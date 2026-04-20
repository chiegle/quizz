'use server';

import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

function getTodayString() {
  return new Date().toISOString().split('T')[0];
}

export async function submitScore(prevState: any, formData: FormData) {
  const scoreStr = formData.get('score') as string;
  const score = parseInt(scoreStr, 10);
  if (isNaN(score) || score < 0) {
    return { error: 'Score invalide.' };
  }

  const cookieStore = await cookies();
  const sessionUserId = cookieStore.get('userId')?.value;
  if (!sessionUserId) return { error: 'Non authentifié.' };

  const targetUserId = formData.get('userId') as string;
  const targetDate = formData.get('date') as string;

  // Determine actual target user and date
  let finalUserId = sessionUserId;
  let finalDate = getTodayString();

  // If there's an attempt to specify another user/date, verify admin
  if (targetUserId || targetDate) {
    const sessionUser = await prisma.user.findUnique({ where: { id: sessionUserId } });
    if (sessionUser?.isAdmin) {
      if (targetUserId) {
        finalUserId = targetUserId;
      }
      if (targetDate) {
        finalDate = targetDate; // format should be YYYY-MM-DD from input[type="date"]
      }
    }
  }

  try {
    const sessionUser = await prisma.user.findUnique({ where: { id: sessionUserId } });

    const existing = await prisma.score.findUnique({
      where: { userId_date: { userId: finalUserId, date: finalDate } }
    });

    if (existing) {
      // Restriction check: Only admins can modify an existing score
      if (!sessionUser?.isAdmin) {
        return { error: 'Vous avez déjà renseigné un score pour le jour, veuillez contacter l\'administrateur pour toute modification.' };
      }

      await prisma.score.update({
        where: { id: existing.id },
        data: { score }
      });
    } else {
      await prisma.score.create({
        data: { score, date: finalDate, userId: finalUserId }
      });
    }

    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: 'Erreur lors de la sauvegarde.' };
  }
}

export async function updatePartner(prevState: any, formData: FormData) {
  const cookieStore = await cookies();
  const sessionUserId = cookieStore.get('userId')?.value;
  if (!sessionUserId) return { error: 'Non authentifié.' };

  const partnerIdStr = formData.get('partnerId') as string;
  const partnerId = partnerIdStr === "" ? null : partnerIdStr;

  if (partnerId === sessionUserId) {
    return { error: "Vous ne pouvez pas être votre propre partenaire." };
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: sessionUserId } });
    if (!user) return { error: 'Utilisateur introuvable.' };

    // Check if user is already in a mutual pair
    if (user.partnerId && !user.isAdmin) {
      const currentPartner = await prisma.user.findUnique({ where: { id: user.partnerId } });
      if (currentPartner && currentPartner.partnerId === user.id) {
        return { error: "Vous êtes déjà en couple ! Seul l'admin peut modifier cela." };
      }
    }

    await prisma.user.update({
      where: { id: sessionUserId },
      data: { partnerId }
    });

    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: 'Erreur lors de la mise à jour.' };
  }
}

// Admin force pairing
export async function forcePairAction(prevState: any, formData: FormData) {
  const cookieStore = await cookies();
  const sessionUserId = cookieStore.get('userId')?.value;
  if (!sessionUserId) return { error: 'Non authentifié.' };

  const userA_id = formData.get('userA') as string;
  const userB_id = formData.get('userB') as string;

  try {
    const admin = await prisma.user.findUnique({ where: { id: sessionUserId } });
    if (!admin?.isAdmin) return { error: 'Action réservée aux admins.' };

    if (userA_id === userB_id) return { error: "Un joueur ne peut pas être son propre partenaire." };

    // Force link both ways
    await prisma.user.update({ where: { id: userA_id }, data: { partnerId: userB_id } });
    await prisma.user.update({ where: { id: userB_id }, data: { partnerId: userA_id } });

    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: 'Erreur lors du forçage du couple.' };
  }
}

export async function updateUsernameAction(prevState: any, formData: FormData) {
  const cookieStore = await cookies();
  const sessionUserId = cookieStore.get('userId')?.value;
  if (!sessionUserId) return { error: 'Non authentifié.' };

  const newUsername = (formData.get('username') as string)?.trimEnd();
  if (!newUsername || newUsername.length < 2) {
    return { error: 'Le pseudo est trop court.' };
  }

  try {
    const existing = await prisma.user.findUnique({ where: { username: newUsername } });
    if (existing && existing.id !== sessionUserId) {
      return { error: 'Ce pseudo est déjà utilisé.' };
    }

    await prisma.user.update({
      where: { id: sessionUserId },
      data: { username: newUsername }
    });

    revalidatePath('/dashboard');
    revalidatePath('/login');
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: 'Erreur lors de la modification du pseudo.' };
  }
}

export async function adminUpdateUserAction(prevState: any, formData: FormData) {
  const cookieStore = await cookies();
  const sessionUserId = cookieStore.get('userId')?.value;
  if (!sessionUserId) return { error: 'Non authentifié.' };

  const targetUserId = formData.get('targetUserId') as string;
  const newUsername = (formData.get('username') as string)?.trimEnd();
  
  if (!newUsername || newUsername.length < 2) return { error: 'Pseudo trop court.' };

  try {
    const admin = await prisma.user.findUnique({ where: { id: sessionUserId } });
    if (!admin?.isAdmin) return { error: 'Action réservée aux admins.' };

    const existing = await prisma.user.findUnique({ where: { username: newUsername } });
    if (existing && existing.id !== targetUserId) return { error: 'Ce pseudo est déjà pris.' };

    await prisma.user.update({
      where: { id: targetUserId },
      data: { username: newUsername }
    });

    revalidatePath('/dashboard');
    revalidatePath('/login');
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: 'Erreur lors de la mise à jour.' };
  }
}

export async function adminDeleteUserAction(targetUserId: string) {
  const cookieStore = await cookies();
  const sessionUserId = cookieStore.get('userId')?.value;
  if (!sessionUserId) return { error: 'Non authentifié.' };

  try {
    const admin = await prisma.user.findUnique({ where: { id: sessionUserId } });
    if (!admin?.isAdmin) return { error: 'Action réservée aux admins.' };

    if (targetUserId === sessionUserId) return { error: "Vous ne pouvez pas vous supprimer vous-même." };

    // Delete scores first (manual cascade)
    await prisma.score.deleteMany({ where: { userId: targetUserId } });
    // Delete user
    await prisma.user.delete({ where: { id: targetUserId } });

    revalidatePath('/dashboard');
    revalidatePath('/login');
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: 'Erreur lors de la suppression.' };
  }
}

export async function updateColorAction(newColor: string) {
  const cookieStore = await cookies();
  const sessionUserId = cookieStore.get('userId')?.value;
  if (!sessionUserId) return { error: 'Non authentifié.' };

  try {
    await prisma.user.update({
      where: { id: sessionUserId },
      data: { favoriteColor: newColor }
    });
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: 'Erreur lors de la mise à jour de la couleur.' };
  }
}

export async function adminUnpairAction(targetUserId: string) {
  const cookieStore = await cookies();
  const sessionUserId = cookieStore.get('userId')?.value;
  if (!sessionUserId) return { error: 'Non authentifié.' };

  try {
    const admin = await prisma.user.findUnique({ where: { id: sessionUserId } });
    if (!admin?.isAdmin) return { error: 'Action réservée aux admins.' };

    const targetUser = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!targetUser) return { error: 'Utilisateur introuvable.' };

    if (targetUser.partnerId) {
      await prisma.user.update({ where: { id: targetUser.partnerId }, data: { partnerId: null, coupleName: null } });
    }
    await prisma.user.update({ where: { id: targetUserId }, data: { partnerId: null, coupleName: null } });

    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: 'Erreur lors de la désactivation du couple.' };
  }
}







