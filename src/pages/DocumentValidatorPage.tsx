import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileCheck, AlertCircle, CheckCircle2, FileText, GraduationCap, Heart, DollarSign, Clock } from 'lucide-react';
import Button from '../components/gamma/Button';
import Card from '../components/gamma/Card';
import Badge from '../components/gamma/Badge';
import SectionHeader from '../components/gamma/SectionHeader';

const DOCUMENT_TYPES = {
  attested_degree: {
    id: 'attested_degree',
    name: 'Attested Degree',
    icon: GraduationCap,
    description: 'Educational certificates with attestation stamps',
    price: 40, // AED
    processingTime: '3-5 minutes',
    requirements: [
      'Ministry attestation stamp',
      'Embassy attestation',
      'Original signature visible',
      'Clear legibility',
      'No tampering or alterations',
    ],
  },
  marriage_certificate: {
    id: 'marriage_certificate',
    name: 'Marriage Certificate',
    icon: Heart,
    description: 'Marriage certificates for family visa applications',
    price: 35,
    processingTime: '3-5 minutes',
    requirements: [
      'Apostille or attestation',
      'Translation if applicable',
      'Official seal present',
      'All fields completed',
      'Valid date range',
    ],
  },
  passport_copy: {
    id: 'passport_copy',
    name: 'Passport Copy',
    icon: FileText,
    description: 'Passport bio page and visa copies',
    price: 25,
    processingTime: '2-3 minutes',
    requirements: [
      'Bio page clearly visible',
      'All corners visible',
      'No glare or shadows',
      'Valid expiry date',
      'MRZ code readable',
    ],
  },
  bank_statement: {
    id: 'bank_statement',
    name: 'Bank Statement',
    icon: DollarSign,
    description: 'Bank statements for financial proof',
    price: 30,
    processingTime: '2-3 minutes',
    requirements: [
      'Official bank letterhead',
      'Account holder name visible',
      'Recent statements (last 3-6 months)',
      'Bank seal/stamp',
      'Clear transaction history',
    ],
  },
  employment_letter: {
    id: 'employment_letter',
    name: 'Employment Letter',
    icon: FileCheck,
    description: 'Employment letters and contracts',
    price: 30,
    processingTime: '2-3 minutes',
    requirements: [
      'Company letterhead',
      'Authorized signature',
      'Company stamp/seal',
      'Job title and salary',
      'Employment dates',
    ],
  },
};

export default function DocumentValidatorPage() {
  const [selectedDocument, setSelectedDocument] = useState<keyof typeof DOCUMENT_TYPES | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
    }
  };

  const handleValidate = async () => {
    if (!selectedDocument || !uploadedFile) return;

    setLoading(true);
    // TODO: Implement API call to validate document
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-neutral-50">
      {/* Hero Section */}
      <section className="py-12 md:py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <Badge variant="gradient" className="mb-4 inline-flex">
              <FileCheck className="w-4 h-4 mr-2" />
              AI-Powered Validation
            </Badge>

            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-600 bg-clip-text text-transparent">
              Document Validator
            </h1>

            <p className="text-xl md:text-2xl text-neutral-600 max-w-3xl mx-auto mb-8">
              AI checks for required stamps, signatures, formatting, and language requirements. Flags rejection risks
              before submission.
            </p>

            {/* Stats */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-neutral-600 mb-8">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-500" />
                <span className="text-sm font-medium">
                  <strong className="text-neutral-900">3-5 minutes</strong> processing
                </span>
              </div>
              <div className="hidden sm:block w-px h-6 bg-neutral-300" />
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium">
                  <strong className="text-neutral-900">AED 25-40</strong> per document
                </span>
              </div>
              <div className="hidden sm:block w-px h-6 bg-neutral-300" />
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-purple-500" />
                <span className="text-sm font-medium">
                  <strong className="text-neutral-900">PDF Report</strong> included
                </span>
              </div>
            </div>
          </div>

          {/* Step 1: Select Document Type */}
          <div className="mb-12">
            <SectionHeader className="mb-8">
              <h2 className="text-3xl font-bold text-neutral-900">Step 1: Select Document Type</h2>
              <p className="text-lg text-neutral-600">Choose the type of document you want to validate</p>
            </SectionHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(DOCUMENT_TYPES).map(([key, doc]) => {
                const Icon = doc.icon;
                const isSelected = selectedDocument === key;

                return (
                  <motion.div
                    key={key}
                    whileHover={{ y: -4 }}
                    onClick={() => setSelectedDocument(key as keyof typeof DOCUMENT_TYPES)}
                    className={`
                      cursor-pointer rounded-3xl p-6 transition-all duration-300
                      ${
                        isSelected
                          ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-2xl scale-105'
                          : 'bg-white hover:shadow-xl border-2 border-neutral-200 hover:border-blue-300'
                      }
                    `}
                  >
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${
                        isSelected ? 'bg-white/20' : 'bg-gradient-to-br from-blue-400 to-purple-500'
                      }`}
                    >
                      <Icon className={`w-7 h-7 ${isSelected ? 'text-white' : 'text-white'}`} />
                    </div>

                    <h3 className={`text-xl font-bold mb-2 ${isSelected ? 'text-white' : 'text-neutral-900'}`}>
                      {doc.name}
                    </h3>

                    <p className={`text-sm mb-4 ${isSelected ? 'text-blue-100' : 'text-neutral-600'}`}>
                      {doc.description}
                    </p>

                    <div className="flex items-baseline gap-2 mb-2">
                      <span className={`text-2xl font-bold ${isSelected ? 'text-white' : 'text-neutral-900'}`}>
                        AED {doc.price}
                      </span>
                      <span className={`text-sm ${isSelected ? 'text-blue-200' : 'text-neutral-500'}`}>
                        per validation
                      </span>
                    </div>

                    <div className={`text-sm ${isSelected ? 'text-blue-200' : 'text-neutral-500'}`}>
                      {doc.processingTime}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Step 2: Upload Document */}
          {selectedDocument && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-12"
            >
              <SectionHeader className="mb-8">
                <h2 className="text-3xl font-bold text-neutral-900">Step 2: Upload Document</h2>
                <p className="text-lg text-neutral-600">
                  Upload a clear scan or photo of your {DOCUMENT_TYPES[selectedDocument].name.toLowerCase()}
                </p>
              </SectionHeader>

              <Card className="max-w-3xl mx-auto">
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={`
                    border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300
                    ${
                      dragActive
                        ? 'border-blue-500 bg-blue-50'
                        : uploadedFile
                        ? 'border-green-500 bg-green-50'
                        : 'border-neutral-300 hover:border-blue-400 hover:bg-neutral-50'
                    }
                  `}
                >
                  {uploadedFile ? (
                    <div className="space-y-4">
                      <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
                      <div>
                        <p className="text-lg font-semibold text-neutral-900">{uploadedFile.name}</p>
                        <p className="text-sm text-neutral-600">
                          {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => setUploadedFile(null)}
                        className="mx-auto"
                      >
                        Change File
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Upload className="w-16 h-16 text-neutral-400 mx-auto" />
                      <div>
                        <p className="text-lg font-semibold text-neutral-900 mb-2">
                          Drag and drop your document here
                        </p>
                        <p className="text-sm text-neutral-600 mb-4">
                          or click to browse (PDF, JPG, PNG - Max 10MB)
                        </p>
                      </div>
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <Button variant="gradient" className="mx-auto">
                          Browse Files
                        </Button>
                      </label>
                    </div>
                  )}
                </div>

                {/* Requirements Checklist */}
                <div className="mt-8 p-6 bg-blue-50 rounded-2xl">
                  <h4 className="font-bold text-neutral-900 mb-4 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-blue-600" />
                    What We Check For:
                  </h4>
                  <ul className="space-y-2">
                    {DOCUMENT_TYPES[selectedDocument].requirements.map((req, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-neutral-700">
                        <CheckCircle2 className="w-4 h-4 text-blue-600" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Step 3: Validate & Pay */}
          {selectedDocument && uploadedFile && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-3xl mx-auto"
            >
              <Card className="bg-gradient-to-br from-blue-50 to-purple-50">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-neutral-900 mb-4">Ready to Validate?</h3>
                  <p className="text-neutral-600 mb-6">
                    We'll analyze your document and generate a comprehensive validation report
                  </p>

                  <div className="flex items-baseline justify-center gap-2 mb-6">
                    <span className="text-4xl font-bold text-neutral-900">
                      AED {DOCUMENT_TYPES[selectedDocument].price}
                    </span>
                    <span className="text-neutral-600">one-time payment</span>
                  </div>

                  <Button
                    variant="gradient"
                    size="xl"
                    onClick={handleValidate}
                    disabled={loading}
                    className="shadow-2xl shadow-blue-500/50"
                  >
                    {loading ? 'Processing...' : 'Proceed to Payment'}
                  </Button>

                  <p className="text-sm text-neutral-500 mt-4">
                    Powered by AI • Secure Payment via Stripe • Instant PDF Report
                  </p>
                </div>
              </Card>
            </motion.div>
          )}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeader className="text-center mb-16">
            <h2 className="text-4xl font-bold text-neutral-900 mb-4">How It Works</h2>
            <p className="text-lg text-neutral-600">Simple, fast, and accurate document validation</p>
          </SectionHeader>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold text-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                1
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-2">Upload Document</h3>
              <p className="text-neutral-600">
                Select document type and upload a clear scan or photo
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 text-white font-bold text-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                2
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-2">AI Analysis</h3>
              <p className="text-neutral-600">
                Our AI checks stamps, signatures, format, and compliance
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-green-600 text-white font-bold text-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                3
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-2">Get Report</h3>
              <p className="text-neutral-600">
                Download comprehensive PDF report with validation results
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
