import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LessonProvider } from './context/LessonContext';
import { GamificationProvider } from './context/GamificationContext';
import { FlashcardProvider } from './context/FlashcardContext';
import { ChatProvider } from './context/ChatContext';
import { AuthProvider } from './context/AuthContext';
import HomePage from './pages/HomePage';
import StudyPage from './pages/StudyPage';
import AchievementsPage from './pages/AchievementsPage';
import FlashcardsPage from './pages/FlashcardsPage';
import OnboardingPage from './pages/OnboardingPage';
import { RewardPopup } from './components/Gamification';
import ProtectedRoute from './components/Routing/ProtectedRoute';

function App() {
    return (
        <AuthProvider>
            <LessonProvider>
                <GamificationProvider>
                    <FlashcardProvider>
                        <ChatProvider>
                            <Router>
                                <Routes>
                                    {/* Public routes */}
                                    <Route path="/onboarding" element={<OnboardingPage />} />

                                    {/* Protected routes - require auth, consent, and child profile */}
                                    <Route
                                        path="/"
                                        element={
                                            <ProtectedRoute>
                                                <HomePage />
                                            </ProtectedRoute>
                                        }
                                    />
                                    <Route
                                        path="/study"
                                        element={
                                            <ProtectedRoute>
                                                <StudyPage />
                                            </ProtectedRoute>
                                        }
                                    />
                                    <Route
                                        path="/achievements"
                                        element={
                                            <ProtectedRoute>
                                                <AchievementsPage />
                                            </ProtectedRoute>
                                        }
                                    />
                                    <Route
                                        path="/flashcards"
                                        element={
                                            <ProtectedRoute>
                                                <FlashcardsPage />
                                            </ProtectedRoute>
                                        }
                                    />

                                    {/* Parent dashboard routes - require auth and consent, but not child profile */}
                                    <Route
                                        path="/parent/*"
                                        element={
                                            <ProtectedRoute requireProfile={false} parentOnly>
                                                <div>Parent Dashboard (Coming Soon)</div>
                                            </ProtectedRoute>
                                        }
                                    />

                                    {/* Add child route */}
                                    <Route
                                        path="/add-child"
                                        element={
                                            <ProtectedRoute requireProfile={false}>
                                                <OnboardingPage initialStep="create_profile" />
                                            </ProtectedRoute>
                                        }
                                    />
                                </Routes>
                            </Router>
                            {/* Global reward popup for celebrations */}
                            <RewardPopup />
                        </ChatProvider>
                    </FlashcardProvider>
                </GamificationProvider>
            </LessonProvider>
        </AuthProvider>
    );
}

export default App;
