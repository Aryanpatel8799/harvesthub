
import { CloudSun, Droplets, Wind } from "lucide-react";

type WeatherWidgetProps = {
  location: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  forecast: Array<{
    day: string;
    temperature: number;
    condition: string;
  }>;
};

const WeatherWidget = ({
  location,
  temperature,
  condition,
  humidity,
  windSpeed,
  forecast,
}: WeatherWidgetProps) => {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
      <div className="bg-gradient-to-r from-blue-50 to-sky-50 p-4">
        <h3 className="text-lg font-medium text-gray-700">Weather Forecast</h3>
        <p className="text-sm text-gray-500">{location}</p>
      </div>
      
      <div className="p-5">
        <div className="flex items-center">
          <CloudSun size={36} className="text-blue-500 mr-4" />
          <div>
            <div className="text-3xl font-semibold">{temperature}°C</div>
            <div className="text-sm text-gray-500">{condition}</div>
          </div>
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="flex items-center">
            <Droplets size={16} className="text-blue-400 mr-2" />
            <span className="text-sm text-gray-600">Humidity: {humidity}%</span>
          </div>
          <div className="flex items-center">
            <Wind size={16} className="text-blue-400 mr-2" />
            <span className="text-sm text-gray-600">Wind: {windSpeed} km/h</span>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-gray-100">
          <h4 className="text-sm font-medium text-gray-700 mb-3">3-Day Forecast</h4>
          <div className="grid grid-cols-3 gap-2">
            {forecast.map((day, index) => (
              <div key={index} className="text-center">
                <div className="text-xs text-gray-500">{day.day}</div>
                <div className="text-sm font-medium mt-1">{day.temperature}°C</div>
                <div className="text-xs text-gray-500 mt-1">{day.condition}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherWidget;
