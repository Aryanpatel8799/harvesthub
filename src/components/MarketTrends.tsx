import { useEffect, useState } from "react";
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
import { marketDataService, MarketData } from "@/services/marketDataService";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowDown, ArrowUp, Minus, TrendingDown, TrendingUp } from "lucide-react";

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

interface MarketTrendsProps {
  currency: string;
  initialCommodity?: string;
  onCommodityChange?: (commodity: string) => void;
}

const MarketTrends = ({ currency, initialCommodity, onCommodityChange }: MarketTrendsProps) => {
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [commodities, setCommodities] = useState<string[]>([]);
  const [selectedCommodity, setSelectedCommodity] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCommodities = async () => {
      const commoditiesList = await marketDataService.getCommodities();
      setCommodities(commoditiesList);
      if (initialCommodity) {
        setSelectedCommodity(initialCommodity);
      } else if (commoditiesList.length > 0) {
        setSelectedCommodity(commoditiesList[0]);
      }
    };

    fetchCommodities();
  }, [initialCommodity]);

  useEffect(() => {
    const fetchMarketData = async () => {
      if (selectedCommodity) {
        setLoading(true);
        const data = await marketDataService.getMarketData(selectedCommodity);
        setMarketData(data);
        setLoading(false);
      }
    };

    fetchMarketData();
  }, [selectedCommodity]);

  const handleCommodityChange = (value: string) => {
    setSelectedCommodity(value);
    if (onCommodityChange) {
      onCommodityChange(value);
    }
  };

  const getPriceChange = () => {
    if (marketData.length < 2) return { change: 0, percentage: 0 };
    const latest = marketData[marketData.length - 1].modalPrice;
    const previous = marketData[marketData.length - 2].modalPrice;
    const change = latest - previous;
    const percentage = (change / previous) * 100;
    return { change, percentage };
  };

  const getOverallTrend = () => {
    if (marketData.length < 2) return 0;
    const firstPrice = marketData[0].modalPrice;
    const lastPrice = marketData[marketData.length - 1].modalPrice;
    return ((lastPrice - firstPrice) / firstPrice) * 100;
  };

  const chartData = {
    labels: marketData.map((data) => data.date),
    datasets: [
      {
        label: `${selectedCommodity} Modal Price`,
        data: marketData.map((data) => data.modalPrice),
        borderColor: "rgb(34, 197, 94)",
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 350);
          gradient.addColorStop(0, "rgba(34, 197, 94, 0.2)");
          gradient.addColorStop(1, "rgba(34, 197, 94, 0)");
          return gradient;
        },
        tension: 0.4,
        fill: true,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointBackgroundColor: "rgb(34, 197, 94)",
        pointHoverBackgroundColor: "rgb(34, 197, 94)",
        pointHoverBorderColor: "white",
        pointHoverBorderWidth: 2,
      },
      {
        label: `Price Range`,
        data: marketData.map((data) => ({
          y: [data.minPrice, data.maxPrice],
          x: data.date,
        })),
        borderColor: "rgba(99, 102, 241, 0.2)",
        backgroundColor: "rgba(99, 102, 241, 0.1)",
        borderWidth: 0,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        type: 'line' as const,
      }
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          usePointStyle: true,
          pointStyle: "circle",
          padding: 15,
        }
      },
      title: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        titleColor: "#1f2937",
        bodyColor: "#1f2937",
        borderColor: "rgba(0, 0, 0, 0.1)",
        borderWidth: 1,
        padding: 12,
        boxPadding: 4,
        usePointStyle: true,
        callbacks: {
          label: function(context: any) {
            if (context.dataset.label === "Price Range") {
              return [
                `Min Price: ${currency}${context.raw.y[0]}`,
                `Max Price: ${currency}${context.raw.y[1]}`
              ];
            }
            return `Modal Price: ${currency}${context.parsed.y}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        grid: {
          color: 'rgba(0, 0, 0, 0.06)',
          drawBorder: false,
        },
        border: {
          display: false,
        },
        ticks: {
          callback: (value: number) => `${currency}${value}`,
          padding: 10,
        },
      },
      x: {
        grid: {
          display: false,
        },
        border: {
          display: false,
        },
        ticks: {
          maxRotation: 0,
          padding: 10,
        }
      }
    },
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    elements: {
      line: {
        borderWidth: 2,
      },
    },
  };

  const { change, percentage } = getPriceChange();
  const overallTrend = getOverallTrend();

  return (
    <Card className="w-full h-full bg-white shadow-lg border-0">
      <CardHeader className="pb-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-400 bg-clip-text text-transparent">
              Market Trends
            </CardTitle>
            <CardDescription className="text-gray-500">
              Price trends in Gujarat markets
            </CardDescription>
          </div>
          <Select
            value={selectedCommodity}
            onValueChange={handleCommodityChange}
          >
            <SelectTrigger className="w-full md:w-[250px] border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors">
              <SelectValue placeholder="Select commodity" />
            </SelectTrigger>
            <SelectContent>
              {commodities.map((commodity) => (
                <SelectItem 
                  key={commodity} 
                  value={commodity}
                  className="hover:bg-gray-100"
                >
                  {commodity}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-[500px]">
            <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {marketData.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-6 rounded-xl bg-gradient-to-br from-green-50 to-green-100 border border-green-100">
                  <div className="text-sm text-gray-600 mb-1">Current Price</div>
                  <div className="text-3xl font-bold text-gray-900">
                    {currency}{marketData[marketData.length - 1].modalPrice}
                  </div>
                  <div className="mt-1 text-sm text-gray-500">
                    per quintal
                  </div>
                </div>
                <div className="p-6 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-100">
                  <div className="text-sm text-gray-600 mb-1">Price Change (24h)</div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-gray-900">{currency}{Math.abs(change)}</span>
                    <Badge 
                      variant={change > 0 ? "destructive" : change < 0 ? "default" : "secondary"}
                      className="font-semibold"
                    >
                      <span className="flex items-center gap-1">
                        {change > 0 ? <ArrowUp className="w-4 h-4" /> : change < 0 ? <ArrowDown className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                        {Math.abs(percentage).toFixed(2)}%
                      </span>
                    </Badge>
                  </div>
                  <div className="mt-2 flex items-center gap-1 text-sm">
                    <span className="text-gray-500">30-day trend:</span>
                    <span className={`flex items-center gap-1 ${overallTrend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {overallTrend > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      {Math.abs(overallTrend).toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="p-6 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-100">
                  <div className="text-sm text-gray-600 mb-1">Market Info</div>
                  <div className="text-xl font-semibold text-gray-900">
                    {marketData[marketData.length - 1].market}
                  </div>
                  <div className="mt-1 text-sm text-gray-500">
                    {marketData[marketData.length - 1].district} District
                  </div>
                </div>
                <div className="p-6 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-100">
                  <div className="text-sm text-gray-600 mb-1">Quality Grade</div>
                  <div className="text-xl font-semibold text-gray-900">
                    {marketData[marketData.length - 1].variety}
                  </div>
                  <div className="mt-1 text-sm text-gray-500">
                    Grade: {marketData[marketData.length - 1].grade} | Code: {marketData[marketData.length - 1].commodityCode}
                  </div>
                </div>
              </div>
            )}
            <div className="h-[400px] p-4 rounded-xl bg-white border border-gray-100">
              <Line 
                data={{
                  ...chartData,
                  datasets: chartData.datasets?.map(dataset => ({
                    ...dataset,
                    data: Array.isArray(dataset.data) ? dataset.data : (dataset.data as { y: number }[])?.map(d => d.y)
                  })) || []
                }}
                options={options}
                className="filter drop-shadow-sm"
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MarketTrends;
