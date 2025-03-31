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
// import DashboardHome from './pages/dashboard/DashboardHome';
// import ProfilePage from './pages/dashboard/ProfilePage';
// import SchedulePage from './pages/dashboard/SchedulePage';
// import PatientsPage from './pages/dashboard/PatientsPage';
// import DocumentsPage from './pages/dashboard/DocumentsPage';
// import UsersPage from './pages/dashboard/UsersPage';
// import VerificationsPage from './pages/dashboard/VerificationsPage';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <>
      <Toaster />
      <Router>
        <AuthProvider>
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
            </Route>

            {/* Client Dashboard routes */}
            <Route path="/dashboard/*" element={
              <PrivateRoute allowedRoles={['client']}>
                <DashboardLayout />
              </PrivateRoute>
            } />

            {/* Psychologist Dashboard routes */}
            <Route path="/psicologo/dashboard/*" element={
              <PrivateRoute allowedRoles={['psychologist']}>
                <DashboardLayout />
              </PrivateRoute>
            } />

            {/* Admin Dashboard routes */}
            <Route path="/admin/dashboard/*" element={
              <PrivateRoute allowedRoles={['admin']}>
                <DashboardLayout />
              </PrivateRoute>
            } />

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </Router>
    </>
  );
}

export default App;