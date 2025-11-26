import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import LoginPage from './pages/LoginPage';

// Components
import { RewardPopup } from './components/Gamification';
import ProtectedRoute from './components/Routing/ProtectedRoute';
import ModeRoute from './components/Routing/ModeRoute';
import { ChildLayout, ParentLayout } from './components/Layouts';
import ParentPinVerification from './components/Parent/ParentPinVerification';

function App() {
    return (
        <AuthProvider>
            <LessonProvider>
                <GamificationProvider>
                    <SelectionProvider>
                        <FlashcardProvider>
                            <ChatProvider>
                                <Router>
                                <ModeProvider>
                                    <Routes>
                                        {/* Public routes */}
                                        <Route path="/" element={<HomePage />} />
                                        <Route path="/login" element={<LoginPage />} />
                                        <Route path="/onboarding" element={<OnboardingPage />} />

                                        {/* Child routes - wrapped in ChildLayout */}
                                        <Route
                                            path="/learn"
                                            element={
                                                <ProtectedRoute>
                                                    <ModeRoute mode="child">
                                                        <ChildLayout />
                                                    </ModeRoute>
                                                </ProtectedRoute>
                                            }
                                        >
                                            <Route index element={<ChildDashboard />} />
                                            <Route path="study" element={<StudyPage />} />
                                            <Route path="study/:lessonId" element={<StudyPage />} />
                                            <Route path="achievements" element={<AchievementsPage />} />
                                            <Route path="flashcards" element={<FlashcardsPage />} />
                                            <Route path="flashcards/:deckId" element={<FlashcardsPage />} />
                                        </Route>

                                        {/* Legacy routes - redirect to new structure */}
                                        <Route path="/study" element={<Navigate to="/learn/study" replace />} />
                                        <Route path="/achievements" element={<Navigate to="/learn/achievements" replace />} />
                                        <Route path="/flashcards" element={<Navigate to="/learn/flashcards" replace />} />

                                        {/* Parent PIN verification route */}
                                        <Route
                                            path="/parent/verify-pin"
                                            element={
                                                <ProtectedRoute requireProfile={false}>
                                                    <ParentPinVerification />
                                                </ProtectedRoute>
                                            }
                                        />

                                        {/* Parent routes - wrapped in ParentLayout */}
                                        <Route
                                            path="/parent"
                                            element={
                                                <ProtectedRoute requireProfile={false}>
                                                    <ModeRoute mode="parent">
                                                        <ParentLayout />
                                                    </ModeRoute>
                                                </ProtectedRoute>
                                            }
                                        >
                                            <Route index element={<Navigate to="/parent/dashboard" replace />} />
                                            <Route path="dashboard" element={<ParentDashboard />} />
                                            <Route path="children" element={<PlaceholderPage title="My Children" />} />
                                            <Route path="children/:childId" element={<PlaceholderPage title="Child Details" />} />
                                            <Route path="reports" element={<PlaceholderPage title="Progress Reports" />} />
                                            <Route path="safety" element={<PlaceholderPage title="Safety Logs" />} />
                                            <Route path="settings" element={<PlaceholderPage title="Settings" />} />
                                            <Route path="privacy" element={<PlaceholderPage title="Privacy Controls" />} />
                                            <Route path="billing" element={<PlaceholderPage title="Subscription" />} />
                                            <Route path="support" element={<PlaceholderPage title="Support" />} />
                                        </Route>

                                        {/* Add child route */}
                                        <Route
                                            path="/add-child"
                                            element={
                                                <ProtectedRoute requireProfile={false}>
                                                    <OnboardingPage initialStep="create_profile" />
                                                </ProtectedRoute>
                                            }
                                        />

                                        {/* Catch-all redirect */}
                                        <Route path="*" element={<Navigate to="/learn" replace />} />
                                    </Routes>
                                </ModeProvider>
                                </Router>
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

export default App;
