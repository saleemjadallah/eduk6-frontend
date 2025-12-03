import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Bold, Italic, Underline, Highlighter, List, Smile } from 'lucide-react';
import { HIGHLIGHT_COLORS, EDITOR_TOOLBAR } from '../../constants/notebookConstants';

/**
 * NoteEditor - Rich text editor for notebook notes
 * Age-appropriate toolbar with formatting options
 */
const NoteEditor = ({
  initialTitle = '',
  initialContent = '',
  ageGroup = 'OLDER', // 'YOUNG' (4-7) or 'OLDER' (8-12)
  onTitleChange,
  onContentChange,
  placeholder = 'Write your note here...',
  autoFocus = false,
}) => {
  const [title, setTitle] = useState(initialTitle);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const editorRef = useRef(null);

  // Common emojis for quick insert
  const QUICK_EMOJIS = ['😊', '🎉', '⭐', '💡', '✨', '🔥', '💪', '🎯', '✅', '❤️', '🌟', '🚀'];

  // Get toolbar buttons based on age
  const toolbarButtons = ageGroup === 'YOUNG' ? EDITOR_TOOLBAR.young : EDITOR_TOOLBAR.older;

  // Apply formatting command
  const applyFormat = useCallback((command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  }, []);

  // Handle title change
  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    onTitleChange?.(newTitle);
  };

  // Handle content change
  const handleContentInput = () => {
    const html = editorRef.current?.innerHTML || '';
    onContentChange?.(html);
  };

  // Apply highlight color
  const applyHighlight = (color) => {
    applyFormat('backColor', color);
    setShowHighlightPicker(false);
  };

  // Insert emoji
  const insertEmoji = (emoji) => {
    applyFormat('insertText', emoji);
    setShowEmojiPicker(false);
  };

  // Toolbar button component
  const ToolbarButton = ({ icon: Icon, command, value, label, onClick, isActive }) => (
    <motion.button
      type="button"
      className={`p-2 rounded-lg border-2 border-black transition-colors ${
        isActive ? 'bg-black text-white' : 'bg-white hover:bg-gray-100'
      }`}
      style={{ boxShadow: '2px 2px 0px rgba(0,0,0,1)' }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95, boxShadow: '1px 1px 0px rgba(0,0,0,1)' }}
      onClick={onClick || (() => applyFormat(command, value))}
      title={label}
    >
      <Icon size={18} />
    </motion.button>
  );

  return (
    <div className="w-full">
      {/* Title input */}
      <input
        type="text"
        value={title}
        onChange={handleTitleChange}
        placeholder="Give your note a title..."
        className="w-full text-xl font-bold px-4 py-3 rounded-xl border-3 border-black bg-white mb-4 focus:outline-none focus:ring-2 focus:ring-yellow-400"
        style={{
          fontFamily: '"Comic Neue", cursive',
          boxShadow: '3px 3px 0px rgba(0,0,0,1)',
        }}
        maxLength={255}
        autoFocus={autoFocus}
      />

      {/* Formatting toolbar */}
      <div className="flex flex-wrap gap-2 mb-3 p-2 bg-gray-50 rounded-xl border-2 border-gray-200">
        {toolbarButtons.includes('bold') && (
          <ToolbarButton
            icon={Bold}
            command="bold"
            label="Bold"
          />
        )}

        {toolbarButtons.includes('italic') && (
          <ToolbarButton
            icon={Italic}
            command="italic"
            label="Italic"
          />
        )}

        {toolbarButtons.includes('underline') && (
          <ToolbarButton
            icon={Underline}
            command="underline"
            label="Underline"
          />
        )}

        {toolbarButtons.includes('highlight') && (
          <div className="relative">
            <ToolbarButton
              icon={Highlighter}
              label="Highlight"
              onClick={() => setShowHighlightPicker(!showHighlightPicker)}
            />
            {showHighlightPicker && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-full left-0 mt-2 p-2 bg-white rounded-xl border-3 border-black z-10 flex gap-2"
                style={{ boxShadow: '3px 3px 0px rgba(0,0,0,1)' }}
              >
                {HIGHLIGHT_COLORS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    className="w-8 h-8 rounded-full border-2 border-black hover:scale-110 transition-transform"
                    style={{ backgroundColor: color.value }}
                    onClick={() => applyHighlight(color.value)}
                    title={color.label}
                  />
                ))}
              </motion.div>
            )}
          </div>
        )}

        {toolbarButtons.includes('bulletList') && (
          <ToolbarButton
            icon={List}
            command="insertUnorderedList"
            label="Bullet List"
          />
        )}

        {toolbarButtons.includes('emoji') && (
          <div className="relative">
            <ToolbarButton
              icon={Smile}
              label="Emoji"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            />
            {showEmojiPicker && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-full left-0 mt-2 p-3 bg-white rounded-xl border-3 border-black z-10"
                style={{ boxShadow: '3px 3px 0px rgba(0,0,0,1)', width: '200px' }}
              >
                <div className="grid grid-cols-6 gap-1">
                  {QUICK_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      className="text-xl p-1 hover:bg-gray-100 rounded transition-colors"
                      onClick={() => insertEmoji(emoji)}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* Content editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleContentInput}
        dangerouslySetInnerHTML={{ __html: initialContent }}
        className="w-full min-h-[200px] max-h-[400px] overflow-y-auto p-4 rounded-xl border-3 border-black bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
        style={{
          fontFamily: '"Comic Neue", cursive',
          fontSize: ageGroup === 'YOUNG' ? '1.125rem' : '1rem',
          lineHeight: '1.6',
          boxShadow: '3px 3px 0px rgba(0,0,0,1)',
          background: '#fffef0', // Slight yellow for paper effect
        }}
        data-placeholder={placeholder}
        suppressContentEditableWarning
      />

      {/* Character hint for young children */}
      {ageGroup === 'YOUNG' && (
        <p className="text-sm text-gray-500 mt-2 text-center">
          Use the buttons above to make your note pretty! ✨
        </p>
      )}

      <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
        [contenteditable] ul {
          list-style-type: disc;
          margin-left: 20px;
        }
      `}</style>
    </div>
  );
};

export default NoteEditor;
