'use client';

import { useFormState } from 'react-dom';
import { updatePartner } from './actions';
import { Heart, Check } from 'lucide-react';

type UserOption = { id: string, username: string };

export default function PartnerSelector({ 
  users, 
  currentPartnerId, 
  isLocked 
}: { 
  users: UserOption[], 
  currentPartnerId?: string | null, 
  isLocked: boolean 
}) {
  const [state, formAction] = useFormState(updatePartner, null);

  return (
    <div className="w-full flex justify-center">
      <form action={formAction} className="flex gap-2 items-center">
        <select 
          name="partnerId" 
          defaultValue={currentPartnerId || ""} 
          className="input-field" 
          disabled={isLocked}
          style={{ minWidth: '150px' }}
        >
          <option value="">Aucun partenaire</option>
          {users.map(u => (
            <option key={u.id} value={u.id}>{u.username}</option>
          ))}
        </select>
        
        {!isLocked && (
          <button type="submit" className="btn-primary flex items-center justify-center p-2 rounded-md" aria-label="Choisir">
            <Check size={18} />
          </button>
        )}
      </form>
      {state?.error && <p className="text-error text-xs mt-1">{state.error}</p>}
    </div>
  );
}
