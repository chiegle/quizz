'use client';

import { useState } from 'react';
import { updateColorAction } from './actions';
import { Palette } from 'lucide-react';

export default function ColorPicker({ initialColor }: { initialColor: string }) {
  const [color, setColor] = useState(initialColor);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setColor(newColor);
    await updateColorAction(newColor);
  };

  return (
    <div className="flex items-center gap-2" title="Choisir votre couleur">
      <label htmlFor="color-picker" className="cursor-pointer hover:text-primary transition-colors">
        <Palette size={18} />
      </label>
      <input 
        id="color-picker"
        type="color" 
        value={color} 
        onChange={handleChange}
        className="w-8 h-8 rounded-full border-2 border-white/10 cursor-pointer overflow-hidden p-0 bg-transparent"
        style={{ border: 'none', background: 'none' }}
      />
    </div>
  );
}
