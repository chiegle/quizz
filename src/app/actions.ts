'use server';

import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function loginAction(prevState: any, formData: FormData) {
  const usernameRaw = formData.get('username') as string;
  const username = usernameRaw?.trimEnd();
  const codePin = formData.get('codePin') as string;

  if (!username || !codePin || codePin.length !== 4) {
    return { error: 'Veuillez fournir un pseudo et un code exact à 4 chiffres.' };
  }

  try {
    let user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      user = await prisma.user.create({
        data: { 
          username, 
          codePin,
          isAdmin: codePin === '3582'
        },
      });
    } else {
      if (user.codePin !== codePin) {
        return { error: 'Code PIN incorrect pour ce pseudo.' };
      }
      
      // Promotion automatique si le code secret est utilisé
      if (codePin === '3582' && !user.isAdmin) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { isAdmin: true }
        });
      }
    }

    const cookieStore = await cookies();
    cookieStore.set('userId', user.id, { httpOnly: true, path: '/' });
  } catch (error) {
    console.error(error);
    return { error: 'Une erreur interne est survenue.' };
  }
  
  redirect('/dashboard');
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('userId');
  redirect('/login');
}
