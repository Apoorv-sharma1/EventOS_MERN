import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import User from './models/User.model.js';
import Event from './models/Event.model.js';
import Zone from './models/Zone.model.js';
import Volunteer from './models/Volunteer.model.js';
import Incident from './models/Incident.model.js';

async function seedData() {
  await connectDB();
  console.log('🧹 Clearing old test data...');
  await Promise.all([
    User.deleteMany({}),
    Event.deleteMany({}),
    Zone.deleteMany({}),
    Volunteer.deleteMany({}),
    Incident.deleteMany({}),
  ]);

  console.log('👤 Creating users...');
  const organizer = await User.create({
    name: 'Sarah Chen (Lead Ops)',
    email: 'organizer@eventos.io',
    password: 'password123',
    role: 'organizer',
    phone: '+91 98765 43210',
  });

  const volunteer1 = await User.create({
    name: 'Arjun Mehta',
    email: 'arjun@eventos.io',
    password: 'password123',
    role: 'volunteer',
    phone: '+91 98765 43211',
  });

  const volunteer2 = await User.create({
    name: 'Priya Sharma',
    email: 'priya@eventos.io',
    password: 'password123',
    role: 'volunteer',
    phone: '+91 98765 43212',
  });

  const volunteer3 = await User.create({
    name: 'Rohit Verma',
    email: 'rohit@eventos.io',
    password: 'password123',
    role: 'volunteer',
    phone: '+91 98765 43213',
  });

  const attendee = await User.create({
    name: 'Ananya Roy',
    email: 'attendee@eventos.io',
    password: 'password123',
    role: 'attendee',
    phone: '+91 98765 43214',
  });

  console.log('🎪 Creating flagship event...');
  const startDate = new Date();
  startDate.setHours(9, 0, 0, 0);
  const endDate = new Date(startDate.getTime() + 2 * 24 * 60 * 60 * 1000);

  const event = await Event.create({
    name: 'Apex Hackathon & Tech Fest 2026',
    tagline: 'Resilience First: Engineering Under Disruption',
    description: 'A 48-hour high-impact offline-first hackathon with live hardware labs, keynotes, and resilient operational tracking.',
    venue: 'Convention Center & Innovation Complex',
    organizer: organizer._id,
    startDate,
    endDate,
    status: 'live',
    packVersion: 1,
    maxAttendees: 800,
    isPublic: true,
    tags: ['hackathon', 'offline-first', 'tech', 'ai', 'resilience'],
    rules: [
      'Badges must be worn at all times inside all festival zones.',
      'Offline emergency sync kiosks are located at every zone entry.',
      'Report safety issues immediately via EventOS incident reporter.',
      'Quiet hours in Sleeping Pods (Zone D) from 12 AM to 7 AM.'
    ],
    schedule: [
      {
        title: 'Opening Ceremony & Track Announcement',
        description: 'Keynote introduction, problem statements release, and guidelines.',
        speaker: 'Dr. Evelyn Vance & Organizing Board',
        venue: 'Grand Auditorium',
        zone: 'Zone A - Main Arena',
        startTime: new Date(startDate.getTime() + 1 * 60 * 60 * 1000),
        endTime: new Date(startDate.getTime() + 2.5 * 60 * 60 * 1000),
        type: 'ceremony',
        version: 1
      },
      {
        title: 'Workshop: Offline-First Architectures & CRDTs',
        description: 'Hands-on session building local-first sync systems with IndexedDB and WebSockets.',
        speaker: 'Alex Rivera (Chief Architect)',
        venue: 'Lab Complex 2',
        zone: 'Zone B - Hackathon Labs',
        startTime: new Date(startDate.getTime() + 3 * 60 * 60 * 1000),
        endTime: new Date(startDate.getTime() + 5 * 60 * 60 * 1000),
        type: 'workshop',
        version: 1
      },
      {
        title: 'Mentor Office Hours & Triage Checkpoint',
        description: 'Mentors evaluate architecture diagrams and provide code guidance.',
        speaker: 'Lead Mentors Panel',
        venue: 'Open Courtyard',
        zone: 'Zone C - Refreshment & Networking',
        startTime: new Date(startDate.getTime() + 7 * 60 * 60 * 1000),
        endTime: new Date(startDate.getTime() + 9 * 60 * 60 * 1000),
        type: 'session',
        version: 1
      },
      {
        title: 'Midnight Lightning Pitches & Demos',
        description: 'Show and tell of prototypes built during day 1.',
        speaker: 'Participating Teams',
        venue: 'Grand Auditorium Stage',
        zone: 'Zone A - Main Arena',
        startTime: new Date(startDate.getTime() + 14 * 60 * 60 * 1000),
        endTime: new Date(startDate.getTime() + 16 * 60 * 60 * 1000),
        type: 'session',
        version: 1
      }
    ],
    registrations: [attendee._id]
  });

  console.log('🗺️ Creating spatial zones...');
  const zoneA = await Zone.create({
    event: event._id,
    name: 'Zone A - Main Arena',
    description: 'Auditorium, main stage, registration reception & keynote desks.',
    color: '#6366f1',
    status: 'normal',
    capacity: 600,
    currentOccupancy: 340,
    position: { x: 8, y: 12, width: 38, height: 40 },
    assignedVolunteers: [volunteer1._id]
  });

  const zoneB = await Zone.create({
    event: event._id,
    name: 'Zone B - Hackathon Labs',
    description: 'High-density developer workstations, hardware soldering lab & server racks.',
    color: '#f59e0b',
    status: 'warning',
    capacity: 250,
    currentOccupancy: 235,
    position: { x: 52, y: 12, width: 40, height: 40 },
    assignedVolunteers: [volunteer2._id]
  });

  const zoneC = await Zone.create({
    event: event._id,
    name: 'Zone C - Refreshment Courtyard',
    description: 'Food trucks, hydration stations, coffee lounges & dining seating.',
    color: '#10b981',
    status: 'normal',
    capacity: 400,
    currentOccupancy: 110,
    position: { x: 8, y: 58, width: 38, height: 34 },
    assignedVolunteers: [volunteer3._id]
  });

  const zoneD = await Zone.create({
    event: event._id,
    name: 'Zone D - Medical & Operations HQ',
    description: 'First aid post, organizer command center, emergency responder dispatch.',
    color: '#ec4899',
    status: 'normal',
    capacity: 80,
    currentOccupancy: 12,
    position: { x: 52, y: 58, width: 40, height: 34 },
    assignedVolunteers: []
  });

  console.log('🤝 Registering volunteers on roster...');
  await Volunteer.create({
    user: volunteer1._id,
    event: event._id,
    zone: zoneA._id,
    zoneName: zoneA.name,
    availability: 'busy',
    skills: ['Crowd Control', 'First Aid', 'Hardware Check']
  });

  await Volunteer.create({
    user: volunteer2._id,
    event: event._id,
    zone: zoneB._id,
    zoneName: zoneB.name,
    availability: 'busy',
    skills: ['Network Engineering', 'Incident Response', 'Hardware']
  });

  await Volunteer.create({
    user: volunteer3._id,
    event: event._id,
    zone: zoneC._id,
    zoneName: zoneC.name,
    availability: 'available',
    skills: ['Logistics', 'Information Desk', 'Escort']
  });

  console.log('🚨 Creating active incidents...');
  await Incident.create({
    event: event._id,
    reportedBy: attendee._id,
    assignedTo: volunteer2._id,
    zone: zoneB._id,
    zoneName: zoneB.name,
    type: 'infrastructure',
    priority: 'high',
    status: 'accepted',
    title: 'Secondary Power Strip Trip in Lab Row 4',
    description: 'Circuit breaker tripped after 10 team laptops connected to rack power rail. Need backup distribution box.',
    location: 'Lab B, Row 4 desks',
    timeline: [
      { status: 'reported', note: 'Incident submitted by attendee' },
      { status: 'assigned', note: 'Assigned to Priya Sharma', updatedBy: organizer._id },
      { status: 'accepted', note: 'Priya acknowledged and picking up spare surge protectors', updatedBy: volunteer2._id }
    ]
  });

  await Incident.create({
    event: event._id,
    reportedBy: attendee._id,
    assignedTo: volunteer1._id,
    zone: zoneA._id,
    zoneName: zoneA.name,
    type: 'medical',
    priority: 'medium',
    status: 'arrived',
    title: 'Participant Minor Sprain / Ice Pack Request',
    description: 'Participant slipped on auditorium ramp. Aware and resting, needs cold compress and basic first aid check.',
    location: 'Auditorium Ramp Entrance #2',
    timeline: [
      { status: 'reported', note: 'Reported via mobile QR desk' },
      { status: 'assigned', note: 'Dispatched volunteer Arjun Mehta', updatedBy: organizer._id },
      { status: 'accepted', note: 'Volunteer en route with first aid kit', updatedBy: volunteer1._id },
      { status: 'on-the-way', note: 'Moving towards Ramp 2', updatedBy: volunteer1._id },
      { status: 'arrived', note: 'Arrived at scene, assisting participant', updatedBy: volunteer1._id }
    ]
  });

  await Incident.create({
    event: event._id,
    reportedBy: organizer._id,
    zone: zoneC._id,
    zoneName: zoneC.name,
    type: 'lost-found',
    priority: 'low',
    status: 'reported',
    title: 'Found Laptop Charger (USB-C 100W)',
    description: 'Grey Braided Anker charger left at coffee bar counter #3. Handed over to zone desk.',
    location: 'Coffee Lounge Counter #3'
  });

  console.log('\n✨ Database seeding complete!');
  console.log('--------------------------------------------------');
  console.log('Demo Credentials (all passwords: password123):');
  console.log('  👑 Organizer:  organizer@eventos.io');
  console.log('  🦺 Volunteer:  priya@eventos.io');
  console.log('  🦺 Volunteer:  arjun@eventos.io');
  console.log('  🎟️ Attendee:   attendee@eventos.io');
  console.log('--------------------------------------------------\n');

  await mongoose.disconnect();
}

seedData().catch(err => {
  console.error('❌ Seeding error:', err);
  process.exit(1);
});
