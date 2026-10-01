import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Package } from 'lucide-react';

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('ADMIN');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, role })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }
      
      // Navigate to login after successful registration
      navigate('/login');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px', color: 'var(--accent)' }}>
          <Package size={48} />
        </div>
        <h1 style={{ marginBottom: '8px' }}>Create Account</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>Join the Nexus Logistics system</p>

        {error && <div style={{ color: 'var(--danger)', marginBottom: '16px', fontSize: '14px' }}>{error}</div>}

        <form onSubmit={handleRegister}>
          <input
            type="text"
            className="input-field"
            placeholder="Username (e.g. admin01)"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            className="input-field"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
          <select 
            className="input-field" 
            value={role} 
            onChange={(e) => setRole(e.target.value)}
            style={{ appearance: 'auto' }}
          >
            <option value="ADMIN">System Admin</option>
            <option value="WAREHOUSE_STAFF">Warehouse Staff</option>
            <option value="LOGISTICS_STAFF">Logistics Staff</option>
          </select>

          <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '16px' }} disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Register'}
          </button>
        </form>

        <div style={{ marginTop: '24px', fontSize: '14px', color: 'var(--text-secondary)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Sign In</Link>
        </div>
      </div>
    </div>
  );
}
