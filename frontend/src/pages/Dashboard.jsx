import { useQuery } from '@tanstack/react-query';
import { Box, Warehouse, Truck, Layers, Users, AlertTriangle, CheckCircle, Clock, XCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const fetchStats = async () => {
  const res = await fetch('/api/stats');
  if (!res.ok) throw new Error('Failed to fetch stats');
  return res.json();
};

const StatCard = ({ title, value, icon, color }) => (
  <div className="glass-panel" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '20px' }}>
    <div style={{ backgroundColor: `${color}20`, padding: '16px', borderRadius: '12px', color: color }}>
      {icon}
    </div>
    <div>
      <div style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '4px' }}>{title}</div>
      <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{value}</div>
    </div>
  </div>
);

const StatusIndicator = ({ error }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 16px',
    backgroundColor: 'var(--bg-card)', borderRadius: '20px',
    border: `1px solid ${error ? 'var(--danger)' : 'var(--success)'}`,
    boxShadow: `0 0 10px ${error ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)'}`
  }}>
    <div style={{
      width: '10px', height: '10px', borderRadius: '50%',
      backgroundColor: error ? 'var(--danger)' : 'var(--success)',
      boxShadow: `0 0 8px ${error ? 'var(--danger)' : 'var(--success)'}`
    }}></div>
    <span style={{ fontSize: '14px', fontWeight: '600', color: error ? 'var(--danger)' : 'var(--success)' }}>
      {error ? 'System Offline / Error' : 'System Operational'}
    </span>
  </div>
);

export default function Dashboard() {
  const role = localStorage.getItem('role') || 'WAREHOUSE_STAFF';
  const { data, isLoading, error } = useQuery({
    queryKey: ['stats'],
    queryFn: fetchStats,
    refetchInterval: 5000
  });

  const stats = data?.data || {
    products: 0,
    warehouses: 0,
    customers: 0,
    totalStock: 0,
    lowStockCount: 0,
    pendingShipments: 0,
    processingShipments: 0,
    inTransitShipments: 0,
    deliveredShipments: 0,
    cancelledShipments: 0,
    chartData: []
  };

  if (isLoading) return <div style={{ padding: '32px' }}>Loading dashboard data...</div>;

  const renderAdminDashboard = () => (
    <>
      <div className="stats-container" style={{ marginBottom: '24px' }}>
        <StatCard title="Total Products" value={stats.products} icon={<Box size={32} />} color="#3b82f6" />
        <StatCard title="Active Warehouses" value={stats.warehouses} icon={<Warehouse size={32} />} color="#8b5cf6" />
        <StatCard title="Total Customers" value={stats.customers} icon={<Users size={32} />} color="#06b6d4" />
      </div>

      <div className="stats-container" style={{ marginBottom: '32px' }}>
        <StatCard title="Pending" value={stats.pendingShipments ?? stats.statusCounts?.PENDING ?? 0} icon={<Truck size={32} />} color="#f59e0b" />
        <StatCard title="Processing" value={stats.processingShipments ?? stats.statusCounts?.PROCESSING ?? 0} icon={<Clock size={32} />} color="#3b82f6" />
        <StatCard title="In Transit" value={stats.inTransitShipments ?? stats.statusCounts?.IN_TRANSIT ?? 0} icon={<Truck size={32} />} color="#8b5cf6" />
        <StatCard title="Delivered" value={stats.deliveredShipments ?? stats.statusCounts?.DELIVERED ?? 0} icon={<CheckCircle size={32} />} color="#22c55e" />
        <StatCard title="Cancelled" value={stats.cancelledShipments ?? stats.statusCounts?.CANCELLED ?? 0} icon={<XCircle size={32} />} color="#ef4444" />
      </div>

      <div className="glass-panel">
        <h2 style={{ marginBottom: '24px' }}>Live Shipment Distribution</h2>
        <div style={{ height: '350px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.chartData} margin={{ top: 20, right: 20, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="name" height={60} stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} interval={0} angle={-45} textAnchor="end" axisLine={false} tickLine={false} />
              <YAxis width={30} stroke="#94a3b8" tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} tickMargin={8} />
              <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f8fafc' }} itemStyle={{ color: '#3b82f6', fontWeight: 'bold' }} />
              <Bar dataKey="count" name="Total Shipments" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={50} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );


  const renderWarehouseDashboard = () => {
    return (
      <>
        <div className="stats-container" style={{ marginBottom: '24px' }}>
          <StatCard title="Total Units in Stock" value={stats.totalStock} icon={<Layers size={32} />} color="#3b82f6" />
          <StatCard title="Unique Products" value={stats.products} icon={<Box size={32} />} color="#8b5cf6" />
          <StatCard title="Low Stock Alerts (<50)" value={stats.lowStockCount} icon={<AlertTriangle size={32} />} color={stats.lowStockCount > 0 ? "#ef4444" : "#22c55e"} />
        </div>
        <div className="glass-panel">
          <h2 style={{ marginBottom: '16px' }}>Stock Capacity by Warehouse</h2>
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.warehouseChartData || []} margin={{ top: 20, right: 20, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" height={60} stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 13 }} axisLine={false} tickLine={false} />
                <YAxis width={40} stroke="#94a3b8" tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} tickMargin={8} />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f8fafc' }} />
                <Bar dataKey="stock" name="Units in Stock" fill="#8b5cf6" radius={[4, 4, 0, 0]} maxBarSize={60} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </>
    );
  };

  const renderLogisticsDashboard = () => (
    <>
      <div className="stats-container" style={{ marginBottom: '24px' }}>
        <StatCard title="Action Required (Pending)" value={stats.pendingShipments} icon={<AlertTriangle size={32} />} color="#ef4444" />
        <StatCard title="Currently In Transit" value={stats.inTransitShipments} icon={<Truck size={32} />} color="#f59e0b" />
        <StatCard title="Successfully Delivered" value={stats.deliveredShipments} icon={<CheckCircle size={32} />} color="#22c55e" />
      </div>
      <div className="glass-panel" style={{ marginBottom: '24px' }}>
        <h2 style={{ marginBottom: '24px' }}>Live Shipment Distribution</h2>
        <div style={{ height: '350px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.chartData} margin={{ top: 20, right: 20, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="name" height={60} stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} interval={0} angle={-45} textAnchor="end" axisLine={false} tickLine={false} />
              <YAxis width={30} stroke="#94a3b8" tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} tickMargin={8} />
              <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f8fafc' }} itemStyle={{ color: '#3b82f6', fontWeight: 'bold' }} />
              <Bar dataKey="count" name="Total Shipments" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={50} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );

  return (
    <div>
      <div className="dashboard-header">
        <div>
          <h1 style={{ marginBottom: '8px' }}>
            {role === 'ADMIN' ? 'Executive Overview' : role === 'WAREHOUSE_STAFF' ? 'Warehouse Hub' : 'Logistics Hub'}
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Live metrics from your Nexus Logistics network.</p>
        </div>
        <StatusIndicator error={error} />
      </div>

      {error && <div style={{ padding: '16px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', borderRadius: '8px', marginBottom: '32px', border: '1px solid var(--danger)' }}>Error loading stats: {error.message}</div>}

      {role === 'ADMIN' && renderAdminDashboard()}
      {role === 'WAREHOUSE_STAFF' && renderWarehouseDashboard()}
      {role === 'LOGISTICS_STAFF' && renderLogisticsDashboard()}
    </div>
  );
}
