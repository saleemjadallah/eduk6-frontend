import { createBrowserRouter, RouterProvider, Navigate, Outlet, ScrollRestoration } from 'react-router-dom';
import { LessonProvider } from './context/LessonContext';
import { GamificationProvider } from './context/GamificationContext';
import { FlashcardProvider } from './context/FlashcardContext';
import { ChatProvider } from './context/ChatContext';
import { AuthProvider } from './context/AuthContext';
import { ModeProvider } from './context/ModeContext';
import { SelectionProvider } from './context/SelectionContext';

// Pages
import HomePage from './pages/HomePage';
import ChildDashboard from './pages/ChildDashboard';
import StudyPage from './pages/StudyPage';
import AchievementsPage from './pages/AchievementsPage';
import FlashcardsPage from './pages/FlashcardsPage';
import OnboardingPage from './pages/OnboardingPage';
import ParentDashboard from './pages/ParentDashboard';
import MyChildrenPage from './pages/MyChildrenPage';
import ChildDetailsPage from './pages/ChildDetailsPage';
import LoginPage from './pages/LoginPage';

// Components
import { RewardPopup } from './components/Gamification';
import ProtectedRoute from './components/Routing/ProtectedRoute';
import ModeRoute from './components/Routing/ModeRoute';
import ScrollToTop from './components/Routing/ScrollToTop';
import { ChildLayout, ParentLayout } from './components/Layouts';
import ParentPinVerification from './components/Parent/ParentPinVerification';

function RootLayout() {
    return (
        <AuthProvider>
            <LessonProvider>
                <GamificationProvider>
                    <SelectionProvider>
                        <FlashcardProvider>
                            <ChatProvider>
                                <ScrollToTop />
                                <ScrollRestoration getKey={(location) => location.pathname} />
                                <ModeProvider>
                                    <Outlet />
                                </ModeProvider>
                                {/* Global reward popup for celebrations */}
                                <RewardPopup />
                            </ChatProvider>
                        </FlashcardProvider>
                    </SelectionProvider>
                </GamificationProvider>
            </LessonProvider>
        </AuthProvider>
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
    {
        element: <RootLayout />,
        children: [
            // Public routes
            { path: '/', element: <HomePage /> },
            { path: '/login', element: <LoginPage /> },
            { path: '/onboarding', element: <OnboardingPage /> },

            // Child routes - wrapped in ChildLayout
            {
                path: '/learn',
                element: (
                    <ProtectedRoute>
                        <ModeRoute mode="child">
                            <ChildLayout />
                        </ModeRoute>
                    </ProtectedRoute>
                ),
                children: [
                    { index: true, element: <ChildDashboard /> },
                    { path: 'study', element: <Navigate to="/learn" replace /> },
                    { path: 'study/:lessonId', element: <StudyPage /> },
                    { path: 'achievements', element: <AchievementsPage /> },
                    { path: 'flashcards', element: <FlashcardsPage /> },
                    { path: 'flashcards/:deckId', element: <FlashcardsPage /> },
                ],
            },

            // Legacy routes - redirect to new structure
            { path: '/study', element: <Navigate to="/learn" replace /> },
            { path: '/achievements', element: <Navigate to="/learn/achievements" replace /> },
            { path: '/flashcards', element: <Navigate to="/learn/flashcards" replace /> },

            // Parent PIN verification route
            {
                path: '/parent/verify-pin',
                element: (
                    <ProtectedRoute requireProfile={false}>
                        <ParentPinVerification />
                    </ProtectedRoute>
                ),
            },

            // Parent routes - wrapped in ParentLayout
            {
                path: '/parent',
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
                    { path: 'reports', element: <PlaceholderPage title="Progress Reports" /> },
                    { path: 'safety', element: <PlaceholderPage title="Safety Logs" /> },
                    { path: 'settings', element: <PlaceholderPage title="Settings" /> },
                    { path: 'privacy', element: <PlaceholderPage title="Privacy Controls" /> },
                    { path: 'billing', element: <PlaceholderPage title="Subscription" /> },
                    { path: 'support', element: <PlaceholderPage title="Support" /> },
                ],
            },

            // Add child route
            {
                path: '/add-child',
                element: (
                    <ProtectedRoute requireProfile={false}>
                        <OnboardingPage initialStep="create_profile" />
                    </ProtectedRoute>
                ),
            },

            // Catch-all redirect
            { path: '*', element: <Navigate to="/learn" replace /> },
        ],
    },
]);

function App() {
    return <RouterProvider router={router} />;
}


export default App;
