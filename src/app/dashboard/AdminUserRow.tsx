'use client';

import { useState } from 'react';
import { useFormState } from 'react-dom';
import { adminUpdateUserAction, adminDeleteUserAction } from './actions';
import { Edit2, Trash2, Check, X } from 'lucide-react';

type UserData = {
  id: string;
  username: string;
  isAdmin: boolean;
};

export default function AdminUserRow({ user }: { user: UserData }) {
  const [isEditing, setIsEditing] = useState(false);
  const [state, formAction] = useFormState(adminUpdateUserAction, null);

  const handleDelete = async () => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer ${user.username} ? Tous ses scores seront effacés.`)) {
      const res = await adminDeleteUserAction(user.id);
      if (res?.error) alert(res.error);
    }
  };

  if (isEditing) {
    return (
      <tr>
        <td className="text-left py-2 border-b border-white/5">
          <form action={async (formData) => {
            await formAction(formData);
            setIsEditing(false);
          }} className="flex items-center gap-2">
            <input type="hidden" name="targetUserId" value={user.id} />
            <input 
              autoFocus
              type="text" 
              name="username" 
              defaultValue={user.username} 
              className="input-field py-1 px-2 text-sm" 
              minLength={3}
              maxLength={7}
              pattern="^[a-zA-Z0-9_-]+$"
              title="Le pseudo doit faire entre 3 et 7 caractères et ne contenir que des lettres, chiffres, tirets ou underscores."
            />
            <button type="submit" className="text-success hover:scale-110"><Check size={16} /></button>
            <button type="button" onClick={() => setIsEditing(false)} className="text-error hover:scale-110"><X size={16} /></button>
          </form>
          {state?.error && <p className="text-error text-xs">{state.error}</p>}
        </td>
      </tr>
    );
  }

  return (
    <tr>
      <td className="text-left py-3 border-b border-white/5 flex justify-between items-center group">
        <span>
          {user.username} {user.isAdmin && <span className="badge-admin ml-2">Admin</span>}
        </span>
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={() => setIsEditing(true)} 
            className="text-muted-text hover:text-primary transition-colors"
            title="Modifier"
          >
            <Edit2 size={14} />
          </button>
          {!user.isAdmin && (
            <button 
              onClick={handleDelete} 
              className="text-muted-text hover:text-error transition-colors"
              title="Supprimer"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}
