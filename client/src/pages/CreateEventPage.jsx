import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useToast } from '../context/ToastContext';

export default function CreateEventPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    tagline: '',
    description: '',
    venue: '',
    startDate: '',
    endDate: '',
    maxAttendees: 500,
    status: 'published',
    bannerUrl: '',
    tags: '',
    rules: '',
  });

  const [scheduleItems, setScheduleItems] = useState([
    {
      title: 'Opening Keynote & Welcome',
      speaker: 'Keynote Speaker',
      venue: 'Main Auditorium',
      zone: 'Zone A',
      startTime: '',
      endTime: '',
      type: 'session',
      description: 'Welcome address and opening remarks.'
    }
  ]);

  const handleAddScheduleItem = () => {
    setScheduleItems([
      ...scheduleItems,
      {
        title: '',
        speaker: '',
        venue: '',
        zone: '',
        startTime: '',
        endTime: '',
        type: 'session',
        description: ''
      }
    ]);
  };

  const handleRemoveScheduleItem = (index) => {
    if (scheduleItems.length === 1) return;
    setScheduleItems(scheduleItems.filter((_, i) => i !== index));
  };

  const handleScheduleChange = (index, field, value) => {
    const updated = [...scheduleItems];
    updated[index][field] = value;
    setScheduleItems(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.venue || !formData.startDate || !formData.endDate) {
      toast.error('Please fill in all required event details');
      return;
    }

    setLoading(true);
    try {
      // Process schedule
      const processedSchedule = scheduleItems
        .filter(item => item.title.trim())
        .map(item => ({
          ...item,
          startTime: item.startTime ? new Date(item.startTime).toISOString() : new Date(formData.startDate).toISOString(),
          endTime: item.endTime ? new Date(item.endTime).toISOString() : new Date(formData.endDate).toISOString(),
        }));

      const payload = {
        ...formData,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        maxAttendees: Number(formData.maxAttendees),
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        rules: formData.rules ? formData.rules.split('\n').map(r => r.trim()).filter(Boolean) : [],
        schedule: processedSchedule
      };

      const res = await api.post('/events', payload);
      if (res.data.success) {
        toast.success('Event published successfully!');
        navigate(`/events/${res.data.data._id}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '800px', padding: '2rem 1rem 5rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ margin: '0 0 0.5rem', fontSize: '1.85rem', fontWeight: 800 }}>Create New Event</h1>
        <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
          Configure offline packs, initial schedule, and venue details for seamless operations.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Core Info */}
        <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 1.25rem' }}>Basic Event Info</h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Event Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Apex Tech Fest 2026"
                className="form-control"
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Tagline
              </label>
              <input
                type="text"
                value={formData.tagline}
                onChange={e => setFormData({ ...formData, tagline: e.target.value })}
                placeholder="e.g. Where Resilience Meets Innovation"
                className="form-control"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Description
              </label>
              <textarea
                rows="3"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="Summary of the fest, tracks, and target audience..."
                className="form-control"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Primary Venue *
              </label>
              <input
                type="text"
                value={formData.venue}
                onChange={e => setFormData({ ...formData, venue: e.target.value })}
                placeholder="e.g. Campus Convention Center"
                className="form-control"
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Capacity (Max Attendees)
              </label>
              <input
                type="number"
                value={formData.maxAttendees}
                onChange={e => setFormData({ ...formData, maxAttendees: e.target.value })}
                className="form-control"
              />
            </div>
          </div>
        </div>

        {/* Schedule & Dates */}
        <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 1.25rem' }}>Date & Timeline</h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Start Date & Time *
              </label>
              <input
                type="datetime-local"
                value={formData.startDate}
                onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                className="form-control"
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                End Date & Time *
              </label>
              <input
                type="datetime-local"
                value={formData.endDate}
                onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                className="form-control"
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Initial Schedule Items</h3>
            <button
              type="button"
              onClick={handleAddScheduleItem}
              className="btn btn-sm btn-outline"
            >
              + Add Item
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {scheduleItems.map((item, idx) => (
              <div
                key={idx}
                style={{
                  padding: '1rem',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                    ITEM #{idx + 1}
                  </span>
                  {scheduleItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveScheduleItem(idx)}
                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem' }}
                    >
                      ✕ Remove
                    </button>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <input
                    type="text"
                    value={item.title}
                    onChange={e => handleScheduleChange(idx, 'title', e.target.value)}
                    placeholder="Session / Activity Title *"
                    className="form-control"
                    required
                  />
                  <input
                    type="text"
                    value={item.speaker}
                    onChange={e => handleScheduleChange(idx, 'speaker', e.target.value)}
                    placeholder="Speaker or Host"
                    className="form-control"
                  />
                  <select
                    value={item.type}
                    onChange={e => handleScheduleChange(idx, 'type', e.target.value)}
                    className="form-control"
                  >
                    <option value="session">Session</option>
                    <option value="workshop">Workshop</option>
                    <option value="break">Break</option>
                    <option value="ceremony">Ceremony</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                  <input
                    type="datetime-local"
                    value={item.startTime}
                    onChange={e => handleScheduleChange(idx, 'startTime', e.target.value)}
                    className="form-control"
                  />
                  <input
                    type="datetime-local"
                    value={item.endTime}
                    onChange={e => handleScheduleChange(idx, 'endTime', e.target.value)}
                    className="form-control"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Extra Information */}
        <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 1.25rem' }}>Offline Guidelines & Tags</h2>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={e => setFormData({ ...formData, tags: e.target.value })}
              placeholder="hackathon, tech, outdoor, coding"
              className="form-control"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              Guidelines & Rules (one per line)
            </label>
            <textarea
              rows="3"
              value={formData.rules}
              onChange={e => setFormData({ ...formData, rules: e.target.value })}
              placeholder="Keep student ID visible&#10;Follow designated emergency exits&#10;Report network disruptions to booth #4"
              className="form-control"
            />
          </div>
        </div>

        {/* Submit Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button
            type="button"
            onClick={() => navigate('/events')}
            className="btn btn-ghost"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ minWidth: '160px' }}
          >
            {loading ? 'Creating...' : 'Publish Event'}
          </button>
        </div>
      </form>
    </div>
  );
}
