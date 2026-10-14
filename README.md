# ⚡ EventOS — College Event Management & Operations Platform

> **Run the Fest. Not the Spreadsheet.**  
> An all-in-one, offline-first event operations operating system built for universities, campus festivals, and high-density student events.

[![MERN Stack](https://img.shields.io/badge/Stack-MERN-blue?style=flat-square)](https://react.dev/)
[![Offline First](https://img.shields.io/badge/Architecture-Offline--First-emerald?style=flat-square)](#offline-first-architecture)
[![License: MIT](https://img.shields.io/badge/License-MIT-purple?style=flat-square)](LICENSE)

---

## 🌟 Overview

During large campus fests and cultural nights, cellular networks regularly crash under crowd density. Most ticketing apps become unresponsive, spreadsheets corrupt, and gates experience long bottlenecks.

**EventOS** solves this with an architectural design inspired by **[EventLedger](https://www.eventledger.me/)**:
- **0% Downtime**: Attendees download complete offline **Event Packs** (schedule, venues, passes) cached in IndexedDB.
- **Sub-Second Gate Check-in**: Volunteers verify digital QR passes locally on device in **0.18s** even with zero internet.
- **Deterministic Auto-Sync**: Turnstile admissions and incident reports made offline queue up and sync automatically once reconnected.
- **Real-Time Command Center**: Organizers get live turnstile streams, zone density indicators, and incident dispatch over WebSockets.

---

## 🚀 Key Features

### 1. 🎫 Digital Pass & Registration Engine
* **Tamper-Proof QR Passes**: Cryptographically verified tickets preventing screenshot cloning.
* **Custom Registration Forms**: Team registrations, individual RSVPs, and ticket tiers.
* **Instant Wallet / Pass View**: Attendees keep access passes offline on mobile devices.

### 2. ⚡ Fast Gate Scanner (0.18s Check-in)
* Built-in camera turnstile scanner powered by `html5-qrcode`.
* Local validation against cached attendee lists with immediate visual audio feedback.
* Instant check-in timestamps recorded offline.

### 3. 🚨 Incident Response & Campus Map
* Zone-based campus mapping with status alerts (Normal, Warning, Critical).
* Rapid reporting with category tagging (Crowd Congestion, Medical, Gate Issue, Security).
* Direct volunteer assignment and dispatch workflow with real-time status tracking.

### 4. 📊 Command Center & Live Analytics
* Real-time metrics counters: Total Registrations, Live Check-ins, Admitted Percentages.
* Live Gate Turnstile Stream showing real-time entry logs.
* Zone capacity monitors and volunteer status overview.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, React Router v7, Vanilla CSS (EventLedger Design System) |
| **Offline Storage** | Service Worker, IndexedDB (`idb`), LocalStorage |
| **Hardware / QR** | `html5-qrcode`, `qrcode` generator |
| **Backend API** | Node.js, Express.js |
| **Database** | MongoDB & Mongoose ODM |
| **Real-Time** | Socket.IO (WebSockets) |
| **Security** | JWT (JSON Web Tokens), bcryptjs, role-based access control |

---

## 📂 Project Structure

```
MERN EVENTS OS/
├── client/                     # Frontend Vite + React application
│   ├── public/                 # Static assets, manifest.json, sw.js
│   ├── src/
│   │   ├── components/         # Navbar, BottomNav, OfflineBanner, Layout
│   │   ├── context/            # AuthContext, SocketContext, ToastContext
│   │   ├── hooks/              # useOnlineStatus, useSyncQueue
│   │   ├── lib/                # api.js (Axios), db.js (IndexedDB wrapper)
│   │   ├── pages/              # Discover, HomePage, Scanner, Dashboard, etc.
│   │   ├── index.css           # EventLedger-inspired architectural design tokens
│   │   └── main.jsx            # Entry point & PWA Service Worker register
│   └── package.json
│
├── server/                     # Backend Node.js + Express API
│   ├── src/
│   │   ├── config/             # MongoDB connection & env setup
│   │   ├── controllers/        # Auth, Event, Ticket, Incident, Zone, Sync
│   │   ├── middleware/         # Auth verification, role checks, error handling
│   │   ├── models/             # User, Event, Ticket, Incident, Zone schemas
│   │   ├── routes/             # REST API endpoint definitions
│   │   ├── services/           # Socket.io live broadcaster
│   │   ├── seed.js             # Initial database demo seed data
│   │   └── server.js           # Server bootstrap
│   └── package.json
│
├── .gitignore                  # Global git ignore configuration
└── README.md                   # Project documentation
```

---

## ⚡ Quick Start Guide

### Prerequisites
* [Node.js](https://nodejs.org/) (v18 or higher recommended)
* [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas URI)

### 1. Clone & Setup Repository
```bash
git clone <your-github-repo-url>
cd "MERN EVENTS OS"
```

### 2. Configure Backend Server
```bash
cd server
npm install
```

Create a `.env` file inside `server/` (or copy from `.env.example`):
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/eventos
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

Seed initial sample data (Fest, Gates, Passes & Demo Accounts):
```bash
npm run seed
```

Start backend development server:
```bash
npm run dev
```
Server will run on `http://localhost:5000`.

---

### 3. Configure Frontend Client
In a separate terminal:
```bash
cd client
npm install
npm run dev
```
Client will run on `http://localhost:5173`.

---

## 👥 Demo Accounts (Pre-configured)

Use these one-click credentials on the Login page:

| Role | Email | Password | Access Capabilities |
|---|---|---|---|
| 👑 **Organizer** | `organizer@eventos.io` | `password123` | Event creation, Command Center, Incident Dispatch, Zone Config |
| 🦺 **Volunteer** | `priya@eventos.io` | `password123` | Gate Scanner, Turnstile Verification, Incident Tasks |
| 🎟️ **Attendee** | `attendee@eventos.io` | `password123` | Event Discovery, Ticket Wallet, Incident Reporting |

---

## 📡 API Endpoints Summary

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register new user account |
| `POST` | `/api/auth/login` | Authenticate user & get JWT |
| `GET` | `/api/events` | List all events (supports query filters) |
| `POST` | `/api/events` | Create new event *(Organizer only)* |
| `GET` | `/api/events/:id/pack` | Export full offline Event Pack |
| `POST` | `/api/tickets/scan` | Verify & check-in ticket QR pass |
| `GET` | `/api/incidents` | Fetch live incidents for an event |
| `POST` | `/api/incidents` | Report a campus incident |
| `POST` | `/api/sync` | Replay & batch sync offline queued actions |

---

## 🎨 UI & Aesthetics

The UI follows the clean, precision engineering style of **[EventLedger](https://www.eventledger.me/)**:
* **Canvas**: Subtle architectural engineering grid pattern with ambient radial gradients.
* **Palette**: High-contrast Slate-900 typography, Electric Blue (`#2563eb`), Indigo (`#4f46e5`), and Mint / Emerald (`#10b981`).
* **Visuals**: Realistic simulated gate turnstiles, holographic digital QR passes, and responsive split-screen authentication screens.

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).
