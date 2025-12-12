import { createBrowserRouter, RouterProvider, Navigate, Outlet, ScrollRestoration } from 'react-router-dom';
import { LessonProvider } from './context/LessonContext';
import { GamificationProvider } from './context/GamificationContext';
import { FlashcardProvider } from './context/FlashcardContext';
import { ChatProvider } from './context/ChatContext';
import { AuthProvider } from './context/AuthContext';
import { TeacherAuthProvider } from './context/TeacherAuthContext';
import { ModeProvider } from './context/ModeContext';
import { SelectionProvider } from './context/SelectionContext';
import { NotebookProvider } from './context/NotebookContext';

// Pages
import HomePage from './pages/HomePage';
import ChildDashboard from './pages/ChildDashboard';
import StudyPage from './pages/StudyPage';
import AchievementsPage from './pages/AchievementsPage';
import FlashcardsPage from './pages/FlashcardsPage';
import NotebookView from './pages/NotebookView';
import OnboardingPage from './pages/OnboardingPage';
import ParentDashboard from './pages/ParentDashboard';
import MyChildrenPage from './pages/MyChildrenPage';
import ChildDetailsPage from './pages/ChildDetailsPage';
import BillingPage from './pages/BillingPage';
import LoginPage from './pages/LoginPage';
import ParentNotebookView from './pages/ParentNotebookView';
import SafetyLogsPage from './pages/SafetyLogsPage';
import SettingsPage from './pages/SettingsPage';
import PrivacyControlsPage from './pages/PrivacyControlsPage';
import ProgressReportsPage from './pages/ProgressReportsPage';
import SupportPage from './pages/SupportPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import { PrivacyPolicyPage, TermsOfServicePage, CoppaCompliancePage } from './pages/legal';

// Teacher Pages
import {
  TeacherLandingPage,
  TeacherLoginPage,
  TeacherSignupPage,
  TeacherEmailVerificationPage,
  TeacherDashboardPage,
  ContentListPage,
  CreateContentPage,
  ContentEditorPage,
  TeacherUsagePage,
  TeacherGradingPage,
} from './pages/teacher';

// Components
import { RewardPopup } from './components/Gamification';
import ProtectedRoute from './components/Routing/ProtectedRoute';
import ProtectedTeacherRoute from './components/Routing/ProtectedTeacherRoute';
import ModeRoute from './components/Routing/ModeRoute';
import { ParentLayout } from './components/Layouts';
import ProtectedChildLayout from './components/Layouts/ProtectedChildLayout';
import ParentPinVerification from './components/Parent/ParentPinVerification';
import { NotebookModal } from './components/Notebook';

function RootLayout() {
    return (
        <AuthProvider>
            <LessonProvider>
                <GamificationProvider>
                    <NotebookProvider>
                        <SelectionProvider>
                            <FlashcardProvider>
                                <ChatProvider>
                                    <ScrollRestoration getKey={(location) => location.pathname} />
                                    <ModeProvider>
                                        <Outlet />
                                    </ModeProvider>
                                    <RewardPopup />
                                    <NotebookModal />
                                </ChatProvider>
                            </FlashcardProvider>
                        </SelectionProvider>
                    </NotebookProvider>
                </GamificationProvider>
            </LessonProvider>
        </AuthProvider>
    );
}

// Teacher root layout - separate auth context from parent/child
function TeacherRootLayout() {
    return (
        <TeacherAuthProvider>
            <ScrollRestoration getKey={(location) => location.pathname} />
            <Outlet />
        </TeacherAuthProvider>
    );
}

// Placeholder component for pages not yet implemented
function PlaceholderPage({ title }) {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '400px',
            textAlign: 'center',
            padding: '40px'
        }}>
            <h1 style={{ fontSize: '1.5rem', marginBottom: '16px', color: '#333' }}>
                {title}
            </h1>
            <p style={{ color: '#666', fontSize: '1rem' }}>
                This page is coming soon.
            </p>
        </div>
    );
}

const router = createBrowserRouter([
    // FIX: Use path-based layout route instead of pathless layout route
    // React Router v7 has known issues with pathless layout routes
    {
        path: '/',
        element: <RootLayout />,
        children: [
            // Home page at root
            { index: true, element: <HomePage /> },

            // Public routes
            { path: 'login', element: <LoginPage /> },
            { path: 'onboarding', element: <OnboardingPage /> },

            // Public informational pages
            { path: 'about', element: <AboutPage /> },
            { path: 'contact', element: <ContactPage /> },
            { path: 'privacy-policy', element: <PrivacyPolicyPage /> },
            { path: 'terms', element: <TermsOfServicePage /> },
            { path: 'coppa', element: <CoppaCompliancePage /> },

            // Child routes - using ProtectedChildLayout (auth built into layout)
            {
                path: 'learn',
                element: <ProtectedChildLayout />,
                children: [
                    { index: true, element: <ChildDashboard /> },
                    { path: 'study', element: <Navigate to="/learn" replace /> },
                    { path: 'study/:lessonId', element: <StudyPage /> },
                    { path: 'achievements', element: <AchievementsPage /> },
                    { path: 'flashcards', element: <FlashcardsPage /> },
                    { path: 'flashcards/:deckId', element: <FlashcardsPage /> },
                    { path: 'notebook', element: <NotebookView /> },
                ],
            },

            // Legacy routes - redirect to new structure
            { path: 'study', element: <Navigate to="/learn" replace /> },
            { path: 'achievements', element: <Navigate to="/learn/achievements" replace /> },
            { path: 'flashcards', element: <Navigate to="/learn/flashcards" replace /> },

            // Parent PIN verification route
            {
                path: 'parent/verify-pin',
                element: (
                    <ProtectedRoute requireProfile={false}>
                        <ParentPinVerification />
                    </ProtectedRoute>
                ),
            },

            // Parent routes - wrapped in ParentLayout
            {
                path: 'parent',
                element: (
                    <ProtectedRoute requireProfile={false}>
                        <ModeRoute mode="parent">
                            <ParentLayout />
                        </ModeRoute>
                    </ProtectedRoute>
                ),
                children: [
                    { index: true, element: <Navigate to="/parent/dashboard" replace /> },
                    { path: 'dashboard', element: <ParentDashboard /> },
                    { path: 'children', element: <MyChildrenPage /> },
                    { path: 'children/:childId', element: <ChildDetailsPage /> },
                    { path: 'children/:childId/notebook', element: <ParentNotebookView /> },
                    { path: 'reports', element: <ProgressReportsPage /> },
                    { path: 'safety', element: <SafetyLogsPage /> },
                    { path: 'settings', element: <SettingsPage /> },
                    { path: 'privacy', element: <PrivacyControlsPage /> },
                    { path: 'billing', element: <BillingPage /> },
                    { path: 'support', element: <SupportPage /> },
                ],
            },

            // Add child route
            {
                path: 'add-child',
                element: (
                    <ProtectedRoute requireProfile={false}>
                        <OnboardingPage initialStep="create_profile" />
                    </ProtectedRoute>
                ),
            },

            // Catch-all redirect (excluding teacher routes)
            { path: '*', element: <Navigate to="/learn" replace /> },
        ],
    },
    // Teacher routes - separate context from parent/child
    {
        path: '/teacher',
        element: <TeacherRootLayout />,
        children: [
            // Public landing page at /teacher (handles auth redirect internally)
            { index: true, element: <TeacherLandingPage /> },

            // Public teacher routes
            { path: 'login', element: <TeacherLoginPage /> },
            { path: 'signup', element: <TeacherSignupPage /> },
            { path: 'verify-email', element: <TeacherEmailVerificationPage /> },

            // Protected teacher routes
            {
                path: 'dashboard',
                element: (
                    <ProtectedTeacherRoute>
                        <TeacherDashboardPage />
                    </ProtectedTeacherRoute>
                ),
            },

            // Content management routes
            {
                path: 'content',
                element: (
                    <ProtectedTeacherRoute>
                        <ContentListPage />
                    </ProtectedTeacherRoute>
                ),
            },
            {
                path: 'content/create',
                element: (
                    <ProtectedTeacherRoute>
                        <CreateContentPage />
                    </ProtectedTeacherRoute>
                ),
            },
            {
                path: 'content/:id',
                element: (
                    <ProtectedTeacherRoute>
                        <ContentEditorPage />
                    </ProtectedTeacherRoute>
                ),
            },

            // Usage & Billing
            {
                path: 'usage',
                element: (
                    <ProtectedTeacherRoute>
                        <TeacherUsagePage />
                    </ProtectedTeacherRoute>
                ),
            },

            // Grading Center (coming soon)
            {
                path: 'grading',
                element: (
                    <ProtectedTeacherRoute>
                        <TeacherGradingPage />
                    </ProtectedTeacherRoute>
                ),
            },

            // Future teacher routes
            // { path: 'rubrics', element: <ProtectedTeacherRoute><RubricsPage /></ProtectedTeacherRoute> },
            // { path: 'settings', element: <ProtectedTeacherRoute><TeacherSettingsPage /></ProtectedTeacherRoute> },

            // Catch-all for teacher routes
            { path: '*', element: <Navigate to="/teacher/dashboard" replace /> },
        ],
    },
]);

function App() {
    return <RouterProvider router={router} />;
}


export default App;
