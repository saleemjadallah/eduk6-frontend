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
import DashboardPage from './pages/DashboardPage';
import JeffreyChatPage from './pages/JeffreyChatPage';
import UploadPage from './pages/UploadPage';
import ProcessingPage from './pages/ProcessingPage';
import BatchViewPage from './pages/BatchViewPage';
import EditStudioPage from './pages/EditStudioPage';
import DocumentValidatorPage from './pages/DocumentValidatorPage';
import PhotoCompliancePage from './pages/PhotoCompliancePage';
import TravelItineraryPage from './pages/TravelItineraryPage';
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
            user ? <Navigate to="/dashboard" /> : <Layout user={user}><LoginPage onLogin={setUser} /></Layout>
          }
        />
        <Route
          path="/register"
          element={
            user ? <Navigate to="/dashboard" /> : <Layout user={user}><RegisterPage onRegister={setUser} /></Layout>
          }
        />
        <Route
          path="/verify-email"
          element={<VerifyEmailPage onVerifySuccess={setUser} />}
        />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            user ? <Layout user={user}><DashboardPage user={user} /></Layout> : <Navigate to="/login" />
          }
        />
        <Route
          path="/chat"
          element={
            user ? <Layout user={user}><JeffreyChatPage /></Layout> : <Navigate to="/login" />
          }
        />
        <Route
          path="/upload"
          element={
            user ? <Layout user={user}><UploadPage user={user} /></Layout> : <Navigate to="/login" />
          }
        />
        <Route
          path="/processing"
          element={
            user ? <Layout user={user}><ProcessingPage /></Layout> : <Navigate to="/login" />
          }
        />
        <Route
          path="/batches/:batchId"
          element={
            user ? <Layout user={user}><BatchViewPage /></Layout> : <Navigate to="/login" />
          }
        />
        <Route
          path="/edit-studio/:batchId"
          element={
            user ? <Layout user={user}><EditStudioPage /></Layout> : <Navigate to="/login" />
          }
        />

        {/* MYDSCVR Core Features */}
        <Route
          path="/document-validator"
          element={
            user ? <Layout user={user}><DocumentValidatorPage /></Layout> : <Navigate to="/login" />
          }
        />
        <Route
          path="/photo-compliance"
          element={
            user ? <Layout user={user}><PhotoCompliancePage /></Layout> : <Navigate to="/login" />
          }
        />
        <Route
          path="/travel-itinerary"
          element={
            user ? <Layout user={user}><TravelItineraryPage /></Layout> : <Navigate to="/login" />
          }
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
