import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { authApi } from './lib/api';
import { normalizeUser } from './lib/user';
import type { User } from './types';

// Pages
import HomePage from './pages/VisaAssistHomePage';
import PricingPage from './pages/PricingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import Layout from './components/Layout';

// NEW: Unified Dashboard with Jeffrey
import { DashboardLayout } from './components/DashboardLayout';
import { UnifiedDashboardHome } from './pages/UnifiedDashboardHome';
import { FormFillerWorkflow } from './pages/workflows/FormFillerWorkflow';
import { DocumentValidatorWorkflow } from './pages/workflows/DocumentValidatorWorkflow';
import { PhotoComplianceWorkflow } from './pages/workflows/PhotoComplianceWorkflow';
import { TravelPlannerWorkflow } from './pages/workflows/TravelPlannerWorkflow';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const currentUser = await authApi.me();
      if (currentUser) {
        setUser(normalizeUser(currentUser));
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Layout user={user}><HomePage /></Layout>} />
        <Route path="/pricing" element={<Layout user={user}><PricingPage /></Layout>} />
        <Route
          path="/login"
          element={
            user ? <Navigate to="/app" /> : <Layout user={user}><LoginPage onLogin={setUser} /></Layout>
          }
        />
        <Route
          path="/register"
          element={
            user ? <Navigate to="/app" /> : <Layout user={user}><RegisterPage onRegister={setUser} /></Layout>
          }
        />
        <Route
          path="/verify-email"
          element={<VerifyEmailPage onVerifySuccess={setUser} />}
        />

        {/* Redirect old dashboard to new unified dashboard */}
        <Route
          path="/dashboard"
          element={<Navigate to="/app" replace />}
        />
        <Route
          path="/chat"
          element={<Navigate to="/app" replace />}
        />
        <Route
          path="/upload"
          element={<Navigate to="/app" replace />}
        />
        <Route
          path="/document-validator"
          element={<Navigate to="/app/validator" replace />}
        />
        <Route
          path="/photo-compliance"
          element={<Navigate to="/app/photo-compliance" replace />}
        />
        <Route
          path="/travel-itinerary"
          element={<Navigate to="/app/travel-planner" replace />}
        />

        {/* NEW: Unified Dashboard with Persistent Jeffrey Sidebar */}
        <Route
          path="/app"
          element={
            user ? (
              <DashboardLayout user={user} onLogout={() => setUser(null)}>
                <UnifiedDashboardHome user={user} />
              </DashboardLayout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/app/form-filler"
          element={
            user ? (
              <DashboardLayout user={user} onLogout={() => setUser(null)}>
                <FormFillerWorkflow />
              </DashboardLayout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/app/validator"
          element={
            user ? (
              <DashboardLayout user={user} onLogout={() => setUser(null)}>
                <DocumentValidatorWorkflow />
              </DashboardLayout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/app/photo-compliance"
          element={
            user ? (
              <DashboardLayout user={user} onLogout={() => setUser(null)}>
                <PhotoComplianceWorkflow />
              </DashboardLayout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/app/travel-planner"
          element={
            user ? (
              <DashboardLayout user={user} onLogout={() => setUser(null)}>
                <TravelPlannerWorkflow />
              </DashboardLayout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
