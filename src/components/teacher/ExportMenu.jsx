/**
 * Export Menu Component
 * Provides options to export content as PDF, PowerPoint, or save to Google Drive
 */

import { useState, useRef, useEffect } from 'react';
import { teacherAPI } from '../../services/api/teacherAPI';
import './ExportMenu.css';

export default function ExportMenu({ contentId, contentTitle, contentType = 'LESSON', onExportStart, onExportEnd }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState(null);
  const [driveStatus, setDriveStatus] = useState({ connected: false, loading: true });
  const [showOptions, setShowOptions] = useState(false);
  const [options, setOptions] = useState({
    // PDF options
    includeAnswers: true,
    includeTeacherNotes: true,
    paperSize: 'letter',
    colorScheme: 'color',
    // PPTX options (using Presenton API)
    theme: 'professional',
    slideStyle: 'focused',
    includeInfographic: true,
  });
  const menuRef = useRef(null);

  // Check if this is a lesson (only lessons can be exported to PPTX)
  const isLesson = contentType === 'LESSON';

  // Check Google Drive connection status
  useEffect(() => {
    if (isOpen) {
      checkDriveStatus();
    }
  }, [isOpen]);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
        setShowOptions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const checkDriveStatus = async () => {
    try {
      const response = await teacherAPI.getGoogleDriveStatus();
      setDriveStatus({ connected: response.data?.connected, loading: false });
    } catch (error) {
      setDriveStatus({ connected: false, loading: false });
    }
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    setExportType('pdf');
    onExportStart?.();

    try {
      const { blob, filename } = await teacherAPI.exportContentPDF(contentId, options);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setIsOpen(false);
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export PDF. Please try again.');
    } finally {
      setIsExporting(false);
      setExportType(null);
      onExportEnd?.();
    }
  };

  const handleExportPPTX = async () => {
    setIsExporting(true);
    setExportType('pptx');
    onExportStart?.();

    try {
      const { blob, filename } = await teacherAPI.exportContentPPTX(contentId, {
        theme: options.theme,
        slideStyle: options.slideStyle,
        includeAnswers: options.includeAnswers,
        includeTeacherNotes: options.includeTeacherNotes,
        includeInfographic: options.includeInfographic,
      });

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setIsOpen(false);
    } catch (error) {
      console.error('PPTX export error:', error);
      alert('Failed to export PowerPoint. Please try again.');
    } finally {
      setIsExporting(false);
      setExportType(null);
      onExportEnd?.();
    }
  };

  const handleConnectDrive = async () => {
    try {
      const response = await teacherAPI.getGoogleDriveAuthUrl();
      const authUrl = response.data?.authUrl;

      if (authUrl) {
        // Open OAuth popup
        const width = 600;
        const height = 700;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;

        const popup = window.open(
          authUrl,
          'google-drive-auth',
          `width=${width},height=${height},left=${left},top=${top}`
        );

        // Listen for OAuth callback
        const handleMessage = async (event) => {
          if (event.data?.type === 'google-drive-callback' && event.data?.code) {
            window.removeEventListener('message', handleMessage);
            popup?.close();

            try {
              await teacherAPI.connectGoogleDrive(event.data.code);
              setDriveStatus({ connected: true, loading: false });
            } catch (error) {
              console.error('Failed to connect Google Drive:', error);
              alert('Failed to connect Google Drive. Please try again.');
            }
          }
        };

        window.addEventListener('message', handleMessage);
      }
    } catch (error) {
      console.error('Failed to get auth URL:', error);
      alert('Failed to connect to Google Drive. Please try again.');
    }
  };

  const handleSaveToDrive = async () => {
    if (!driveStatus.connected) {
      handleConnectDrive();
      return;
    }

    setIsExporting(true);
    setExportType('drive');
    onExportStart?.();

    try {
      const response = await teacherAPI.saveToGoogleDrive(contentId, options);

      if (response.success) {
        // Open the file in Google Drive
        if (response.data?.webViewLink) {
          window.open(response.data.webViewLink, '_blank');
        }
        alert('Successfully saved to Google Drive!');
      }

      setIsOpen(false);
    } catch (error) {
      console.error('Drive save error:', error);
      alert('Failed to save to Google Drive. Please try again.');
    } finally {
      setIsExporting(false);
      setExportType(null);
      onExportEnd?.();
    }
  };

  return (
    <div className="export-menu-container" ref={menuRef}>
      <button
        className="export-button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isExporting}
      >
        {isExporting ? (
          <>
            <span className="spinner" />
            Exporting...
          </>
        ) : (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7,10 12,15 17,10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export
          </>
        )}
      </button>

      {isOpen && (
        <div className="export-dropdown">
          <div className="export-dropdown-header">
            <span>Export Options</span>
            <button
              className="options-toggle"
              onClick={() => setShowOptions(!showOptions)}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </button>
          </div>

          {showOptions && (
            <div className="export-options">
              {/* Common options */}
              <label className="export-option">
                <input
                  type="checkbox"
                  checked={options.includeAnswers}
                  onChange={(e) => setOptions({ ...options, includeAnswers: e.target.checked })}
                />
                <span>Include Answers</span>
              </label>
              <label className="export-option">
                <input
                  type="checkbox"
                  checked={options.includeTeacherNotes}
                  onChange={(e) => setOptions({ ...options, includeTeacherNotes: e.target.checked })}
                />
                <span>Include Teacher Notes</span>
              </label>

              {/* PDF-specific options */}
              <div className="export-options-section">
                <span className="export-options-section-title">PDF Settings</span>
                <div className="export-option-select">
                  <span>Paper Size:</span>
                  <select
                    value={options.paperSize}
                    onChange={(e) => setOptions({ ...options, paperSize: e.target.value })}
                  >
                    <option value="letter">Letter</option>
                    <option value="a4">A4</option>
                  </select>
                </div>
                <div className="export-option-select">
                  <span>Color:</span>
                  <select
                    value={options.colorScheme}
                    onChange={(e) => setOptions({ ...options, colorScheme: e.target.value })}
                  >
                    <option value="color">Color</option>
                    <option value="grayscale">Grayscale</option>
                  </select>
                </div>
              </div>

              {/* PPTX-specific options - only show for lessons */}
              {isLesson && (
                <div className="export-options-section">
                  <span className="export-options-section-title">PowerPoint Settings</span>
                  <div className="export-option-select">
                    <span>Theme:</span>
                    <select
                      value={options.theme}
                      onChange={(e) => setOptions({ ...options, theme: e.target.value })}
                    >
                      <option value="professional">Professional</option>
                      <option value="colorful">Colorful</option>
                    </select>
                  </div>
                  <div className="export-option-select">
                    <span>Slide Style:</span>
                    <select
                      value={options.slideStyle}
                      onChange={(e) => setOptions({ ...options, slideStyle: e.target.value })}
                    >
                      <option value="focused">Focused (More slides)</option>
                      <option value="dense">Dense (Fewer slides)</option>
                    </select>
                  </div>
                  <label className="export-option">
                    <input
                      type="checkbox"
                      checked={options.includeInfographic}
                      onChange={(e) => setOptions({ ...options, includeInfographic: e.target.checked })}
                    />
                    <span>Include Visual Summary</span>
                  </label>
                </div>
              )}
            </div>
          )}

          <div className="export-actions">
            <button
              className="export-action-button pdf"
              onClick={handleExportPDF}
              disabled={isExporting}
            >
              {isExporting && exportType === 'pdf' ? (
                <span className="spinner" />
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14,2 14,8 20,8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10,9 9,9 8,9" />
                </svg>
              )}
              <span>Download PDF</span>
            </button>

            {/* PowerPoint button - only for lessons */}
            {isLesson && (
              <button
                className="export-action-button pptx"
                onClick={handleExportPPTX}
                disabled={isExporting}
              >
                {isExporting && exportType === 'pptx' ? (
                  <span className="spinner" />
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="14" rx="2" />
                    <path d="M3 8h18" />
                    <path d="M8 21h8" />
                    <path d="M12 17v4" />
                    <circle cx="9" cy="12" r="1.5" fill="currentColor" />
                    <rect x="12" y="11" width="5" height="2" rx="0.5" fill="currentColor" />
                  </svg>
                )}
                <span>Download PowerPoint</span>
              </button>
            )}

            <button
              className="export-action-button drive"
              onClick={handleSaveToDrive}
              disabled={isExporting}
            >
              {isExporting && exportType === 'drive' ? (
                <span className="spinner" />
              ) : driveStatus.loading ? (
                <span className="spinner small" />
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L4.5 14h7l-1 8 8.5-12h-7l1-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
              <span>
                {driveStatus.connected ? 'Save to Google Drive' : 'Connect Google Drive'}
              </span>
              {driveStatus.connected && (
                <span className="drive-connected-badge">Connected</span>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
