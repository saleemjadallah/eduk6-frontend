import React from 'react';
import StudentSuggestionBox from './StudentSuggestionBox';
import TeacherSuggestionBox from './TeacherSuggestionBox';

/**
 * Main SuggestionBox component
 * Renders the appropriate version based on the variant prop
 *
 * @param {Object} props
 * @param {'student' | 'teacher'} props.variant - Which version to render
 */
const SuggestionBox = ({ variant = 'student' }) => {
  if (variant === 'teacher') {
    return <TeacherSuggestionBox />;
  }

  return <StudentSuggestionBox />;
};

export default SuggestionBox;
