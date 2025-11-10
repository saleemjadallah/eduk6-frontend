import { Link } from 'react-router-dom';
import { User, HeadshotBatch } from '@/types';
import { Button, Card, Badge } from '../components/ui';
import { Plus, Image, Clock, Check, Eye, Download, Trash2, Calendar, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { batchApi } from '@/lib/api';

interface DashboardPageProps {
  user: User;
}

// Extend HeadshotBatch with optional UI fields
interface DashboardBatch extends Omit<HeadshotBatch, 'status'> {
  name?: string;
  progress?: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

export default function DashboardPage({ user }: DashboardPageProps) {
  const [batches, setBatches] = useState<DashboardBatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await batchApi.getBatches();

      if (response.success && response.data) {
        setBatches(response.data);
      } else {
        // No batches yet, that's okay for new users
        setBatches([]);
      }
    } catch (err: any) {
      // Silently handle errors for new users without batches
      // The UI will show the "No batches yet" state
      console.log('No batches found for user');
      setBatches([]);
      setError(null);
    } finally {
      setIsLoading(false);
    }
  };

  const completedBatches = batches.filter(b => b.status === 'completed');
  const processingBatches = batches.filter(b => b.status === 'processing' || b.status === 'pending');
  const totalHeadshots = completedBatches.reduce((sum, b) => sum + (b.generatedHeadshots?.length || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-12">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Welcome back, {user.firstName}!
              </h1>
              <p className="text-lg text-gray-600">
                Manage your AI headshot batches and downloads
              </p>
            </div>
            <Button variant="primary" size="lg" asChild>
              <Link to="/upload">
                <Plus className="w-5 h-5" />
                Create New Batch
              </Link>
            </Button>
          </div>

          {/* Error State */}
          {error && (
            <Card variant="default" className="p-6 mb-8 bg-red-50 border-red-200">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-red-900 mb-1">Error Loading Batches</h3>
                  <p className="text-red-700 mb-4">{error}</p>
                  <Button variant="primary" size="sm" onClick={fetchBatches}>
                    Try Again
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Loading State */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading your batches...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <Card variant="default" className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center">
                  <Image className="w-6 h-6 text-white" />
                </div>
                <Badge variant="info" size="sm">Total</Badge>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {totalHeadshots}
              </div>
              <div className="text-sm text-gray-600">Headshots Generated</div>
            </Card>

            <Card variant="default" className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-secondary-400 to-secondary-600 rounded-xl flex items-center justify-center">
                  <Check className="w-6 h-6 text-white" />
                </div>
                <Badge variant="success" size="sm">Done</Badge>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {completedBatches.length}
              </div>
              <div className="text-sm text-gray-600">Completed Batches</div>
            </Card>

            <Card variant="default" className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <Badge variant="processing" size="sm">Active</Badge>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {processingBatches.length}
              </div>
              <div className="text-sm text-gray-600">In Progress</div>
            </Card>

            <Card variant="default" className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center">
                  <Download className="w-6 h-6 text-white" />
                </div>
                <Badge variant="success" size="sm">Ready</Badge>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {completedBatches.length}
              </div>
              <div className="text-sm text-gray-600">Ready to Download</div>
            </Card>
          </div>

          {/* Processing Batches */}
          {processingBatches.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Currently Processing</h2>
              <div className="space-y-4">
                {processingBatches.map((batch) => (
                  <Card key={batch.id} variant="default" className="p-6">
                    <div className="flex items-start gap-6">
                      <div className="w-20 h-20 bg-gradient-to-br from-primary-400 to-secondary-600 rounded-xl flex items-center justify-center flex-shrink-0 animate-pulse">
                        <Clock className="w-10 h-10 text-white" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1">
                              {batch.name || `Batch #${batch.id}`}
                            </h3>
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {new Date(batch.createdAt).toLocaleDateString()}
                              </span>
                              <span>•</span>
                              <span className="capitalize">{batch.plan} Plan</span>
                              <span>•</span>
                              <span>{batch.styleTemplates.length} platform{batch.styleTemplates.length !== 1 ? 's' : ''}</span>
                            </div>
                          </div>
                          <Badge variant="processing">{batch.status === 'pending' ? 'Pending' : 'Processing'}</Badge>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">
                              Progress
                            </span>
                            <span className="text-sm font-bold text-primary-600">
                              {batch.progress}%
                            </span>
                          </div>
                          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-primary-500 to-secondary-600 transition-all duration-500"
                              style={{ width: `${batch.progress}%` }}
                            />
                          </div>
                        </div>

                        <p className="text-sm text-gray-600">
                          Estimated time remaining: {Math.round((100 - (batch.progress || 0)) * 1.2)} minutes
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Completed Batches */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Your Batches</h2>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>{completedBatches.length} completed</span>
              </div>
            </div>

            {batches.length === 0 ? (
              <Card variant="default" className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Image className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No headshots yet</h3>
                <p className="text-gray-600 mb-6">
                  Upload your photos to create your first batch of AI-generated professional headshots
                </p>
                <Button variant="primary" size="lg" asChild>
                  <Link to="/upload">
                    <Plus className="w-5 h-5" />
                    Upload Photos
                  </Link>
                </Button>
              </Card>
            ) : completedBatches.length === 0 ? (
              <Card variant="default" className="p-12 text-center">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-amber-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No completed headshots yet</h3>
                <p className="text-gray-600 mb-6">
                  Your batches are currently being processed. Check back soon!
                </p>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedBatches.map((batch) => {
                  const thumbnails = batch.generatedHeadshots?.slice(0, 4).map(h => h.thumbnail) || [];
                  const headshotCount = batch.generatedHeadshots?.length || 0;

                  return (
                    <Card key={batch.id} variant="default" className="overflow-hidden group">
                      {/* Thumbnail Grid */}
                      <div className="grid grid-cols-2 gap-1 aspect-square bg-gray-100">
                        {thumbnails.length > 0 ? (
                          thumbnails.map((thumb, idx) => (
                            <div key={idx} className="relative overflow-hidden bg-gray-200">
                              <img
                                src={thumb}
                                alt={`Thumbnail ${idx + 1}`}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                onError={(e) => {
                                  e.currentTarget.src = 'https://via.placeholder.com/200x200?text=Headshot';
                                }}
                              />
                            </div>
                          ))
                        ) : (
                          // Placeholder if no thumbnails
                          Array.from({ length: 4 }).map((_, idx) => (
                            <div key={idx} className="relative overflow-hidden bg-gray-200 flex items-center justify-center">
                              <Image className="w-8 h-8 text-gray-400" />
                            </div>
                          ))
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-5">
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <h3 className="font-bold text-gray-900 leading-tight line-clamp-2">
                            {batch.name || `Batch #${batch.id}`}
                          </h3>
                          <Badge variant="success" size="sm">
                            <Check className="w-3 h-3" />
                          </Badge>
                        </div>

                        <div className="space-y-2 mb-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Image className="w-4 h-4" />
                            <span>{headshotCount} headshot{headshotCount !== 1 ? 's' : ''}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(batch.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>

                      <div className="flex items-center gap-2">
                        <Button variant="primary" size="sm" className="flex-1" asChild>
                          <Link to={`/batches/${batch.id}`}>
                            <Eye className="w-4 h-4" />
                            View Gallery
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => alert('Download all from batch ' + batch.id)}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => alert('Delete batch ' + batch.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                  );
                })}
              </div>
            )}
          </div>
            </>
          )}

          {/* Quick Actions */}
          {!isLoading && (
          <div className="mt-12 p-8 bg-gradient-to-r from-primary-50 to-secondary-50 border border-primary-200 rounded-xl">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Need more professional headshots?
                </h3>
                <p className="text-gray-600">
                  Create a new batch and get 10-20 AI-generated headshots in just 1-3 hours
                </p>
              </div>
              <Button variant="primary" size="lg" asChild className="flex-shrink-0">
                <Link to="/upload">
                  <Plus className="w-5 h-5" />
                  Create New Batch
                </Link>
              </Button>
            </div>
          </div>
          )}
        </div>
      </div>
    </div>
  );
}
