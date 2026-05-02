'use client';

import { useFormState } from 'react-dom';
import { loginAction } from '@/app/actions';
import { Lock, User, PlusCircle, Users } from 'lucide-react';
import { useState } from 'react';

export default function LoginForm({ usernames = [] }: { usernames?: string[] }) {
  const [state, formAction] = useFormState(loginAction, null);
  const [isNewUser, setIsNewUser] = useState(usernames.length === 0);

  return (
    <form action={formAction} className="flex-col gap-4 text-left">
      {state?.error && (
        <div className="text-error text-sm text-center mb-2 p-2" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '0.375rem' }}>
          {state.error}
        </div>
      )}

      <div>
        <div className="flex justify-between items-center mb-2">
          <label htmlFor="username" className="input-label" style={{ margin: 0 }}>Pseudo</label>
          {usernames.length > 0 && (
            <button 
              type="button" 
              onClick={() => setIsNewUser(!isNewUser)}
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              {isNewUser ? <Users size={12}/> : <PlusCircle size={12}/>}
              {isNewUser ? "Choisir dans la liste" : "Nouveau joueur ?"}
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isNewUser ? (
            <>
              <User size={20} className="text-muted" />
              <input 
                type="text" 
                id="username" 
                name="username" 
                placeholder="Votre Pseudo" 
                className="input-field" 
                required 
                minLength={3}
                maxLength={7}
                pattern="^[a-zA-Z0-9_-]+$"
                title="Le pseudo doit faire entre 3 et 7 caractères et ne contenir que des lettres, chiffres, tirets ou underscores."
              />
            </>
          ) : (
            <>
              <Users size={20} className="text-muted" />
              <select 
                id="username" 
                name="username" 
                className="input-field"
                required
                defaultValue=""
              >
                <option value="" disabled>-- Choisir un joueur --</option>
                {usernames.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </>
          )}
        </div>
      </div>
      
      <div className="mt-4">
        <label htmlFor="codePin" className="input-label">Code PIN (4 chiffres)</label>
        <div className="flex items-center gap-2">
          <Lock size={20} className="text-muted" />
          <input 
            type="password" 
            id="codePin" 
            name="codePin" 
            pattern="[0-9]{4}"
            maxLength={4}
            placeholder="1234" 
            className="input-field" 
            required 
          />
        </div>
      </div>

      <button 
        type="submit" 
        className="btn-primary w-full mt-6 flex justify-center items-center gap-2" 
      >
        Connexion
      </button>
    </form>
  );
}
