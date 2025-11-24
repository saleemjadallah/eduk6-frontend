import React from 'react';
import MainLayout from '../components/Layout/MainLayout';
import LessonView from '../components/Lesson/LessonView';
import ChatInterface from '../components/Chat/ChatInterface';

const StudyPage = () => {
    return (
        <MainLayout>
            <LessonView />
            <ChatInterface />
        </MainLayout>
    );
};

export default StudyPage;
