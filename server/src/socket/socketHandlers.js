import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';

export const setupSocketHandlers = (io) => {
  // Auth middleware for socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Authentication required'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (!user) return next(new Error('User not found'));
      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.user.name} (${socket.user.role})`);

    // Join event room
    socket.on('join:event', (eventId) => {
      socket.join(`event:${eventId}`);
      console.log(`${socket.user.name} joined event room: ${eventId}`);
      socket.emit('joined', { eventId, message: 'Joined event room' });
    });

    // Leave event room
    socket.on('leave:event', (eventId) => {
      socket.leave(`event:${eventId}`);
    });

    // Volunteer broadcasts their location/status
    socket.on('volunteer:status', ({ eventId, availability }) => {
      socket.to(`event:${eventId}`).emit('volunteer:status', {
        userId: socket.user._id,
        name: socket.user.name,
        availability,
        timestamp: new Date().toISOString(),
      });
    });

    // Organizer sends event announcement
    socket.on('announcement', ({ eventId, message, type }) => {
      if (!['organizer', 'admin'].includes(socket.user.role)) return;
      io.to(`event:${eventId}`).emit('announcement', {
        message,
        type: type || 'info',
        sentBy: socket.user.name,
        timestamp: new Date().toISOString(),
      });
    });

    socket.on('disconnect', () => {
      console.log(`❌ Socket disconnected: ${socket.user.name}`);
    });
  });
};
