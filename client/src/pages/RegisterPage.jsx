import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'attendee', phone: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      const user = await register(form);
      toast.success('Account Created!', `Welcome to EventOS, ${user.name}!`);
      navigate('/events');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const ROLES = [
    { value: 'attendee', label: '🎟️ Attendee', desc: 'Browse passes & stay informed' },
    { value: 'volunteer', label: '🦺 Volunteer', desc: 'Gate scanner & incident response' },
    { value: 'organizer', label: '🎯 Organizer', desc: 'Create fests & monitor command center' },
  ];

  return (
    <div className="el-auth-page animate-fade-in">
      <div className="el-auth-layout">
        {/* Left Form Column */}
        <div className="el-auth-form-column">
          <div className="el-auth-form-inner">
            <Link to="/" className="el-auth-logo">
              <span className="el-auth-logo-badge">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" fill="#eff6ff" stroke="#2563eb" strokeWidth="2"/>
                  <path d="M13 3L6 14H12L11 21L18 10H12L13 3Z" fill="#2563eb"/>
                </svg>
              </span>
              <span>Event<span className="el-auth-logo-accent">OS</span></span>
            </Link>

            <h1 className="el-auth-title">Create your account</h1>
            <p className="el-auth-subtitle">Join the college fest operations network</p>

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
                <label className="form-label" htmlFor="reg-name">Full Name</label>
                <input
                  id="reg-name"
                  name="name"
                  type="text"
                  className="form-control"
                  placeholder="Aanya Sharma"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="reg-email">College / Personal Email</label>
                <input
                  id="reg-email"
                  name="email"
                  type="email"
                  className="form-control"
                  placeholder="aanya@college.edu"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="reg-phone">Phone Number (optional)</label>
                <input
                  id="reg-phone"
                  name="phone"
                  type="tel"
                  className="form-control"
                  placeholder="+91 98765 43210"
                  value={form.phone}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="reg-password">Password</label>
                <input
                  id="reg-password"
                  name="password"
                  type="password"
                  className="form-control"
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Platform Role</label>
                <div className="el-role-picker">
                  {ROLES.map(r => (
                    <label
                      key={r.value}
                      className={`el-role-option ${form.role === r.value ? 'selected' : ''}`}
                    >
                      <input
                        type="radio"
                        name="role"
                        value={r.value}
                        checked={form.role === r.value}
                        onChange={handleChange}
                        hidden
                      />
                      <div className="el-role-label">{r.label}</div>
                      <div className="el-role-desc">{r.desc}</div>
                    </label>
                  ))}
                </div>
              </div>

              <button
                id="register-submit"
                type="submit"
                className="btn btn-primary btn-full el-auth-submit-btn"
                disabled={loading}
              >
                {loading ? <><span className="spinner" /> Creating account...</> : 'Create Free Account'}
              </button>
            </form>

            <div className="el-auth-footer">
              Already have an account? <Link to="/login" className="el-auth-link">Sign in</Link>
            </div>
          </div>
        </div>

        {/* Right Art Banner Column */}
        <div className="el-auth-banner-column">
          <div className="el-auth-gradient-art" />
          <div className="el-auth-quote-card">
            <div className="el-quote-mark">“</div>
            <p className="el-quote-text">
              We eliminated 400-person entry queues and paper spreadsheets within 10 minutes of deploying EventOS across 6 gates.
            </p>
            <div className="el-quote-author">
              <div className="el-author-name">Kavya Krishnan</div>
              <div className="el-author-title">Chief Student Convenor, National Cultural Fest</div>
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
          max-width: 440px;
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

        .el-role-picker {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .el-role-option {
          background: #ffffff;
          border: 1.5px solid #e2e8f0;
          border-radius: var(--radius-md);
          padding: 10px 14px;
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .el-role-option:hover {
          border-color: #cbd5e1;
          background: #f8fafc;
        }
        .el-role-option.selected {
          border-color: #2563eb;
          background: #eff6ff;
          box-shadow: 0 0 0 1px #2563eb;
        }
        .el-role-label {
          font-weight: 700;
          font-size: 0.875rem;
          color: #0f172a;
        }
        .el-role-desc {
          font-size: 0.75rem;
          color: #64748b;
          margin-top: 2px;
        }

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

        /* Right Banner Column */
        .el-auth-banner-column {
          position: relative;
          background: linear-gradient(135deg, #2563eb 0%, #4f46e5 45%, #9333ea 100%);
          display: flex;
          align-items: flex-end;
          padding: 4rem;
          overflow: hidden;
        }
        .el-auth-gradient-art {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 75% 25%, rgba(255,255,255,0.2) 0%, transparent 60%),
                      radial-gradient(circle at 25% 75%, rgba(6,182,212,0.3) 0%, transparent 70%);
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
