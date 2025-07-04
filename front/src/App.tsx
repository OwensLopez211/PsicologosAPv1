// App.tsx (actualizado)
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import TokenRefreshManager from './components/TokenRefreshManager';
import PrivateRoute from './components/routing/PrivateRoute';
import PublicRoute from './components/routing/PublicRoute';
import Layout from './components/Layout';
import DashboardLayout from './components/dashboard/DashboardLayout';
import HomePage from './pages/public-pages/HomePage';
import LoginPage from './pages/public-pages/LoginPage';
import RegisterPage from './pages/public-pages/RegisterPage';
import ContactPage from './pages/public-pages/ContactPage';
import AboutPage from './pages/public-pages/AboutPage';
import SpecialistPage from './pages/public-pages/SpecialistPage';
import SpecialistProfilePage from './pages/public-pages/SpecialistProfilePage';
import TermsPage from './pages/public-pages/TermsPage';
import DashboardHome from './pages/dashboard/DashboardHome';
import ProfilePage from './pages/dashboard/ProfilePage';
import SchedulePage from './pages/dashboard/psychologist/SchedulePage';
import ClientAppointments from './pages/dashboard/client/ClientAppointments';
import PsychologistListPage from './pages/admin/PsychologistListPage';
import PsychologistDetailPage from './pages/admin/PsychologistDetailPage';
import VerificationsPage from './pages/dashboard/VerificationsPage';
import ToastProvider from './components/toast/ToastProvider';
import FAQPage from './pages/public-pages/FaqPage';
import UnifiedPatientsPage from './pages/dashboard/UnifiedPatientsPage';
import { useEffect } from 'react';
import RecuperarPasswordPage from './pages/public-pages/RecuperarPasswordPage';
import EstablecerPasswordPage from './pages/public-pages/EstablecerPasswordPage';
import ClientReviewsPage from './pages/dashboard/client/ClientReviewsPage';
import PsychologistReviewsPage from './pages/dashboard/psychologist/PsychologistReviewsPage';
import AdminReviewsPage from './pages/dashboard/admin/AdminReviewsPage';


// Componente para inicializar el token en localStorage
function TokenInitializer() {
  useEffect(() => {
    // Forzar la sincronización del token al iniciar la aplicación
    console.log('Inicializando sincronización de token en App.tsx');
    const token = localStorage.getItem('token');
    if (token) {
      console.log('Token encontrado en localStorage durante inicialización de la app');
    }
  }, []);

  return null;
}

function App() {
  return (
    <>
      <ToastProvider />
      <Router>
        <AuthProvider>
          <TokenInitializer />
          <TokenRefreshManager />
          <Routes>
            {/* Public routes */}
            <Route element={<Layout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              } />
              <Route path="/registro" element={
                <PublicRoute>
                  <RegisterPage />
                </PublicRoute>
              } />
              <Route path="/especialistas" element={<SpecialistPage />} />
              <Route path="/especialistas/:id" element={<SpecialistProfilePage />} />
              <Route path="/quienes-somos" element={<AboutPage />} />
              <Route path="/contacto" element={<ContactPage />} />
              <Route path="/terminos-y-condiciones" element={<TermsPage />} />
              <Route path="/preguntas-frecuentes" element={<FAQPage />} />
              <Route path="/recuperar-password" element={
                <PublicRoute>
                  <RecuperarPasswordPage />
                </PublicRoute>
              } />
              <Route path="/reset-password/:token" element={
                <PublicRoute>
                  <EstablecerPasswordPage />
                </PublicRoute>
              } />
            </Route>

            {/* Client Dashboard routes */}
            <Route path="/dashboard/*" element={
              <PrivateRoute allowedRoles={['client']}>
                <DashboardLayout />
              </PrivateRoute>
            }>
              <Route path="" element={<DashboardHome />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="appointments" element={<ClientAppointments />} />
              <Route path="reviews" element={<ClientReviewsPage />} />
            </Route>

            {/* Psychologist Dashboard routes */}
            <Route path="/psicologo/dashboard/*" element={
              <PrivateRoute allowedRoles={['psychologist']}>
                <DashboardLayout />
              </PrivateRoute>
            }>
              <Route path="" element={<DashboardHome />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="schedule" element={<SchedulePage />} />
              <Route path="payments" element={<VerificationsPage />} />
              <Route path="patients" element={<UnifiedPatientsPage />} />
              <Route path="reviews" element={<PsychologistReviewsPage />} />
            </Route>

            {/* Admin Dashboard routes */}
            <Route path="/admin/dashboard/*" element={
              <PrivateRoute allowedRoles={['admin']}>
                <DashboardLayout />
              </PrivateRoute>
            }>
              <Route path="" element={<DashboardHome />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="pacients" element={<UnifiedPatientsPage />} />
              <Route path="psychologists" element={<PsychologistListPage />} />
              <Route path="psychologists/:id" element={<PsychologistDetailPage />} />
              <Route path="payments" element={<VerificationsPage />} />
              <Route path="reviews" element={<AdminReviewsPage />} />
            </Route>

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </Router>
    </>
  );
}

export default App;