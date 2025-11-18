/**
 * AI Form Filler - History Page
 * View and manage previously filled forms
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFormHistory, downloadFilledPDF } from '../lib/api-formfiller';
import type { FilledForm } from '../types/formfiller';

export default function FormFillerHistoryPage() {
  const navigate = useNavigate();

  const [forms, setForms] = useState<FilledForm[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalForms, setTotalForms] = useState(0);
  const [downloadingId, setDownloadingId] = useState<string>('');

  const ITEMS_PER_PAGE = 20;

  // Load form history
  useEffect(() => {
    loadHistory();
  }, [currentPage]);

  const loadHistory = async () => {
    setIsLoading(true);
    setError('');

    try {
      const result = await getFormHistory(ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

      if (result.success && result.data) {
        setForms(result.data.forms);
        setTotalForms(result.data.pagination.total);
      } else {
        throw new Error(result.error || 'Failed to load history');
      }
    } catch (err: any) {
      console.error('History load error:', err);
      setError(err.message || 'Failed to load form history');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle download
  const handleDownload = async (formId: string, filename: string) => {
    setDownloadingId(formId);

    try {
      await downloadFilledPDF(formId, filename);
    } catch (err: any) {
      console.error('Download error:', err);
      alert(`Download failed: ${err.message}`);
    } finally {
      setDownloadingId('');
    }
  };

  // Format date
  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    const styles: Record<string, { bg: string; text: string; label: string }> = {
      completed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Completed' },
      processing: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Processing' },
      failed: { bg: 'bg-red-100', text: 'text-red-800', label: 'Failed' },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
    };

    const style = styles[status] || styles.pending;

    return (
      <span className={`px-2 py-1 ${style.bg} ${style.text} text-xs font-medium rounded`}>
        {style.label}
      </span>
    );
  };

  // Get confidence badge
  const getConfidenceBadge = (confidence: number | null) => {
    if (confidence === null) return null;

    let color = 'text-red-600';
    if (confidence >= 85) color = 'text-green-600';
    else if (confidence >= 70) color = 'text-yellow-600';

    return <span className={`font-medium ${color}`}>{confidence}%</span>;
  };

  const totalPages = Math.ceil(totalForms / ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Form History</h1>
              <p className="text-gray-600 mt-1">
                View and download your previously filled forms
              </p>
            </div>

            <button
              onClick={() => navigate('/form-filler/upload')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              + Fill New Form
            </button>
          </div>
        </div>

        {/* Stats Card */}
        {!isLoading && forms.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-gray-600 mb-1">Total Forms Filled</div>
                <div className="text-2xl font-bold text-gray-900">{totalForms}</div>
              </div>

              <div>
                <div className="text-sm text-gray-600 mb-1">This Month</div>
                <div className="text-2xl font-bold text-blue-600">
                  {
                    forms.filter((f) => {
                      const createdDate = new Date(f.createdAt);
                      const now = new Date();
                      return (
                        createdDate.getMonth() === now.getMonth() &&
                        createdDate.getFullYear() === now.getFullYear()
                      );
                    }).length
                  }
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-600 mb-1">Avg. Confidence</div>
                <div className="text-2xl font-bold text-green-600">
                  {Math.round(
                    forms
                      .filter((f) => f.confidence !== null)
                      .reduce((sum, f) => sum + (f.confidence || 0), 0) /
                      forms.filter((f) => f.confidence !== null).length
                  ) || 0}
                  %
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading form history...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-700">{error}</p>
            <button
              onClick={loadHistory}
              className="mt-4 px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && forms.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <svg
              className="mx-auto h-16 w-16 text-gray-400 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No forms yet</h3>
            <p className="text-gray-600 mb-6">
              You haven't filled any forms yet. Upload a PDF to get started!
            </p>
            <button
              onClick={() => navigate('/form-filler/upload')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
            >
              Fill Your First Form
            </button>
          </div>
        )}

        {/* Forms Table */}
        {!isLoading && !error && forms.length > 0 && (
          <>
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Form ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Confidence
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Completed
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {forms.map((form) => (
                    <tr key={form.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-mono text-gray-900">
                          {form.id.slice(0, 8)}...
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(form.status)}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {getConfidenceBadge(form.confidence) || (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(form.createdAt)}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {form.completedAt ? (
                          formatDate(form.completedAt)
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {form.status === 'completed' && (
                          <button
                            onClick={() =>
                              handleDownload(form.id, `form_${form.id.slice(0, 8)}.pdf`)
                            }
                            disabled={downloadingId === form.id}
                            className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                          >
                            {downloadingId === form.id ? (
                              <span className="flex items-center justify-end">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                                Downloading...
                              </span>
                            ) : (
                              <span className="flex items-center justify-end">
                                <svg
                                  className="w-4 h-4 mr-1"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                  />
                                </svg>
                                Download
                              </span>
                            )}
                          </button>
                        )}

                        {form.status === 'failed' && (
                          <span className="text-red-600 text-sm">Failed</span>
                        )}

                        {form.status === 'processing' && (
                          <span className="text-blue-600 text-sm flex items-center justify-end">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                            Processing...
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white rounded-lg shadow-sm p-4 mt-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing {currentPage * ITEMS_PER_PAGE + 1} to{' '}
                    {Math.min((currentPage + 1) * ITEMS_PER_PAGE, totalForms)} of {totalForms}{' '}
                    forms
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                      disabled={currentPage === 0}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>

                    <div className="flex items-center px-4 py-2 text-sm text-gray-700">
                      Page {currentPage + 1} of {totalPages}
                    </div>

                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                      disabled={currentPage >= totalPages - 1}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
