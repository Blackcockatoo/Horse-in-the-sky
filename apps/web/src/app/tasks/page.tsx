'use client';

import { useState, useEffect } from 'react';

interface Task {
  id: string;
  text: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('hmffcc_tasks');
    if (saved) {
      setTasks(JSON.parse(saved));
    } else {
      const defaults: Task[] = [
        { id: '1', text: 'Check fence line', completed: false, priority: 'high' },
        { id: '2', text: 'Service tractor', completed: false, priority: 'medium' },
        { id: '3', text: 'Order more AvGas', completed: true, priority: 'high' },
      ];
      setTasks(defaults);
      localStorage.setItem('hmffcc_tasks', JSON.stringify(defaults));
    }
  }, []);

  const saveTasks = (newTasks: Task[]) => {
    setTasks(newTasks);
    localStorage.setItem('hmffcc_tasks', JSON.stringify(newTasks));
  };

  const toggleTask = (id: string) => {
    const newTasks = tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    );
    saveTasks(newTasks);
  };

  const addTask = () => {
    if (!newTask.trim()) return;
    const task: Task = {
      id: Date.now().toString(),
      text: newTask.trim(),
      completed: false,
      priority: 'medium'
    };
    saveTasks([task, ...tasks]);
    setNewTask('');
  };

  const deleteTask = (id: string) => {
    saveTasks(tasks.filter(t => t.id !== id));
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1rem', color: '#888', fontWeight: 700, letterSpacing: '0.15em', marginBottom: '1.5rem', fontFamily: 'monospace' }}>
        TO-DO LISTS
      </h1>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
        <input 
          placeholder="New task..." 
          value={newTask}
          onChange={e => setNewTask(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addTask()}
          style={{ flex: 1, background: '#111', border: '1px solid #333', color: '#fff', padding: '1.25rem', borderRadius: '12px', fontSize: '1.2rem' }}
        />
        <button 
          onClick={addTask}
          style={{ background: '#00c853', color: '#000', border: 'none', padding: '0 1.5rem', borderRadius: '12px', fontSize: '1.2rem', fontWeight: 900 }}
        >
          ADD
        </button>
      </div>

      <div style={{ display: 'grid', gap: '0.75rem' }}>
        {tasks.map(task => (
          <div key={task.id} style={{
            background: task.completed ? '#0a0a0a' : '#111',
            border: `1px solid ${task.completed ? '#222' : '#333'}`,
            borderRadius: '12px',
            padding: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            opacity: task.completed ? 0.6 : 1
          }}>
            <button 
              onClick={() => toggleTask(task.id)}
              style={{ 
                width: '44px', 
                height: '44px', 
                borderRadius: '50%', 
                border: `3px solid ${task.completed ? '#00c853' : '#555'}`,
                background: task.completed ? '#00c853' : 'transparent',
                color: '#000',
                fontSize: '1.2rem',
                fontWeight: 900,
                cursor: 'pointer'
              }}
            >
              {task.completed ? '✓' : ''}
            </button>
            <div style={{ 
              flex: 1, 
              fontSize: '1.2rem', 
              color: task.completed ? '#666' : '#fff',
              textDecoration: task.completed ? 'line-through' : 'none'
            }}>
              {task.text}
            </div>
            <button 
              onClick={() => deleteTask(task.id)}
              style={{ background: 'transparent', border: 'none', color: '#ff1744', fontSize: '1.5rem', padding: '0.5rem' }}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
