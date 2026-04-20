'use client';

import { useFormState } from 'react-dom';
import { submitScore } from './actions';
import { Check } from 'lucide-react';

type UserOption = { id: string, username: string };

export default function ScoreForm({ 
  initialScore, 
  isAdmin, 
  users = [] 
}: { 
  initialScore: number | string, 
  isAdmin?: boolean, 
  users?: UserOption[] 
}) {
  const [state, formAction] = useFormState(submitScore, null);
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const minDate = isAdmin ? undefined : new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];

  return (
    <div className="flex flex-col items-center">
      <form action={formAction} className="flex gap-2 items-center flex-wrap md:flex-nowrap">
        {isAdmin && (
          <select name="userId" className="input-field h-10 py-1" style={{ width: '130px' }}>
            <option value="">Moi (Défaut)</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.username}</option>
            ))}
          </select>
        )}
        <input 
          type="date" 
          name="date" 
          defaultValue={todayStr} 
          min={minDate}
          max={todayStr}
          className="input-field h-10 py-1 px-2 text-sm" 
          style={{ width: '140px' }}
        />
        <input 
          type="number" 
          name="score" 
          defaultValue={initialScore}
          placeholder="Score..." 
          className="input-field h-10 py-1 px-2 text-sm" 
          style={{ width: '90px' }}
          required 
        />
        <button type="submit" className="btn-primary h-10 px-6 flex items-center justify-center rounded-md" aria-label="Valider">
          <Check size={20} strokeWidth={3} />
        </button>
      </form>
      {state?.error && (
        <div className="absolute top-full text-error text-[10px] mt-1 bg-black/80 px-2 py-1 rounded-sm z-10">{state.error}</div>
      )}
      {state?.success && (
        <div className="absolute top-full text-success text-[10px] mt-1 bg-black/80 px-2 py-1 rounded-sm z-10">Validé !</div>
      )}
    </div>
  );
}
