import { createBrowserRouter, RouterProvider, Navigate, Outlet, ScrollRestoration, useLocation, useNavigate } from 'react-router-dom';
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
import { ParentLayout } from './components/Layouts';
import ProtectedChildLayout from './components/Layouts/ProtectedChildLayout';
import ParentPinVerification from './components/Parent/ParentPinVerification';
import RouterDebugOverlay from './components/Debug/RouterDebugOverlay';

function RootLayout() {
    const location = useLocation();
    const navigate = useNavigate();

    // If the window URL and router state ever diverge (observed in production),
    // force the router to resync to the real URL to avoid a “stuck” page.
    React.useEffect(() => {
        const browserUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;
        const routerUrl = `${location.pathname}${location.search}${location.hash}`;
        if (browserUrl !== routerUrl) {
            console.warn('[RouterSync] Resyncing router to window URL', { browserUrl, routerUrl });
            navigate(browserUrl || '/', { replace: true });
        }
    }, [location.pathname, location.search, location.hash, navigate]);

    return (
        <AuthProvider>
            <LessonProvider>
                <GamificationProvider>
                    <SelectionProvider>
                        <FlashcardProvider>
                            <ChatProvider>
                                <ScrollRestoration getKey={(location) => location.pathname} />
                                <ModeProvider>
                                    <Outlet />
                                </ModeProvider>
                                <RewardPopup />
                                <RouterDebugOverlay />
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
                path: 'add-child',
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
