import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { useTeacherAuth } from '../../context/TeacherAuthContext';
import { teacherAPI } from '../../services/api/teacherAPI';
import TeacherLayout from '../../components/teacher/TeacherLayout';
import { extractText, validateFile, getFileTypeCategory, formatFileSize } from '../../utils/fileProcessors';
import {
  Mic,
  Play,
  Pause,
  Volume2,
  Plus,
  Loader2,
  Check,
  X,
  RefreshCw,
  Trash2,
  Share2,
  BookOpen,
  Calendar,
  Zap,
  ChevronDown,
  Edit3,
  Globe,
  Clock,
  ExternalLink,
  Copy,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Radio,
  Upload,
  File,
  Image,
  Download,
  Mail,
  Link2,
  MessageCircle,
} from 'lucide-react';

// Jeffrey Avatar Component
const JeffreyAvatar = ({ size = 'md', animate = false }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20',
  };

  return (
    <div className={`${sizeClasses[size]} rounded-full overflow-hidden flex-shrink-0 border-2 border-teacher-gold/20 bg-teacher-paper`}>
      <img
        src="/assets/images/jeffrey-avatar.png"
        alt="Jeffrey"
        className={`w-full h-full object-cover ${animate ? 'animate-pulse' : ''}`}
      />
    </div>
  );
};

// Audio Player Component
const AudioPlayer = ({ audioUrl, duration }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(duration || 0);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => {
      setAudioDuration(audio.duration);
      setLoading(false);
    };
    const handleEnded = () => setIsPlaying(false);
    const handleError = (e) => {
      console.error('Audio error:', e, audio.error);
      setError(audio.error?.message || 'Failed to load audio');
      setLoading(false);
      setIsPlaying(false);
    };
    const handleCanPlay = () => setLoading(false);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('canplay', handleCanPlay);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('canplay', handleCanPlay);
    };
  }, [audioUrl]);

  const togglePlay = async () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        try {
          setLoading(true);
          setError(null);
          await audioRef.current.play();
          setIsPlaying(true);
          setLoading(false);
        } catch (err) {
          console.error('Play error:', err);
          setError(err.message || 'Failed to play audio');
          setLoading(false);
          setIsPlaying(false);
        }
      }
    }
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * audioDuration;
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = audioDuration > 0 ? (currentTime / audioDuration) * 100 : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-teacher-chalk/5 to-teacher-gold/5 rounded-xl border border-teacher-ink/5">
        <audio ref={audioRef} src={audioUrl} preload="metadata" crossOrigin="anonymous" />

        <button
          onClick={togglePlay}
          disabled={loading}
          className="w-12 h-12 rounded-full bg-gradient-to-br from-teacher-chalk to-teacher-chalkLight flex items-center justify-center text-white shadow-teacher hover:shadow-teacher-lg transition-all hover:scale-105 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : isPlaying ? (
            <Pause className="w-5 h-5" />
          ) : (
            <Play className="w-5 h-5 ml-0.5" />
          )}
        </button>

        <div className="flex-1">
          <div
            onClick={handleSeek}
            className="h-2 bg-teacher-ink/10 rounded-full cursor-pointer overflow-hidden group"
          >
            <motion.div
              className="h-full bg-gradient-to-r from-teacher-chalk to-teacher-gold rounded-full relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>
          </div>
          <div className="flex justify-between mt-1.5 text-xs text-teacher-inkLight">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(audioDuration)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-teacher-inkLight">
          <Volume2 className="w-4 h-4" />
        </div>
      </div>
      {error && (
        <div className="flex items-center gap-2 text-sm text-teacher-coral px-4">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

// Status Badge Component
const StatusBadge = ({ status }) => {
  const statusConfig = {
    DRAFT: { bg: 'bg-teacher-ink/10', text: 'text-teacher-inkLight', label: 'Draft' },
    GENERATING: { bg: 'bg-teacher-gold/20', text: 'text-teacher-gold', label: 'Generating...' },
    READY: { bg: 'bg-teacher-sage/20', text: 'text-teacher-sage', label: 'Ready' },
    PUBLISHED: { bg: 'bg-teacher-chalk/20', text: 'text-teacher-chalk', label: 'Published' },
  };

  const config = statusConfig[status] || statusConfig.DRAFT;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      {status === 'GENERATING' && <Loader2 className="w-3 h-3 animate-spin" />}
      {status === 'PUBLISHED' && <Radio className="w-3 h-3" />}
      {config.label}
    </span>
  );
};

// Language options
const LANGUAGES = [
  { value: 'en', label: 'English', flag: '🇺🇸' },
  { value: 'ar', label: 'Arabic', flag: '🇸🇦' },
  { value: 'es', label: 'Spanish', flag: '🇪🇸' },
  { value: 'fr', label: 'French', flag: '🇫🇷' },
];

const AudioUpdatesPage = () => {
  const { teacher, quota, refreshQuota } = useTeacherAuth();

  // List state
  const [audioUpdates, setAudioUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Create/Edit modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUpdate, setEditingUpdate] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    lessonIds: [],
    language: 'en',
    voiceId: '',
    customNotes: '',
  });

  // Voice options
  const [voiceOptions, setVoiceOptions] = useState([]);
  const [loadingVoices, setLoadingVoices] = useState(false);

  // Lessons for selection
  const [availableLessons, setAvailableLessons] = useState([]);
  const [loadingLessons, setLoadingLessons] = useState(false);

  // File upload state
  const [uploadedFile, setUploadedFile] = useState(null);
  const [fileProcessing, setFileProcessing] = useState(false);
  const [extractedContent, setExtractedContent] = useState(null);
  const [fileError, setFileError] = useState(null);

  // Generation state
  const [generating, setGenerating] = useState(false);
  const [generatedScript, setGeneratedScript] = useState('');
  const [editingScript, setEditingScript] = useState(false);
  const [generatingAudio, setGeneratingAudio] = useState(false);

  // Action states
  const [actionLoading, setActionLoading] = useState({});
  const [copiedId, setCopiedId] = useState(null);

  // Share modal state
  const [shareModalUpdate, setShareModalUpdate] = useState(null);
  const [copiedField, setCopiedField] = useState(null);

  // Load audio updates on mount
  useEffect(() => {
    loadAudioUpdates();
  }, []);

  // Load voice options when language changes
  useEffect(() => {
    if (showCreateModal) {
      loadVoiceOptions();
      loadLessons();
    }
  }, [showCreateModal, formData.language]);

  const loadAudioUpdates = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await teacherAPI.listAudioUpdates({ limit: 50 });
      if (result.success) {
        // Backend returns data as array directly, not { audioUpdates: [...] }
        setAudioUpdates(result.data || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load audio updates');
    } finally {
      setLoading(false);
    }
  };

  const loadVoiceOptions = async () => {
    try {
      setLoadingVoices(true);
      const result = await teacherAPI.getVoiceOptions();
      if (result.success) {
        const voices = result.data?.voices || [];
        // Filter by selected language
        const filteredVoices = voices.filter(v => v.language === formData.language);
        setVoiceOptions(filteredVoices);
        // Set default voice
        if (filteredVoices.length > 0 && !formData.voiceId) {
          setFormData(prev => ({ ...prev, voiceId: filteredVoices[0].id }));
        }
      }
    } catch (err) {
      console.error('Failed to load voices:', err);
    } finally {
      setLoadingVoices(false);
    }
  };

  const loadLessons = async () => {
    try {
      setLoadingLessons(true);
      const result = await teacherAPI.listContent({ contentType: 'LESSON', limit: 100 });
      if (result.success) {
        // API returns data as array directly, not data.content
        setAvailableLessons(result.data || []);
      }
    } catch (err) {
      console.error('Failed to load lessons:', err);
    } finally {
      setLoadingLessons(false);
    }
  };

  // File upload handling
  const onFileDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setUploadedFile(file);
    setFileError(null);
    setExtractedContent(null);

    try {
      validateFile(file);
      setFileProcessing(true);

      const fileType = getFileTypeCategory(file);

      if (fileType === 'ppt') {
        // PPT files need server-side processing
        const result = await teacherAPI.analyzePPT(file);
        if (result.success && result.data) {
          setExtractedContent({
            text: result.data.extractedText || result.data.content || '',
            title: result.data.suggestedTitle || file.name,
            summary: result.data.summary || '',
            sourceType: 'ppt',
          });
        }
      } else if (fileType === 'pdf') {
        // Try client-side PDF extraction first
        const extracted = await extractText(file);
        if (extracted.text) {
          setExtractedContent({
            text: extracted.text,
            title: extracted.metadata?.title || file.name.replace('.pdf', ''),
            sourceType: 'pdf',
          });
        } else {
          // Fallback to server-side PDF processing
          const result = await teacherAPI.analyzePDF(file);
          if (result.success && result.data) {
            setExtractedContent({
              text: result.data.extractedText || result.data.content || '',
              title: result.data.suggestedTitle || file.name,
              sourceType: 'pdf',
            });
          }
        }
      } else if (fileType === 'image') {
        // Image needs OCR via server
        const extracted = await extractText(file);
        setExtractedContent({
          text: extracted.text,
          title: file.name,
          sourceType: 'image',
        });
      } else if (fileType === 'text') {
        const extracted = await extractText(file);
        setExtractedContent({
          text: extracted.text,
          title: file.name.replace('.txt', ''),
          sourceType: 'text',
        });
      }
    } catch (err) {
      console.error('File processing error:', err);
      setFileError(err.message || 'Failed to process file');
      setUploadedFile(null);
    } finally {
      setFileProcessing(false);
    }
  }, []);

  const clearUploadedFile = () => {
    setUploadedFile(null);
    setExtractedContent(null);
    setFileError(null);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onFileDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.ms-powerpoint': ['.ppt'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'text/plain': ['.txt'],
    },
    maxFiles: 1,
    disabled: fileProcessing,
  });

  const handleCreateNew = () => {
    setEditingUpdate(null);
    setFormData({
      title: '',
      lessonIds: [],
      language: 'en',
      voiceId: '',
      customNotes: '',
    });
    setGeneratedScript('');
    clearUploadedFile();
    setShowCreateModal(true);
  };

  const handleEdit = (update) => {
    setEditingUpdate(update);
    setFormData({
      title: update.title,
      lessonIds: update.lessonIds || [],
      language: update.language || 'en',
      voiceId: update.voiceId || '',
      customNotes: update.customNotes || '',
    });
    setGeneratedScript(update.script || '');
    clearUploadedFile();
    setShowCreateModal(true);
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setEditingUpdate(null);
    setGeneratedScript('');
    setEditingScript(false);
    clearUploadedFile();
  };

  const toggleLessonSelection = (lessonId) => {
    setFormData(prev => ({
      ...prev,
      lessonIds: prev.lessonIds.includes(lessonId)
        ? prev.lessonIds.filter(id => id !== lessonId)
        : [...prev.lessonIds, lessonId],
    }));
  };

  const handleGenerateScript = async () => {
    if (!formData.title || formData.lessonIds.length === 0) {
      setError('Please provide a title and select at least one lesson');
      return;
    }

    try {
      setGenerating(true);
      setError(null);

      const result = await teacherAPI.createAudioUpdate({
        title: formData.title,
        lessonIds: formData.lessonIds,
        language: formData.language,
        voiceId: formData.voiceId,
        customNotes: formData.customNotes,
      });

      if (result.success) {
        setGeneratedScript(result.data?.script || '');
        setEditingUpdate(result.data);
        refreshQuota?.();
        // Refresh the list so the new update appears when modal closes
        loadAudioUpdates();
      }
    } catch (err) {
      setError(err.message || 'Failed to generate script');
    } finally {
      setGenerating(false);
    }
  };

  const handleRegenerateScript = async () => {
    if (!editingUpdate?.id) return;

    try {
      setGenerating(true);
      setError(null);

      const result = await teacherAPI.regenerateAudioScript(editingUpdate.id);
      if (result.success) {
        setGeneratedScript(result.data?.script || '');
        setEditingUpdate(result.data);
        refreshQuota?.();
      }
    } catch (err) {
      setError(err.message || 'Failed to regenerate script');
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveScript = async () => {
    if (!editingUpdate?.id) return;

    try {
      setActionLoading(prev => ({ ...prev, saveScript: true }));

      const result = await teacherAPI.updateAudioUpdate(editingUpdate.id, {
        script: generatedScript,
      });

      if (result.success) {
        setEditingScript(false);
        setEditingUpdate(result.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to save script');
    } finally {
      setActionLoading(prev => ({ ...prev, saveScript: false }));
    }
  };

  const handleGenerateAudio = async () => {
    if (!editingUpdate?.id) return;

    try {
      setGeneratingAudio(true);
      setError(null);

      const result = await teacherAPI.generateAudio(editingUpdate.id);
      if (result.success) {
        setEditingUpdate(result.data);
        refreshQuota?.();
        // Refresh the list to show updated status
        loadAudioUpdates();
      }
    } catch (err) {
      setError(err.message || 'Failed to generate audio');
    } finally {
      setGeneratingAudio(false);
    }
  };

  const handlePublish = async (updateId) => {
    try {
      setActionLoading(prev => ({ ...prev, [updateId]: 'publish' }));

      const result = await teacherAPI.publishAudioUpdate(updateId);
      if (result.success) {
        loadAudioUpdates();
      }
    } catch (err) {
      setError(err.message || 'Failed to publish');
    } finally {
      setActionLoading(prev => ({ ...prev, [updateId]: null }));
    }
  };

  const handleUnpublish = async (updateId) => {
    try {
      setActionLoading(prev => ({ ...prev, [updateId]: 'unpublish' }));

      const result = await teacherAPI.unpublishAudioUpdate(updateId);
      if (result.success) {
        loadAudioUpdates();
      }
    } catch (err) {
      setError(err.message || 'Failed to unpublish');
    } finally {
      setActionLoading(prev => ({ ...prev, [updateId]: null }));
    }
  };

  const handleDelete = async (updateId) => {
    if (!window.confirm('Are you sure you want to delete this audio update?')) return;

    try {
      setActionLoading(prev => ({ ...prev, [updateId]: 'delete' }));

      await teacherAPI.deleteAudioUpdate(updateId);
      loadAudioUpdates();
    } catch (err) {
      setError(err.message || 'Failed to delete');
    } finally {
      setActionLoading(prev => ({ ...prev, [updateId]: null }));
    }
  };

  // Download audio file
  const handleDownloadAudio = async (update) => {
    if (!update.audioUrl) return;

    try {
      setActionLoading(prev => ({ ...prev, [update.id]: 'download' }));

      // Fetch the audio file
      const response = await fetch(update.audioUrl);
      const blob = await response.blob();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${update.title.replace(/[^a-zA-Z0-9]/g, '_')}_audio.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to download audio. Please try again.');
    } finally {
      setActionLoading(prev => ({ ...prev, [update.id]: null }));
    }
  };

  // Open share modal
  const handleOpenShareModal = (update) => {
    setShareModalUpdate(update);
    setCopiedField(null);
  };

  // Copy to clipboard helper
  const handleCopyToClipboard = async (text, field) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      setError('Failed to copy to clipboard');
    }
  };

  // Generate share URLs
  const getShareUrls = (update) => {
    const pageUrl = `${window.location.origin}/listen/${update.id}`;
    const audioUrl = update.audioUrl || '';

    return {
      pageUrl,
      audioUrl,
      emailSubject: encodeURIComponent(`Class Update: ${update.title}`),
      emailBody: encodeURIComponent(
        `Hi,\n\nI've prepared an audio update about what we've been learning in class.\n\n` +
        `Listen here: ${pageUrl}\n\n` +
        `Or download the audio directly: ${audioUrl}\n\n` +
        `Best regards`
      ),
      whatsappText: encodeURIComponent(
        `🎧 Class Update: ${update.title}\n\nListen to what we've been learning: ${pageUrl}`
      ),
    };
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const headerActions = (
    <button
      onClick={handleCreateNew}
      className="teacher-btn-primary flex items-center gap-2"
    >
      <Plus className="w-4 h-4" />
      <span className="hidden sm:inline">Create Update</span>
    </button>
  );

  return (
    <TeacherLayout
      title="Audio Updates"
      subtitle="Create podcast-style updates for parents"
      headerActions={headerActions}
    >
      <div className="max-w-6xl mx-auto">
        {/* Credit Info Banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-gradient-to-r from-teacher-gold/10 to-teacher-terracotta/10 rounded-xl border border-teacher-gold/20 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teacher-gold/20 flex items-center justify-center">
              <Mic className="w-5 h-5 text-teacher-gold" />
            </div>
            <div>
              <p className="font-medium text-teacher-ink">Audio Updates for Parents</p>
              <p className="text-sm text-teacher-inkLight">
                Create engaging podcast-style summaries of what students are learning
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-teacher-gold/20 text-teacher-gold text-sm font-medium">
            <Zap className="w-4 h-4" />
            ~75 credits per audio
          </div>
        </motion.div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 p-4 bg-teacher-coral/10 border border-teacher-coral/20 rounded-xl flex items-center gap-3 text-teacher-coral"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="flex-1">{error}</span>
              <button onClick={() => setError(null)} className="p-1 hover:bg-teacher-coral/20 rounded-lg transition-colors">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-10 h-10 text-teacher-gold animate-spin mb-4" />
            <p className="text-teacher-inkLight">Loading your audio updates...</p>
          </div>
        ) : audioUpdates.length === 0 ? (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="teacher-card p-12 text-center"
          >
            <div className="relative w-24 h-24 mx-auto mb-6">
              <JeffreyAvatar size="xl" />
              <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-teacher-gold flex items-center justify-center shadow-lg">
                <Mic className="w-4 h-4 text-white" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-teacher-ink mb-2">
              No Audio Updates Yet
            </h3>
            <p className="text-teacher-inkLight max-w-md mx-auto mb-6">
              Create engaging podcast-style audio updates to keep parents informed about what their children are learning. It's like having your own classroom radio show!
            </p>
            <button
              onClick={handleCreateNew}
              className="teacher-btn-primary inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create Your First Audio Update
            </button>
          </motion.div>
        ) : (
          /* Audio Updates Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {audioUpdates.map((update, index) => (
              <motion.div
                key={update.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="teacher-card p-5 group hover:shadow-teacher-lg transition-all"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teacher-terracotta to-teacher-terracottaLight flex items-center justify-center text-white">
                      <Mic className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-teacher-ink line-clamp-1">{update.title}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <StatusBadge status={update.status} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Audio Player (if ready) */}
                {update.audioUrl && update.status !== 'GENERATING' && (
                  <div className="mb-4">
                    <AudioPlayer audioUrl={update.audioUrl} duration={update.duration} />
                  </div>
                )}

                {/* Generating state */}
                {update.status === 'GENERATING' && (
                  <div className="mb-4 p-4 bg-teacher-gold/5 rounded-xl border border-teacher-gold/20">
                    <div className="flex items-center gap-3">
                      <Loader2 className="w-5 h-5 text-teacher-gold animate-spin" />
                      <div>
                        <p className="text-sm font-medium text-teacher-gold">Generating Audio...</p>
                        <p className="text-xs text-teacher-inkLight">This may take a minute</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Meta Info */}
                <div className="flex items-center gap-4 text-xs text-teacher-inkLight mb-4">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {formatDuration(update.duration)}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5" />
                    {LANGUAGES.find(l => l.value === update.language)?.label || 'English'}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(update.createdAt)}
                  </div>
                </div>

                {/* Lessons included */}
                {update.lessonIds?.length > 0 && (
                  <div className="flex items-center gap-2 mb-4 text-xs">
                    <BookOpen className="w-3.5 h-3.5 text-teacher-chalk" />
                    <span className="text-teacher-inkLight">
                      {update.lessonIds.length} lesson{update.lessonIds.length > 1 ? 's' : ''} included
                    </span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-4 border-t border-teacher-ink/5">
                  <button
                    onClick={() => handleEdit(update)}
                    className="flex-1 py-2 px-3 text-sm font-medium text-teacher-ink bg-teacher-paper hover:bg-teacher-ink/10 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit
                  </button>

                  {update.status === 'READY' && (
                    <button
                      onClick={() => handlePublish(update.id)}
                      disabled={actionLoading[update.id]}
                      className="flex-1 py-2 px-3 text-sm font-medium text-white bg-teacher-chalk hover:bg-teacher-chalkLight rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {actionLoading[update.id] === 'publish' ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Radio className="w-4 h-4" />
                          Publish
                        </>
                      )}
                    </button>
                  )}

                  {/* Download button - show when audio is available */}
                  {update.audioUrl && (
                    <button
                      onClick={() => handleDownloadAudio(update)}
                      disabled={actionLoading[update.id]}
                      className="py-2 px-3 text-sm font-medium text-teacher-gold bg-teacher-gold/10 hover:bg-teacher-gold/20 rounded-lg transition-colors flex items-center justify-center gap-2"
                      title="Download audio"
                    >
                      {actionLoading[update.id] === 'download' ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                    </button>
                  )}

                  {/* Share button - show when audio is available */}
                  {update.audioUrl && (
                    <button
                      onClick={() => handleOpenShareModal(update)}
                      className="py-2 px-3 text-sm font-medium text-teacher-chalk bg-teacher-chalk/10 hover:bg-teacher-chalk/20 rounded-lg transition-colors flex items-center justify-center gap-2"
                      title="Share audio"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  )}

                  {update.status === 'PUBLISHED' && (
                    <button
                      onClick={() => handleUnpublish(update.id)}
                      disabled={actionLoading[update.id]}
                      className="py-2 px-3 text-sm font-medium text-teacher-inkLight hover:text-teacher-coral hover:bg-teacher-coral/10 rounded-lg transition-colors"
                      title="Unpublish"
                    >
                      {actionLoading[update.id] === 'unpublish' ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <X className="w-4 h-4" />
                      )}
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(update.id)}
                    disabled={actionLoading[update.id]}
                    className="py-2 px-3 text-sm text-teacher-inkLight hover:text-teacher-coral hover:bg-teacher-coral/10 rounded-lg transition-colors"
                    title="Delete"
                  >
                    {actionLoading[update.id] === 'delete' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Create/Edit Modal */}
        <AnimatePresence>
          {showCreateModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={(e) => e.target === e.currentTarget && handleCloseModal()}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-teacher-cream rounded-2xl shadow-2xl"
              >
                {/* Modal Header */}
                <div className="sticky top-0 bg-teacher-cream border-b border-teacher-ink/5 px-6 py-4 flex items-center justify-between z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teacher-terracotta to-teacher-gold flex items-center justify-center text-white">
                      <Mic className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="font-semibold text-teacher-ink">
                        {editingUpdate ? 'Edit Audio Update' : 'Create Audio Update'}
                      </h2>
                      <p className="text-sm text-teacher-inkLight">
                        {generatedScript ? 'Review and generate audio' : 'Select lessons to include'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleCloseModal}
                    className="p-2 text-teacher-inkLight hover:text-teacher-ink hover:bg-teacher-paper rounded-xl transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6">
                  {!generatedScript ? (
                    /* Form Section */
                    <div className="space-y-6">
                      {/* Title */}
                      <div>
                        <label className="block text-sm font-medium text-teacher-ink mb-2">
                          Update Title
                        </label>
                        <input
                          type="text"
                          value={formData.title}
                          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="e.g., Week 12 Learning Update"
                          className="w-full px-4 py-3 rounded-xl border border-teacher-ink/10 focus:border-teacher-gold focus:ring-2 focus:ring-teacher-gold/10 transition-all text-teacher-ink placeholder:text-teacher-inkLight/50"
                        />
                      </div>

                      {/* Language Selection */}
                      <div>
                        <label className="block text-sm font-medium text-teacher-ink mb-2">
                          Language
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {LANGUAGES.map((lang) => (
                            <button
                              key={lang.value}
                              onClick={() => setFormData(prev => ({ ...prev, language: lang.value, voiceId: '' }))}
                              className={`p-3 rounded-xl border-2 transition-all flex items-center gap-2 ${
                                formData.language === lang.value
                                  ? 'border-teacher-gold bg-teacher-gold/5 text-teacher-ink'
                                  : 'border-teacher-ink/10 text-teacher-inkLight hover:border-teacher-ink/20'
                              }`}
                            >
                              <span className="text-lg">{lang.flag}</span>
                              <span className="text-sm font-medium">{lang.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Voice Selection */}
                      <div>
                        <label className="block text-sm font-medium text-teacher-ink mb-2">
                          Voice Style
                        </label>
                        {loadingVoices ? (
                          <div className="flex items-center gap-2 text-teacher-inkLight py-3">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="text-sm">Loading voices...</span>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-2">
                            {voiceOptions.map((voice) => (
                              <button
                                key={voice.id}
                                onClick={() => setFormData(prev => ({ ...prev, voiceId: voice.id }))}
                                className={`p-3 rounded-xl border-2 transition-all text-left ${
                                  formData.voiceId === voice.id
                                    ? 'border-teacher-gold bg-teacher-gold/5'
                                    : 'border-teacher-ink/10 hover:border-teacher-ink/20'
                                }`}
                              >
                                <p className="font-medium text-teacher-ink">{voice.name}</p>
                                <p className="text-xs text-teacher-inkLight">{voice.description}</p>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Lesson Selection */}
                      <div>
                        <label className="block text-sm font-medium text-teacher-ink mb-2">
                          Select Lessons to Include
                        </label>
                        {loadingLessons ? (
                          <div className="flex items-center gap-2 text-teacher-inkLight py-8 justify-center">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Loading lessons...</span>
                          </div>
                        ) : availableLessons.length === 0 ? (
                          <div className="text-center py-8 bg-teacher-paper rounded-xl">
                            <BookOpen className="w-10 h-10 mx-auto text-teacher-inkLight/50 mb-3" />
                            <p className="text-teacher-inkLight">No lessons available</p>
                            <p className="text-sm text-teacher-inkLight/70">Create some lessons first to include in your audio update</p>
                          </div>
                        ) : (
                          <div className="max-h-64 overflow-y-auto border border-teacher-ink/10 rounded-xl divide-y divide-teacher-ink/5">
                            {availableLessons.map((lesson) => (
                              <button
                                key={lesson.id}
                                onClick={() => toggleLessonSelection(lesson.id)}
                                className={`w-full p-4 text-left flex items-center gap-3 transition-colors ${
                                  formData.lessonIds.includes(lesson.id)
                                    ? 'bg-teacher-gold/5'
                                    : 'hover:bg-teacher-paper'
                                }`}
                              >
                                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                                  formData.lessonIds.includes(lesson.id)
                                    ? 'bg-teacher-gold border-teacher-gold text-white'
                                    : 'border-teacher-ink/20'
                                }`}>
                                  {formData.lessonIds.includes(lesson.id) && <Check className="w-3 h-3" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-teacher-ink truncate">{lesson.title}</p>
                                  <p className="text-xs text-teacher-inkLight">
                                    {lesson.subject && `${lesson.subject} • `}
                                    {formatDate(lesson.createdAt)}
                                  </p>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                        {formData.lessonIds.length > 0 && (
                          <p className="text-sm text-teacher-sage mt-2 flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4" />
                            {formData.lessonIds.length} lesson{formData.lessonIds.length > 1 ? 's' : ''} selected
                          </p>
                        )}
                      </div>

                      {/* OR Divider */}
                      <div className="relative py-2">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-teacher-ink/10"></div>
                        </div>
                        <div className="relative flex justify-center">
                          <span className="px-3 bg-white text-sm text-teacher-inkLight font-medium">OR</span>
                        </div>
                      </div>

                      {/* File Upload */}
                      <div>
                        <label className="block text-sm font-medium text-teacher-ink mb-2">
                          Upload Content (PDF, PPT, Image, or Text)
                        </label>

                        {!uploadedFile ? (
                          <div
                            {...getRootProps()}
                            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                              isDragActive
                                ? 'border-teacher-gold bg-teacher-gold/5'
                                : fileError
                                ? 'border-teacher-coral bg-teacher-coral/5'
                                : 'border-teacher-ink/20 hover:border-teacher-gold hover:bg-teacher-gold/5'
                            }`}
                          >
                            <input {...getInputProps()} />
                            {fileProcessing ? (
                              <div className="flex flex-col items-center gap-2">
                                <Loader2 className="w-8 h-8 text-teacher-gold animate-spin" />
                                <p className="text-teacher-inkLight">Processing file...</p>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center gap-2">
                                <div className="w-12 h-12 rounded-full bg-teacher-gold/10 flex items-center justify-center">
                                  <Upload className="w-6 h-6 text-teacher-gold" />
                                </div>
                                <p className="font-medium text-teacher-ink">
                                  {isDragActive ? 'Drop the file here' : 'Drag & drop or click to upload'}
                                </p>
                                <p className="text-sm text-teacher-inkLight">
                                  PDF, PowerPoint, Images, or Text files
                                </p>
                              </div>
                            )}
                            {fileError && (
                              <p className="text-sm text-teacher-coral mt-2">{fileError}</p>
                            )}
                          </div>
                        ) : (
                          <div className="border border-teacher-ink/10 rounded-xl p-4">
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 rounded-lg bg-teacher-gold/10 flex items-center justify-center flex-shrink-0">
                                {extractedContent?.sourceType === 'pdf' && <File className="w-5 h-5 text-teacher-gold" />}
                                {extractedContent?.sourceType === 'ppt' && <File className="w-5 h-5 text-teacher-terracotta" />}
                                {extractedContent?.sourceType === 'image' && <Image className="w-5 h-5 text-teacher-chalk" />}
                                {extractedContent?.sourceType === 'text' && <File className="w-5 h-5 text-teacher-sage" />}
                                {!extractedContent?.sourceType && <File className="w-5 h-5 text-teacher-inkLight" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-teacher-ink truncate">{uploadedFile.name}</p>
                                <p className="text-sm text-teacher-inkLight">
                                  {formatFileSize(uploadedFile.size)}
                                  {extractedContent && (
                                    <span className="text-teacher-sage ml-2">• Content extracted</span>
                                  )}
                                </p>
                              </div>
                              <button
                                onClick={clearUploadedFile}
                                className="p-2 hover:bg-teacher-coral/10 rounded-lg transition-colors text-teacher-coral"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                            {extractedContent?.text && (
                              <div className="mt-3 p-3 bg-teacher-paper rounded-lg max-h-32 overflow-y-auto">
                                <p className="text-sm text-teacher-inkLight whitespace-pre-wrap line-clamp-4">
                                  {extractedContent.text.substring(0, 500)}
                                  {extractedContent.text.length > 500 && '...'}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Additional Notes */}
                      <div>
                        <label className="block text-sm font-medium text-teacher-ink mb-2">
                          Additional Notes (Optional)
                        </label>
                        <textarea
                          value={formData.customNotes}
                          onChange={(e) => setFormData(prev => ({ ...prev, customNotes: e.target.value }))}
                          placeholder="Add any special announcements, upcoming events, or notes for parents..."
                          rows={3}
                          className="w-full px-4 py-3 rounded-xl border border-teacher-ink/10 focus:border-teacher-gold focus:ring-2 focus:ring-teacher-gold/10 transition-all text-teacher-ink placeholder:text-teacher-inkLight/50 resize-none"
                        />
                      </div>

                      {/* Generate Button */}
                      <div className="flex items-center gap-4 pt-4 border-t border-teacher-ink/10">
                        <button
                          onClick={handleCloseModal}
                          className="px-6 py-3 text-teacher-inkLight hover:text-teacher-ink transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleGenerateScript}
                          disabled={generating || !formData.title || formData.lessonIds.length === 0}
                          className="flex-1 teacher-btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {generating ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              Generating Script...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-5 h-5" />
                              Generate Script
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Script Preview Section */
                    <div className="space-y-6">
                      {/* Script Display */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <label className="text-sm font-medium text-teacher-ink">
                            Generated Script
                          </label>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={handleRegenerateScript}
                              disabled={generating}
                              className="text-sm text-teacher-chalk hover:text-teacher-chalkLight flex items-center gap-1.5 transition-colors disabled:opacity-50"
                            >
                              <RefreshCw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
                              Regenerate
                            </button>
                            <button
                              onClick={() => setEditingScript(!editingScript)}
                              className="text-sm text-teacher-gold hover:text-teacher-goldLight flex items-center gap-1.5 transition-colors"
                            >
                              <Edit3 className="w-4 h-4" />
                              {editingScript ? 'Preview' : 'Edit'}
                            </button>
                          </div>
                        </div>

                        {editingScript ? (
                          <div className="space-y-3">
                            <textarea
                              value={generatedScript}
                              onChange={(e) => setGeneratedScript(e.target.value)}
                              rows={12}
                              className="w-full px-4 py-3 rounded-xl border border-teacher-ink/10 focus:border-teacher-gold focus:ring-2 focus:ring-teacher-gold/10 transition-all text-teacher-ink font-mono text-sm resize-none"
                            />
                            <button
                              onClick={handleSaveScript}
                              disabled={actionLoading.saveScript}
                              className="px-4 py-2 bg-teacher-sage text-white rounded-lg text-sm font-medium hover:bg-teacher-sageLight transition-colors flex items-center gap-2 disabled:opacity-50"
                            >
                              {actionLoading.saveScript ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Check className="w-4 h-4" />
                              )}
                              Save Changes
                            </button>
                          </div>
                        ) : (
                          <div className="p-4 bg-teacher-paper rounded-xl border border-teacher-ink/5 max-h-80 overflow-y-auto">
                            <p className="text-teacher-ink whitespace-pre-wrap text-sm leading-relaxed">
                              {generatedScript}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Audio Preview */}
                      {editingUpdate?.audioUrl && (
                        <div>
                          <label className="block text-sm font-medium text-teacher-ink mb-3">
                            Audio Preview
                          </label>
                          <AudioPlayer audioUrl={editingUpdate.audioUrl} duration={editingUpdate.duration} />
                        </div>
                      )}

                      {/* Credit Notice */}
                      <div className="p-4 bg-teacher-gold/10 rounded-xl flex items-center gap-3">
                        <Zap className="w-5 h-5 text-teacher-gold flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-teacher-ink">Audio generation uses ~75 credits</p>
                          <p className="text-xs text-teacher-inkLight">
                            You have {quota?.credits?.total - quota?.credits?.used || 0} credits remaining
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-4 pt-4 border-t border-teacher-ink/10">
                        <button
                          onClick={handleCloseModal}
                          className="px-6 py-3 text-teacher-inkLight hover:text-teacher-ink transition-colors"
                        >
                          Close
                        </button>
                        <button
                          onClick={handleGenerateAudio}
                          disabled={generatingAudio || !generatedScript}
                          className="flex-1 teacher-btn-gold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {generatingAudio ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              Generating Audio...
                            </>
                          ) : editingUpdate?.audioUrl ? (
                            <>
                              <RefreshCw className="w-5 h-5" />
                              Regenerate Audio
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-5 h-5" />
                              Generate Audio
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Share Modal */}
          {shareModalUpdate && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={(e) => e.target === e.currentTarget && setShareModalUpdate(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="w-full max-w-md bg-teacher-cream rounded-2xl shadow-2xl overflow-hidden"
              >
                {/* Modal Header */}
                <div className="bg-gradient-to-r from-teacher-chalk to-teacher-chalkLight px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                      <Share2 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="font-semibold text-white">Share Audio Update</h2>
                      <p className="text-sm text-white/70 truncate max-w-[200px]">{shareModalUpdate.title}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShareModalUpdate(null)}
                    className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  {/* Quick Actions */}
                  <div className="grid grid-cols-3 gap-3">
                    {/* Download */}
                    <button
                      onClick={() => {
                        handleDownloadAudio(shareModalUpdate);
                        setShareModalUpdate(null);
                      }}
                      className="flex flex-col items-center gap-2 p-4 rounded-xl bg-teacher-gold/10 hover:bg-teacher-gold/20 transition-colors group"
                    >
                      <div className="w-12 h-12 rounded-full bg-teacher-gold/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Download className="w-6 h-6 text-teacher-gold" />
                      </div>
                      <span className="text-sm font-medium text-teacher-ink">Download</span>
                    </button>

                    {/* Email */}
                    <a
                      href={`mailto:?subject=${getShareUrls(shareModalUpdate).emailSubject}&body=${getShareUrls(shareModalUpdate).emailBody}`}
                      className="flex flex-col items-center gap-2 p-4 rounded-xl bg-teacher-chalk/10 hover:bg-teacher-chalk/20 transition-colors group"
                      onClick={() => setShareModalUpdate(null)}
                    >
                      <div className="w-12 h-12 rounded-full bg-teacher-chalk/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Mail className="w-6 h-6 text-teacher-chalk" />
                      </div>
                      <span className="text-sm font-medium text-teacher-ink">Email</span>
                    </a>

                    {/* WhatsApp */}
                    <a
                      href={`https://wa.me/?text=${getShareUrls(shareModalUpdate).whatsappText}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center gap-2 p-4 rounded-xl bg-teacher-sage/10 hover:bg-teacher-sage/20 transition-colors group"
                      onClick={() => setShareModalUpdate(null)}
                    >
                      <div className="w-12 h-12 rounded-full bg-teacher-sage/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <MessageCircle className="w-6 h-6 text-teacher-sage" />
                      </div>
                      <span className="text-sm font-medium text-teacher-ink">WhatsApp</span>
                    </a>
                  </div>

                  {/* Copy Links Section */}
                  <div className="space-y-3 pt-4 border-t border-teacher-ink/10">
                    <p className="text-sm font-medium text-teacher-ink">Copy Links</p>

                    {/* Audio File URL */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 px-3 py-2.5 bg-teacher-paper rounded-lg text-sm text-teacher-inkLight truncate font-mono">
                        {shareModalUpdate.audioUrl}
                      </div>
                      <button
                        onClick={() => handleCopyToClipboard(shareModalUpdate.audioUrl, 'audio')}
                        className="px-3 py-2.5 bg-teacher-gold/10 hover:bg-teacher-gold/20 text-teacher-gold rounded-lg transition-colors flex items-center gap-2"
                      >
                        {copiedField === 'audio' ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                        <span className="text-sm font-medium">
                          {copiedField === 'audio' ? 'Copied!' : 'Audio'}
                        </span>
                      </button>
                    </div>

                    {/* Page Link (for future public page) */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 px-3 py-2.5 bg-teacher-paper rounded-lg text-sm text-teacher-inkLight truncate font-mono">
                        {getShareUrls(shareModalUpdate).pageUrl}
                      </div>
                      <button
                        onClick={() => handleCopyToClipboard(getShareUrls(shareModalUpdate).pageUrl, 'page')}
                        className="px-3 py-2.5 bg-teacher-chalk/10 hover:bg-teacher-chalk/20 text-teacher-chalk rounded-lg transition-colors flex items-center gap-2"
                      >
                        {copiedField === 'page' ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Link2 className="w-4 h-4" />
                        )}
                        <span className="text-sm font-medium">
                          {copiedField === 'page' ? 'Copied!' : 'Link'}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Tips */}
                  <div className="p-3 bg-teacher-terracotta/10 rounded-xl text-sm text-teacher-terracotta flex items-start gap-2">
                    <Sparkles className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <p>Tip: Parents can listen to the audio directly from the link, or download it to play offline!</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </TeacherLayout>
  );
};

export default AudioUpdatesPage;
