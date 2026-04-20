import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'La Table des Savoirs - Quiz Tracker',
  description: 'Un outil pour suivre et comparer vos scores journaliers et mensuels du quiz.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>
        <div className="flex-col w-full" style={{ minHeight: '100vh', padding: '1rem' }}>
          {children}
        </div>
      </body>
    </html>
  );
}
