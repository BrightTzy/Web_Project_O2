import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useOutletContext } from 'react-router-dom';
import { Trash2, Plus } from 'lucide-react';

const fetchInventory = async () => { const res = await fetch('/api/inventory'); return res.json(); };
const fetchProducts = async () => { const res = await fetch('/api/products'); return res.json(); };
const fetchWarehouses = async () => { const res = await fetch('/api/warehouses'); return res.json(); };

export default function Inventory() {
  const { searchQuery } = useOutletContext() || { searchQuery: '' };
  const queryClient = useQueryClient();
  const [productId, setProductId] = useState('');
  const [warehouseId, setWarehouseId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const { data: invData, isLoading: invLoading } = useQuery({ queryKey: ['inventory'], queryFn: fetchInventory });
  const { data: prodData } = useQuery({ queryKey: ['products'], queryFn: fetchProducts });
  const { data: whData } = useQuery({ queryKey: ['warehouses'], queryFn: fetchWarehouses });

  const createMutation = useMutation({
    mutationFn: async (newInv) => {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newInv),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add inventory');
      return data;
    },
    onSuccess: () => {
      setErrorMsg('');
      setProductId('');
      setWarehouseId('');
      setQuantity('');
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
    onError: (err) => {
      setErrorMsg(err.message);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await fetch(`/api/inventory/${id}`, { method: 'DELETE' });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['inventory'] })
  });

  const handleCreate = (e) => {
    e.preventDefault();
    createMutation.mutate({ productId, warehouseId, quantity: Number(quantity) });
  };

  const filteredData = invData?.data?.filter(inv => 
    (inv.productId?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (inv.warehouseId?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div>
      <h1 style={{ marginBottom: '32px' }}>Inventory Stock Management</h1>
      
      <div className="glass-panel" style={{ marginBottom: '32px' }}>
        <h3 style={{ marginBottom: '16px' }}>Add Stock to Warehouse</h3>
        
        {errorMsg && (
          <div style={{ 
            color: 'var(--danger)', marginBottom: '16px', fontSize: '14px', 
            border: '1px solid var(--danger)', padding: '12px', borderRadius: '8px', 
            backgroundColor: 'rgba(239, 68, 68, 0.1)', fontWeight: '500' 
          }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleCreate} style={{ display: 'flex', gap: '16px' }}>
          <select className="input-field" style={{marginBottom: 0}} value={productId} onChange={e => setProductId(e.target.value)} required>
            <option value="">Select Product...</option>
            {prodData?.data?.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
          </select>
          <select className="input-field" style={{marginBottom: 0}} value={warehouseId} onChange={e => setWarehouseId(e.target.value)} required>
            <option value="">Select Warehouse...</option>
            {whData?.data?.map(w => <option key={w._id} value={w._id}>{w.name}</option>)}
          </select>
          <input className="input-field" style={{marginBottom: 0}} type="number" placeholder="Quantity" value={quantity} onChange={e => setQuantity(e.target.value)} required />
          <button type="submit" className="btn-primary" style={{ height: '44px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={18} /> Add
          </button>
        </form>
      </div>

      <div className="glass-panel">
        <h3 style={{ marginBottom: '16px' }}>Current Stock Levels</h3>
        {invLoading ? <p>Loading inventory...</p> : (
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '12px' }}>Product</th>
                <th style={{ padding: '12px' }}>Warehouse</th>
                <th style={{ padding: '12px' }}>Quantity</th>
                <th style={{ padding: '12px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map(inv => (
                <tr key={inv._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '12px' }}>{inv.productId?.name || 'Unknown'}</td>
                  <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{inv.warehouseId?.name || 'Unknown'}</td>
                  <td style={{ padding: '12px' }}>{inv.quantity} units</td>
                  <td style={{ padding: '12px' }}>
                    <button onClick={() => deleteMutation.mutate(inv._id)} className="btn-danger" style={{ padding: '6px' }}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>No inventory found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
