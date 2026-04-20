import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { logoutAction } from '@/app/actions';
import { Trophy, Calendar, ExternalLink, Heart, LogOut } from 'lucide-react';
import ScoreForm from './ScoreForm';
import ReminderToggle from '@/components/ReminderToggle';
import PartnerSelector from './PartnerSelector';
import UsernameEditor from './UsernameEditor';
import AdminForceCouple from './AdminForceCouple';
import AdminUserRow from './AdminUserRow';
import { getContrastColor, getTodayString } from '@/lib/utils';

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;

  if (!userId) {
    redirect('/login');
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) redirect('/login');

  const todayStr = getTodayString();
  const currentMonthStr = todayStr.substring(0, 7); // e.g. 2026-04

  // Fetch all users
  const allUsers = await prisma.user.findMany({
    select: { id: true, username: true, isAdmin: true, partnerId: true, favoriteColor: true, coupleName: true },
    orderBy: { username: 'asc' }
  });

  // Get today's score for the user
  const todayScore = await prisma.score.findUnique({
    where: { userId_date: { userId, date: todayStr } }
  });

  // Get daily leaderboard
  const dailyScores = await prisma.score.findMany({
    where: { date: todayStr },
    include: { user: true },
    orderBy: { score: 'desc' }
  });

  // Get monthly leaderboard
  const monthlyScoresRaw = await prisma.score.findMany({
    where: {
      date: { startsWith: currentMonthStr }
    },
    include: { user: true }
  });

  // Aggregate monthly scores by user
  const userMonthlyMap: Record<string, { username: string, total: number, color: string }> = {};
  for (const s of monthlyScoresRaw) {
    if (!userMonthlyMap[s.userId]) {
       userMonthlyMap[s.userId] = { 
         username: s.user.username, 
         total: 0, 
         color: s.user.favoriteColor || '#ffffff' 
       };
    }
    userMonthlyMap[s.userId].total += s.score;
  }
  
  const monthlyScoresSorted = Object.values(userMonthlyMap).sort((a, b) => b.total - a.total);

  // Identify confirmed couples
  const confirmedCouples: { userA: string, userB: string, colorA: string, colorB: string, total: number, coupleName: string | null }[] = [];
  const processedUserIds = new Set<string>();

  for (const u of allUsers) {
    if (processedUserIds.has(u.id)) continue;
    if (u.partnerId) {
      const partner = allUsers.find(p => p.id === u.partnerId);
      if (partner && partner.partnerId === u.id && u.id !== partner.id) {
        const scoreA = userMonthlyMap[u.id]?.total || 0;
        const scoreB = userMonthlyMap[partner.id]?.total || 0;
        confirmedCouples.push({
          userA: u.username,
          userB: partner.username,
          colorA: u.favoriteColor,
          colorB: partner.favoriteColor,
          total: scoreA + scoreB,
          coupleName: u.coupleName
        });
        processedUserIds.add(u.id);
        processedUserIds.add(partner.id);
      }
    }
  }
  const coupleScoresSorted = confirmedCouples.sort((a, b) => b.total - a.total);

  // Partner status for the current user
  let partnerStatusText = "Vous n'avez pas encore de partenaire.";
  let currentPartnerObj = null;
  let isConfirmedCouple = false;
  
  if (user.partnerId) {
    const p = allUsers.find(u => u.id === user.partnerId);
    if (p) {
      currentPartnerObj = p;
      if (p.partnerId === user.id) {
        isConfirmedCouple = true;
        partnerStatusText = `En couple avec ${p.username} ❤️`;
      } else {
        partnerStatusText = `Demande envoyée à ${p.username}. Il faut que l'autre utilisateur fasse de même pour que le couple soit créé.`;
      }
    }
  }

  return (
    <main className="container animate-fade-in text-center flex flex-col items-center gap-8 py-8">
      {/* HEADER SECTION: Button + Global Score Form */}
      <div className="flex flex-wrap justify-center items-center gap-6 w-full max-w-5xl px-4 py-4 glass-panel relative">
         <a href="https://latabledessavoirs.fr" target="_blank" rel="noopener noreferrer" className="btn-flashy h-10 flex items-center gap-2 flex-shrink-0">
            Jouer au Quiz <ExternalLink size={16} />
         </a>
         <div className="h-8 w-px bg-white/10 hidden md:block"></div>
         <div className="flex flex-col items-center gap-1">
            <p className="text-[10px] italic opacity-60">Renseigne ton score du jour</p>
            <ScoreForm 
              initialScore={todayScore?.score || ''} 
              isAdmin={user.isAdmin} 
              users={allUsers}
            />
         </div>
      </div>

      {/* RANKINGS SECTION (3 blocks row) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
         {/* Daily Solo */}
         <div className="glass-panel flex flex-col p-5">
            <h3 className="flex items-center justify-center gap-2 mb-4 font-bold text-primary">
              <Calendar size={18} /> Classement du jour
            </h3>
            <div className="flex flex-col gap-2 overflow-y-auto max-h-[300px]">
              {dailyScores.length === 0 && <p className="text-muted text-xs">Aucun score aujourd'hui.</p>}
              {dailyScores.map((s, index) => (
                  <div key={s.id} className="flex justify-between items-center p-2.5 bg-black/20 rounded-md border border-white/5 hover:border-white/10 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold text-muted">#{index + 1}</span>
                      <span className="text-xs font-bold px-2 py-1 rounded-md" style={{ backgroundColor: s.user.favoriteColor, color: getContrastColor(s.user.favoriteColor) }}>
                        {s.user.username}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-primary">{s.score}</span>
                  </div>
              ))}
            </div>
         </div>

         {/* Monthly Solo */}
         <div className="glass-panel flex flex-col p-5">
            <h3 className="flex items-center justify-center gap-2 mb-4 font-bold text-success">
              <Trophy size={18} /> Classement du mois
            </h3>
            <div className="flex flex-col gap-2 overflow-y-auto max-h-[300px]">
              {monthlyScoresSorted.length === 0 && <p className="text-muted text-xs">Vide.</p>}
              {monthlyScoresSorted.map((s, index) => (
                  <div key={index} className="flex justify-between items-center p-2.5 bg-black/20 rounded-md border border-white/5 hover:border-white/10 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold text-muted">#{index + 1}</span>
                      <span className="text-xs font-bold px-2 py-1 rounded-md" style={{ backgroundColor: s.color, color: getContrastColor(s.color) }}>
                        {s.username}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-success">{s.total}</span>
                  </div>
              ))}
            </div>
         </div>

         {/* Monthly Couple */}
         <div className="glass-panel flex flex-col p-5 border-secondary/20 bg-secondary/5">
            <h3 className="flex items-center justify-center gap-2 mb-4 font-bold text-secondary">
              <Heart size={18} /> Couples du mois
            </h3>
            <div className="flex flex-col gap-2 overflow-y-auto max-h-[300px]">
              {coupleScoresSorted.length === 0 && <p className="text-muted text-xs">Aucun couple formé.</p>}
              {coupleScoresSorted.map((c, index) => (
                  <div key={index} className="flex justify-between items-center p-2.5 bg-secondary/10 rounded-md border border-secondary/10">
                    <div className="flex flex-col text-left">
                      <div className="text-[10px] font-bold text-muted">#{index + 1}</div>
                      <div className="text-xs font-bold px-2.5 py-1 rounded-md shadow-sm" style={{ 
                          background: c.colorA === c.colorB 
                            ? c.colorA 
                            : `linear-gradient(to right, ${c.colorA} 0%, ${c.colorA} 40%, #ffffff33 50%, ${c.colorB} 60%, ${c.colorB} 100%)`,
                          color: (getContrastColor(c.colorA) === '#000000' || getContrastColor(c.colorB) === '#000000') ? '#000000' : '#ffffff',
                          textShadow: (getContrastColor(c.colorA) === '#000000' || getContrastColor(c.colorB) === '#000000') ? 'none' : '0 1px 2px rgba(0,0,0,0.8)',
                          display: 'inline-block'
                        }}>
                           <span>{c.userA} + {c.userB}</span>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-secondary">{c.total}</span>
                  </div>
              ))}
            </div>
         </div>
      </div>

      {/* UI & PROFILE SECTION (Below rankings) */}
      <div className="flex flex-col items-center w-full max-w-lg gap-6">
         <div className="glass-panel flex flex-col items-center w-full p-8">
            <div className="flex flex-col items-center gap-4 mb-6">
               <UsernameEditor currentUsername={user.username} initialColor={user.favoriteColor} isLarge={true} />
               {user.isAdmin && <span className="badge-admin">Administrateur</span>}
            </div>

            <div className="w-full h-px bg-white/5 mb-6"></div>

            <div className="w-full flex flex-col items-center">
               <p className="text-sm font-bold mb-3 flex items-center justify-center gap-2">
                 <Heart size={16} className="text-secondary" /> {partnerStatusText}
               </p>
               
               {isConfirmedCouple ? (
                 <div className="flex flex-col items-center gap-1">
                    <p className="text-[10px] italic opacity-40 mt-1">
                       (Contactez l'admin pour changer de partenaire)
                    </p>
                 </div>
               ) : (
                 <PartnerSelector 
                   users={allUsers.filter(u => u.id !== user.id)} 
                   currentPartnerId={user.partnerId} 
                   isLocked={!!(currentPartnerObj && currentPartnerObj.partnerId === user.id) && !user.isAdmin} 
                 />
               )}
            </div>
         </div>

         {user.isAdmin && (
           <>
             <AdminForceCouple users={allUsers} />
             <div className="glass-panel w-full mt-8 p-6">
                <h3 className="heading-lg mb-4 text-left" style={{ fontSize: '1.2rem' }}>Joueurs inscrits</h3>
                <div className="overflow-x-auto">
                   <table className="w-full text-sm">
                      <thead>
                         <tr>
                            <th className="text-left py-2 border-b border-white/10 opacity-60">Pseudo</th>
                         </tr>
                      </thead>
                      <tbody>
                         {allUsers.map(u => (
                            <AdminUserRow key={u.id} user={u} />
                         ))}
                      </tbody>
                   </table>
                </div>
             </div>
           </>
         )}

         <footer className="w-full flex flex-col items-center gap-4 pt-4">
            <ReminderToggle />
            <form action={logoutAction}>
              <button type="submit" className="btn-secondary flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity text-xs py-2 px-4 rounded-full border border-white/5">
                 <LogOut size={14} /> Se déconnecter
              </button>
            </form>
         </footer>
      </div>
    </main>
  );
}
