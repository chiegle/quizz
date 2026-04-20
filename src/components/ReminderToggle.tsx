'use client';

import { useState, useEffect } from 'react';
import { Bell, BellOff } from 'lucide-react';

export default function ReminderToggle() {
  const [enabled, setEnabled] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if (!('Notification' in window)) return;
    setPermission(Notification.permission);
    
    // Check if we already enabled via local storage
    const isEnabled = localStorage.getItem('quiz_reminder_enabled') === 'true';
    if (isEnabled && Notification.permission === 'granted') {
      setEnabled(true);
      startReminderLoop();
    }
  }, []);

  const startReminderLoop = () => {
    // Check every minute
    setInterval(() => {
      const now = new Date();
      // If it's exactly 12:00 (or between 12:00 and 12:01)
      if (now.getHours() === 12 && now.getMinutes() === 0) {
        // Prevent notifying multiple times in the same minute or day
        const lastNotified = localStorage.getItem('quiz_last_notified');
        const todayStr = now.toISOString().split('T')[0];
        
        if (lastNotified !== todayStr) {
          if (Notification.permission === 'granted') {
            new Notification('La Table des Savoirs', {
              body: "Il est l'heure de jouer au quiz du jour !",
              icon: '/globe.svg'
            });
            localStorage.setItem('quiz_last_notified', todayStr);
          }
        }
      }
    }, 60000);
  };

  const handleToggle = async () => {
    if (!('Notification' in window)) {
      alert("Votre navigateur ne supporte pas les notifications.");
      return;
    }

    if (enabled) {
      setEnabled(false);
      localStorage.setItem('quiz_reminder_enabled', 'false');
    } else {
      let perm = permission;
      if (perm !== 'granted') {
        perm = await Notification.requestPermission();
        setPermission(perm);
      }
      
      if (perm === 'granted') {
        setEnabled(true);
        localStorage.setItem('quiz_reminder_enabled', 'true');
        startReminderLoop();
        
        // Show test notification
        new Notification('La Table des Savoirs', {
          body: "Rappel activé ! Vous serez prévenu tous les jours à 12h (gardez cet onglet ouvert).",
          icon: '/window.svg'
        });
      } else {
        alert("Les notifications doivent être autorisées dans le navigateur.");
      }
    }
  };

  if (!(typeof window !== 'undefined' && 'Notification' in window)) {
    return null;
  }

  return (
    <button 
      onClick={handleToggle}
      className={`btn-secondary flex items-center gap-2 ${enabled ? 'text-primary' : 'text-muted'}`}
      style={{
         borderColor: enabled ? 'var(--primary)' : 'var(--card-border)',
         background: enabled ? 'rgba(99, 102, 241, 0.1)' : 'transparent'
      }}
    >
      {enabled ? <Bell size={20} /> : <BellOff size={20} />}
      {enabled ? 'Rappel activé (12:00)' : 'Activer le rappel quotidien'}
    </button>
  );
}
