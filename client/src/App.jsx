import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { SocketProvider } from './context/SocketContext';

import Layout from './components/Layout';
import OfflineBanner from './components/OfflineBanner';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import EventsPage from './pages/EventsPage';
import EventDetailPage from './pages/EventDetailPage';
import SchedulePage from './pages/SchedulePage';
import EventMapPage from './pages/EventMapPage';
import MyTicketPage from './pages/MyTicketPage';
import QRScannerPage from './pages/QRScannerPage';
import ReportIncidentPage from './pages/ReportIncidentPage';
import MyAssignmentsPage from './pages/MyAssignmentsPage';
import OrganizerDashboard from './pages/OrganizerDashboard';
import IncidentDetailPage from './pages/IncidentDetailPage';
import CreateEventPage from './pages/CreateEventPage';
import EventPackPage from './pages/EventPackPage';

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100dvh' }}>
      <div className="spinner spinner-lg" />
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  return (
    <>
      <OfflineBanner />
      <Routes>
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/events/create" element={
            <ProtectedRoute roles={['organizer','admin']}><CreateEventPage /></ProtectedRoute>
          } />
          <Route path="/events/:id" element={<EventDetailPage />} />
          <Route path="/events/:id/schedule" element={<SchedulePage />} />
          <Route path="/events/:id/map" element={<EventMapPage />} />
          <Route path="/events/:id/pack" element={
            <ProtectedRoute><EventPackPage /></ProtectedRoute>
          } />
          <Route path="/my-ticket" element={
            <ProtectedRoute><MyTicketPage /></ProtectedRoute>
          } />
          <Route path="/scan" element={<QRScannerPage />} />
          <Route path="/report-incident" element={
            <ProtectedRoute><ReportIncidentPage /></ProtectedRoute>
          } />
          <Route path="/assignments" element={
            <ProtectedRoute roles={['volunteer','organizer','admin']}><MyAssignmentsPage /></ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute roles={['organizer','admin']}><OrganizerDashboard /></ProtectedRoute>
          } />
          <Route path="/incidents/:id" element={
            <ProtectedRoute><IncidentDetailPage /></ProtectedRoute>
          } />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <ToastProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </ToastProvider>
      </SocketProvider>
    </AuthProvider>
  );
}
