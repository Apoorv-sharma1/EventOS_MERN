import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ICONS = {
  home:       { icon: '🏠', label: 'Home',       path: '/' },
  events:     { icon: '🎪', label: 'Events',     path: '/events' },
  scan:       { icon: '📷', label: 'Scan',       path: '/scan' },
  ticket:     { icon: '🎟️', label: 'Ticket',    path: '/my-ticket' },
  report:     { icon: '🚨', label: 'Report',     path: '/report-incident' },
  assign:     { icon: '📋', label: 'Tasks',      path: '/assignments' },
  dashboard:  { icon: '📊', label: 'Command',    path: '/dashboard' },
};

export default function BottomNav() {
  const { user } = useAuth();

  let navItems = [ICONS.home, ICONS.events, ICONS.scan];
  if (!user) {
    navItems = [ICONS.home, ICONS.events, ICONS.scan];
  } else if (user.role === 'organizer' || user.role === 'admin') {
    navItems = [ICONS.home, ICONS.events, ICONS.scan, ICONS.report, ICONS.dashboard];
  } else if (user.role === 'volunteer') {
    navItems = [ICONS.home, ICONS.events, ICONS.scan, ICONS.report, ICONS.assign];
  } else {
    navItems = [ICONS.home, ICONS.events, ICONS.scan, ICONS.ticket, ICONS.report];
  }

  return (
    <nav className="bottom-nav">
      {navItems.map(item => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.path === '/'}
          className={({ isActive }) => `bottom-nav-item${isActive ? ' active' : ''}`}
        >
          <span className="bottom-nav-icon">{item.icon}</span>
          <span className="bottom-nav-label">{item.label}</span>
        </NavLink>
      ))}

      <style>{`
        .bottom-nav {
          display: none;
          position: fixed;
          bottom: 0; left: 0; right: 0;
          z-index: var(--z-header);
          background: rgba(255, 255, 255, 0.92);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-top: 1px solid var(--color-border);
          box-shadow: 0 -4px 12px rgba(15, 23, 42, 0.04);
          justify-content: space-around;
          padding: var(--sp-2) 0 calc(var(--sp-2) + env(safe-area-inset-bottom, 0px));
        }
        @media (max-width: 768px) {
          .bottom-nav {
            display: flex;
          }
        }
        .bottom-nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
          padding: var(--sp-2) var(--sp-3);
          border-radius: var(--radius-md);
          color: var(--color-text-secondary);
          transition: all var(--transition-fast);
          flex: 1;
        }
        .bottom-nav-item:hover { color: var(--color-text-primary); }
        .bottom-nav-item.active { color: var(--color-primary); font-weight: 700; }
        .bottom-nav-item.active .bottom-nav-icon {
          transform: scale(1.15);
        }
        .bottom-nav-icon { font-size: 1.2rem; transition: all var(--transition-fast); }
        .bottom-nav-label { font-size: 0.65rem; font-weight: 600; letter-spacing: 0.02em; }
      `}</style>
    </nav>
  );
}
