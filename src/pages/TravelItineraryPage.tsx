import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plane, Hotel, MapPin, Calendar, DollarSign, Clock, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import Button from '../components/gamma/Button';
import Card from '../components/gamma/Card';
import Badge from '../components/gamma/Badge';
import SectionHeader from '../components/gamma/SectionHeader';

const DESTINATIONS = {
  schengen: {
    id: 'schengen',
    name: 'Schengen Zone (Europe)',
    flag: '🇪🇺',
    description: 'Multi-country European travel itinerary',
    requiresItinerary: true,
    price: 125,
    processingTime: '10-15 minutes',
    popularCountries: ['France', 'Italy', 'Spain', 'Germany', 'Greece', 'Switzerland'],
  },
  uk: {
    id: 'uk',
    name: 'United Kingdom',
    flag: '🇬🇧',
    description: 'UK tourist visa travel itinerary',
    requiresItinerary: true,
    price: 100,
    processingTime: '10-15 minutes',
    popularCountries: ['England', 'Scotland', 'Wales', 'Northern Ireland'],
  },
  us: {
    id: 'us',
    name: 'United States',
    flag: '🇺🇸',
    description: 'US tourist visa travel itinerary',
    requiresItinerary: false,
    price: 100,
    processingTime: '10-15 minutes',
    popularCountries: ['New York', 'California', 'Florida', 'Texas'],
  },
  canada: {
    id: 'canada',
    name: 'Canada',
    flag: '🇨🇦',
    description: 'Canadian tourist visa itinerary',
    requiresItinerary: false,
    price: 100,
    processingTime: '10-15 minutes',
    popularCountries: ['Ontario', 'Quebec', 'British Columbia', 'Alberta'],
  },
};

const TRAVEL_PURPOSES = [
  { value: 'tourism', label: 'Tourism & Sightseeing', icon: '🏛️' },
  { value: 'business', label: 'Business Meetings', icon: '💼' },
  { value: 'family_visit', label: 'Family Visit', icon: '👨‍👩‍👧‍👦' },
  { value: 'conference', label: 'Conference/Event', icon: '🎤' },
];

const BUDGET_LEVELS = [
  { value: 'low', label: 'Budget', description: '3-star hotels, public transport', icon: '💰' },
  { value: 'medium', label: 'Moderate', description: '4-star hotels, mixed transport', icon: '💰💰' },
  { value: 'high', label: 'Premium', description: '5-star hotels, private transport', icon: '💰💰💰' },
];

export default function TravelItineraryPage() {
  const [selectedDestination, setSelectedDestination] = useState<keyof typeof DESTINATIONS | null>(null);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [duration, setDuration] = useState(7);
  const [travelPurpose, setTravelPurpose] = useState('tourism');
  const [budget, setBudget] = useState('medium');
  const [startDate, setStartDate] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCountryToggle = (country: string) => {
    if (selectedCountries.includes(country)) {
      setSelectedCountries(selectedCountries.filter((c) => c !== country));
    } else {
      setSelectedCountries([...selectedCountries, country]);
    }
  };

  const handleGenerate = async () => {
    if (!selectedDestination || !startDate) return;

    setLoading(true);
    // TODO: Implement API call to generate itinerary
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };

  const canProceed = selectedDestination && startDate && duration > 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-neutral-50">
      {/* Hero Section */}
      <section className="py-12 md:py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <Badge variant="gradient" className="mb-4 inline-flex">
              <Plane className="w-4 h-4 mr-2" />
              AI-Generated Itineraries
            </Badge>

            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-600 bg-clip-text text-transparent">
              Travel Itinerary Generator
            </h1>

            <p className="text-xl md:text-2xl text-neutral-600 max-w-3xl mx-auto mb-8">
              Generates compliant, detailed, and verifiable travel itinerary that aligns with your stated purpose and
              duration. Perfect for Schengen and tourist visas.
            </p>

            {/* Stats */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-neutral-600 mb-8">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-500" />
                <span className="text-sm font-medium">
                  <strong className="text-neutral-900">10-15 minutes</strong> processing
                </span>
              </div>
              <div className="hidden sm:block w-px h-6 bg-neutral-300" />
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium">
                  <strong className="text-neutral-900">AED 100-125</strong> per itinerary
                </span>
              </div>
              <div className="hidden sm:block w-px h-6 bg-neutral-300" />
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-500" />
                <span className="text-sm font-medium">
                  <strong className="text-neutral-900">Realistic & Verifiable</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Step 1: Select Destination */}
          <div className="mb-12">
            <SectionHeader className="mb-8">
              <h2 className="text-3xl font-bold text-neutral-900">Step 1: Select Destination</h2>
              <p className="text-lg text-neutral-600">Choose where you're planning to travel</p>
            </SectionHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Object.entries(DESTINATIONS).map(([key, dest]) => {
                const isSelected = selectedDestination === key;

                return (
                  <motion.div
                    key={key}
                    whileHover={{ y: -4 }}
                    onClick={() => {
                      setSelectedDestination(key as keyof typeof DESTINATIONS);
                      setSelectedCountries([]);
                    }}
                    className={`
                      cursor-pointer rounded-3xl p-6 transition-all duration-300
                      ${
                        isSelected
                          ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-2xl scale-105'
                          : 'bg-white hover:shadow-xl border-2 border-neutral-200 hover:border-amber-300'
                      }
                    `}
                  >
                    <div className="text-5xl mb-4">{dest.flag}</div>

                    <h3 className={`text-xl font-bold mb-2 ${isSelected ? 'text-white' : 'text-neutral-900'}`}>
                      {dest.name}
                    </h3>

                    <p className={`text-sm mb-4 ${isSelected ? 'text-orange-100' : 'text-neutral-600'}`}>
                      {dest.description}
                    </p>

                    <div className="flex items-baseline gap-2 mb-2">
                      <span className={`text-2xl font-bold ${isSelected ? 'text-white' : 'text-neutral-900'}`}>
                        AED {dest.price}
                      </span>
                    </div>

                    <div className={`text-sm ${isSelected ? 'text-orange-200' : 'text-neutral-500'}`}>
                      {dest.processingTime}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Step 2: Trip Details */}
          {selectedDestination && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-12"
            >
              <SectionHeader className="mb-8">
                <h2 className="text-3xl font-bold text-neutral-900">Step 2: Trip Details</h2>
                <p className="text-lg text-neutral-600">Provide your travel information</p>
              </SectionHeader>

              <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
                {/* Countries (for multi-country destinations) */}
                {DESTINATIONS[selectedDestination].popularCountries && (
                  <Card className="md:col-span-2">
                    <h3 className="text-xl font-bold text-neutral-900 mb-4 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-amber-500" />
                      Select Countries to Visit
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {DESTINATIONS[selectedDestination].popularCountries!.map((country) => (
                        <button
                          key={country}
                          onClick={() => handleCountryToggle(country)}
                          className={`
                            p-4 rounded-xl border-2 transition-all duration-300 text-left
                            ${
                              selectedCountries.includes(country)
                                ? 'border-amber-500 bg-amber-50 text-amber-900'
                                : 'border-neutral-200 hover:border-amber-300 text-neutral-700'
                            }
                          `}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold">{country}</span>
                            {selectedCountries.includes(country) && (
                              <CheckCircle2 className="w-5 h-5 text-amber-600" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Duration */}
                <Card>
                  <h3 className="text-xl font-bold text-neutral-900 mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-500" />
                    Trip Duration
                  </h3>
                  <input
                    type="number"
                    min="1"
                    max="90"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value) || 1)}
                    className="w-full p-3 border-2 border-neutral-200 rounded-xl focus:border-blue-500 focus:outline-none text-lg font-semibold"
                  />
                  <p className="text-sm text-neutral-600 mt-2">{duration} days / {duration - 1} nights</p>
                </Card>

                {/* Start Date */}
                <Card>
                  <h3 className="text-xl font-bold text-neutral-900 mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-green-500" />
                    Start Date
                  </h3>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full p-3 border-2 border-neutral-200 rounded-xl focus:border-green-500 focus:outline-none text-lg"
                  />
                  <p className="text-sm text-neutral-600 mt-2">
                    {startDate && `Ends: ${new Date(new Date(startDate).getTime() + duration * 24 * 60 * 60 * 1000).toLocaleDateString()}`}
                  </p>
                </Card>

                {/* Travel Purpose */}
                <Card className="md:col-span-2">
                  <h3 className="text-xl font-bold text-neutral-900 mb-4">Travel Purpose</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {TRAVEL_PURPOSES.map((purpose) => (
                      <button
                        key={purpose.value}
                        onClick={() => setTravelPurpose(purpose.value)}
                        className={`
                          p-4 rounded-xl border-2 transition-all duration-300
                          ${
                            travelPurpose === purpose.value
                              ? 'border-purple-500 bg-purple-50 text-purple-900'
                              : 'border-neutral-200 hover:border-purple-300 text-neutral-700'
                          }
                        `}
                      >
                        <div className="text-3xl mb-2">{purpose.icon}</div>
                        <div className="font-semibold text-sm">{purpose.label}</div>
                      </button>
                    ))}
                  </div>
                </Card>

                {/* Budget Level */}
                <Card className="md:col-span-2">
                  <h3 className="text-xl font-bold text-neutral-900 mb-4">Budget Level</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {BUDGET_LEVELS.map((level) => (
                      <button
                        key={level.value}
                        onClick={() => setBudget(level.value)}
                        className={`
                          p-6 rounded-xl border-2 transition-all duration-300 text-left
                          ${
                            budget === level.value
                              ? 'border-green-500 bg-green-50'
                              : 'border-neutral-200 hover:border-green-300'
                          }
                        `}
                      >
                        <div className="text-2xl mb-2">{level.icon}</div>
                        <div className={`font-bold mb-1 ${budget === level.value ? 'text-green-900' : 'text-neutral-900'}`}>
                          {level.label}
                        </div>
                        <div className="text-sm text-neutral-600">{level.description}</div>
                      </button>
                    ))}
                  </div>
                </Card>
              </div>
            </motion.div>
          )}

          {/* Step 3: Generate & Pay */}
          {canProceed && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-3xl mx-auto"
            >
              <Card className="bg-gradient-to-br from-amber-50 to-orange-50">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-neutral-900 mb-4">Ready to Generate Your Itinerary?</h3>
                  <p className="text-neutral-600 mb-6">
                    We'll create a detailed, realistic travel plan with flights, hotels, and daily activities
                  </p>

                  {/* Summary */}
                  <div className="bg-white rounded-2xl p-6 mb-6 text-left">
                    <h4 className="font-bold text-neutral-900 mb-4">Trip Summary:</h4>
                    <div className="space-y-2 text-neutral-700">
                      <p>📍 <strong>Destination:</strong> {DESTINATIONS[selectedDestination].name}</p>
                      {selectedCountries.length > 0 && (
                        <p>🌍 <strong>Countries:</strong> {selectedCountries.join(', ')}</p>
                      )}
                      <p>📅 <strong>Duration:</strong> {duration} days ({startDate} onwards)</p>
                      <p>🎯 <strong>Purpose:</strong> {TRAVEL_PURPOSES.find(p => p.value === travelPurpose)?.label}</p>
                      <p>💰 <strong>Budget:</strong> {BUDGET_LEVELS.find(b => b.value === budget)?.label}</p>
                    </div>
                  </div>

                  <div className="flex items-baseline justify-center gap-2 mb-6">
                    <span className="text-4xl font-bold text-neutral-900">
                      AED {DESTINATIONS[selectedDestination].price}
                    </span>
                    <span className="text-neutral-600">one-time payment</span>
                  </div>

                  <Button
                    variant="gradient"
                    size="xl"
                    onClick={handleGenerate}
                    disabled={loading}
                    className="shadow-2xl shadow-amber-500/50 group"
                  >
                    {loading ? 'Generating Itinerary...' : 'Proceed to Payment'}
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>

                  <p className="text-sm text-neutral-500 mt-4">
                    Powered by AI • Secure Payment via Stripe • Downloadable PDF Itinerary
                  </p>
                </div>
              </Card>
            </motion.div>
          )}
        </div>
      </section>

      {/* What's Included Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeader className="text-center mb-16">
            <h2 className="text-4xl font-bold text-neutral-900 mb-4">What's Included</h2>
            <p className="text-lg text-neutral-600">Everything you need for a successful visa application</p>
          </SectionHeader>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mx-auto mb-4">
                <Plane className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900 mb-2">Flight Details</h3>
              <p className="text-neutral-600 text-sm">
                Realistic flight numbers, times, and routes
              </p>
            </Card>

            <Card className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center mx-auto mb-4">
                <Hotel className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900 mb-2">Hotel Bookings</h3>
              <p className="text-neutral-600 text-sm">
                Verified hotels with addresses and confirmation numbers
              </p>
            </Card>

            <Card className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900 mb-2">Daily Activities</h3>
              <p className="text-neutral-600 text-sm">
                Hour-by-hour plans with realistic locations
              </p>
            </Card>

            <Card className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900 mb-2">PDF Export</h3>
              <p className="text-neutral-600 text-sm">
                Professional PDF ready for visa submission
              </p>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
