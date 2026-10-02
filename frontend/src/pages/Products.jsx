import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useOutletContext } from 'react-router-dom';
import { Trash2, Plus } from 'lucide-react';

const fetchProducts = async () => {
  const res = await fetch('/api/products');
  if (!res.ok) throw new Error('Network response was not ok');
  return res.json();
};

export default function Products() {
  const { searchQuery } = useOutletContext() || { searchQuery: '' };
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [price, setPrice] = useState('');

  const { data, isLoading } = useQuery({ queryKey: ['products'], queryFn: fetchProducts });

  const createMutation = useMutation({
    mutationFn: async (newProduct) => {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct),
      });
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] })
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] })
  });

  const handleCreate = (e) => {
    e.preventDefault();
    createMutation.mutate({ name, sku, price: Number(price) });
    setName(''); setSku(''); setPrice('');
  };

  const filteredData = data?.data?.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div>
      <h1 style={{ marginBottom: '32px' }}>Product Catalog</h1>
      
      <div className="glass-panel" style={{ marginBottom: '32px' }}>
        <h3 style={{ marginBottom: '16px' }}>Add New Product</h3>
        <form onSubmit={handleCreate} style={{ display: 'flex', gap: '16px' }}>
          <input className="input-field" style={{marginBottom: 0}} placeholder="Product Name" value={name} onChange={e => setName(e.target.value)} required />
          <input className="input-field" style={{marginBottom: 0}} placeholder="SKU" value={sku} onChange={e => setSku(e.target.value)} required />
          <input className="input-field" style={{marginBottom: 0}} type="number" placeholder="Price ($)" value={price} onChange={e => setPrice(e.target.value)} required />
          <button type="submit" className="btn-primary" style={{ height: '44px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={18} /> Add
          </button>
        </form>
      </div>

      <div className="glass-panel">
        <h3 style={{ marginBottom: '16px' }}>Inventory List</h3>
        {isLoading ? <p>Loading products...</p> : (
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '12px' }}>Name</th>
                <th style={{ padding: '12px' }}>SKU</th>
                <th style={{ padding: '12px' }}>Price</th>
                <th style={{ padding: '12px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map(product => (
                <tr key={product._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '12px' }}>{product.name}</td>
                  <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{product.sku}</td>
                  <td style={{ padding: '12px' }}>${product.price}</td>
                  <td style={{ padding: '12px' }}>
                    <button onClick={() => deleteMutation.mutate(product._id)} className="btn-danger" style={{ padding: '6px' }}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>No products found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
