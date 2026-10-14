import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

const ROLE_COLORS = {
  admin: '#ec4899',
  organizer: '#6366f1',
  volunteer: '#10b981',
  attendee: '#9d9ab4',
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">
          <span className="navbar-logo-badge">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" fill="#eff6ff" stroke="#2563eb" strokeWidth="2"/>
              <path d="M13 3L6 14H12L11 21L18 10H12L13 3Z" fill="#2563eb"/>
            </svg>
          </span>
          <span className="navbar-logo-text">Event<span className="navbar-logo-accent">OS</span></span>
        </Link>

        <nav className="navbar-links">
          <Link to="/events" className="navbar-link">Discover</Link>
          <Link to="/schedule" className="navbar-link">Schedule</Link>
          {user?.role === 'organizer' || user?.role === 'admin' ? (
            <Link to="/dashboard" className="navbar-link">Command Center</Link>
          ) : null}
          {user?.role === 'volunteer' || user?.role === 'organizer' || user?.role === 'admin' ? (
            <Link to="/assignments" className="navbar-link">Assignments</Link>
          ) : null}
          <Link to="/scan" className="navbar-link">Gate Scanner</Link>
        </nav>

        <div className="navbar-right">
          {user ? (
            <div className="navbar-user">
              <span className="navbar-role-pill">
                <span className="navbar-role-dot" style={{ background: ROLE_COLORS[user.role] || '#94a3b8' }} />
                <span className="navbar-username">{user.name.split(' ')[0]}</span>
              </span>
              <button className="btn btn-secondary btn-sm" onClick={handleLogout}>Sign Out</button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="navbar-login-link">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .navbar {
          position: sticky;
          top: 0;
          z-index: var(--z-header);
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border-bottom: 1px solid var(--color-border);
        }
        .navbar-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 var(--sp-4);
          height: 68px;
          display: flex;
          align-items: center;
          gap: var(--sp-6);
        }
        .navbar-logo {
          display: flex;
          align-items: center;
          gap: var(--sp-2);
          font-weight: 800;
          font-size: 1.3rem;
          color: #0f172a;
          letter-spacing: -0.03em;
          flex-shrink: 0;
        }
        .navbar-logo-badge {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .navbar-logo-accent {
          color: var(--color-primary);
        }
        .navbar-links {
          display: flex;
          align-items: center;
          gap: var(--sp-2);
          flex: 1;
        }
        .navbar-link {
          padding: 6px 14px;
          border-radius: var(--radius-full);
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--color-text-secondary);
          transition: all var(--transition-fast);
        }
        .navbar-link:hover {
          color: var(--color-text-primary);
          background: var(--color-surface-2);
        }
        .navbar-right {
          margin-left: auto;
          flex-shrink: 0;
        }
        .navbar-login-link {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--color-text-secondary);
          padding: 6px 12px;
          transition: color var(--transition-fast);
        }
        .navbar-login-link:hover {
          color: var(--color-text-primary);
        }
        .navbar-user {
          display: flex;
          align-items: center;
          gap: var(--sp-3);
        }
        .navbar-role-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: var(--color-surface-2);
          border: 1px solid var(--color-border);
          padding: 4px 12px;
          border-radius: var(--radius-full);
          font-size: 0.825rem;
          font-weight: 600;
          color: var(--color-text-primary);
        }
        .navbar-role-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }
        @media (max-width: 640px) {
          .navbar-links { display: none; }
        }
      `}</style>
    </header>
  );
}
