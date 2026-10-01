import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useOutletContext } from 'react-router-dom';
import { Trash2, Plus } from 'lucide-react';

const fetchWarehouses = async () => {
  const res = await fetch('/api/warehouses');
  if (!res.ok) throw new Error('Network response was not ok');
  return res.json();
};

const fetchInventory = async () => {
  const res = await fetch('/api/inventory');
  if (!res.ok) throw new Error('Network response was not ok');
  return res.json();
};

export default function Warehouses() {
  const { searchQuery } = useOutletContext() || { searchQuery: '' };
  const role = localStorage.getItem('role') || 'WAREHOUSE_STAFF';
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [capacity, setCapacity] = useState('');

  const { data, isLoading } = useQuery({ queryKey: ['warehouses'], queryFn: fetchWarehouses });
  const { data: invData } = useQuery({ queryKey: ['inventory'], queryFn: fetchInventory });

  const createMutation = useMutation({
    mutationFn: async (newWarehouse) => {
      const res = await fetch('/api/warehouses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newWarehouse),
      });
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['warehouses'] })
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`/api/warehouses/${id}`, { method: 'DELETE' });
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['warehouses'] })
  });

  const handleCreate = (e) => {
    e.preventDefault();
    createMutation.mutate({ name, location, capacity: Number(capacity) });
    setName(''); setLocation(''); setCapacity('');
  };

  const filteredData = data?.data?.filter(w => 
    w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.location.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div>
      <h1 style={{ marginBottom: '32px' }}>Warehouse Locations</h1>
      
      {role === 'ADMIN' && (
        <div className="glass-panel" style={{ marginBottom: '32px' }}>
          <h3 style={{ marginBottom: '16px' }}>Add New Warehouse</h3>
          <form onSubmit={handleCreate} style={{ display: 'flex', gap: '16px' }}>
            <input className="input-field" style={{marginBottom: 0}} placeholder="Warehouse Name" value={name} onChange={e => setName(e.target.value)} required />
            <input className="input-field" style={{marginBottom: 0}} placeholder="Location (City, State)" value={location} onChange={e => setLocation(e.target.value)} required />
            <input className="input-field" style={{marginBottom: 0}} type="number" placeholder="Capacity" value={capacity} onChange={e => setCapacity(e.target.value)} required />
            <button type="submit" className="btn-primary" style={{ height: '44px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Plus size={18} /> Add
            </button>
          </form>
        </div>
      )}

      <div className="glass-panel">
        <h3 style={{ marginBottom: '16px' }}>Active Facilities & Stored Inventory</h3>
        {isLoading ? <p>Loading warehouses...</p> : (
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '12px' }}>Name</th>
                <th style={{ padding: '12px' }}>Location</th>
                <th style={{ padding: '12px' }}>Current Inventory</th>
                {role === 'ADMIN' && <th style={{ padding: '12px', width: '80px' }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredData.map(warehouse => {
                const warehouseInventory = invData?.data?.filter(inv => inv.warehouseId?._id === warehouse._id) || [];
                
                return (
                  <tr key={warehouse._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '12px', verticalAlign: 'top' }}>
                      <strong style={{color: 'white'}}>{warehouse.name}</strong>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>Cap: {warehouse.capacity} units</div>
                    </td>
                    <td style={{ padding: '12px', color: 'var(--text-secondary)', verticalAlign: 'top' }}>{warehouse.location}</td>
                    <td style={{ padding: '12px', verticalAlign: 'top' }}>
                      {warehouseInventory.length === 0 ? (
                        <span style={{ color: 'var(--text-secondary)', fontSize: '14px', fontStyle: 'italic' }}>Facility is empty</span>
                      ) : (
                        <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                          {warehouseInventory.map(inv => (
                            <li key={inv._id} style={{ marginBottom: '4px' }}>
                              {inv.productId?.name || 'Unknown'}: <strong style={{color: 'white'}}>{inv.quantity} units</strong>
                            </li>
                          ))}
                        </ul>
                      )}
                    </td>
                    {role === 'ADMIN' && (
                      <td style={{ padding: '12px', verticalAlign: 'top' }}>
                        <button onClick={() => deleteMutation.mutate(warehouse._id)} className="btn-danger" style={{ padding: '6px' }}>
                          <Trash2 size={16} />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={role === 'ADMIN' ? 4 : 3} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>No warehouses found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
