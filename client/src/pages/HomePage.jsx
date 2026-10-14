import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export default function HomePage() {
  const { user, isOrganizer } = useAuth();
  const isOnline = useOnlineStatus();
  const [activeCapability, setActiveCapability] = useState('all');

  const capabilities = [
    { id: 'all', label: 'All Capabilities' },
    { id: 'registration', label: 'Registration Engine' },
    { id: 'passes', label: 'Cryptographic Passes' },
    { id: 'scanner', label: 'Gate Scanner' },
    { id: 'mesh', label: 'Offline Sync' },
    { id: 'incident', label: 'Emergency Dispatch' },
  ];

  const features = [
    {
      category: 'registration',
      icon: '📝',
      title: 'Custom Form Builder',
      desc: 'Build dynamic registration workflows with team allocations, custom fields, and ticket tier rules in minutes.',
      badge: 'Zero Code',
    },
    {
      category: 'passes',
      icon: '🎫',
      title: 'Cryptographic Dynamic Passes',
      desc: 'Tamper-proof HMAC-signed digital QR tickets with offline verification capabilities that prevent screenshot cloning.',
      badge: 'Anti-Fraud',
    },
    {
      category: 'scanner',
      icon: '⚡',
      title: 'Sub-Second Gate Scanner',
      desc: 'High-speed camera scanning verifying tickets in 0.18s locally on device, keeping queues moving without delay.',
      badge: '0.18s Check-in',
    },
    {
      category: 'mesh',
      icon: '🔄',
      title: 'Deterministic Offline Sync',
      desc: 'Keep checking in attendees and logging logs even when campus Wi-Fi drops. Automatically syncs once reconnected.',
      badge: '100% Resilient',
    },
    {
      category: 'incident',
      icon: '🚨',
      title: 'Incident Dispatch & Heatmaps',
      desc: 'Real-time zone crowding indicators and rapid volunteer assignment dispatch to handle campus emergencies.',
      badge: 'Real-Time Ops',
    },
    {
      category: 'mesh',
      icon: '📦',
      title: 'One-Tap Event Packs',
      desc: 'Attendees and staff download comprehensive schedule, venue map, and pass bundles for completely offline browsing.',
      badge: 'Cache-First',
    },
  ];

  const filteredFeatures = activeCapability === 'all'
    ? features
    : features.filter(f => f.category === activeCapability);

  return (
    <div className="eventledger-home animate-fade-in">
      {/* Hero Section */}
      <section className="el-hero">
        <div className="el-hero-glow" />
        <div className="container el-hero-container">
          <div className="el-hero-left">
            <div className="el-pill-badge">
              <span className={`el-status-dot ${isOnline ? 'online' : 'offline'}`} />
              <span>The Modern Operating System for College Fests</span>
              <span className="el-pill-sparkle">✨</span>
            </div>

            <h1 className="el-hero-heading">
              Run the Fest.
              <span className="el-hero-highlight"> Not the</span>
              <span className="el-hero-accent"> Spreadsheet.</span>
            </h1>

            <p className="el-hero-subtitle">
              The all-in-one event platform built for colleges and campus fests.
              Create custom registration forms, accept direct UPI payments,
              issue instant digital QR entry passes, and check in thousands of students smoothly at the gate—even with zero internet.
            </p>

            <div className="el-value-banner">
              <div className="el-value-tag">
                <span className="el-bold">0% Platform Fees</span> on free events & campus club meetups
              </div>
              <div className="el-value-checks">
                <span><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg> Direct UPI to Bank</span>
                <span><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg> Instant QR Passes</span>
                <span><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg> 100% Offline Ready</span>
              </div>
            </div>

            <div className="el-hero-actions">
              <Link to="/events" className="btn btn-primary btn-lg el-btn-main">
                Start Creating Free <span className="el-arrow">↗</span>
              </Link>
              <Link to="/events" className="btn btn-secondary btn-lg el-btn-sub">
                Explore Live Fests <span className="el-chevron">›</span>
              </Link>
              {isOrganizer && (
                <Link to="/dashboard" className="btn btn-secondary btn-lg el-btn-sub">
                  ⚡ Command Center
                </Link>
              )}
            </div>

            <div className="el-social-proof">
              <span>⚡ <strong>50+</strong> College Fests</span>
              <span className="el-dot-sep">•</span>
              <span>🎟️ <strong>25,000+</strong> Passes Issued</span>
              <span className="el-dot-sep">•</span>
              <span>🔒 <strong>100%</strong> Offline Resilient</span>
            </div>
          </div>

          {/* Right Mockup (EventLedger Interactive Live Fest Card) */}
          <div className="el-hero-right">
            <div className="el-mockup-wrapper">
              {/* Floating Top Settlement Pill */}
              <div className="el-floating-pill el-floating-top">
                <div className="el-upi-icon">₹</div>
                <div>
                  <div className="el-floating-sub">Instant UPI Settlement</div>
                  <div className="el-floating-val">₹4,85,000 Settled</div>
                </div>
                <span className="el-bank-badge">Direct to Bank</span>
              </div>

              {/* Main Dashboard Card */}
              <div className="el-mockup-card">
                {/* Window header */}
                <div className="el-mockup-header">
                  <div className="el-window-dots">
                    <span className="dot red" />
                    <span className="dot yellow" />
                    <span className="dot green" />
                  </div>
                  <div className="el-window-title">
                    📅 SPECTRA 2026 • Annual Campus Fest
                  </div>
                  <span className="el-header-sync">Instant sync</span>
                </div>

                {/* Stat Counters */}
                <div className="el-mockup-stats">
                  <div className="el-mstat">
                    <div className="el-mstat-label">Total Registrations</div>
                    <div className="el-mstat-val">2,840</div>
                    <div className="el-mstat-change positive">↗ +18% today</div>
                  </div>
                  <div className="el-mstat">
                    <div className="el-mstat-label">Direct UPI Settled</div>
                    <div className="el-mstat-val">₹4.85L</div>
                    <div className="el-mstat-change success">✓ 100% to Bank</div>
                  </div>
                  <div className="el-mstat">
                    <div className="el-mstat-label">Gate Check-ins</div>
                    <div className="el-mstat-val">1,920</div>
                    <div className="el-mstat-change info">∿ 68% Admitted</div>
                  </div>
                </div>

                {/* Two-Column Mini Layout: Live Feed & Ticket Card */}
                <div className="el-mockup-content">
                  {/* Left: Live Gate Turnstile Stream */}
                  <div className="el-stream-pane">
                    <div className="el-stream-heading">
                      <span>Live Gate Turnstile Stream</span>
                      <span className="el-stream-badge">LIVE</span>
                    </div>

                    <div className="el-stream-list">
                      <div className="el-stream-row">
                        <span className="el-admit-badge">ADMITTED</span>
                        <div className="el-stream-info">
                          <div className="el-stream-name">Aanya Sharma</div>
                          <div className="el-stream-meta">Hackathon Solo</div>
                        </div>
                        <div className="el-stream-time">Just now</div>
                      </div>

                      <div className="el-stream-row">
                        <span className="el-admit-badge">ADMITTED</span>
                        <div className="el-stream-info">
                          <div className="el-stream-name">Rohan Nair</div>
                          <div className="el-stream-meta">Robotics Team</div>
                        </div>
                        <div className="el-stream-time">4s ago</div>
                      </div>

                      <div className="el-stream-row">
                        <span className="el-admit-badge">ADMITTED</span>
                        <div className="el-stream-info">
                          <div className="el-stream-name">Pooja Deshmukh</div>
                          <div className="el-stream-meta">Cultural Night</div>
                        </div>
                        <div className="el-stream-time">12s ago</div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Floating Digital Pass Preview */}
                  <div className="el-ticket-preview">
                    <div className="el-ticket-top">
                      <span className="el-ticket-fest">SPECTRA 2026</span>
                      <span className="el-ticket-type">ALL-ACCESS PASS</span>
                    </div>

                    <div className="el-ticket-body">
                      {/* Stylized QR Visual */}
                      <div className="el-ticket-qr">
                        <svg width="44" height="44" viewBox="0 0 24 24" fill="#2563eb">
                          <path d="M3 3h7v7H3V3zm2 2v3h3V5H5zm9-2h7v7h-7V3zm2 2v3h3V5h-3zM3 14h7v7H3v-7zm2 2v3h3v-3H5zm11-2h2v2h-2v-2zm3 0h2v4h-2v-4zm-3 4h2v3h-2v-3zm3 2h2v1h-2v-1zm-6-4h2v2h-2v-2zm0 3h2v2h-2v-2z"/>
                        </svg>
                      </div>
                      <div className="el-ticket-user">
                        <div className="el-ticket-name">Aanya Sharma</div>
                        <div className="el-ticket-id">Pass #EL-8942</div>
                        <div className="el-ticket-verified">✓ Verified QR Pass</div>
                      </div>
                    </div>

                    <div className="el-ticket-status">
                      <span className="el-status-indicator" />
                      <span>ENTRY APPROVED • Gate 1</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Bottom Scanner Pill */}
              <div className="el-floating-pill el-floating-bottom">
                <div className="el-scanner-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5">
                    <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2"/>
                  </svg>
                </div>
                <div>
                  <div className="el-floating-sub">Gate 1 Scanner</div>
                  <div className="el-floating-val">0.18s Check-in</div>
                </div>
                <span className="el-offline-badge">• 100% Offline Ready</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Navigation Pill Row (EventLedger style) */}
      <section className="el-pills-bar-section">
        <div className="container">
          <div className="el-pills-bar">
            <span className="el-pills-label">Looking for a feature?</span>
            <div className="el-pills-list">
              <span className="el-feature-pill">📄 Custom Form Builder</span>
              <span className="el-feature-pill">👥 Team Registrations</span>
              <span className="el-feature-pill">💳 Direct UPI Payments</span>
              <span className="el-feature-pill">🎟️ Digital QR Passes</span>
              <span className="el-feature-pill">⚡ Fast Gate Scanner</span>
              <span className="el-feature-pill">📊 Live Analytics</span>
              <span className="el-feature-pill">🚨 Incident Response</span>
            </div>
          </div>
        </div>
      </section>

      {/* The Reality of Manual Fests (Chaos Section) */}
      <section className="el-chaos-section">
        <div className="container">
          <div className="el-section-eyebrow">THE REALITY OF MANUAL FESTS</div>
          <h2 className="el-chaos-title">
            Big ambition. 20 open browser tabs.<br />
            <span className="el-chaos-accent">Total operational chaos.</span>
          </h2>

          <div className="el-chaos-grid">
            <div className="el-chaos-card">
              <div className="el-chaos-card-header">
                <span className="el-chaos-icon red">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                </span>
                <span className="el-chaos-step">01</span>
              </div>
              <h3 className="el-chaos-card-title">Google Forms Limbo</h3>
              <p className="el-chaos-card-desc">
                Duplicate submissions, fake phone numbers, broken Google Drive screenshot links, and student volunteers manually cleaning spreadsheets until 3 AM before the fest.
              </p>
              <div className="el-chaos-tag danger">High Error Rate • Zero Verification</div>
            </div>

            <div className="el-chaos-card">
              <div className="el-chaos-card-header">
                <span className="el-chaos-icon yellow">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v12m-3-6h6"/></svg>
                </span>
                <span className="el-chaos-step">02</span>
              </div>
              <h3 className="el-chaos-card-title">Screenshot Accounting</h3>
              <p className="el-chaos-card-desc">
                Attendees sending cropped UPI screenshots and reused UTR reference numbers. Organizers spend days calling the bank instead of setting up the stage.
              </p>
              <div className="el-chaos-tag warning">Financial Leakage • Phantom Payments</div>
            </div>

            <div className="el-chaos-card">
              <div className="el-chaos-card-header">
                <span className="el-chaos-icon purple">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                </span>
                <span className="el-chaos-step">03</span>
              </div>
              <h3 className="el-chaos-card-title">Gate Panic & Wi-Fi Dead Zones</h3>
              <p className="el-chaos-card-desc">
                600 students waiting in the scorching sun. Paper checklists get ripped, mobile internet collapses under crowd density, and gatecrashers slip right through.
              </p>
              <div className="el-chaos-tag purple-tag">Long Bottlenecks • Security Vulnerable</div>
            </div>
          </div>

          {/* Solution Banner */}
          <div className="el-solution-banner">
            <span className="el-solution-sparkle">✨</span>
            <div className="el-solution-text">
              <strong>EventOS was built to replace this chaos.</strong> One deterministic platform where registration forms, UPI tickets, offline gate check-ins, and emergency dispatch speak the same cryptographic language.
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities Section with Tabs */}
      <section className="el-orchestration-section">
        <div className="container">
          <div className="el-section-eyebrow">END-TO-END ORCHESTRATION</div>
          <h2 className="el-orchestration-title">
            From the first RSVP to the final encore.
          </h2>

          {/* Filter Tabs */}
          <div className="el-tabs-wrapper">
            {capabilities.map(cap => (
              <button
                key={cap.id}
                className={`el-tab-pill ${activeCapability === cap.id ? 'active' : ''}`}
                onClick={() => setActiveCapability(cap.id)}
              >
                {cap.label}
              </button>
            ))}
          </div>

          {/* Feature Grid */}
          <div className="el-features-grid">
            {filteredFeatures.map(item => (
              <div className="el-feature-card" key={item.title}>
                <div className="el-fcard-top">
                  <span className="el-fcard-icon">{item.icon}</span>
                  <span className="el-fcard-badge">{item.badge}</span>
                </div>
                <h3 className="el-fcard-title">{item.title}</h3>
                <p className="el-fcard-desc">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="el-cta-section">
        <div className="container">
          <div className="el-cta-box">
            <div className="el-cta-content">
              <h2 className="el-cta-title">Supercharge your campus fest this season.</h2>
              <p className="el-cta-sub">
                Join campus organizers, student clubs, and festival teams using EventOS for deterministic operations.
              </p>
              <div className="el-cta-btns">
                <Link to="/register" className="btn btn-primary btn-lg el-btn-main">
                  Get Started for Free ↗
                </Link>
                <Link to="/events" className="btn btn-secondary btn-lg el-btn-sub">
                  Browse Active Events ›
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .eventledger-home {
          padding-bottom: var(--sp-16);
          position: relative;
        }

        /* Hero */
        .el-hero {
          position: relative;
          padding: 3rem 0 4rem;
          overflow: hidden;
        }
        .el-hero-glow {
          position: absolute;
          top: -150px;
          left: 50%;
          transform: translateX(-50%);
          width: 900px;
          height: 600px;
          background: radial-gradient(ellipse, rgba(37, 99, 235, 0.08) 0%, rgba(99, 102, 241, 0.04) 50%, transparent 75%);
          pointer-events: none;
        }
        .el-hero-container {
          display: grid;
          grid-template-columns: 1.1fr 1fr;
          gap: 3rem;
          align-items: center;
          position: relative;
          z-index: 1;
        }
        @media (max-width: 1024px) {
          .el-hero-container {
            grid-template-columns: 1fr;
            gap: 2.5rem;
          }
        }

        /* Pill Badge */
        .el-pill-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: var(--radius-full);
          padding: 6px 14px;
          font-size: 0.825rem;
          font-weight: 600;
          color: #334155;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
          margin-bottom: 1.5rem;
        }
        .el-status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          display: inline-block;
        }
        .el-status-dot.online {
          background: #10b981;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
        }
        .el-status-dot.offline {
          background: #f59e0b;
          box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.2);
        }
        .el-pill-sparkle { font-size: 0.9rem; }

        /* Heading */
        .el-hero-heading {
          font-size: clamp(2.75rem, 5.5vw, 4.2rem);
          font-weight: 900;
          line-height: 1.05;
          letter-spacing: -0.04em;
          color: #0f172a;
          margin-bottom: 1.25rem;
        }
        .el-hero-highlight {
          color: #2563eb;
        }
        .el-hero-accent {
          color: #2563eb;
        }
        .el-hero-subtitle {
          font-size: 1.05rem;
          color: #475569;
          line-height: 1.65;
          margin-bottom: 1.75rem;
          max-width: 560px;
        }

        /* Value Banner */
        .el-value-banner {
          background: #ecfdf5;
          border: 1px solid #a7f3d0;
          border-radius: var(--radius-lg);
          padding: 1rem 1.25rem;
          margin-bottom: 2rem;
          max-width: 560px;
        }
        .el-value-tag {
          font-size: 0.875rem;
          color: #065f46;
          margin-bottom: 0.5rem;
        }
        .el-bold { font-weight: 700; color: #047857; }
        .el-value-checks {
          display: flex;
          flex-wrap: wrap;
          gap: 1.25rem;
          font-size: 0.8rem;
          font-weight: 600;
          color: #065f46;
        }
        .el-value-checks span {
          display: inline-flex;
          align-items: center;
          gap: 5px;
        }

        /* Actions */
        .el-hero-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
          margin-bottom: 1.75rem;
        }
        .el-btn-main {
          padding: 0.85rem 1.75rem;
          font-size: 0.95rem;
          font-weight: 700;
          border-radius: var(--radius-full);
          background: #2563eb;
          color: #ffffff;
        }
        .el-btn-main:hover {
          background: #1d4ed8;
        }
        .el-btn-sub {
          padding: 0.85rem 1.5rem;
          font-size: 0.95rem;
          font-weight: 600;
          border-radius: var(--radius-full);
          background: #ffffff;
          border: 1px solid #cbd5e1;
          color: #1e293b;
        }
        .el-arrow, .el-chevron {
          font-size: 1.1rem;
          line-height: 1;
        }

        /* Social proof */
        .el-social-proof {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.85rem;
          color: #64748b;
          flex-wrap: wrap;
        }
        .el-dot-sep { color: #cbd5e1; }

        /* Mockup Right Side */
        .el-hero-right {
          position: relative;
        }
        .el-mockup-wrapper {
          position: relative;
          padding: 1.5rem 0;
        }

        /* Floating Pills */
        .el-floating-pill {
          position: absolute;
          z-index: 10;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: var(--radius-lg);
          padding: 8px 14px;
          display: flex;
          align-items: center;
          gap: 10px;
          box-shadow: 0 10px 25px -4px rgba(15, 23, 42, 0.1);
        }
        .el-floating-top {
          top: -10px;
          right: 20px;
        }
        .el-floating-bottom {
          bottom: -10px;
          left: 20px;
        }
        .el-upi-icon {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: #ecfdf5;
          color: #059669;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
        }
        .el-scanner-icon {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: #eff6ff;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .el-floating-sub {
          font-size: 0.7rem;
          color: #64748b;
        }
        .el-floating-val {
          font-size: 0.85rem;
          font-weight: 700;
          color: #0f172a;
        }
        .el-bank-badge {
          background: #ecfdf5;
          color: #059669;
          font-size: 0.7rem;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: var(--radius-full);
        }
        .el-offline-badge {
          color: #2563eb;
          font-size: 0.72rem;
          font-weight: 700;
        }

        /* Main Mockup Card */
        .el-mockup-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          box-shadow: 0 20px 40px -10px rgba(15, 23, 42, 0.08);
          overflow: hidden;
        }
        .el-mockup-header {
          padding: 12px 18px;
          border-bottom: 1px solid #f1f5f9;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #fafbfc;
        }
        .el-window-dots {
          display: flex;
          gap: 6px;
        }
        .el-window-dots .dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }
        .el-window-dots .dot.red { background: #f87171; }
        .el-window-dots .dot.yellow { background: #fbbf24; }
        .el-window-dots .dot.green { background: #34d399; }
        .el-window-title {
          font-size: 0.75rem;
          font-weight: 600;
          color: #475569;
        }
        .el-header-sync {
          font-size: 0.7rem;
          color: #64748b;
        }

        /* Mockup Stats */
        .el-mockup-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          padding: 16px 18px;
          border-bottom: 1px solid #f1f5f9;
        }
        .el-mstat {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 10px 12px;
        }
        .el-mstat-label {
          font-size: 0.7rem;
          color: #64748b;
          margin-bottom: 4px;
        }
        .el-mstat-val {
          font-size: 1.25rem;
          font-weight: 800;
          color: #0f172a;
          line-height: 1.1;
        }
        .el-mstat-change {
          font-size: 0.68rem;
          font-weight: 600;
          margin-top: 4px;
        }
        .el-mstat-change.positive { color: #2563eb; }
        .el-mstat-change.success { color: #059669; }
        .el-mstat-change.info { color: #4f46e5; }

        /* Mockup Content Two-Col */
        .el-mockup-content {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 14px;
          padding: 16px 18px 24px;
        }
        @media (max-width: 640px) {
          .el-mockup-content {
            grid-template-columns: 1fr;
          }
        }

        /* Stream Pane */
        .el-stream-pane {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 12px;
        }
        .el-stream-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.75rem;
          font-weight: 700;
          color: #334155;
          margin-bottom: 10px;
        }
        .el-stream-badge {
          background: #ecfdf5;
          color: #059669;
          font-size: 0.65rem;
          font-weight: 700;
          padding: 1px 6px;
          border-radius: 4px;
        }
        .el-stream-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .el-stream-row {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 6px 10px;
        }
        .el-admit-badge {
          background: #ecfdf5;
          border: 1px solid #a7f3d0;
          color: #047857;
          font-size: 0.65rem;
          font-weight: 800;
          padding: 2px 6px;
          border-radius: 4px;
        }
        .el-stream-info { flex: 1; }
        .el-stream-name {
          font-size: 0.78rem;
          font-weight: 700;
          color: #0f172a;
          line-height: 1.2;
        }
        .el-stream-meta {
          font-size: 0.68rem;
          color: #64748b;
        }
        .el-stream-time {
          font-size: 0.68rem;
          color: #94a3b8;
        }

        /* Digital Pass Preview Card */
        .el-ticket-preview {
          background: #0f172a;
          color: #ffffff;
          border-radius: 14px;
          padding: 14px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .el-ticket-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          border-bottom: 1px dashed rgba(255,255,255,0.15);
          padding-bottom: 8px;
        }
        .el-ticket-fest { color: #94a3b8; }
        .el-ticket-type {
          background: rgba(37, 99, 235, 0.3);
          color: #60a5fa;
          padding: 2px 6px;
          border-radius: 4px;
        }
        .el-ticket-body {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 0;
        }
        .el-ticket-qr {
          background: #ffffff;
          padding: 6px;
          border-radius: 8px;
          display: flex;
        }
        .el-ticket-name {
          font-size: 0.85rem;
          font-weight: 700;
          color: #ffffff;
        }
        .el-ticket-id {
          font-size: 0.7rem;
          color: #94a3b8;
        }
        .el-ticket-verified {
          font-size: 0.68rem;
          color: #34d399;
          font-weight: 600;
          margin-top: 2px;
        }
        .el-ticket-status {
          background: rgba(16, 185, 129, 0.2);
          border: 1px solid rgba(16, 185, 129, 0.4);
          color: #34d399;
          font-size: 0.7rem;
          font-weight: 700;
          text-align: center;
          padding: 4px 8px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
        .el-status-indicator {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #34d399;
        }

        /* Pill bar section */
        .el-pills-bar-section {
          padding: 1.5rem 0;
          border-top: 1px solid #e2e8f0;
          border-bottom: 1px solid #e2e8f0;
          background: #ffffff;
        }
        .el-pills-bar {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          overflow-x: auto;
          white-space: nowrap;
          padding: 4px 0;
        }
        .el-pills-label {
          font-size: 0.875rem;
          font-weight: 700;
          color: #0f172a;
          flex-shrink: 0;
        }
        .el-pills-list {
          display: flex;
          gap: 0.75rem;
        }
        .el-feature-pill {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          padding: 6px 14px;
          border-radius: var(--radius-full);
          font-size: 0.8rem;
          font-weight: 600;
          color: #475569;
          transition: all var(--transition-fast);
        }
        .el-feature-pill:hover {
          background: #eff6ff;
          border-color: #bfdbfe;
          color: #2563eb;
        }

        /* Chaos Section */
        .el-chaos-section {
          padding: 5rem 0 4rem;
          text-align: center;
        }
        .el-section-eyebrow {
          font-size: 0.75rem;
          font-weight: 800;
          letter-spacing: 0.1em;
          color: #2563eb;
          margin-bottom: 0.75rem;
        }
        .el-chaos-title {
          font-size: clamp(2rem, 4vw, 2.75rem);
          font-weight: 900;
          letter-spacing: -0.03em;
          color: #0f172a;
          margin-bottom: 3.5rem;
          line-height: 1.2;
        }
        .el-chaos-accent {
          color: #2563eb;
        }
        .el-chaos-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
          margin-bottom: 2.5rem;
          text-align: left;
        }
        @media (max-width: 900px) {
          .el-chaos-grid {
            grid-template-columns: 1fr;
          }
        }
        .el-chaos-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 18px;
          padding: 1.75rem;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.03);
          display: flex;
          flex-direction: column;
        }
        .el-chaos-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.25rem;
        }
        .el-chaos-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .el-chaos-icon.red { background: #fef2f2; }
        .el-chaos-icon.yellow { background: #fffbeb; }
        .el-chaos-icon.purple { background: #f5f3ff; }
        .el-chaos-step {
          font-size: 0.9rem;
          font-weight: 800;
          color: #cbd5e1;
        }
        .el-chaos-card-title {
          font-size: 1.2rem;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 0.75rem;
        }
        .el-chaos-card-desc {
          font-size: 0.9rem;
          color: #64748b;
          line-height: 1.6;
          margin-bottom: 1.5rem;
          flex: 1;
        }
        .el-chaos-tag {
          font-size: 0.72rem;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 6px;
          width: fit-content;
        }
        .el-chaos-tag.danger {
          background: #fef2f2;
          color: #b91c1c;
          border: 1px solid #fecaca;
        }
        .el-chaos-tag.warning {
          background: #fffbeb;
          color: #b45309;
          border: 1px solid #fde68a;
        }
        .el-chaos-tag.purple-tag {
          background: #f5f3ff;
          color: #6d28d9;
          border: 1px solid #ddd6fe;
        }

        /* Solution Banner */
        .el-solution-banner {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 1.25rem 1.75rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          box-shadow: 0 4px 12px rgba(0,0,0,0.03);
          text-align: left;
        }
        .el-solution-sparkle {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: #eff6ff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          flex-shrink: 0;
        }
        .el-solution-text {
          font-size: 0.95rem;
          color: #334155;
          line-height: 1.5;
        }

        /* Orchestration Section */
        .el-orchestration-section {
          padding: 4rem 0 5rem;
          text-align: center;
        }
        .el-orchestration-title {
          font-size: clamp(2rem, 3.5vw, 2.6rem);
          font-weight: 900;
          letter-spacing: -0.03em;
          color: #0f172a;
          margin-bottom: 2rem;
        }
        .el-tabs-wrapper {
          display: flex;
          justify-content: center;
          gap: 0.5rem;
          flex-wrap: wrap;
          margin-bottom: 3rem;
        }
        .el-tab-pill {
          padding: 8px 18px;
          border-radius: var(--radius-full);
          font-size: 0.85rem;
          font-weight: 600;
          color: #64748b;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .el-tab-pill:hover {
          color: #0f172a;
          border-color: #cbd5e1;
        }
        .el-tab-pill.active {
          background: #2563eb;
          color: #ffffff;
          border-color: #2563eb;
          box-shadow: 0 2px 8px rgba(37, 99, 235, 0.25);
        }
        .el-features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
          text-align: left;
        }
        @media (max-width: 900px) {
          .el-features-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 600px) {
          .el-features-grid {
            grid-template-columns: 1fr;
          }
        }
        .el-feature-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 1.5rem;
          box-shadow: 0 2px 4px rgba(0,0,0,0.02);
          transition: all var(--transition-normal);
        }
        .el-feature-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px -2px rgba(15, 23, 42, 0.06);
          border-color: #cbd5e1;
        }
        .el-fcard-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1rem;
        }
        .el-fcard-icon {
          font-size: 1.5rem;
        }
        .el-fcard-badge {
          background: #eff6ff;
          color: #2563eb;
          font-size: 0.7rem;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: var(--radius-full);
          border: 1px solid #bfdbfe;
        }
        .el-fcard-title {
          font-size: 1.1rem;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 0.5rem;
        }
        .el-fcard-desc {
          font-size: 0.875rem;
          color: #64748b;
          line-height: 1.55;
        }

        /* CTA Section */
        .el-cta-section {
          padding: 2rem 0 3rem;
        }
        .el-cta-box {
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 50%, #4338ca 100%);
          border-radius: 24px;
          padding: 4rem 2rem;
          color: #ffffff;
          text-align: center;
          position: relative;
          overflow: hidden;
          box-shadow: 0 20px 40px -10px rgba(37, 99, 235, 0.25);
        }
        .el-cta-box::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: 
            linear-gradient(to right, rgba(255, 255, 255, 0.08) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.08) 1px, transparent 1px);
          background-size: 32px 32px;
          pointer-events: none;
        }
        .el-cta-content {
          position: relative;
          z-index: 1;
          max-width: 640px;
          margin: 0 auto;
        }
        .el-cta-title {
          font-size: clamp(2rem, 3.5vw, 2.5rem);
          font-weight: 900;
          letter-spacing: -0.03em;
          margin-bottom: 1rem;
          line-height: 1.2;
        }
        .el-cta-sub {
          font-size: 1rem;
          color: #dbeafe;
          line-height: 1.6;
          margin-bottom: 2rem;
        }
        .el-cta-btns {
          display: flex;
          justify-content: center;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .el-cta-btns .el-btn-main {
          background: #ffffff;
          color: #2563eb;
        }
        .el-cta-btns .el-btn-main:hover {
          background: #f8fafc;
        }
        .el-cta-btns .el-btn-sub {
          background: rgba(255, 255, 255, 0.15);
          color: #ffffff;
          border-color: rgba(255, 255, 255, 0.3);
        }
        .el-cta-btns .el-btn-sub:hover {
          background: rgba(255, 255, 255, 0.25);
        }
      `}</style>
    </div>
  );
}
