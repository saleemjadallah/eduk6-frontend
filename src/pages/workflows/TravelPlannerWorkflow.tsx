import React, { useEffect, useState } from 'react';
import { Plane, Building, MapPin, Calendar, DollarSign, Download, MessageCircle, RefreshCw, Sparkles, Shield } from 'lucide-react';
import { useJeffrey } from '../../contexts/JeffreyContext';
import { Breadcrumb, BreadcrumbItem } from '../../components/ui/Breadcrumb';

interface Flight { id: string; airline: string; departure: string; arrival: string; price: number; }
interface Hotel { id: string; name: string; location: string; nights: number; price: number; }
interface Activity { id: string; day: number; name: string; description: string; }

export const TravelPlannerWorkflow: React.FC = () => {
  const { updateWorkflow, addRecentAction, askJeffrey } = useJeffrey();
  const [currentStep, setCurrentStep] = useState(1);
  const [destination, setDestination] = useState('');
  const [travelDates, setTravelDates] = useState({ start: '', end: '' });
  const [tripPurpose, setTripPurpose] = useState('');
  const [budget, setBudget] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedItinerary, setGeneratedItinerary] = useState<{
    flights: Flight[];
    hotels: Hotel[];
    activities: Activity[];
  } | null>(null);

  useEffect(() => {
    updateWorkflow('travel');
    addRecentAction('Entered Travel Planner workflow');
  }, [updateWorkflow, addRecentAction]);

  const handleGenerateItinerary = async () => {
    setIsGenerating(true);
    addRecentAction('Generating travel itinerary', { destination });

    try {
      // TODO: Call real API to generate itinerary based on user inputs
      // For now, simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // This would be replaced with actual API response
      // For now, just move to step 2 with empty state to show the structure
      setGeneratedItinerary(null);
      setCurrentStep(2);
    } catch (error) {
      console.error('Failed to generate itinerary:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const tripDuration = travelDates.start && travelDates.end ? Math.ceil((new Date(travelDates.end).getTime() - new Date(travelDates.start).getTime()) / 86400000) : 0;
  const estimatedCost = generatedItinerary ? generatedItinerary.flights.reduce((s, f) => s + f.price, 0) + generatedItinerary.hotels.reduce((s, h) => s + h.price, 0) : 0;

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
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">Destination Country</label>
                  <select value={destination} onChange={(e) => setDestination(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-neutral-300">
                    <option value="">Select destination</option>
                    <option value="UAE">United Arab Emirates</option>
                    <option value="Schengen">Schengen Area</option>
                    <option value="USA">United States</option>
                    <option value="UK">United Kingdom</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">Start Date</label>
                    <input type="date" value={travelDates.start} onChange={(e) => setTravelDates({ ...travelDates, start: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-neutral-300" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">End Date</label>
                    <input type="date" value={travelDates.end} onChange={(e) => setTravelDates({ ...travelDates, end: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-neutral-300" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">Trip Purpose</label>
                  <select value={tripPurpose} onChange={(e) => setTripPurpose(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-neutral-300">
                    <option value="">Select purpose</option>
                    <option value="Tourism">Tourism</option>
                    <option value="Business">Business</option>
                    <option value="Visit Family">Visit Family</option>
                    <option value="Medical">Medical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">Budget (Optional)</label>
                  <input type="number" placeholder="e.g., 5000" value={budget} onChange={(e) => setBudget(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-neutral-300" />
                </div>
                <button onClick={handleGenerateItinerary} disabled={!destination || !travelDates.start || !travelDates.end || isGenerating} className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:shadow-lg disabled:opacity-50 transition-all">
                  {isGenerating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />Generate AI Itinerary
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold">Your Travel Itinerary</h3>
                {generatedItinerary ? (
                  <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full font-semibold">Visa-Ready</span>
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
                    <h4 className="text-lg font-semibold flex items-center gap-2 mb-4"><MapPin className="w-5 h-5 text-indigo-600" />Activities</h4>
                    <div className="space-y-3">
                      {generatedItinerary.activities.map((activity) => (
                        <div key={activity.id} className="p-4 bg-neutral-50 rounded-xl border">
                          <p className="text-xs font-semibold text-indigo-600 mb-1">Day {activity.day}</p>
                          <p className="font-semibold">{activity.name}</p>
                          <p className="text-sm text-neutral-600">{activity.description}</p>
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
