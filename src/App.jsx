import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import StudyPage from './pages/StudyPage';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/study" element={<StudyPage />} />
            </Routes>
        </Router>
    );
}

export default App;
