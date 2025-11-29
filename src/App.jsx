import { createBrowserRouter, RouterProvider, Navigate, Outlet, ScrollRestoration, Link } from 'react-router-dom';
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

function RootLayout() {
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

// Simple test layout to isolate routing issues
function TestLayout() {
    return (
        <div style={{ padding: '20px' }}>
            <h1>Test Layout - Testing React Router</h1>
            <nav style={{ marginBottom: '20px', display: 'flex', gap: '20px' }}>
                <Link to="/test" style={{ color: 'blue', textDecoration: 'underline' }}>Test Home</Link>
                <Link to="/test/page1" style={{ color: 'blue', textDecoration: 'underline' }}>Page 1</Link>
                <Link to="/test/page2" style={{ color: 'blue', textDecoration: 'underline' }}>Page 2</Link>
            </nav>
            <div style={{ border: '2px solid blue', padding: '20px', marginTop: '20px' }}>
                <p style={{ color: 'gray', marginBottom: '10px' }}>Content below (from Outlet):</p>
                <Outlet />
            </div>
        </div>
    );
}

const router = createBrowserRouter([
    // SIMPLE TEST ROUTES - no auth, no providers
    {
        path: '/test',
        element: <TestLayout />,
        children: [
            { index: true, element: <div><h2>Test Home Page</h2><p>Click links above to test navigation</p></div> },
            { path: 'page1', element: <div><h2>Page 1</h2><p>This is page 1</p></div> },
            { path: 'page2', element: <div><h2>Page 2</h2><p>This is page 2</p></div> },
        ],
    },
    {
        element: <RootLayout />,
        children: [
            // Public routes
            { path: '/', element: <HomePage /> },
            { path: '/login', element: <LoginPage /> },
            { path: '/onboarding', element: <OnboardingPage /> },

            // Child routes - using ProtectedChildLayout (auth built into layout)
            {
                path: '/learn',
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
