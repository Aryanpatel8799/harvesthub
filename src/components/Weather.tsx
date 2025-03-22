import { useEffect, useState } from 'react';
import { CloudSun, Droplets, Wind, Cloud, Sun, CloudRain, CloudSnow, CloudLightning } from 'lucide-react';

interface WeatherData {
  location: {
    name: string;
    region: string;
    country: string;
    lat: number;
    lon: number;
    localtime: string;
  };
  current: {
    temp_c: number;
    condition: {
      text: string;
      icon: string;
    };
    humidity: number;
    wind_kph: number;
    feelslike_c: number;
  };
  forecast: {
    forecastday: Array<{
      date: string;
      day: {
        maxtemp_c: number;
        mintemp_c: number;
        condition: {
          text: string;
          icon: string;
        };
      };
    }>;
  };
}

export function Weather() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        // Get user's location
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });

        const { latitude, longitude } = position.coords;
        const API_KEY = '4fe9fd2f8fcc4cd0a23102124251803';
        const response = await fetch(
          `http://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${latitude},${longitude}&days=3&aqi=no`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch weather data');
        }

        const data = await response.json();
        setWeather(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch weather data');
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, []);

  const getWeatherIcon = (condition: string) => {
    const lowerCondition = condition.toLowerCase();
    if (lowerCondition.includes('rain')) return <CloudRain className="w-8 h-8 text-blue-500" />;
    if (lowerCondition.includes('snow')) return <CloudSnow className="w-8 h-8 text-blue-500" />;
    if (lowerCondition.includes('thunder')) return <CloudLightning className="w-8 h-8 text-blue-500" />;
    if (lowerCondition.includes('cloud')) return <Cloud className="w-8 h-8 text-blue-500" />;
    return <Sun className="w-8 h-8 text-blue-500" />;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
        <div className="bg-gradient-to-r from-blue-50 to-sky-50 p-4">
          <h3 className="text-lg font-medium text-gray-700">Loading weather...</h3>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
        <div className="bg-gradient-to-r from-blue-50 to-sky-50 p-4">
          <h3 className="text-lg font-medium text-gray-700">Error</h3>
          <p className="text-sm text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  if (!weather) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
      <div className="bg-gradient-to-r from-blue-50 to-sky-50 p-4">
        <h3 className="text-lg font-medium text-gray-700">Weather Forecast</h3>
        <p className="text-sm text-gray-500">{weather.location.name}, {weather.location.country}</p>
      </div>
      
      <div className="p-5">
        <div className="flex items-center">
          {getWeatherIcon(weather.current.condition.text)}
          <div className="ml-4">
            <div className="text-3xl font-semibold">{weather.current.temp_c}°C</div>
            <div className="text-sm text-gray-500">{weather.current.condition.text}</div>
          </div>
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="flex items-center">
            <Droplets size={16} className="text-blue-400 mr-2" />
            <span className="text-sm text-gray-600">Humidity: {weather.current.humidity}%</span>
          </div>
          <div className="flex items-center">
            <Wind size={16} className="text-blue-400 mr-2" />
            <span className="text-sm text-gray-600">Wind: {weather.current.wind_kph} km/h</span>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-gray-100">
          <h4 className="text-sm font-medium text-gray-700 mb-3">3-Day Forecast</h4>
          <div className="grid grid-cols-3 gap-2">
            {weather.forecast.forecastday.map((day, index) => (
              <div key={index} className="text-center">
                <div className="text-xs text-gray-500">
                  {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div className="text-sm font-medium mt-1">{day.day.maxtemp_c}°C</div>
                <div className="text-xs text-gray-500 mt-1">{day.day.condition.text}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 