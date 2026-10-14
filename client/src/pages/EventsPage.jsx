import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { getAllEventPacks } from '../lib/db';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { format } from 'date-fns';

export default function EventsPage() {
  const isOnline = useOnlineStatus();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'All Events' },
    { id: 'technical', label: 'Technical' },
    { id: 'cultural', label: 'Cultural' },
    { id: 'workshops', label: 'Workshops' },
    { id: 'sports', label: 'Sports' },
    { id: 'hackathons', label: 'Hackathons' },
    { id: 'others', label: 'Others' },
  ];

  useEffect(() => {
    const load = async () => {
      if (isOnline) {
        try {
          const res = await api.get('/events');
          setEvents(res.data.data);
        } catch {
          const packs = await getAllEventPacks();
          setEvents(packs.map(p => p.event));
        }
      } else {
        const packs = await getAllEventPacks();
        setEvents(packs.map(p => p.event));
      }
      setLoading(false);
    };
    load();
  }, [isOnline]);

  const filtered = events.filter(e => {
    const matchesSearch =
      e.name?.toLowerCase().includes(search.toLowerCase()) ||
      e.description?.toLowerCase().includes(search.toLowerCase()) ||
      e.venue?.toLowerCase().includes(search.toLowerCase());

    const matchesLocation = locationFilter
      ? e.venue?.toLowerCase().includes(locationFilter.toLowerCase())
      : true;

    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'upcoming'
        ? e.status === 'published' || e.status === 'draft'
        : e.status === statusFilter;

    const matchesCategory =
      selectedCategory === 'all'
        ? true
        : e.tags?.some(t => t.toLowerCase().includes(selectedCategory.toLowerCase())) ||
          e.name?.toLowerCase().includes(selectedCategory.toLowerCase()) ||
          e.description?.toLowerCase().includes(selectedCategory.toLowerCase());

    return matchesSearch && matchesLocation && matchesStatus && matchesCategory;
  });

  const STATUS_COLORS = {
    draft: { bg: '#f1f5f9', color: '#475569', border: '#e2e8f0' },
    published: { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
    live: { bg: '#ecfdf5', color: '#047857', border: '#a7f3d0' },
    completed: { bg: '#f8fafc', color: '#64748b', border: '#cbd5e1' },
    cancelled: { bg: '#fef2f2', color: '#b91c1c', border: '#fecaca' },
  };

  return (
    <div className="discover-page animate-fade-in">
      <div className="container discover-container">
        {/* Title */}
        <div className="discover-header">
          <h1 className="discover-title">Discover Events</h1>
          <p className="discover-subtitle">
            {isOnline
              ? `Explore fests, hackathons, and campus activities • ${events.length} events loaded`
              : '⚡ Offline Mode Active • Showing cached events from local storage'}
          </p>
        </div>

        {/* Search & Filter Bar (EventLedger Style) */}
        <div className="discover-search-card">
          <div className="search-input-wrapper">
            <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              className="search-input"
              placeholder="Search by name, college or city..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="search-filters-row">
            <select
              className="filter-select"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="all">All Timelines</option>
              <option value="upcoming">Upcoming</option>
              <option value="live">Live Now</option>
              <option value="completed">Past Events</option>
            </select>

            <input
              type="text"
              className="filter-location-input"
              placeholder="Location..."
              value={locationFilter}
              onChange={e => setLocationFilter(e.target.value)}
            />

            <button
              className="btn btn-primary filter-btn"
              onClick={() => {}}
            >
              Filter
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="category-pills-row">
          {categories.map(cat => (
            <button
              key={cat.id}
              className={`category-pill ${selectedCategory === cat.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Results */}
        {loading ? (
          <div className="discover-loading">
            <div className="spinner spinner-lg" />
            <p>Loading campus events...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="discover-empty-state">
            <div className="empty-icon-box">🔍</div>
            <h3 className="empty-title">No events found</h3>
            <p className="empty-desc">
              Try searching for something else or browse another category.
            </p>
          </div>
        ) : (
          <div className="events-grid">
            {filtered.map(event => {
              const statusStyle = STATUS_COLORS[event.status] || STATUS_COLORS.published;
              return (
                <Link to={`/events/${event._id}`} key={event._id} className="el-event-card">
                  <div className="el-ecard-header">
                    <div className="el-ecard-bg-gradient" />
                    <div className="el-ecard-tags">
                      <span
                        className="badge"
                        style={{
                          background: statusStyle.bg,
                          color: statusStyle.color,
                          borderColor: statusStyle.border,
                        }}
                      >
                        {event.status?.toUpperCase()}
                      </span>
                      {event.status === 'live' && (
                        <span className="live-pulsing-badge">
                          <span className="live-dot" /> LIVE
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="el-ecard-body">
                    <h2 className="el-ecard-title">{event.name}</h2>
                    <p className="el-ecard-desc">
                      {event.description
                        ? event.description.length > 95
                          ? `${event.description.slice(0, 95)}...`
                          : event.description
                        : 'No description provided.'}
                    </p>

                    <div className="el-ecard-details">
                      <div className="el-ecard-meta-item">
                        <span className="meta-icon">📍</span>
                        <span className="meta-text">{event.venue || 'Campus Main Grounds'}</span>
                      </div>
                      <div className="el-ecard-meta-item">
                        <span className="meta-icon">📅</span>
                        <span className="meta-text">
                          {event.startDate
                            ? format(new Date(event.startDate), 'MMM dd, yyyy • h:mm a')
                            : 'Date to be announced'}
                        </span>
                      </div>
                    </div>

                    <div className="el-ecard-footer">
                      <div className="el-ecard-tags-list">
                        {event.tags && event.tags.length > 0 ? (
                          event.tags.slice(0, 2).map(tag => (
                            <span key={tag} className="tag-chip">
                              #{tag}
                            </span>
                          ))
                        ) : (
                          <span className="tag-chip">#CampusFest</span>
                        )}
                      </div>

                      <span className="el-ecard-btn">
                        View Event ↗
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        .discover-page {
          padding: 2.5rem 0 5rem;
        }
        .discover-container {
          max-width: 1200px;
        }
        .discover-header {
          margin-bottom: 2rem;
        }
        .discover-title {
          font-size: clamp(2rem, 4vw, 2.75rem);
          font-weight: 900;
          letter-spacing: -0.04em;
          color: #0f172a;
          margin-bottom: 0.5rem;
        }
        .discover-subtitle {
          font-size: 0.95rem;
          color: #64748b;
        }

        /* Search & Filter Bar */
        .discover-search-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: var(--radius-xl);
          padding: 10px 14px;
          display: flex;
          align-items: center;
          gap: 12px;
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.04);
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
        }
        .search-input-wrapper {
          display: flex;
          align-items: center;
          gap: 10px;
          flex: 1;
          min-width: 260px;
        }
        .search-icon {
          flex-shrink: 0;
        }
        .search-input {
          border: none;
          background: transparent;
          font-size: 0.95rem;
          color: #0f172a;
          width: 100%;
          outline: none;
        }
        .search-input::placeholder {
          color: #94a3b8;
        }
        .search-filters-row {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }
        .filter-select, .filter-location-input {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: var(--radius-md);
          padding: 8px 14px;
          font-size: 0.875rem;
          color: #334155;
          outline: none;
          transition: all var(--transition-fast);
        }
        .filter-select:focus, .filter-location-input:focus {
          border-color: #2563eb;
          background: #ffffff;
        }
        .filter-location-input {
          width: 130px;
        }
        .filter-btn {
          padding: 8px 20px;
          font-size: 0.875rem;
        }

        /* Category pills */
        .category-pills-row {
          display: flex;
          align-items: center;
          gap: 8px;
          overflow-x: auto;
          white-space: nowrap;
          padding-bottom: 1.5rem;
          margin-bottom: 1rem;
        }
        .category-pill {
          padding: 7px 16px;
          border-radius: var(--radius-full);
          font-size: 0.825rem;
          font-weight: 600;
          color: #475569;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .category-pill:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
          color: #0f172a;
        }
        .category-pill.active {
          background: #0f172a;
          color: #ffffff;
          border-color: #0f172a;
        }

        /* Loading & Empty */
        .discover-loading {
          padding: 4rem 0;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          color: #64748b;
        }
        .discover-empty-state {
          padding: 4rem 1rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }
        .empty-icon-box {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
          opacity: 0.7;
        }
        .empty-title {
          font-size: 1.25rem;
          font-weight: 800;
          color: #0f172a;
        }
        .empty-desc {
          font-size: 0.9rem;
          color: #64748b;
          max-width: 320px;
        }

        /* Event Grid & Card */
        .events-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.5rem;
        }
        .el-event-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          box-shadow: 0 2px 4px rgba(15, 23, 42, 0.03);
          transition: all var(--transition-normal);
        }
        .el-event-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 28px -4px rgba(15, 23, 42, 0.09);
          border-color: #cbd5e1;
        }
        .el-ecard-header {
          height: 120px;
          position: relative;
          overflow: hidden;
          background: #f1f5f9;
        }
        .el-ecard-bg-gradient {
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 50%, #4338ca 100%);
          opacity: 0.9;
        }
        .el-ecard-tags {
          position: absolute;
          top: 12px;
          left: 12px;
          right: 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .live-pulsing-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #ecfdf5;
          border: 1px solid #a7f3d0;
          color: #047857;
          font-size: 0.68rem;
          font-weight: 800;
          padding: 2px 8px;
          border-radius: var(--radius-full);
        }
        .live-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.3);
        }
        .el-ecard-body {
          padding: 1.25rem 1.5rem;
          display: flex;
          flex-direction: column;
          flex: 1;
        }
        .el-ecard-title {
          font-size: 1.15rem;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: -0.02em;
          margin-bottom: 0.5rem;
        }
        .el-ecard-desc {
          font-size: 0.85rem;
          color: #64748b;
          line-height: 1.55;
          margin-bottom: 1.25rem;
          flex: 1;
        }
        .el-ecard-details {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 1.25rem;
          padding-top: 0.75rem;
          border-top: 1px solid #f1f5f9;
        }
        .el-ecard-meta-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.8rem;
          color: #475569;
        }
        .meta-icon {
          font-size: 0.9rem;
        }
        .el-ecard-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 0.75rem;
          border-top: 1px solid #f1f5f9;
        }
        .el-ecard-tags-list {
          display: flex;
          gap: 6px;
        }
        .tag-chip {
          font-size: 0.72rem;
          font-weight: 600;
          color: #64748b;
          background: #f1f5f9;
          padding: 2px 8px;
          border-radius: 6px;
        }
        .el-ecard-btn {
          font-size: 0.825rem;
          font-weight: 700;
          color: #2563eb;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          transition: gap var(--transition-fast);
        }
        .el-event-card:hover .el-ecard-btn {
          gap: 8px;
          color: #1d4ed8;
        }
      `}</style>
    </div>
  );
}
