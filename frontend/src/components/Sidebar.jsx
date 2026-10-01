import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Box, Warehouse, Truck, Users, Layers, LogOut } from 'lucide-react';

export default function Sidebar() {
  const navigate = useNavigate();
  const username = localStorage.getItem('username') || 'Staff Member';
  const role = localStorage.getItem('role') || 'WAREHOUSE_STAFF';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    navigate('/login');
  };

  const navStyles = ({ isActive }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    color: isActive ? 'white' : 'var(--text-secondary)',
    backgroundColor: isActive ? 'var(--accent)' : 'transparent',
    borderRadius: '8px',
    textDecoration: 'none',
    marginBottom: '8px',
    transition: 'all 0.2s',
  });

  return (
    <div className="glass-panel sidebar-glass" style={{ width: '280px', height: '100vh', borderRadius: '0', display: 'flex', flexDirection: 'column', borderTop: 'none', borderBottom: 'none', borderLeft: 'none' }}>
      <div className="sidebar-header" style={{ padding: '20px 16px', marginBottom: '32px' }}>
        <h2 style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Box color="var(--accent)" /> Nexus Logistics
        </h2>
      </div>

      <nav className="sidebar-nav" style={{ flex: 1, padding: '0 16px', overflowY: 'auto' }}>
        {/* Dashboard is now visible to everyone */}
        <NavLink to="/dashboard" style={navStyles} end>
          <LayoutDashboard size={20} /> Dashboard
        </NavLink>

        {(role === 'ADMIN' || role === 'WAREHOUSE_STAFF') && (
          <NavLink to="/dashboard/warehouses" style={navStyles}>
            <Warehouse size={20} /> Warehouses
          </NavLink>
        )}

        {(role === 'ADMIN' || role === 'WAREHOUSE_STAFF') && (
          <>
            <NavLink to="/dashboard/products" style={navStyles}>
              <Box size={20} /> Products
            </NavLink>
            <NavLink to="/dashboard/inventory" style={navStyles}>
              <Layers size={20} /> Inventory
            </NavLink>
          </>
        )}

        {(role === 'ADMIN' || role === 'LOGISTICS_STAFF') && (
          <>
            <NavLink to="/dashboard/customers" style={navStyles}>
              <Users size={20} /> Customers
            </NavLink>
            <NavLink to="/dashboard/shipments" style={navStyles}>
              <Truck size={20} /> Shipments
            </NavLink>
          </>
        )}
      </nav>

      <div className="sidebar-footer" style={{ padding: '24px 16px', borderTop: '1px solid var(--border-color)' }}>
        <div style={{ marginBottom: '16px', color: 'var(--text-secondary)', fontSize: '14px' }}>
          Logged in as: <strong style={{color: 'white'}}>{username}</strong>
          <div style={{fontSize: '12px', marginTop: '4px', opacity: 0.7}}>{role.replace('_', ' ')}</div>
        </div>
        <button onClick={handleLogout} className="btn-danger" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <LogOut size={18} /> <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}
