import { Link } from 'react-router-dom';
import { User, VisaPackage } from '@/types';
import { Button, Card, Badge } from '../components/ui';
import { Plus, FileText, Clock, Check, Eye, Trash2, Calendar, AlertCircle, Plane } from 'lucide-react';
import { useState, useEffect } from 'react';
import { visaDocsApi } from '@/lib/api';

interface DashboardPageProps {
  user: User;
}

export default function DashboardPage({ user }: DashboardPageProps) {
  const [packages, setPackages] = useState<VisaPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await visaDocsApi.getPackages();

      if (response.success && response.data) {
        setPackages(response.data);
      } else {
        setPackages([]);
      }
    } catch (err: any) {
      console.log('No packages found for user');
      setPackages([]);
      setError(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (packageId: number) => {
    if (!confirm('Are you sure you want to delete this visa package?')) return;

    try {
      await visaDocsApi.deletePackage(packageId);
      setPackages(packages.filter(pkg => pkg.id !== packageId));
    } catch (err: any) {
      alert('Failed to delete package: ' + (err.response?.data?.error || err.message));
    }
  };

  // Calculate stats
  const inProgressPackages = packages.filter(p =>
    ['in_progress', 'documents_uploaded', 'photos_generated', 'forms_filled'].includes(p.status)
  );
  const readyPackages = packages.filter(p => p.status === 'ready_for_submission');
  const submittedPackages = packages.filter(p => ['submitted', 'approved', 'rejected'].includes(p.status));
  const totalDocuments = packages.reduce((sum, p) => sum + (p.uploadedDocuments?.length || 0), 0);

  // Status display helpers
  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: 'popular' | 'ai' | 'success' | 'processing' | 'completed' | 'info' }> = {
      'in_progress': { label: 'In Progress', variant: 'processing' },
      'documents_uploaded': { label: 'Documents Uploaded', variant: 'processing' },
      'photos_generated': { label: 'Photos Generated', variant: 'processing' },
      'forms_filled': { label: 'Forms Filled', variant: 'processing' },
      'ready_for_submission': { label: 'Ready', variant: 'success' },
      'submitted': { label: 'Submitted', variant: 'info' },
      'approved': { label: 'Approved', variant: 'completed' },
      'rejected': { label: 'Rejected', variant: 'info' },
    };

    const config = statusMap[status] || { label: status, variant: 'info' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getCountryFlag = (country: string) => {
    const flags: Record<string, string> = {
      'uae': '🇦🇪',
      'saudi': '🇸🇦',
      'qatar': '🇶🇦',
      'kuwait': '🇰🇼',
      'bahrain': '🇧🇭',
      'oman': '🇴🇲',
      'schengen': '🇪🇺',
      'usa': '🇺🇸',
      'uk': '🇬🇧',
      'canada': '🇨🇦',
    };
    return flags[country.toLowerCase()] || '🌍';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user.firstName || user.name}! ✈️
          </h1>
          <p className="text-gray-600">
            Manage your visa documentation packages and track your application progress.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Documents</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{totalDocuments}</p>
              </div>
              <FileText className="h-10 w-10 text-blue-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-3xl font-bold text-orange-600 mt-1">{inProgressPackages.length}</p>
              </div>
              <Clock className="h-10 w-10 text-orange-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ready to Submit</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{readyPackages.length}</p>
              </div>
              <Check className="h-10 w-10 text-green-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Submitted</p>
                <p className="text-3xl font-bold text-purple-600 mt-1">{submittedPackages.length}</p>
              </div>
              <Plane className="h-10 w-10 text-purple-500" />
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <Link to="/upload">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Plus className="mr-2 h-5 w-5" />
              Start New Visa Application
            </Button>
          </Link>
        </div>

        {/* In Progress Packages */}
        {inProgressPackages.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <Clock className="mr-3 h-6 w-6 text-orange-500" />
              In Progress ({inProgressPackages.length})
            </h2>

            <div className="space-y-4">
              {inProgressPackages.map((pkg) => (
                <Card key={pkg.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <span className="text-2xl mr-3">{getCountryFlag(pkg.destinationCountry)}</span>
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">
                            {pkg.destinationCountry.toUpperCase()} - {pkg.visaType.replace(/_/g, ' ').toUpperCase()}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {pkg.applicantName && `${pkg.applicantName} • `}
                            Plan: {pkg.plan.charAt(0).toUpperCase() + pkg.plan.slice(1)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 space-y-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <FileText className="mr-2 h-4 w-4" />
                          {pkg.uploadedDocuments?.length || 0} documents uploaded
                        </div>
                        {pkg.completenessScore !== undefined && (
                          <div className="flex items-center text-sm text-gray-600">
                            <div className="w-full bg-gray-200 rounded-full h-2 mr-3">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all"
                                style={{ width: `${pkg.completenessScore}%` }}
                              />
                            </div>
                            <span className="font-medium">{pkg.completenessScore}% complete</span>
                          </div>
                        )}
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="mr-2 h-4 w-4" />
                          Started {new Date(pkg.createdAt).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="mt-4">
                        {getStatusBadge(pkg.status)}
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Link to={`/packages/${pkg.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Ready & Submitted Packages */}
        {(readyPackages.length > 0 || submittedPackages.length > 0) && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <Check className="mr-3 h-6 w-6 text-green-500" />
              Ready & Submitted ({readyPackages.length + submittedPackages.length})
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...readyPackages, ...submittedPackages].map((pkg) => (
                <Card key={pkg.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{getCountryFlag(pkg.destinationCountry)}</span>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {pkg.destinationCountry.toUpperCase()} - {pkg.visaType.replace(/_/g, ' ')}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {new Date(pkg.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(pkg.status)}
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <FileText className="mr-2 h-4 w-4" />
                      {pkg.uploadedDocuments?.length || 0} documents
                    </div>
                    {pkg.submittedAt && (
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="mr-2 h-4 w-4" />
                        Submitted {new Date(pkg.submittedAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Link to={`/packages/${pkg.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(pkg.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {packages.length === 0 && !isLoading && (
          <Card className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="mb-6">
                <Plane className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No Visa Applications Yet</h3>
                <p className="text-gray-600 mb-6">
                  Start your first visa application and let our AI help you prepare all the documents you need.
                </p>
              </div>
              <Link to="/upload">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600">
                  <Plus className="mr-2 h-5 w-5" />
                  Start Your First Application
                </Button>
              </Link>
            </div>
          </Card>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading your visa packages...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card className="p-6 bg-red-50 border-red-200">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
              <p className="text-red-800">{error}</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
