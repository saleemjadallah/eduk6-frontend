import { generateItinerary as generateGeminiItinerary, GeneratedItinerary as GeminiItinerary } from './gemini';
import { travelItineraryApi } from './api';

export type ItineraryProvider = 'gemini' | 'perplexity';

export interface TravelPlanRequest {
  destination: string;
  dates: { start: string; end: string };
  purpose: string;
  budget?: string;
  countries?: string[];
  nationality?: string;
  specialConcerns?: string[];
  departureCity?: string;
  travelers?: number;
  preferences?: {
    accommodation?: string;
    pace?: string;
    interests?: string[];
    notes?: string;
  };
}

export interface NormalizedItineraryFlight {
  id: string;
  airline: string;
  departure: string;
  arrival: string;
  price: number;
}

export interface NormalizedItineraryHotel {
  id: string;
  name: string;
  location: string;
  nights: number;
  price: number;
}

export interface NormalizedItineraryActivity {
  id: string;
  day: number;
  name: string;
  description: string;
  time?: string;
  location?: string;
}

export interface NormalizedDailyPlan {
  day: number;
  date?: string;
  city?: string;
  country?: string;
  activities: Array<{
    time?: string;
    name: string;
    location?: string;
    description?: string;
  }>;
  accommodation?: string;
}

export interface NormalizedItinerary {
  provider: 'gemini' | 'perplexity' | 'mock';
  flights: NormalizedItineraryFlight[];
  hotels: NormalizedItineraryHotel[];
  activities: NormalizedItineraryActivity[];
  dailyPlan?: NormalizedDailyPlan[];
  notes?: string;
  raw?: unknown;
}

interface PerplexityPreviewResponse {
  itinerary: Array<{
    day: number;
    date: string;
    city: string;
    country: string;
    activities: Array<{
      time: string;
      activity: string;
      location: string;
      description: string;
    }>;
    accommodation: {
      name: string;
      address: string;
      checkIn: string;
      checkOut: string;
      confirmationNumber: string;
    };
    transportation: Array<{
      type: string;
      from: string;
      to: string;
      time: string;
      details: string;
    }>;
  }>;
  flightDetails?: {
    outbound?: {
      airline: string;
      flightNumber: string;
      departure: { airport: string; time: string; date: string };
      arrival: { airport: string; time: string; date: string };
    };
    return?: {
      airline: string;
      flightNumber: string;
      departure: { airport: string; time: string; date: string };
      arrival: { airport: string; time: string; date: string };
    };
  };
}

const normalizeGeminiItinerary = (
  itinerary: GeminiItinerary,
  request: TravelPlanRequest,
  usedProvider: NormalizedItinerary['provider']
): NormalizedItinerary => {
  const dayMap = new Map<number, NormalizedDailyPlan>();

  itinerary.activities?.forEach((activity) => {
    const existing = dayMap.get(activity.day) || {
      day: activity.day,
      activities: [],
    };

    existing.activities.push({
      name: activity.name,
      description: activity.description,
    });

    dayMap.set(activity.day, existing);
  });

  return {
    provider: usedProvider,
    flights: itinerary.flights || [],
    hotels: itinerary.hotels || [],
    activities: itinerary.activities || [],
    dailyPlan: Array.from(dayMap.values()).sort((a, b) => a.day - b.day),
    notes: request.specialConcerns?.length
      ? `Planned with concerns in mind: ${request.specialConcerns.join(', ')}`
      : undefined,
    raw: itinerary,
  };
};

const normalizePerplexityItinerary = (data: PerplexityPreviewResponse): NormalizedItinerary => {
  const hotelsMap = new Map<string, NormalizedItineraryHotel>();
  const activities: NormalizedItineraryActivity[] = [];

  const flights: NormalizedItineraryFlight[] = [];
  if (data.flightDetails?.outbound) {
    flights.push({
      id: 'outbound',
      airline: data.flightDetails.outbound.airline,
      departure: `${data.flightDetails.outbound.departure.airport} • ${data.flightDetails.outbound.departure.time} (${data.flightDetails.outbound.departure.date})`,
      arrival: `${data.flightDetails.outbound.arrival.airport} • ${data.flightDetails.outbound.arrival.time} (${data.flightDetails.outbound.arrival.date})`,
      price: 0,
    });
  }
  if (data.flightDetails?.return) {
    flights.push({
      id: 'return',
      airline: data.flightDetails.return.airline,
      departure: `${data.flightDetails.return.departure.airport} • ${data.flightDetails.return.departure.time} (${data.flightDetails.return.departure.date})`,
      arrival: `${data.flightDetails.return.arrival.airport} • ${data.flightDetails.return.arrival.time} (${data.flightDetails.return.arrival.date})`,
      price: 0,
    });
  }

  const dailyPlan: NormalizedDailyPlan[] =
    data.itinerary?.map((dayPlan) => {
      const accommodationName = dayPlan.accommodation?.name;
      if (accommodationName) {
        const existing = hotelsMap.get(accommodationName);
        hotelsMap.set(accommodationName, {
          id: accommodationName,
          name: accommodationName,
          location: dayPlan.accommodation.address || dayPlan.city,
          nights: (existing?.nights || 0) + 1,
          price: existing?.price || 0,
        });
      }

      dayPlan.activities?.forEach((activity, index) => {
        activities.push({
          id: `p-${dayPlan.day}-${index}`,
          day: dayPlan.day,
          name: activity.activity,
          description: activity.description,
          time: activity.time,
          location: activity.location,
        });
      });

      return {
        day: dayPlan.day,
        date: dayPlan.date,
        city: dayPlan.city,
        country: dayPlan.country,
        activities: dayPlan.activities?.map((activity) => ({
          name: activity.activity,
          description: activity.description,
          time: activity.time,
          location: activity.location,
        })) || [],
        accommodation: dayPlan.accommodation?.name,
      };
    }) || [];

  return {
    provider: 'perplexity',
    flights,
    hotels: Array.from(hotelsMap.values()),
    activities,
    dailyPlan,
    raw: data,
  };
};

export const generateTravelPlan = async (
  request: TravelPlanRequest,
  options?: { provider?: ItineraryProvider }
): Promise<NormalizedItinerary> => {
  const preferredProvider =
    options?.provider || (import.meta.env.VITE_DEFAULT_ITINERARY_PROVIDER as ItineraryProvider) || 'gemini';

  if (preferredProvider === 'perplexity') {
    try {
      const response = await travelItineraryApi.preview({
        destination: request.destination,
        startDate: request.dates.start,
        endDate: request.dates.end,
        travelPurpose: request.purpose,
        budget: request.budget,
        countries: request.countries,
      });

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Perplexity preview failed');
      }

      return normalizePerplexityItinerary(response.data as PerplexityPreviewResponse);
    } catch (error) {
      console.warn('[Travel Planner] Perplexity generation failed, falling back to Gemini', error);
    }
  }

  // Default to Gemini
  const itinerary = await generateGeminiItinerary({
    destination: request.destination,
    dates: request.dates,
    purpose: request.purpose,
    budget: request.budget,
    countries: request.countries,
    nationality: request.nationality,
    specialConcerns: request.specialConcerns,
    departureCity: request.departureCity,
    travelers: request.travelers,
    preferences: request.preferences,
  });

  const providerUsed: NormalizedItinerary['provider'] = import.meta.env.VITE_GEMINI_API_KEY ? 'gemini' : 'mock';
  const normalized = normalizeGeminiItinerary(itinerary, request, providerUsed);

  if (preferredProvider === 'perplexity' && normalized.provider !== 'perplexity') {
    normalized.notes = normalized.notes
      ? `${normalized.notes} • Perplexity unavailable, used Gemini fallback.`
      : 'Perplexity unavailable, used Gemini fallback.';
  }

  return normalized;
};
