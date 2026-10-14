import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function LoginPage() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success('Welcome back!', `Logged in as ${user.name}`);
      navigate(user.role === 'organizer' || user.role === 'admin' ? '/dashboard' : '/events');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="el-auth-page animate-fade-in">
      <div className="el-auth-layout">
        {/* Left Form Column */}
        <div className="el-auth-form-column">
          <div className="el-auth-form-inner">
            {/* Logo */}
            <Link to="/" className="el-auth-logo">
              <span className="el-auth-logo-badge">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" fill="#eff6ff" stroke="#2563eb" strokeWidth="2"/>
                  <path d="M13 3L6 14H12L11 21L18 10H12L13 3Z" fill="#2563eb"/>
                </svg>
              </span>
              <span>Event<span className="el-auth-logo-accent">OS</span></span>
            </Link>

            <h1 className="el-auth-title">Sign in to your account</h1>
            <p className="el-auth-subtitle">Enter your email and password to continue</p>

            {error && (
              <div className="el-auth-error">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="el-auth-form">
              <div className="form-group">
                <label className="form-label" htmlFor="login-email">Email</label>
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  className="form-control"
                  placeholder="admin@college.ac.in"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <div className="flex items-center justify-between">
                  <label className="form-label" htmlFor="login-password">Password</label>
                  <span className="el-auth-forgot">Forgot password?</span>
                </div>
                <div className="el-password-input-wrapper">
                  <input
                    id="login-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    className="form-control"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    className="el-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>

              <button
                id="login-submit"
                type="submit"
                className="btn btn-primary btn-full el-auth-submit-btn"
                disabled={loading}
              >
                {loading ? <><span className="spinner" /> Signing In...</> : 'Sign In'}
              </button>
            </form>

            <div className="el-auth-footer">
              Don't have an account? <Link to="/register" className="el-auth-link">Sign Up</Link>
            </div>

            {/* Quick Demo Login Preset Pills */}
            <div className="el-demo-box">
              <div className="el-demo-heading">⚡ Quick Demo One-Click Fill:</div>
              <div className="el-demo-pills">
                <button
                  type="button"
                  className="el-demo-btn"
                  onClick={() => setForm({ email: 'organizer@eventos.io', password: 'password123' })}
                >
                  👑 Organizer
                </button>
                <button
                  type="button"
                  className="el-demo-btn"
                  onClick={() => setForm({ email: 'priya@eventos.io', password: 'password123' })}
                >
                  🦺 Volunteer
                </button>
                <button
                  type="button"
                  className="el-demo-btn"
                  onClick={() => setForm({ email: 'attendee@eventos.io', password: 'password123' })}
                >
                  🎟️ Attendee
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Art Banner Column (EventLedger Artwork) */}
        <div className="el-auth-banner-column">
          <div className="el-auth-gradient-art" />
          <div className="el-auth-quote-card">
            <div className="el-quote-mark">“</div>
            <p className="el-quote-text">
              The most powerful event management and gate ops platform we've ever used. Completely saved our annual fest when cell towers went down.
            </p>
            <div className="el-quote-author">
              <div className="el-author-name">Dr. Rajeshwari Sengupta</div>
              <div className="el-author-title">Dean of Student Affairs, Top Tier Engineering University</div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .el-auth-page {
          min-height: 100dvh;
          background: #ffffff;
          display: flex;
        }
        .el-auth-layout {
          display: grid;
          grid-template-columns: 1fr 1.15fr;
          width: 100%;
          min-height: 100dvh;
        }
        @media (max-width: 900px) {
          .el-auth-layout {
            grid-template-columns: 1fr;
          }
          .el-auth-banner-column {
            display: none !important;
          }
        }

        /* Left Column */
        .el-auth-form-column {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 3rem 2rem;
          background: #ffffff;
        }
        .el-auth-form-inner {
          width: 100%;
          max-width: 420px;
        }
        .el-auth-logo {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 1.35rem;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 2rem;
          letter-spacing: -0.03em;
        }
        .el-auth-logo-badge {
          display: flex;
        }
        .el-auth-logo-accent {
          color: #2563eb;
        }
        .el-auth-title {
          font-size: 1.85rem;
          font-weight: 900;
          color: #0f172a;
          letter-spacing: -0.03em;
          margin-bottom: 0.5rem;
        }
        .el-auth-subtitle {
          font-size: 0.95rem;
          color: #64748b;
          margin-bottom: 2rem;
        }

        .el-auth-error {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #b91c1c;
          padding: 10px 14px;
          border-radius: var(--radius-md);
          font-size: 0.85rem;
          margin-bottom: 1.5rem;
        }

        .el-password-input-wrapper {
          position: relative;
        }
        .el-password-toggle {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          font-size: 1rem;
          opacity: 0.6;
        }
        .el-password-toggle:hover { opacity: 1; }

        .el-auth-forgot {
          font-size: 0.8rem;
          color: #2563eb;
          cursor: pointer;
          font-weight: 500;
        }
        .el-auth-forgot:hover { text-decoration: underline; }

        .el-auth-submit-btn {
          margin-top: 1rem;
          padding: 0.85rem;
          font-size: 0.95rem;
          font-weight: 700;
          border-radius: var(--radius-md);
        }

        .el-auth-footer {
          text-align: center;
          font-size: 0.9rem;
          color: #64748b;
          margin-top: 1.75rem;
        }
        .el-auth-link {
          color: #2563eb;
          font-weight: 600;
        }
        .el-auth-link:hover { text-decoration: underline; }

        /* Demo Presets */
        .el-demo-box {
          margin-top: 2rem;
          padding: 14px;
          background: #f8fafc;
          border: 1px dashed #cbd5e1;
          border-radius: var(--radius-md);
        }
        .el-demo-heading {
          font-size: 0.75rem;
          font-weight: 700;
          color: #475569;
          margin-bottom: 8px;
        }
        .el-demo-pills {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }
        .el-demo-btn {
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: var(--radius-full);
          padding: 4px 12px;
          font-size: 0.75rem;
          font-weight: 600;
          color: #334155;
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .el-demo-btn:hover {
          background: #eff6ff;
          border-color: #93c5fd;
          color: #1d4ed8;
        }

        /* Right Banner Column */
        .el-auth-banner-column {
          position: relative;
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 40%, #06b6d4 100%);
          display: flex;
          align-items: flex-end;
          padding: 4rem;
          overflow: hidden;
        }
        .el-auth-gradient-art {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 80% 20%, rgba(255,255,255,0.2) 0%, transparent 60%),
                      radial-gradient(circle at 20% 80%, rgba(37,99,235,0.4) 0%, transparent 70%);
          filter: blur(40px);
        }
        .el-auth-quote-card {
          position: relative;
          z-index: 2;
          background: rgba(15, 23, 42, 0.45);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 20px;
          padding: 2.25rem;
          color: #ffffff;
          max-width: 520px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35);
        }
        .el-quote-mark {
          font-size: 3rem;
          font-family: Georgia, serif;
          line-height: 1;
          color: #93c5fd;
          margin-bottom: 0.5rem;
        }
        .el-quote-text {
          font-size: 1.15rem;
          line-height: 1.6;
          font-weight: 500;
          margin-bottom: 1.5rem;
          color: #f8fafc;
        }
        .el-author-name {
          font-size: 0.95rem;
          font-weight: 700;
          color: #ffffff;
        }
        .el-author-title {
          font-size: 0.8rem;
          color: #cbd5e1;
          margin-top: 2px;
        }
      `}</style>
    </div>
  );
}
