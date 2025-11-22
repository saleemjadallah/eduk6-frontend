import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Google Generative AI client
// Note: In production, API calls should be proxied through the backend to secure the API key
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const DEFAULT_GEMINI_MODEL = (import.meta.env.VITE_GEMINI_MODEL as string)?.trim() || 'gemini-1.5-flash-latest';
const genAI = new GoogleGenerativeAI(API_KEY);

export interface ItineraryRequest {
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

export interface GeneratedItinerary {
    flights: Array<{
        id: string;
        airline: string;
        departure: string;
        arrival: string;
        price: number;
    }>;
    hotels: Array<{
        id: string;
        name: string;
        location: string;
        nights: number;
        price: number;
    }>;
    activities: Array<{
        id: string;
        day: number;
        name: string;
        description: string;
    }>;
}

export const generateItinerary = async (request: ItineraryRequest): Promise<GeneratedItinerary> => {
    if (!API_KEY) {
        console.warn('Gemini API key is missing. Using mock data.');
        return getMockItinerary(request);
    }

    try {
        const modelCandidates = [
            DEFAULT_GEMINI_MODEL,
            'gemini-1.5-pro-latest',
            'gemini-1.5-flash',
        ].filter(Boolean);

        const prompt = `
      You are an expert travel agent. Create a detailed travel itinerary for a trip to ${request.destination}.
      
      Trip Details:
      - Dates: ${request.dates.start} to ${request.dates.end}
      - Purpose: ${request.purpose}
      - Budget: ${request.budget ? `$${request.budget}` : 'Standard'}
      - Departure City: ${request.departureCity || 'Not specified'}
      - Traveler Count: ${request.travelers || 1}
      - Traveler Nationality: ${request.nationality || 'Not specified'}
      - Regions/Cities to cover: ${request.countries?.length ? request.countries.join(', ') : 'Main destination only'}
      - Visa/Travel Concerns: ${request.specialConcerns?.length ? request.specialConcerns.join(', ') : 'None specified'}
      - Accommodation Preference: ${request.preferences?.accommodation || 'Mix of 3-4 star, centrally located'}
      - Pace Preference: ${request.preferences?.pace || 'Balanced'}
      - Interests: ${request.preferences?.interests?.length ? request.preferences.interests.join(', ') : 'General highlights'}
      - Notes: ${request.preferences?.notes || 'Keep the plan visa-application friendly'}
      
      Please generate a JSON response with the following structure:
      {
        "flights": [
          { "id": "f1", "airline": "Airline Name", "departure": "HH:MM", "arrival": "HH:MM", "price": 0 }
        ],
        "hotels": [
          { "id": "h1", "name": "Hotel Name", "location": "City/Area", "nights": 0, "price": 0 }
        ],
        "activities": [
          { "id": "a1", "day": 1, "name": "Activity Name", "description": "Short description" }
        ]
      }
      
      Ensure the response is valid JSON. Do not include markdown formatting like \`\`\`json.
      Provide realistic options suitable for the destination and purpose.
      Align activities and hotel choices with the stated budget and preferences.
      For flights, estimate prices from the departure city where possible. For hotels, suggest 1-2 options that fit the budget.
      For activities, plan for each day of the trip (up to 7 days) with visa-friendly confirmations (day/region + purpose-aligned experiences).
    `;

        let lastError: unknown;
        for (const modelName of modelCandidates) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent(prompt);
                const response = await result.response;
                const text = response.text();

                // Clean up markdown if present
                const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();

                return JSON.parse(jsonStr) as GeneratedItinerary;
            } catch (error) {
                lastError = error;
                console.warn(`[Gemini] Model "${modelName}" failed, trying next fallback.`, error);
            }
        }

        throw lastError || new Error('All Gemini models failed');
    } catch (error) {
        console.error('Failed to generate itinerary with Gemini:', error);
        // Fallback to mock data on error
        return getMockItinerary(request);
    }
};

const getMockItinerary = (request: ItineraryRequest): GeneratedItinerary => {
    return {
        flights: [
            {
                id: 'f1',
                airline: 'Emirates',
                departure: '10:00 AM',
                arrival: '08:00 PM',
                price: 1200,
            },
            {
                id: 'f2',
                airline: 'Qatar Airways',
                departure: '02:00 PM',
                arrival: '11:00 PM',
                price: 1150,
            },
        ],
        hotels: [
            {
                id: 'h1',
                name: `Grand ${request.destination} Hotel`,
                location: 'City Center',
                nights: 5,
                price: 1500,
            },
        ],
        activities: [
            {
                id: 'a1',
                day: 1,
                name: 'City Tour',
                description: 'Explore the main landmarks and historical sites.',
            },
            {
                id: 'a2',
                day: 2,
                name: 'Local Cuisine Tasting',
                description: 'Experience the best local food and markets.',
            },
            {
                id: 'a3',
                day: 3,
                name: 'Museum Visit',
                description: 'Visit the national museum to learn about the culture.',
            },
        ],
    };
};
