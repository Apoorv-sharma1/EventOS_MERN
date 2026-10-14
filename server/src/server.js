import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import eventRoutes from './routes/event.routes.js';
import incidentRoutes from './routes/incident.routes.js';
import zoneRoutes from './routes/zone.routes.js';
import volunteerRoutes from './routes/volunteer.routes.js';
import syncRoutes from './routes/sync.routes.js';
import qrRoutes from './routes/qr.routes.js';
import { setupSocketHandlers } from './socket/socketHandlers.js';

const app = express();
const httpServer = createServer(app);

// Socket.IO setup
export const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  },
});

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/zones', zoneRoutes);
app.use('/api/volunteers', volunteerRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/qr', qrRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// Socket handlers
setupSocketHandlers(io);

// Start server
const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  httpServer.listen(PORT, () => {
    console.log(`\n🚀 EventOS Server running on port ${PORT}`);
    console.log(`📡 WebSocket server ready`);
    console.log(`🌐 API available at http://localhost:${PORT}/api\n`);
  });
});
