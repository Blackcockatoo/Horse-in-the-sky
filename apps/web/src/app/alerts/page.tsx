'use client';

import { useState, useEffect } from 'react';

interface Reminder {
  id: string;
  text: string;
  time: string;
  active: boolean;
  repeat: 'daily' | 'weekly' | 'once';
}

export default function AlertsPage() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [newReminder, setNewReminder] = useState({ text: '', time: '08:00', repeat: 'daily' as const });

  useEffect(() => {
    const saved = localStorage.getItem('hmffcc_reminders');
    if (saved) {
      setReminders(JSON.parse(saved));
    } else {
      const defaults: Reminder[] = [
        { id: '1', text: 'Check weather for flight', time: '07:00', active: true, repeat: 'daily' },
        { id: '2', text: 'Fuel up tractor', time: '16:00', active: true, repeat: 'weekly' },
        { id: '3', text: 'Call the vet', time: '09:00', active: false, repeat: 'once' },
      ];
      setReminders(defaults);
      localStorage.setItem('hmffcc_reminders', JSON.stringify(defaults));
    }
  }, []);

  const saveReminders = (newReminders: Reminder[]) => {
    setReminders(newReminders);
    localStorage.setItem('hmffcc_reminders', JSON.stringify(newReminders));
  };

  const toggleReminder = (id: string) => {
    const newReminders = reminders.map(r => 
      r.id === id ? { ...r, active: !r.active } : r
    );
    saveReminders(newReminders);
  };

  const addReminder = () => {
    if (!newReminder.text) return;
    const reminder: Reminder = {
      id: Date.now().toString(),
      ...newReminder,
      active: true
    };
    saveReminders([...reminders, reminder]);
    setNewReminder({ text: '', time: '08:00', repeat: 'daily' });
  };

  const deleteReminder = (id: string) => {
    saveReminders(reminders.filter(r => r.id !== id));
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1rem', color: '#888', fontWeight: 700, letterSpacing: '0.15em', marginBottom: '1.5rem', fontFamily: 'monospace' }}>
        REMINDERS & ALERTS
      </h1>

      <div style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
        {reminders.map(reminder => (
          <div key={reminder.id} style={{
            background: '#111',
            border: `2px solid ${reminder.active ? '#00c853' : '#333'}`,
            borderRadius: '12px',
            padding: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            opacity: reminder.active ? 1 : 0.6
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#fff' }}>{reminder.text}</div>
              <div style={{ fontSize: '1rem', color: '#00c853', fontFamily: 'monospace', marginTop: '0.25rem' }}>
                {reminder.time} — {reminder.repeat.toUpperCase()}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button 
                onClick={() => toggleReminder(reminder.id)}
                style={{ 
                  width: '80px', 
                  height: '44px', 
                  borderRadius: '22px', 
                  background: reminder.active ? '#00c853' : '#333',
                  border: 'none',
                  color: '#000',
                  fontWeight: 900,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
              >
                {reminder.active ? 'ON' : 'OFF'}
              </button>
              <button 
                onClick={() => deleteReminder(reminder.id)}
                style={{ background: 'transparent', border: 'none', color: '#ff1744', fontSize: '1.5rem', padding: '0.5rem' }}
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: '#111', border: '1px solid #333', borderRadius: '12px', padding: '1.25rem' }}>
        <h2 style={{ fontSize: '0.85rem', color: '#888', marginBottom: '1rem' }}>SET NEW REMINDER</h2>
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          <input 
            placeholder="What needs doing?" 
            value={newReminder.text}
            onChange={e => setNewReminder({...newReminder, text: e.target.value})}
            style={{ background: '#000', border: '1px solid #444', color: '#fff', padding: '1rem', borderRadius: '8px', fontSize: '1rem' }}
          />
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input 
              type="time" 
              value={newReminder.time}
              onChange={e => setNewReminder({...newReminder, time: e.target.value})}
              style={{ flex: 1, background: '#000', border: '1px solid #444', color: '#fff', padding: '1rem', borderRadius: '8px', fontSize: '1rem' }}
            />
            <select 
              value={newReminder.repeat}
              onChange={e => setNewReminder({...newReminder, repeat: e.target.value as any})}
              style={{ flex: 1, background: '#000', border: '1px solid #444', color: '#fff', padding: '1rem', borderRadius: '8px', fontSize: '1rem' }}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="once">Once</option>
            </select>
          </div>
          <button 
            onClick={addReminder}
            style={{ background: '#00c853', color: '#000', border: 'none', padding: '1rem', borderRadius: '8px', fontSize: '1rem', fontWeight: 900 }}
          >
            SET REMINDER
          </button>
        </div>
      </div>
    </div>
  );
}
