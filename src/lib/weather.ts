/**
 * Weer-API integratie
 * 
 * Deze module bevat functies voor het ophalen van weergegevens op basis van locatie.
 * Standaard wordt de OpenWeatherMap API gebruikt, maar je kunt ook een andere API gebruiken.
 */

export interface WeatherData {
  description: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  icon: string;
}

/**
 * Haalt weergegevens op voor een specifieke locatie
 * 
 * @param latitude Breedtegraad
 * @param longitude Lengtegraad
 * @returns Promise met weergegevens
 */
export async function fetchWeather(latitude: number, longitude: number): Promise<WeatherData> {
  try {
    // Gebruik een standaard API-sleutel als er geen is opgegeven in de omgevingsvariabelen
    const apiKey = process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY || 'bd5e378503939ddaee76f12ad7a97608';
    
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric&lang=nl`
    );
    
    if (!response.ok) {
      throw new Error(`Weer-API fout: ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      description: data.weather[0].description,
      temperature: Math.round(data.main.temp),
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
      icon: data.weather[0].icon
    };
  } catch (error) {
    console.error('Fout bij het ophalen van weergegevens:', error);
    
    // Retourneer standaardwaarden als er iets misgaat
    return {
      description: 'Onbekend',
      temperature: 0,
      humidity: 0,
      windSpeed: 0,
      icon: '01d'
    };
  }
}

/**
 * Haalt de URL van het weericoon op
 * 
 * @param icon Icoon-ID van OpenWeatherMap
 * @returns URL van het weericoon
 */
export function getWeatherIconUrl(icon: string): string {
  return `https://openweathermap.org/img/wn/${icon}@2x.png`;
}

/**
 * Formatteert weergegevens als een leesbare string
 * 
 * @param weather Weergegevens
 * @returns Geformatteerde weerstring
 */
export function formatWeather(weather: WeatherData): string {
  return `${weather.description}, ${weather.temperature}°C, wind: ${weather.windSpeed} m/s`;
} 