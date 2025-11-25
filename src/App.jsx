import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LessonProvider } from './context/LessonContext';
import { GamificationProvider } from './context/GamificationContext';
import { FlashcardProvider } from './context/FlashcardContext';
import { ChatProvider } from './context/ChatContext';
import HomePage from './pages/HomePage';
import StudyPage from './pages/StudyPage';
import AchievementsPage from './pages/AchievementsPage';
import FlashcardsPage from './pages/FlashcardsPage';
import { RewardPopup } from './components/Gamification';

function App() {
    return (
        <LessonProvider>
            <GamificationProvider>
                <FlashcardProvider>
                    <ChatProvider>
                        <Router>
                            <Routes>
                                <Route path="/" element={<HomePage />} />
                                <Route path="/study" element={<StudyPage />} />
                                <Route path="/achievements" element={<AchievementsPage />} />
                                <Route path="/flashcards" element={<FlashcardsPage />} />
                            </Routes>
                        </Router>
                        {/* Global reward popup for celebrations */}
                        <RewardPopup />
                    </ChatProvider>
                </FlashcardProvider>
            </GamificationProvider>
        </LessonProvider>
    );
}

export default App;
