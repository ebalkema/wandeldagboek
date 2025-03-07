export interface Walk {
  id: string;
  title?: string;
  startTime: string; // ISO string
  endTime?: string;  // ISO string, optioneel
  observations: string[]; // Array van observation IDs
  notes?: string; // Optionele notities over de wandeling
  route?: GeoPoint[]; // Array van locatiepunten voor de route
}

export interface Observation {
  id: string;
  text: string;
  photos: string[];
  audioUrl?: string; // URL naar de audio-opname
  location: string;
  weather: string;
  date: string;
  walkId?: string; // ID van de wandeling waar deze observatie bij hoort
}

export interface GeoPoint {
  latitude: number;
  longitude: number;
  timestamp: string;
} 