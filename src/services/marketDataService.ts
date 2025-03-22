import axios from 'axios';

const BASE_URL = '/api/market-data';

export interface MarketData {
  state: string;
  district: string;
  market: string;
  commodity: string;
  variety: string;
  grade: string;
  date: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
  commodityCode: string;
}

export interface MarketDataResponse {
  records: Array<{
    State: string;
    District: string;
    Market: string;
    Commodity: string;
    Variety: string;
    Grade: string;
    Arrival_Date: string;
    Min_Price: string;
    Max_Price: string;
    Modal_Price: string;
    Commodity_Code: string;
  }>;
  total: number;
  count: number;
  limit: string;
  offset: string;
}

// Realistic commodity list for Gujarat
const MOCK_COMMODITIES = [
  "Cotton",
  "Groundnut",
  "Castor",
  "Wheat",
  "Bajra (Pearl Millet)",
  "Cumin",
  "Fennel",
  "Paddy",
  "Potato",
  "Onion",
  "Banana",
  "Mango",
  "Chana (Chickpea)",
  "Soybean",
  "Mustard",
  "Tobacco"
];

// Generate realistic price data for the last 30 days
const generatePriceData = (commodity: string) => {
  const today = new Date();
  const data: MarketData[] = [];
  
  // Base price ranges for different commodities (Gujarat market prices)
  const priceRanges: { [key: string]: { base: number, variance: number } } = {
    "Cotton": { base: 8500, variance: 800 },
    "Groundnut": { base: 6800, variance: 500 },
    "Castor": { base: 7200, variance: 600 },
    "Wheat": { base: 2500, variance: 200 },
    "Bajra (Pearl Millet)": { base: 2200, variance: 180 },
    "Cumin": { base: 28000, variance: 2500 },
    "Fennel": { base: 15000, variance: 1200 },
    "Paddy": { base: 2300, variance: 200 },
    "Potato": { base: 1800, variance: 400 },
    "Onion": { base: 1600, variance: 500 },
    "Banana": { base: 2200, variance: 300 },
    "Mango": { base: 4500, variance: 800 },
    "Chana (Chickpea)": { base: 5500, variance: 400 },
    "Soybean": { base: 4800, variance: 350 },
    "Mustard": { base: 5200, variance: 400 },
    "Tobacco": { base: 3800, variance: 300 }
  };

  const { base, variance } = priceRanges[commodity] || { base: 5000, variance: 400 };
  const markets = [
    { district: "Ahmedabad", market: "Ahmedabad APMC" },
    { district: "Rajkot", market: "Rajkot APMC" },
    { district: "Surat", market: "Surat APMC" }
  ];
  const selectedMarket = markets[Math.floor(Math.random() * markets.length)];

  for (let i = 30; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Generate slightly varying prices with seasonal trends
    const seasonalFactor = Math.cos((date.getMonth() + i/30) * Math.PI / 6);
    const baseForDay = base + seasonalFactor * variance * 0.5;
    const trendFactor = Math.sin(i * 0.2) * variance * 0.3;
    
    const modalPrice = Math.round(baseForDay + trendFactor + (Math.random() - 0.5) * variance);
    const minPrice = Math.round(modalPrice - Math.random() * variance * 0.4);
    const maxPrice = Math.round(modalPrice + Math.random() * variance * 0.4);

    data.push({
      state: "Gujarat",
      district: selectedMarket.district,
      market: selectedMarket.market,
      commodity: commodity,
      variety: "Premium",
      grade: "A",
      date: date.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }),
      minPrice,
      maxPrice,
      modalPrice,
      commodityCode: "GJ" + (MOCK_COMMODITIES.indexOf(commodity) + 1).toString().padStart(3, '0')
    });
  }

  return data;
};

export const marketDataService = {
  async getMarketData(commodity: string = ''): Promise<MarketData[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    if (!commodity) {
      return generatePriceData(MOCK_COMMODITIES[0]);
    }
    return generatePriceData(commodity);
  },

  async getCommodities(): Promise<string[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return MOCK_COMMODITIES;
  },
}; 