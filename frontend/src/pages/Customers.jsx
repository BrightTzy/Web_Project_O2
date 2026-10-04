import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useOutletContext } from 'react-router-dom';
import { Trash2, Plus } from 'lucide-react';

const fetchCustomers = async () => {
  const res = await fetch('/api/customers');
  if (!res.ok) throw new Error('Network response was not ok');
  return res.json();
};

export default function Customers() {
  const { searchQuery } = useOutletContext() || { searchQuery: '' };
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');

  const { data, isLoading } = useQuery({ queryKey: ['customers'], queryFn: fetchCustomers });

  const createMutation = useMutation({
    mutationFn: async (newCustomer) => {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCustomer),
      });
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['customers'] })
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await fetch(`/api/customers/${id}`, { method: 'DELETE' });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['customers'] })
  });

  const handleCreate = (e) => {
    e.preventDefault();
    createMutation.mutate({ name, email, address });
    setName(''); setEmail(''); setAddress('');
  };

  const filteredData = data?.data?.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.address.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div>
      <h1 style={{ marginBottom: '32px' }}>Customer Profiles</h1>
      
      <div className="glass-panel" style={{ marginBottom: '32px' }}>
        <h3 style={{ marginBottom: '16px' }}>Add New Customer</h3>
        <form onSubmit={handleCreate} style={{ display: 'flex', gap: '16px' }}>
          <input className="input-field" style={{marginBottom: 0}} placeholder="Customer Name" value={name} onChange={e => setName(e.target.value)} required />
          <input className="input-field" style={{marginBottom: 0}} type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
          <input className="input-field" style={{marginBottom: 0}} placeholder="Shipping Address" value={address} onChange={e => setAddress(e.target.value)} required />
          <button type="submit" className="btn-primary" style={{ height: '44px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={18} /> Add
          </button>
        </form>
      </div>

      <div className="glass-panel">
        <h3 style={{ marginBottom: '16px' }}>Client Database</h3>
        {isLoading ? <p>Loading customers...</p> : (
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '12px' }}>Name</th>
                <th style={{ padding: '12px' }}>Email</th>
                <th style={{ padding: '12px' }}>Address</th>
                <th style={{ padding: '12px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map(customer => (
                <tr key={customer._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '12px' }}>{customer.name}</td>
                  <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{customer.email}</td>
                  <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{customer.address}</td>
                  <td style={{ padding: '12px' }}>
                    <button onClick={() => deleteMutation.mutate(customer._id)} className="btn-danger" style={{ padding: '6px' }}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>No customers found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
