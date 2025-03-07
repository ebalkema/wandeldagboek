/**
 * Route tracking functionaliteit
 * 
 * Deze module bevat functies voor het bijhouden van wandelroutes.
 */

import { GeoPoint } from './types';

/**
 * Opties voor route tracking
 */
export interface RouteTrackingOptions {
  /** Minimale afstand in meters tussen twee punten */
  minDistance?: number;
  /** Maximale tijd in milliseconden tussen twee punten */
  maxTime?: number;
  /** Nauwkeurigheid van de locatiebepaling */
  enableHighAccuracy?: boolean;
  /** Maximale leeftijd van een cached positie in milliseconden */
  maximumAge?: number;
  /** Timeout voor de locatiebepaling in milliseconden */
  timeout?: number;
}

/**
 * Standaard opties voor route tracking
 */
const DEFAULT_OPTIONS: RouteTrackingOptions = {
  minDistance: 10, // 10 meter
  maxTime: 60000, // 1 minuut
  enableHighAccuracy: true,
  maximumAge: 10000, // 10 seconden
  timeout: 5000 // 5 seconden
};

/**
 * Start route tracking
 * 
 * @param walkId ID van de wandeling
 * @param options Opties voor route tracking
 * @returns ID van de watch positie (nodig om tracking te stoppen)
 */
export function startRouteTracking(
  walkId: string,
  options: RouteTrackingOptions = {}
): number | null {
  if (!navigator.geolocation) {
    console.error('Geolocation API is niet beschikbaar');
    return null;
  }

  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
  let lastPosition: GeolocationPosition | null = null;

  const watchId = navigator.geolocation.watchPosition(
    (position) => {
      // Controleer of de nieuwe positie ver genoeg is van de vorige positie
      if (lastPosition) {
        const distance = calculateDistance(
          lastPosition.coords.latitude,
          lastPosition.coords.longitude,
          position.coords.latitude,
          position.coords.longitude
        );

        const timeDiff = position.timestamp - lastPosition.timestamp;

        // Sla de positie alleen op als de afstand groter is dan de minimale afstand
        // of als er genoeg tijd is verstreken
        if (distance < mergedOptions.minDistance! && timeDiff < mergedOptions.maxTime!) {
          return;
        }
      }

      // Sla de positie op
      const newPoint: GeoPoint = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        timestamp: new Date().toISOString()
      };

      // Haal bestaande wandeling op
      const walks = JSON.parse(localStorage.getItem('walks') || '[]');
      const walkIndex = walks.findIndex((w: any) => w.id === walkId);

      if (walkIndex !== -1) {
        // Voeg locatiepunt toe aan route
        if (!walks[walkIndex].route) {
          walks[walkIndex].route = [];
        }

        walks[walkIndex].route.push(newPoint);
        localStorage.setItem('walks', JSON.stringify(walks));
      }

      lastPosition = position;
    },
    (error) => {
      console.error('Fout bij het volgen van locatie:', error);
    },
    {
      enableHighAccuracy: mergedOptions.enableHighAccuracy,
      maximumAge: mergedOptions.maximumAge,
      timeout: mergedOptions.timeout
    }
  );

  return watchId;
}

/**
 * Stop route tracking
 * 
 * @param watchId ID van de watch positie
 */
export function stopRouteTracking(watchId: number | null): void {
  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId);
  }
}

/**
 * Bereken de afstand tussen twee punten in meters (Haversine formule)
 * 
 * @param lat1 Breedtegraad van punt 1
 * @param lon1 Lengtegraad van punt 1
 * @param lat2 Breedtegraad van punt 2
 * @param lon2 Lengtegraad van punt 2
 * @returns Afstand in meters
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Straal van de aarde in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
}

/**
 * Bereken de totale afstand van een route in meters
 * 
 * @param route Array van GeoPoint objecten
 * @returns Totale afstand in meters
 */
export function calculateTotalDistance(route: GeoPoint[]): number {
  if (route.length < 2) return 0;

  let totalDistance = 0;

  for (let i = 1; i < route.length; i++) {
    const prevPoint = route[i - 1];
    const currentPoint = route[i];

    totalDistance += calculateDistance(
      prevPoint.latitude,
      prevPoint.longitude,
      currentPoint.latitude,
      currentPoint.longitude
    );
  }

  return totalDistance;
}

/**
 * Formatteert een afstand in meters naar een leesbare string
 * 
 * @param distance Afstand in meters
 * @returns Geformatteerde afstandsstring
 */
export function formatDistance(distance: number): string {
  if (distance < 1000) {
    return `${Math.round(distance)} m`;
  } else {
    return `${(distance / 1000).toFixed(2)} km`;
  }
} 