'use client';

import { useFormState } from 'react-dom';
import { forcePairAction, adminUnpairAction } from './actions';
import { useState } from 'react';
import { Unlink } from 'lucide-react';

type UserOption = { 
  id: string, 
  username: string,
  partnerId?: string | null
};

export default function AdminForceCouple({ users }: { users: UserOption[] }) {
  const [state, formAction] = useFormState(forcePairAction, null);
  const [selectedA, setSelectedA] = useState("");

  const filteredUsersB = users.filter(u => u.id !== selectedA);

  // Identify confirmed couples
  const confirmedCouples: { idA: string, idB: string, userA: string, userB: string }[] = [];
  const processed = new Set<string>();

  for (const u of users) {
    if (processed.has(u.id)) continue;
    if (u.partnerId) {
      const partner = users.find(p => p.id === u.partnerId);
      if (partner && partner.partnerId === u.id && u.id !== partner.id) {
        confirmedCouples.push({ idA: u.id, idB: partner.id, userA: u.username, userB: partner.username });
        processed.add(u.id);
        processed.add(partner.id);
      }
    }
  }

  const handleUnpair = async (userId: string) => {
    if (window.confirm("Voulez-vous vraiment séparer ce couple ?")) {
      const res = await adminUnpairAction(userId);
      if (res?.error) alert(res.error);
    }
  };

  return (
    <div className="glass-panel w-full mt-8 p-6 flex flex-col gap-8">
      <div>
        <h3 className="heading-lg mb-4" style={{ fontSize: '1.2rem' }}>Panel Admin : Forcer un Couple</h3>
        <form action={formAction} className="flex gap-4 justify-center items-end flex-wrap">
          <div className="flex-col text-left">
            <label className="input-label">Joueur 1</label>
            <select 
              name="userA" 
              className="input-field" 
              required 
              value={selectedA}
              onChange={(e) => setSelectedA(e.target.value)}
            >
              <option value="" disabled>-- Choisir --</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.username}</option>)}
            </select>
          </div>
          <div className="flex-col text-left">
            <label className="input-label">Joueur 2</label>
            <select name="userB" className="input-field" required defaultValue="">
              <option value="" disabled>-- Choisir --</option>
              {filteredUsersB.map(u => <option key={u.id} value={u.id}>{u.username}</option>)}
            </select>
          </div>
          <button type="submit" className="btn-primary">Lier les deux</button>
        </form>
        {state?.error && <p className="text-error text-sm mt-2">{state.error}</p>}
        {state?.success && <p className="text-success text-sm mt-2">Couple créé avec succès !</p>}
      </div>

      <div className="w-full h-px bg-white/5"></div>

      <div>
        <h3 className="heading-lg mb-4" style={{ fontSize: '1.1rem' }}>Couples Actuels</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {confirmedCouples.length === 0 && <p className="text-muted text-xs">Aucun couple formé.</p>}
          {confirmedCouples.map((c, i) => (
            <div key={i} className="bg-white/5 border border-white/5 p-3 rounded-lg flex justify-between items-center group">
              <span className="text-sm font-bold opacity-80">{c.userA} + {c.userB}</span>
              <button 
                onClick={() => handleUnpair(c.idA)}
                className="text-muted-text hover:text-error transition-colors"
                title="Délier ce couple"
              >
                <Unlink size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

