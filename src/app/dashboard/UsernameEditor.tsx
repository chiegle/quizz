'use client';

import { useFormState } from 'react-dom';
import { updateUsernameAction } from './actions';
import { Edit2, Check, X } from 'lucide-react';
import { useState } from 'react';
import ColorPicker from './ColorPicker';

export default function UsernameEditor({ 
  currentUsername, 
  initialColor,
  isLarge = false
}: { 
  currentUsername: string, 
  initialColor: string,
  isLarge?: boolean
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [state, formAction] = useFormState(updateUsernameAction, null);

  if (!isEditing) {
    return (
      <div className="flex items-center justify-center gap-3">
        <div className="flex items-center gap-1.5">
          <span 
            className="font-bold tracking-tight" 
            style={{ 
              color: initialColor, 
              fontSize: isLarge ? '2.5rem' : 'inherit',
              lineHeight: 1
            }}
          >
            {currentUsername}
          </span>
          <button 
            onClick={() => setIsEditing(true)} 
            className="p-1 hover:text-primary transition-colors opacity-40 hover:opacity-100" 
            aria-label="Modifier le pseudo"
          >
            <Edit2 size={isLarge ? 18 : 14} />
          </button>
        </div>
        <div className="w-px bg-white/10 h-6 mx-1"></div>
        <ColorPicker initialColor={initialColor} />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <form action={async (formData) => {
        await formAction(formData);
        setIsEditing(false);
      }} className="flex items-center justify-center gap-2">
        <input 
          autoFocus
          type="text" 
          name="username" 
          defaultValue={currentUsername} 
          className="input-field py-1 px-2" 
          style={{ width: '150px', fontSize: isLarge ? '1.5rem' : 'inherit' }}
          minLength={3}
          maxLength={7}
          pattern="^[a-zA-Z0-9_-]+$"
          title="Le pseudo doit faire entre 3 et 7 caractères et ne contenir que des lettres, chiffres, tirets ou underscores."
        />
        <button type="submit" className="text-success hover:scale-110 transition-transform">
          <Check size={20} />
        </button>
        <button type="button" onClick={() => setIsEditing(false)} className="text-error hover:scale-110 transition-transform">
          <X size={20} />
        </button>
      </form>
      {state?.error && <p className="text-error text-[10px] mt-1">{state.error}</p>}
    </div>
  );
}
