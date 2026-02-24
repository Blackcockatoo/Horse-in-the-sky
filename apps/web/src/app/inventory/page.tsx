'use client';

import { useState, useEffect } from 'react';

interface StockItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  minLevel: number;
}

export default function InventoryPage() {
  const [items, setItems] = useState<StockItem[]>([]);
  const [newItem, setNewItem] = useState({ name: '', quantity: 0, unit: 'units', minLevel: 0 });

  useEffect(() => {
    const saved = localStorage.getItem('hmffcc_inventory');
    if (saved) {
      setItems(JSON.parse(saved));
    } else {
      // Default items for Pete
      const defaults: StockItem[] = [
        { id: '1', name: 'AvGas', quantity: 120, unit: 'L', minLevel: 50 },
        { id: '2', name: 'Herbicide', quantity: 15, unit: 'L', minLevel: 5 },
        { id: '3', name: 'Diesel', quantity: 200, unit: 'L', minLevel: 40 },
      ];
      setItems(defaults);
      localStorage.setItem('hmffcc_inventory', JSON.stringify(defaults));
    }
  }, []);

  const saveItems = (newItems: StockItem[]) => {
    setItems(newItems);
    localStorage.setItem('hmffcc_inventory', JSON.stringify(newItems));
  };

  const updateQuantity = (id: string, delta: number) => {
    const newItems = items.map(item => 
      item.id === id ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item
    );
    saveItems(newItems);
  };

  const addItem = () => {
    if (!newItem.name) return;
    const item: StockItem = {
      id: Date.now().toString(),
      ...newItem
    };
    saveItems([...items, item]);
    setNewItem({ name: '', quantity: 0, unit: 'units', minLevel: 0 });
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1rem', color: '#888', fontWeight: 700, letterSpacing: '0.15em', marginBottom: '1.5rem', fontFamily: 'monospace' }}>
        STOCK & INVENTORY
      </h1>

      <div style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
        {items.map(item => (
          <div key={item.id} style={{
            background: '#111',
            border: `2px solid ${item.quantity <= item.minLevel ? '#ff1744' : '#333'}`,
            borderRadius: '12px',
            padding: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#fff' }}>{item.name}</div>
              <div style={{ fontSize: '0.9rem', color: item.quantity <= item.minLevel ? '#ff1744' : '#888' }}>
                {item.quantity} {item.unit} {item.quantity <= item.minLevel && '(LOW STOCK)'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button 
                onClick={() => updateQuantity(item.id, -1)}
                style={{ width: '60px', height: '60px', background: '#222', border: '1px solid #444', color: '#fff', fontSize: '1.5rem', borderRadius: '8px' }}
              >-</button>
              <button 
                onClick={() => updateQuantity(item.id, 1)}
                style={{ width: '60px', height: '60px', background: '#00c853', border: 'none', color: '#000', fontSize: '1.5rem', fontWeight: 900, borderRadius: '8px' }}
              >+</button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: '#111', border: '1px solid #333', borderRadius: '12px', padding: '1.25rem' }}>
        <h2 style={{ fontSize: '0.85rem', color: '#888', marginBottom: '1rem' }}>ADD NEW ITEM</h2>
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          <input 
            placeholder="Item Name" 
            value={newItem.name}
            onChange={e => setNewItem({...newItem, name: e.target.value})}
            style={{ background: '#000', border: '1px solid #444', color: '#fff', padding: '1rem', borderRadius: '8px', fontSize: '1rem' }}
          />
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input 
              type="number" 
              placeholder="Qty" 
              value={newItem.quantity || ''}
              onChange={e => setNewItem({...newItem, quantity: parseInt(e.target.value) || 0})}
              style={{ flex: 1, background: '#000', border: '1px solid #444', color: '#fff', padding: '1rem', borderRadius: '8px', fontSize: '1rem' }}
            />
            <input 
              placeholder="Unit (L, kg, etc)" 
              value={newItem.unit}
              onChange={e => setNewItem({...newItem, unit: e.target.value})}
              style={{ flex: 1, background: '#000', border: '1px solid #444', color: '#fff', padding: '1rem', borderRadius: '8px', fontSize: '1rem' }}
            />
          </div>
          <button 
            onClick={addItem}
            style={{ background: '#00c853', color: '#000', border: 'none', padding: '1rem', borderRadius: '8px', fontSize: '1rem', fontWeight: 900 }}
          >
            ADD TO LIST
          </button>
        </div>
      </div>
    </div>
  );
}
