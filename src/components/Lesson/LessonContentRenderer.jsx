import React, { useMemo } from 'react';
import DOMPurify from 'dompurify';
import { InlineExercise } from '../Exercise';

/**
 * LessonContentRenderer - Renders lesson HTML content with interactive exercises
 * Parses formattedContent and replaces exercise markers with InlineExercise components
 */
const LessonContentRenderer = ({
  content,
  exercises = [], // Exercise data from database for hints/answers
  lessonId, // Required for exercise submissions with marker IDs
  onExerciseComplete,
}) => {
  // Create a map of exercises by their HTML ID (stored in originalPosition)
  const exerciseMap = useMemo(() => {
    const map = {};
    exercises.forEach(ex => {
      // The exercise's originalPosition contains the HTML marker ID (ex-1, ex-2, etc.)
      if (ex.originalPosition) {
        map[ex.originalPosition] = ex;
      }
    });
    return map;
  }, [exercises]);

  // Parse and render content with interactive exercises
  const renderedContent = useMemo(() => {
    if (!content) return null;

    // First, sanitize the content but allow our custom attributes and images
    const sanitized = DOMPurify.sanitize(content, {
      ALLOWED_TAGS: [
        'p', 'br', 'b', 'strong', 'i', 'em', 'u',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'ul', 'ol', 'li', 'span', 'div', 'blockquote',
        'table', 'thead', 'tbody', 'tr', 'th', 'td',
        'img' // Allow images from PPTX extraction
      ],
      ALLOWED_ATTR: [
        'class', 'style', 'data-exercise-id', 'data-type', 'data-answer',
        'src', 'alt', 'loading', 'width', 'height' // Image attributes
      ],
    });

    // Parse the HTML to find interactive exercises
    const parser = new DOMParser();
    const doc = parser.parseFromString(sanitized, 'text/html');

    // Find all interactive exercise spans
    const exerciseSpans = doc.querySelectorAll('.interactive-exercise');

    if (exerciseSpans.length === 0) {
      // No exercises found, render as plain HTML
      return (
        <div
          className="lesson-content prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: sanitized }}
        />
      );
    }

    // Convert to array of content parts (text and exercises)
    const parts = [];
    let lastIndex = 0;
    const html = doc.body.innerHTML;

    exerciseSpans.forEach((span, index) => {
      const exerciseId = span.getAttribute('data-exercise-id');
      const exerciseType = span.getAttribute('data-type');
      const questionText = span.textContent;

      // Find position of this span in the HTML
      const spanOuterHTML = span.outerHTML;
      const spanIndex = html.indexOf(spanOuterHTML, lastIndex);

      if (spanIndex > lastIndex) {
        // Add the HTML before this exercise
        parts.push({
          type: 'html',
          content: html.substring(lastIndex, spanIndex),
          key: `html-${index}`,
        });
      }

      // Add the exercise
      parts.push({
        type: 'exercise',
        exerciseId,
        exerciseType,
        questionText,
        exercise: exerciseMap[exerciseId],
        key: `exercise-${exerciseId}`,
      });

      lastIndex = spanIndex + spanOuterHTML.length;
    });

    // Add remaining HTML after last exercise
    if (lastIndex < html.length) {
      parts.push({
        type: 'html',
        content: html.substring(lastIndex),
        key: 'html-final',
      });
    }

    // Render the parts
    return (
      <div className="lesson-content prose prose-lg max-w-none">
        {parts.map(part => {
          if (part.type === 'html') {
            return (
              <span
                key={part.key}
                dangerouslySetInnerHTML={{ __html: part.content }}
              />
            );
          } else if (part.type === 'exercise') {
            return (
              <InlineExercise
                key={part.key}
                exerciseId={part.exerciseId}
                questionText={part.questionText}
                exerciseType={part.exerciseType}
                exercise={part.exercise}
                lessonId={lessonId}
                onComplete={(result) => onExerciseComplete?.(part.exerciseId, result)}
              />
            );
          }
          return null;
        })}
      </div>
    );
  }, [content, exerciseMap, onExerciseComplete]);

  return renderedContent;
};

export default LessonContentRenderer;
