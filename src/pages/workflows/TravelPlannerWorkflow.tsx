import React, { useEffect, useState } from 'react';
import {
  Plane,
  Building,
  MapPin,
  Calendar,
  DollarSign,
  Download,
  MessageCircle,
  RefreshCw,
  Sparkles,
  Shield,
  Info,
  Users,
  Settings2,
} from 'lucide-react';
import { useJeffrey } from '../../contexts/JeffreyContext';
import { Breadcrumb, BreadcrumbItem } from '../../components/ui/Breadcrumb';
import { onboardingApi } from '../../lib/api';
import { generateTravelPlan, ItineraryProvider, NormalizedItinerary } from '../../lib/travelPlanner';

const SPECIAL_CONCERNS_PRESETS = [
  'First-time visa applicant',
  'Previous visa rejection',
  'Tight deadline/urgent',
  'Multiple destinations',
  'Traveling with family',
];

export const TravelPlannerWorkflow: React.FC = () => {
  const { updateWorkflow, addRecentAction, askJeffrey } = useJeffrey();
  const defaultProvider =
    (import.meta.env.VITE_DEFAULT_ITINERARY_PROVIDER as ItineraryProvider) === 'perplexity'
      ? 'perplexity'
      : 'gemini';

  const [currentStep, setCurrentStep] = useState(1);
  const [destination, setDestination] = useState('');
  const [countriesInput, setCountriesInput] = useState('');
  const [travelDates, setTravelDates] = useState({ start: '', end: '' });
  const [tripPurpose, setTripPurpose] = useState('');
  const [budget, setBudget] = useState('');
  const [departureCity, setDepartureCity] = useState('Dubai, UAE');
  const [travelerCount, setTravelerCount] = useState('1');
  const [accommodation, setAccommodation] = useState('4-star / business');
  const [pace, setPace] = useState('Balanced');
  const [interests, setInterests] = useState('');
  const [planningNotes, setPlanningNotes] = useState('');
  const [nationality, setNationality] = useState('');
  const [specialConcerns, setSpecialConcerns] = useState<string[]>([]);
  const [provider, setProvider] = useState<ItineraryProvider>(defaultProvider);
  const [prefilledFromOnboarding, setPrefilledFromOnboarding] = useState(false);
  const [providerNote, setProviderNote] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedItinerary, setGeneratedItinerary] = useState<NormalizedItinerary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    updateWorkflow('travel');
    addRecentAction('Entered Travel Planner workflow');
    loadTravelData();
  }, [updateWorkflow, addRecentAction]);

  const loadTravelData = async () => {
    setIsLoading(true);
    try {
      const response = await onboardingApi.getStatus();

      if (response.success && response.data?.travelProfile) {
        const {
          destinationCountry,
          travelPurpose,
          travelDates: dates,
          nationality: onboardingNationality,
          specialConcerns: onboardingConcerns,
        } = response.data.travelProfile;

        setDestination((prev) => prev || destinationCountry);
        setTripPurpose((prev) => prev || travelPurpose);
        setTravelDates({
          start: dates.start,
          end: dates.end,
        });
        setNationality(onboardingNationality);
        setSpecialConcerns(onboardingConcerns || []);
        setPrefilledFromOnboarding(true);

        addRecentAction('Pre-filled travel information from profile');
      }
    } catch (error) {
      console.error('Failed to load travel data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateItinerary = async () => {
    setIsGenerating(true);
    setProviderNote(null);
    addRecentAction('Generating travel itinerary', { destination, provider });

    const parsedCountries = countriesInput
      .split(',')
      .map((country) => country.trim())
      .filter(Boolean);
    const parsedInterests = interests
      .split(',')
      .map((interest) => interest.trim())
      .filter(Boolean);
    const travelers = Number.parseInt(travelerCount, 10);

    try {
      const itinerary = await generateTravelPlan(
        {
          destination,
          dates: travelDates,
          purpose: tripPurpose,
          budget,
          countries: parsedCountries,
          nationality,
          specialConcerns,
          departureCity,
          travelers: Number.isNaN(travelers) ? undefined : travelers,
          preferences: {
            accommodation,
            pace,
            interests: parsedInterests.length ? parsedInterests : undefined,
            notes: planningNotes || undefined,
          },
        },
        { provider }
      );

      setGeneratedItinerary(itinerary);
      setCurrentStep(2);
      addRecentAction('Generated itinerary successfully', { provider: itinerary.provider });

      if (provider === 'perplexity' && itinerary.provider !== 'perplexity') {
        setProviderNote('Perplexity was unavailable, so we used Gemini for this draft.');
      }
    } catch (error) {
      console.error('Failed to generate itinerary:', error);
      const message = error instanceof Error ? error.message : 'We could not generate an itinerary. Please try again or adjust your inputs.';
      setProviderNote(message);
    } finally {
      setIsGenerating(false);
    }
  };

  const tripDuration =
    travelDates.start && travelDates.end
      ? Math.ceil((new Date(travelDates.end).getTime() - new Date(travelDates.start).getTime()) / 86400000)
      : 0;

  const estimatedCost = generatedItinerary
    ? generatedItinerary.flights.reduce((s, f) => s + (f.price || 0), 0) +
      generatedItinerary.hotels.reduce((s, h) => s + (h.price || 0), 0)
    : 0;

  const readyToGenerate = Boolean(destination && travelDates.start && travelDates.end && tripPurpose) && !isGenerating;

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-neutral-600">Loading your travel information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <Breadcrumb>
        <BreadcrumbItem href="/app">Dashboard</BreadcrumbItem>
        <BreadcrumbItem active>AI Travel Planner</BreadcrumbItem>
      </Breadcrumb>

      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">AI Travel Planner</h1>
        <p className="text-xl text-neutral-600">Generate a visa-ready travel itinerary with flights, hotels, and activities</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-neutral-200">
          {currentStep === 1 && (
            <div>
              <h3 className="text-2xl font-bold mb-6">Trip Details</h3>

              {prefilledFromOnboarding && (
                <div className="flex items-start gap-3 p-4 mb-6 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-900">
                  <Info className="w-5 h-5 mt-1" />
                  <div>
                    <p className="font-semibold">Pulled from Jeffrey&apos;s onboarding</p>
                    <p className="text-sm mt-1">Destination, dates, and nationality were pre-filled. Update anything that changed and regenerate.</p>
                  </div>
                </div>
              )}

              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">Destination Country</label>
                    <input
                      type="text"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      placeholder="e.g., France, UAE, Schengen"
                      className="w-full px-4 py-3 rounded-lg border border-neutral-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">Cities/Regions to Cover (optional)</label>
                    <input
                      type="text"
                      value={countriesInput}
                      onChange={(e) => setCountriesInput(e.target.value)}
                      placeholder="Paris, Lyon, Nice"
                      className="w-full px-4 py-3 rounded-lg border border-neutral-300"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">Start Date</label>
                    <input
                      type="date"
                      value={travelDates.start}
                      onChange={(e) => setTravelDates({ ...travelDates, start: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-neutral-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">End Date</label>
                    <input
                      type="date"
                      value={travelDates.end}
                      onChange={(e) => setTravelDates({ ...travelDates, end: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-neutral-300"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">Trip Purpose</label>
                    <select
                      value={tripPurpose}
                      onChange={(e) => setTripPurpose(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-neutral-300"
                    >
                      <option value="">Select purpose</option>
                      <option value="Tourism">Tourism</option>
                      <option value="Business">Business</option>
                      <option value="Visit Family">Visit Family</option>
                      <option value="Medical">Medical</option>
                      <option value="Study">Study</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">Budget (per trip, optional)</label>
                    <input
                      type="number"
                      placeholder="e.g., 5000"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-neutral-300"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">Departure City / Airport</label>
                    <input
                      type="text"
                      value={departureCity}
                      onChange={(e) => setDepartureCity(e.target.value)}
                      placeholder="e.g., Dubai (DXB)"
                      className="w-full px-4 py-3 rounded-lg border border-neutral-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">Travelers</label>
                    <input
                      type="number"
                      min={1}
                      value={travelerCount}
                      onChange={(e) => setTravelerCount(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-neutral-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">Nationality</label>
                    <input
                      type="text"
                      value={nationality}
                      onChange={(e) => setNationality(e.target.value)}
                      placeholder="e.g., Jordanian"
                      className="w-full px-4 py-3 rounded-lg border border-neutral-300"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">Accommodation Preference</label>
                    <select
                      value={accommodation}
                      onChange={(e) => setAccommodation(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-neutral-300"
                    >
                      <option value="3-star / budget">3-star / budget</option>
                      <option value="4-star / business">4-star / business</option>
                      <option value="5-star / premium">5-star / premium</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">Pace</label>
                    <select
                      value={pace}
                      onChange={(e) => setPace(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-neutral-300"
                    >
                      <option value="Relaxed">Relaxed</option>
                      <option value="Balanced">Balanced</option>
                      <option value="Packed">Packed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">Preferred Interests</label>
                    <input
                      type="text"
                      value={interests}
                      onChange={(e) => setInterests(e.target.value)}
                      placeholder="Museums, food tours, kid-friendly"
                      className="w-full px-4 py-3 rounded-lg border border-neutral-300"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">Special Considerations</label>
                    <input
                      type="text"
                      value={specialConcerns.join(', ')}
                      onChange={(e) =>
                        setSpecialConcerns(
                          e.target.value
                            .split(',')
                            .map((value) => value.trim())
                            .filter(Boolean)
                        )
                      }
                      placeholder="Previous visa rejection, family travel, urgent timeline"
                      className="w-full px-4 py-3 rounded-lg border border-neutral-300"
                    />
                    <div className="flex flex-wrap gap-2 mt-2">
                      {SPECIAL_CONCERNS_PRESETS.map((preset) => (
                        <button
                          key={preset}
                          onClick={() =>
                            setSpecialConcerns((prev) =>
                              prev.includes(preset) ? prev : [...prev, preset]
                            )
                          }
                          type="button"
                          className="px-3 py-1 text-xs rounded-full border border-neutral-200 hover:border-indigo-300 hover:text-indigo-700 transition-colors"
                        >
                          + {preset}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">Planning Notes (optional)</label>
                    <textarea
                      value={planningNotes}
                      onChange={(e) => setPlanningNotes(e.target.value)}
                      placeholder="Anything else Jeffrey should consider? (e.g., need embassies nearby, child-friendly evenings...)"
                      rows={3}
                      className="w-full px-4 py-3 rounded-lg border border-neutral-300"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">Itinerary Provider</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setProvider('gemini')}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        provider === 'gemini'
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-semibold">
                        <Sparkles className="w-4 h-4" />
                        Gemini (fast draft)
                      </div>
                      <p className="text-sm text-neutral-600 mt-1">Runs in the browser, great for quick iterations.</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setProvider('perplexity')}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        provider === 'perplexity'
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-semibold">
                        <Settings2 className="w-4 h-4" />
                        Perplexity (visa-focused)
                      </div>
                      <p className="text-sm text-neutral-600 mt-1">Uses server-side real-world data for embassy-ready plans.</p>
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleGenerateItinerary}
                  disabled={!readyToGenerate}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:shadow-lg disabled:opacity-50 transition-all"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Generate AI Itinerary
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold">Your Travel Itinerary</h3>
                  {providerNote && <p className="text-sm text-amber-700 mt-1">{providerNote}</p>}
                </div>
                {generatedItinerary ? (
                  <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full font-semibold flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Visa-ready draft
                  </span>
                ) : (
                  <span className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full font-semibold">Pending Generation</span>
                )}
              </div>

              {!generatedItinerary ? (
                <div className="text-center py-12 border-2 border-dashed border-neutral-200 rounded-xl">
                  <Plane className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-neutral-700 mb-2">No Itinerary Generated Yet</h4>
                  <p className="text-neutral-500 mb-4">
                    Your travel itinerary will appear here once it's generated by our AI.
                  </p>
                  <button
                    onClick={() => askJeffrey('What makes a good visa-ready travel itinerary?')}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Ask Jeffrey About Itineraries
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-800">
                      Provider: {generatedItinerary.provider === 'perplexity' ? 'Perplexity (server)' : generatedItinerary.provider === 'gemini' ? 'Gemini' : 'Gemini mock'}
                    </span>
                    {generatedItinerary.notes && (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                        {generatedItinerary.notes}
                      </span>
                    )}
                  </div>

                  {generatedItinerary.dailyPlan?.length ? (
                    <div>
                      <h4 className="text-lg font-semibold flex items-center gap-2 mb-4">
                        <MapPin className="w-5 h-5 text-indigo-600" />
                        Daily Plan
                      </h4>
                      <div className="grid md:grid-cols-2 gap-3">
                        {generatedItinerary.dailyPlan.map((dayPlan) => (
                          <div key={dayPlan.day} className="p-4 bg-neutral-50 rounded-xl border">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-xs font-semibold text-indigo-600">Day {dayPlan.day}</p>
                              <p className="text-xs text-neutral-500">{dayPlan.date}</p>
                            </div>
                            <p className="font-semibold text-neutral-900">
                              {dayPlan.city || 'City TBD'} {dayPlan.country ? `• ${dayPlan.country}` : ''}
                            </p>
                            <ul className="mt-3 space-y-2">
                              {dayPlan.activities.map((activity, index) => (
                                <li key={`${dayPlan.day}-${index}`} className="text-sm text-neutral-700">
                                  <span className="text-neutral-500">{activity.time || 'Time TBD'} • </span>
                                  <span className="font-semibold">{activity.name}</span>
                                  {activity.location ? ` — ${activity.location}` : ''}
                                  {activity.description ? ` (${activity.description})` : ''}
                                </li>
                              ))}
                            </ul>
                            {dayPlan.accommodation && (
                              <p className="text-xs text-neutral-600 mt-3">Hotel: {dayPlan.accommodation}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  <div>
                    <h4 className="text-lg font-semibold flex items-center gap-2 mb-4"><Plane className="w-5 h-5 text-indigo-600" />Flights</h4>
                    <div className="space-y-3">
                      {generatedItinerary.flights.map((flight) => (
                        <div key={flight.id} className="p-4 bg-neutral-50 rounded-xl border">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-semibold">{flight.airline}</p>
                              <p className="text-sm text-neutral-600">{flight.departure} → {flight.arrival}</p>
                            </div>
                            <p className="font-bold text-indigo-600">${flight.price}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold flex items-center gap-2 mb-4"><Building className="w-5 h-5 text-indigo-600" />Accommodation</h4>
                    {generatedItinerary.hotels.map((hotel) => (
                      <div key={hotel.id} className="p-4 bg-neutral-50 rounded-xl border">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-semibold">{hotel.name}</p>
                            <p className="text-sm text-neutral-600">{hotel.location} • {hotel.nights} nights</p>
                          </div>
                          <p className="font-bold text-indigo-600">${hotel.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold flex items-center gap-2 mb-4"><Users className="w-5 h-5 text-indigo-600" />Activities</h4>
                    <div className="space-y-3">
                      {generatedItinerary.activities.map((activity) => (
                        <div key={activity.id} className="p-4 bg-neutral-50 rounded-xl border">
                          <p className="text-xs font-semibold text-indigo-600 mb-1">Day {activity.day}</p>
                          <p className="font-semibold">{activity.name}</p>
                          <p className="text-sm text-neutral-600">{activity.description}</p>
                          {activity.time && <p className="text-xs text-neutral-500 mt-1">{activity.time} {activity.location ? `• ${activity.location}` : ''}</p>}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold flex items-center gap-2 mb-4"><Shield className="w-5 h-5 text-indigo-600" />Travel Insurance</h4>
                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                      <p className="font-semibold text-blue-900">Recommended: Comprehensive Coverage</p>
                      <p className="text-sm text-blue-700 mt-1">Medical coverage up to $100,000 • Trip cancellation • Lost baggage</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-2xl border border-neutral-200">
          <h3 className="text-lg font-bold mb-4">Trip Summary</h3>
          {generatedItinerary ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
                <MapPin className="w-5 h-5 text-indigo-600" />
                <div><p className="text-xs text-neutral-500">Destination</p><p className="font-semibold">{destination}</p></div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
                <Calendar className="w-5 h-5 text-indigo-600" />
                <div><p className="text-xs text-neutral-500">Duration</p><p className="font-semibold">{tripDuration} days</p></div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
                <DollarSign className="w-5 h-5 text-indigo-600" />
                <div><p className="text-xs text-neutral-500">Est. Total Cost</p><p className="font-semibold">${estimatedCost}</p></div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
                <Users className="w-5 h-5 text-indigo-600" />
                <div><p className="text-xs text-neutral-500">Travelers</p><p className="font-semibold">{travelerCount}</p></div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
                <Shield className="w-5 h-5 text-indigo-600" />
                <div><p className="text-xs text-neutral-500">Special concerns</p><p className="font-semibold">{specialConcerns.length ? specialConcerns.join(', ') : 'None'}</p></div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
                <Plane className="w-5 h-5 text-indigo-600" />
                <div><p className="text-xs text-neutral-500">Flights</p><p className="font-semibold">{generatedItinerary.flights.length} bookings</p></div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
                <Building className="w-5 h-5 text-indigo-600" />
                <div><p className="text-xs text-neutral-500">Hotels</p><p className="font-semibold">{generatedItinerary.hotels.reduce((s, h) => s + h.nights, 0)} nights</p></div>
              </div>

              <div className="mt-6 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">J</div>
                  <div>
                    <p className="text-xs font-semibold text-neutral-500">Jeffrey's Travel Tips</p>
                    <ul className="text-sm text-neutral-700 mt-2 space-y-1">
                      <li>• Book flights 2-3 months in advance</li>
                      <li>• Consider travel insurance</li>
                      <li>• Keep copies of all bookings</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-neutral-500 text-sm">Fill in your trip details to see the summary</p>
          )}
        </div>
      </div>

      {currentStep === 2 && (
        <div className="flex items-center gap-4 mt-8">
          <button
            onClick={() => addRecentAction('Downloaded itinerary PDF')}
            disabled={!generatedItinerary}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Download className="w-5 h-5" />Download PDF Itinerary
          </button>
          <button onClick={() => askJeffrey('Review my itinerary')} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold border border-neutral-300 text-neutral-700 hover:bg-neutral-50 transition-all">
            <MessageCircle className="w-5 h-5" />Ask Jeffrey to Review
          </button>
          <button onClick={() => setCurrentStep(1)} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold border border-neutral-300 text-neutral-700 hover:bg-neutral-50 transition-all">
            <RefreshCw className="w-5 h-5" />Regenerate
          </button>
        </div>
      )}
    </div>
  );
};
