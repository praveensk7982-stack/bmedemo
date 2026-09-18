import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Building2, 
  UserCheck, 
  Calendar, 
  Users, 
  AlertCircle, 
  MapPin, 
  Sparkles, 
  Settings,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const navItems = [
    { name: 'Hospitals', path: '/hospitals', icon: Building2 },
    { name: 'Doctors', path: '/doctors', icon: UserCheck },
    { name: 'Appointments', path: '/appointments', icon: Calendar },
    { name: 'Queue / Waiting', path: '/queue', icon: Users },
    { name: 'Emergency', path: '/emergency', icon: AlertCircle },
    { name: 'Nearby', path: '/nearby', icon: MapPin },
    { name: 'AI Assistant', path: '/ai-assistant', icon: Sparkles },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <>
      <aside className={`sidebar ${isOpen ? 'open' : ''}`} id="sidebar">
        <div className="brand">
          <div className="brand-mark">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
              <path d="M12 20.5s-7.5-4.6-7.5-9.7A4.3 4.3 0 0 1 12 8.2a4.3 4.3 0 0 1 7.5 2.6c0 5.1-7.5 9.7-7.5 9.7Z" fill="#fff" />
              <path d="M12 11v4M10 13h4" stroke="#0d6e7d" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <div className="brand-name">Hospivio</div>
            <div className="brand-sub">Better Care. Connected.</div>
          </div>
        </div>

        <nav className="nav" id="nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => (isActive ? 'active' : '')}
                onClick={onClose}
              >
                <Icon size={16} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="side-foot">
          <NavLink to="/nearby" className="side-promo" onClick={onClose}>
            <MapPin size={18} color="#2fd0c8" />
            <span style={{ flex: 1 }}>
              <span className="t" style={{ display: 'block' }}>AI Nearby Location</span>
              <span className="s" style={{ display: 'block' }}>Find hospitals near you</span>
            </span>
            <ChevronRight size={13} color="#8ea5bc" />
          </NavLink>

          <div className="status">
            <span className="dot"></span>
            <span>
              <span className="t" style={{ display: 'block' }}>Online</span>
              <span className="s" style={{ display: 'block' }}>Hospivio Network</span>
            </span>
          </div>
        </div>
      </aside>

      <div
        className={`scrim-overlay ${isOpen ? 'show' : ''}`}
        id="scrim"
        onClick={onClose}
      />
    </>
  );
};
