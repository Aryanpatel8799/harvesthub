import { Weather } from "@/components/Weather";
import MarketTrends from "@/components/MarketTrends";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CloudSun, TrendingUp, Droplets, Wind, Sun, CloudRain } from "lucide-react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { useEffect, useState } from "react";
import { marketDataService, MarketData } from "@/services/marketDataService";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

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

const WeatherMarket = () => {
  const [marketData, setMarketData] = useState<{ [key: string]: MarketData[] }>({});
  const [commodities, setCommodities] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [selectedCommodity, setSelectedCommodity] = useState<string>('');

  useEffect(() => {
    const fetchWeather = async () => {
      try {
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
        console.error('Weather fetch error:', err);
      } finally {
        setWeatherLoading(false);
      }
    };

    fetchWeather();
  }, []);

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const commoditiesList = await marketDataService.getCommodities();
        setCommodities(commoditiesList);
        
        // Set initial selected commodity
        if (commoditiesList.length > 0) {
          setSelectedCommodity(commoditiesList[0]);
        }

        const marketDataMap: { [key: string]: MarketData[] } = {};
        for (const commodity of commoditiesList.slice(0, 4)) {
          const data = await marketDataService.getMarketData(commodity);
          marketDataMap[commodity] = data;
        }
        setMarketData(marketDataMap);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching market data:', error);
        setLoading(false);
      }
    };

    fetchMarketData();
  }, []);

  const getPriceChange = (data: MarketData[]) => {
    if (data.length < 2) return { change: 0, percentage: 0 };
    const latest = data[data.length - 1].modalPrice;
    const previous = data[data.length - 2].modalPrice;
    const change = latest - previous;
    const percentage = (change / previous) * 100;
    return { change, percentage };
  };

  // Weather data for chart
  const weeklyTemps = {
    labels: weather?.forecast.forecastday.map(day => 
      new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })
    ) || [],
    datasets: [{
      label: 'Temperature',
      data: weather?.forecast.forecastday.map(day => day.day.maxtemp_c) || [],
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      fill: true,
      tension: 0.4,
      pointRadius: 0,
    }]
  };

  const weeklyPrices = {
    labels: marketData[selectedCommodity]?.slice(-7).map(d => d.date) || [],
    datasets: [{
      label: 'Average Price',
      data: marketData[selectedCommodity]?.slice(-7).map(d => d.modalPrice) || [],
      borderColor: 'rgb(34, 197, 94)',
      backgroundColor: 'rgba(34, 197, 94, 0.1)',
      fill: true,
      tension: 0.4,
      pointRadius: 0,
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: function(context: any) {
            const value = context.raw;
            return context.dataset.label === 'Temperature' 
              ? `${value}°C`
              : `₹${value}`;
          }
        }
      }
    },
    scales: {
      x: {
        display: false,
      },
      y: {
        display: false,
      }
    },
  };

  const getWeatherIcon = (condition: string) => {
    const lowerCondition = condition.toLowerCase();
    if (lowerCondition.includes('rain')) return <CloudRain className="h-5 w-5 text-blue-600" />;
    if (lowerCondition.includes('cloud')) return <CloudSun className="h-5 w-5 text-blue-600" />;
    return <Sun className="h-5 w-5 text-blue-600" />;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex-1 p-4 md:p-6 max-w-[1600px] mx-auto">
        {/* Header section */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Weather & Market Insights
          </h1>
          <p className="text-gray-600">
            Stay informed with real-time weather forecasts and market price trends to optimize your farming decisions.
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-100">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <CardTitle className="text-lg font-semibold text-gray-800">Weather Overview</CardTitle>
                  <CardDescription>
                    {weather ? `${weather.location.name}, ${weather.location.region}` : 'Loading location...'}
                  </CardDescription>
                </div>
                <div className="bg-white/80 rounded-full p-2">
                  {weather ? getWeatherIcon(weather.current.condition.text) : <CloudSun className="h-5 w-5 text-blue-600" />}
                </div>
              </div>
              {weatherLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Droplets className="h-4 w-4 text-blue-600" />
                      <span className="text-sm text-gray-600">
                        Humidity: {weather?.current.humidity}%
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Wind className="h-4 w-4 text-blue-600" />
                      <span className="text-sm text-gray-600">
                        Wind: {weather?.current.wind_kph} km/h
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Sun className="h-4 w-4 text-blue-600" />
                      <span className="text-sm text-gray-600">
                        Feels like: {weather?.current.feelslike_c}°C
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CloudSun className="h-4 w-4 text-blue-600" />
                      <span className="text-sm text-gray-600">
                        {weather?.current.condition.text}
                      </span>
                    </div>
                  </div>
                  <div className="h-20 mt-4">
                    <Line data={weeklyTemps} options={chartOptions} />
                  </div>
                </>
              )}
            </CardHeader>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-100">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <CardTitle className="text-lg font-semibold text-gray-800">Market Overview</CardTitle>
                  <CardDescription>Current market trends and price analysis</CardDescription>
                </div>
                <div className="bg-white/80 rounded-full p-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
              </div>
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(marketData).slice(0, 4).map(([commodity, data]) => {
                      const latest = data[data.length - 1];
                      const { percentage } = getPriceChange(data);
                      return (
                        <div 
                          key={commodity} 
                          className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${
                            selectedCommodity === commodity ? 'bg-white/50' : ''
                          }`}
                          onClick={() => setSelectedCommodity(commodity)}
                          style={{ cursor: 'pointer' }}
                        >
                          <span className="text-sm text-gray-600">
                            {commodity}: ₹{latest.modalPrice.toLocaleString()}/q
                          </span>
                          <span className={`text-xs ${percentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {percentage >= 0 ? '↑' : '↓'} {Math.abs(percentage).toFixed(1)}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="h-20 mt-4">
                    <Line data={weeklyPrices} options={chartOptions} />
                  </div>
                </>
              )}
            </CardHeader>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Weather Section */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-lg h-full">
              <CardHeader>
                <CardTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                  Weather Forecast
                </CardTitle>
                <CardDescription>
                  3-day weather prediction for your region
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Weather />
              </CardContent>
            </Card>
          </div>

          {/* Market Trends Section */}
          <div className="lg:col-span-2">
            <MarketTrends 
              currency="₹" 
              initialCommodity={selectedCommodity}
              onCommodityChange={setSelectedCommodity}
            />
          </div>
        </div>

        {/* Additional Information Section */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-100">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-800">Crop Planning</CardTitle>
              <CardDescription className="mb-2">
                Based on weather and market conditions
              </CardDescription>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Cotton</span>
                  <div className="w-24 bg-purple-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Wheat</span>
                  <div className="w-24 bg-purple-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '65%' }}></div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Rice</span>
                  <div className="w-24 bg-purple-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-100">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-800">Price Alerts</CardTitle>
              <CardDescription className="mb-2">
                Recent price movements
              </CardDescription>
              <div className="space-y-2">
                <div className="p-2 bg-white/50 rounded-lg">
                  <div className="text-sm font-medium">Cotton ↑</div>
                  <div className="text-xs text-gray-600">Crossed ₹9,000 threshold</div>
                </div>
                <div className="p-2 bg-white/50 rounded-lg">
                  <div className="text-sm font-medium">Wheat ↓</div>
                  <div className="text-xs text-gray-600">Below 3-month average</div>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="bg-gradient-to-br from-teal-50 to-teal-100 border-teal-100">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-800">Market Analysis</CardTitle>
              <CardDescription className="mb-2">
                Top performing commodities
              </CardDescription>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-white/50 rounded-lg">
                  <span className="text-sm font-medium">Cotton</span>
                  <span className="text-sm text-green-600">+4.9%</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-white/50 rounded-lg">
                  <span className="text-sm font-medium">Rice</span>
                  <span className="text-sm text-green-600">+3.2%</span>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default WeatherMarket;
