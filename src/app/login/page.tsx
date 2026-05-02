import { prisma } from '@/lib/prisma';
import LoginForm from './LoginForm';
import { Trophy } from 'lucide-react';
import { getContrastColor, getTodayString } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function LoginPage() {
  const todayStr = getTodayString();

  // Fetch all users
  const allUsers = await prisma.user.findMany({
    select: { id: true, username: true, isAdmin: true, favoriteColor: true },
    orderBy: { username: 'asc' }
  });

  // Fetch today's scores
  const dailyScores = await prisma.score.findMany({
    where: { date: todayStr }
  });

  // Map scores to users
  const playersWithScores = allUsers.map(user => {
    const scoreObj = dailyScores.find(s => s.userId === user.id);
    return {
      ...user,
      score: scoreObj ? scoreObj.score : 0
    };
  }).sort((a, b) => b.score - a.score);

  return (
    <main className="container flex items-center justify-center pt-12 pb-12" style={{ minHeight: '90vh' }}>
      <div className="flex w-full gap-8 justify-center items-start flex-wrap">
        
        {/* Registration/Login Card */}
        <div className="glass-panel animate-fade-in text-center" style={{ maxWidth: '400px', padding: '3rem 2rem' }}>
          <h1 className="heading-lg" style={{ marginBottom: '0.5rem' }}>Table des Savoirs</h1>
          <p className="text-muted mb-6 text-sm">
            Saisissez votre pseudo pour vous connecter. <br/>
            <strong>Si le pseudo n'existe pas encore, votre compte sera créé automatiquement.</strong>
          </p>
          
          <LoginForm usernames={allUsers.map(u => u.username)} />
        </div>

        {/* Home Leaderboard */}
        {allUsers.length > 0 && (
          <div className="glass-panel animate-fade-in flex-col" style={{ width: '400px', padding: '2rem' }}>
            <h3 className="flex items-center justify-center gap-2 mb-6" style={{ fontSize: '1.25rem', fontWeight: 600 }}>
               <Trophy size={20} className="text-primary" /> Classement du jour
            </h3>
            <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
              <table className="table-users w-full">
                <thead>
                  <tr className="text-xs text-muted uppercase tracking-wider">
                    <th className="text-left py-2 px-3">Rang</th>
                    <th className="text-left py-2 px-3">Joueur</th>
                    <th className="text-right py-2 px-3">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {playersWithScores.map((p, index) => (
                    <tr key={p.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-3 text-sm font-bold text-muted">#{index + 1}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-md font-bold text-sm" style={{ backgroundColor: p.favoriteColor, color: getContrastColor(p.favoriteColor) }}>
                          {p.username}
                        </span>
                        {p.isAdmin && <span className="badge-admin ml-2">Admin</span>}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-primary">
                        {p.score}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted mt-4 text-center italic">Tous les joueurs inscrits s'affichent ici.</p>
          </div>
        )}

      </div>
    </main>
  );
}
