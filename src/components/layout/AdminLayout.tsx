import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  getStoredAdminSession, 
  setStoredAdminSession 
} from '../../lib/adminAuth';
import { 
  Activity, 
  ShieldCheck, 
  Cpu, 
  FileText, 
  LogOut,
  LayoutDashboard
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const session = getStoredAdminSession();

  // Route Guard: If not logged in as Admin, redirect to /admin/login
  if (!session) {
    navigate('/admin/login', { replace: true });
    return null;
  }

  const handleLogout = () => {
    setStoredAdminSession(null);
    navigate('/admin/login');
  };

  const navLinks = [
    { name: 'Live Tokens Queue', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Operations Simulator', path: '/admin/operations-simulator', icon: Cpu },
    { name: 'Health Records Vault', path: '/admin/health-records', icon: FileText },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f4f8fb', display: 'flex', flexDirection: 'column' }}>
      {/* Top Header Bar for Hospital Admin Portal */}
      <header style={{
        background: '#ffffff',
        borderBottom: '1px solid #cbd5e1',
        padding: '12px 24px',
        boxShadow: '0 2px 8px rgba(15, 39, 68, 0.05)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16
      }}>
        {/* Left: Hospivio Admin Logo & Hospital Session Name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div 
            onClick={() => navigate('/admin/dashboard')}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 8, 
              background: 'linear-gradient(140deg, #16a3ae, #0d6e7d)', 
              color: '#fff', 
              padding: '6px 12px', 
              borderRadius: '9px',
              cursor: 'pointer' 
            }}
          >
            <Activity size={18} />
            <span style={{ fontSize: '15px', fontWeight: 800, letterSpacing: '0.4px' }}>Hospivio</span>
            <span style={{ fontSize: '9.5px', background: 'rgba(255,255,255,0.22)', padding: '2px 5px', borderRadius: '4px', fontWeight: 700, textTransform: 'uppercase' }}>Admin</span>
          </div>

          <div style={{ height: '22px', width: '1px', background: '#cbd5e1' }} />

          <div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)' }}>
              {session.hospitalName}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--teal)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
              <ShieldCheck size={12} /> Live Control Session
            </div>
          </div>
        </div>

        {/* Center: Admin Navigation Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f1f5f9', padding: '4px', borderRadius: '10px' }}>
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '7px 14px',
                  borderRadius: '7px',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  textDecoration: 'none',
                  background: isActive ? '#ffffff' : 'transparent',
                  color: isActive ? '#0e7c86' : '#64748b',
                  boxShadow: isActive ? '0 2px 4px rgba(0,0,0,0.06)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={15} />
                <span>{link.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Right: Exit / Logout Button */}
        <button
          type="button"
          onClick={handleLogout}
          style={{
            background: '#fff1f2',
            border: '1px solid #fecdd3',
            color: '#e11d48',
            padding: '7px 14px',
            borderRadius: '9px',
            fontSize: '12.5px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
          title="Sign out of Hospital Admin Portal"
        >
          <LogOut size={15} />
          <span>Admin Logout</span>
        </button>
      </header>

      {/* Main Admin Content Body */}
      <main style={{ flex: 1 }}>
        {children}
      </main>
    </div>
  );
};
