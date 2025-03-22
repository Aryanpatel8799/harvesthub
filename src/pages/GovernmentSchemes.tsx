import { useState, useMemo } from "react";
import { Search, ChevronLeft, ChevronRight, ExternalLink, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Scheme {
  id: string;
  title: string;
  description: string;
  eligibility: string[];
  benefits: string[];
  applicationLink: string;
  category: string;
  state?: string;
}

const schemes: Scheme[] = [
  {
    "id": "1",
    "title": "PM-KISAN",
    "description": "Direct income support of ₹6000 per year to farmer families across the country.",
    "eligibility": [
      "Small and Marginal Farmers",
      "Family must own cultivable land",
      "Certain categories of higher-income farmers are excluded"
    ],
    "benefits": [
      "₹6000 annual financial benefit",
      "Paid in three installments of ₹2000 each",
      "Direct transfer to bank account"
    ],
    "applicationLink": "https://pmkisan.gov.in/",
    "category": "Financial Support",
    "state": "All India"
  },
  {
    "id": "2",
    "title": "Pradhan Mantri Fasal Bima Yojana",
    "description": "Comprehensive crop insurance to protect farmers from crop loss/damage.",
    "eligibility": [
      "All farmers with insurable crops",
      "Both loanee and non-loanee farmers",
      "Individual/Community farming"
    ],
    "benefits": [
      "Insurance coverage and financial support",
      "Stable income during crop damage",
      "Low premium rates"
    ],
    "applicationLink": "https://pmfby.gov.in/",
    "category": "Insurance",
    "state": "All India"
  },
  {
    "id": "3",
    "title": "Kisan Credit Card",
    "description": "Provides farmers with timely access to credit for their agricultural needs.",
    "eligibility": [
      "All farmers - individual/joint",
      "Tenant farmers",
      "Self Help Groups of farmers"
    ],
    "benefits": [
      "Easy access to credit",
      "Flexible repayment options",
      "Coverage of multiple needs"
    ],
    "applicationLink": "https://www.kcc.gov.in/",
    "category": "Credit",
    "state": "All India"
  },
  {
    "id": "4",
    "title": "Pradhan Mantri Krishi Sinchayee Yojana",
    "description": "Aims to improve water-use efficiency and irrigation infrastructure.",
    "eligibility": [
      "Farmers involved in agriculture",
      "Priority to water-stressed areas",
      "Groups of farmers or individual farmers"
    ],
    "benefits": [
      "Enhanced irrigation coverage",
      "Improved water-use efficiency",
      "Financial assistance for micro-irrigation"
    ],
    "applicationLink": "https://pmksy.gov.in/",
    "category": "Irrigation",
    "state": "All India"
  },
  {
    "id": "5",
    "title": "Soil Health Card Scheme",
    "description": "Provides farmers with information on soil nutrient status and recommendations.",
    "eligibility": [
      "All farmers",
      "Agricultural landowners"
    ],
    "benefits": [
      "Improved soil health management",
      "Better crop productivity",
      "Scientific nutrient recommendations"
    ],
    "applicationLink": "https://soilhealth.dac.gov.in/",
    "category": "Soil Health",
    "state": "All India"
  },
  {
    "id": "6",
    "title": "National Agriculture Market (e-NAM)",
    "description": "An online trading platform for agricultural commodities across India.",
    "eligibility": [
      "Registered farmers",
      "Traders & commission agents",
      "State APMC mandis"
    ],
    "benefits": [
      "Transparent price discovery",
      "Online trade across states",
      "Direct linkage with buyers"
    ],
    "applicationLink": "https://enam.gov.in/web/",
    "category": "Market Access",
    "state": "All India"
  },
  {
    "id": "7",
    "title": "Paramparagat Krishi Vikas Yojana",
    "description": "Encourages organic farming through cluster-based approach.",
    "eligibility": [
      "Small and marginal farmers",
      "Farmer groups and clusters",
      "Minimum 50 farmers per cluster"
    ],
    "benefits": [
      "Financial support for organic farming",
      "Certification for organic produce",
      "Market linkage support"
    ],
    "applicationLink": "https://pgsindia-ncof.gov.in/pkvy/index.aspx",
    "category": "Organic Farming",
    "state": "All India"
  },
  {
    "id": "8",
    "title": "National Mission for Sustainable Agriculture",
    "description": "Focuses on climate-resilient farming techniques.",
    "eligibility": [
      "Farmers in climate-vulnerable areas",
      "Agricultural producer groups",
      "State agriculture departments"
    ],
    "benefits": [
      "Sustainable farming techniques",
      "Water-efficient practices",
      "Soil health improvement"
    ],
    "applicationLink": "https://nmsa.dac.gov.in/",
    "category": "Sustainability",
    "state": "All India"
  },
  {
    "id": "9",
    "title": "Dairy Entrepreneurship Development Scheme",
    "description": "Promotes dairy farming and infrastructure support.",
    "eligibility": [
      "Farmers, SHGs, NGOs, companies",
      "New dairy entrepreneurs",
      "Dairy cooperatives"
    ],
    "benefits": [
      "Financial assistance for dairy farming",
      "Loan support for milk production",
      "Dairy processing infrastructure"
    ],
    "applicationLink": "https://dahd.nic.in/schemes-programmes/dairy-development",
    "category": "Dairy Farming",
    "state": "All India"
  },
  {
    "id": "10",
    "title": "Agriculture Infrastructure Fund",
    "description": "Provides financial support for building agri-infrastructure.",
    "eligibility": [
      "Farmers, FPOs, SHGs",
      "Agripreneurs and startups",
      "State and central agencies"
    ],
    "benefits": [
      "Subsidized loans for infrastructure",
      "Support for storage facilities",
      "Enhancement of supply chain"
    ],
    "applicationLink": "https://agriinfra.dac.gov.in/",
    "category": "Infrastructure",
    "state": "All India"
  },
  {
    "id": "11",
    "title": "Rashtriya Krishi Vikas Yojana",
    "description": "Provides financial assistance for agricultural development projects.",
    "eligibility": [
      "Farmers, FPOs, NGOs",
      "State agriculture departments",
      "Agricultural startups"
    ],
    "benefits": [
      "Funding for innovation in agriculture",
      "Support for agri-business models",
      "Enhancement of productivity"
    ],
    "applicationLink": "https://rkvy.nic.in/",
    "category": "Agriculture Development",
    "state": "All India"
  },
  {
    "id": "12",
    "title": "Mission for Integrated Development of Horticulture",
    "description": "Supports horticulture farming and market linkages.",
    "eligibility": [
      "Farmers, FPOs, SHGs",
      "Horticulture-based entrepreneurs",
      "State horticulture agencies"
    ],
    "benefits": [
      "Financial assistance for horticulture",
      "Subsidies for fruit and vegetable farming",
      "Market linkage support"
    ],
    "applicationLink": "https://midh.gov.in/",
    "category": "Horticulture",
    "state": "All India"
  },
  {
    "id": "13",
    "title": "Fisheries and Aquaculture Infrastructure Development Fund",
    "description": "Financial assistance for fisheries development and infrastructure.",
    "eligibility": [
      "Fish farmers, cooperatives, SHGs",
      "Fisheries-based businesses",
      "Government agencies"
    ],
    "benefits": [
      "Loan assistance for aquaculture",
      "Fisheries infrastructure support",
      "Technology-based fish farming"
    ],
    "applicationLink": "https://nfdb.gov.in/",
    "category": "Fisheries",
    "state": "All India"
  },
  {
    "id": "14",
    "title": "Agriculture Export Policy",
    "description": "Promotes the export of agricultural products.",
    "eligibility": [
      "Farmers, FPOs, agribusinesses",
      "Export-oriented agripreneurs",
      "Government agricultural export agencies"
    ],
    "benefits": [
      "Financial support for export activities",
      "Market linkage to global buyers",
      "Subsidies for export-based logistics"
    ],
    "applicationLink": "https://agriexport.gov.in/",
    "category": "Export Promotion",
    "state": "All India"
  },
  {
    "id": "15",
    "title": "Rural Infrastructure Development Fund",
    "description": "Provides funding for rural agricultural infrastructure projects.",
    "eligibility": [
      "State governments",
      "Panchayati Raj institutions",
      "Cooperative societies"
    ],
    "benefits": [
      "Funds for rural road development",
      "Storage and irrigation facility enhancement",
      "Market connectivity improvement"
    ],
    "applicationLink": "https://nabard.org/",
    "category": "Infrastructure",
    "state": "All India"
  },
  {
    "id": "16",
    "title": "Sub-Mission on Agricultural Mechanization",
    "description": "Promotes farm mechanization to reduce labor dependency.",
    "eligibility": [
      "Small and marginal farmers",
      "Farmer cooperatives",
      "Agricultural enterprises"
    ],
    "benefits": [
      "Subsidy for farm equipment purchase",
      "Financial aid for mechanized farming",
      "Training programs for farmers"
    ],
    "applicationLink": "https://agrimachinery.nic.in/",
    "category": "Farm Mechanization",
    "state": "All India"
  },
  {
    "id": "17",
    "title": "National Food Security Mission",
    "description": "Enhances the production of rice, wheat, and pulses.",
    "eligibility": [
      "Farmers engaged in food grain production",
      "State agriculture departments",
      "Farmer organizations"
    ],
    "benefits": [
      "Subsidies for seeds and fertilizers",
      "Financial assistance for farm inputs",
      "Research support for better yield"
    ],
    "applicationLink": "https://nfsm.gov.in/",
    "category": "Food Security",
    "state": "All India"
  },
  {
    "id": "18",
    "title": "Gramin Bhandaran Yojana",
    "description": "Supports rural warehouse construction for agricultural produce storage.",
    "eligibility": [
      "Farmers, FPOs, SHGs",
      "Agripreneurs",
      "Cooperative societies"
    ],
    "benefits": [
      "Financial aid for warehouse setup",
      "Loan subsidy for storage facilities",
      "Improved supply chain management"
    ],
    "applicationLink": "https://www.nabard.org/",
    "category": "Storage & Warehousing",
    "state": "All India"
  },
  {
    "id": "19",
    "title": "Pradhan Mantri Kisan Maan-Dhan Yojana",
    "description": "Pension scheme for small and marginal farmers.",
    "eligibility": [
      "Farmers aged 18-40 years",
      "Small and marginal farmers",
      "Not part of EPFO, NPS, or other pension schemes"
    ],
    "benefits": [
      "₹3000 monthly pension after 60 years",
      "Contribution-based pension scheme",
      "Government co-contribution"
    ],
    "applicationLink": "https://maandhan.in/",
    "category": "Pension",
    "state": "All India"
  },
  {
    "id": "20",
    "title": "National Beekeeping and Honey Mission",
    "description": "Promotes beekeeping as an agricultural enterprise.",
    "eligibility": [
      "Beekeepers, farmers",
      "FPOs and SHGs",
      "Agricultural startups"
    ],
    "benefits": [
      "Financial support for beekeeping equipment",
      "Market linkage for honey producers",
      "Training and skill development"
    ],
    "applicationLink": "https://nbhm.gov.in/",
    "category": "Beekeeping",
    "state": "All India"
  },
  {
    "id": "21",
    "title": "Operation Greens",
    "description": "Aims to stabilize the supply of Tomato, Onion, and Potato (TOP) crops.",
    "eligibility": [
      "Farmers growing tomatoes, onions, potatoes",
      "Agricultural producer organizations",
      "State agriculture agencies"
    ],
    "benefits": [
      "50% subsidy on transportation and storage",
      "Price stabilization for farmers",
      "Market linkage support"
    ],
    "applicationLink": "https://mofpi.gov.in/",
    "category": "Price Stabilization",
    "state": "All India"
  }
]



export default function GovernmentSchemes() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(9);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Simulate loading state
  useState(() => {
    const timer = setTimeout(() => {
      if (schemes.length > 0) {
        setIsLoading(false);
      } else {
        setError("Failed to load government schemes. Please try again later.");
      }
    }, 1000);

    return () => clearTimeout(timer);
  });

  const categories = useMemo(() => 
    Array.from(new Set(schemes.map(scheme => scheme.category))),
    []
  );

  const filteredSchemes = useMemo(() => 
    schemes.filter(scheme => {
      const matchesSearch = scheme.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          scheme.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || scheme.category === selectedCategory;
      return matchesSearch && matchesCategory;
    }),
    [searchTerm, selectedCategory]
  );

  const totalPages = Math.ceil(filteredSchemes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSchemes = filteredSchemes.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50/50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading government schemes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50/50 to-white p-4">
        <div className="container mx-auto max-w-2xl">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="mt-4 text-center">
            <Button 
              onClick={() => window.location.reload()}
              variant="outline"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50/50 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-green-900 mb-3">Government Schemes</h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Explore and apply for various government schemes designed to support and empower farmers across India
          </p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="relative md:col-span-5">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search schemes by name or description..."
                className="pl-10 w-full bg-gray-50/50"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <div className="md:col-span-5">
              <Select
                value={selectedCategory || "all"}
                onValueChange={(value) => {
                  setSelectedCategory(value === "all" ? null : value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-full bg-gray-50/50">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Select
                value={itemsPerPage.toString()}
                onValueChange={(value) => {
                  setItemsPerPage(Number(value));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-full bg-gray-50/50">
                  <SelectValue placeholder="Items per page" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6">6 per page</SelectItem>
                  <SelectItem value="9">9 per page</SelectItem>
                  <SelectItem value="12">12 per page</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">
            Showing {Math.min(startIndex + 1, filteredSchemes.length)} - {Math.min(startIndex + itemsPerPage, filteredSchemes.length)} of {filteredSchemes.length} schemes
          </p>
        </div>

        {/* Schemes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {paginatedSchemes.map(scheme => (
            <Card key={scheme.id} className="flex flex-col hover:shadow-md transition-shadow duration-200">
              <CardHeader className="space-y-3">
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200">
                      {scheme.category}
                    </Badge>
                    {scheme.state && (
                      <Badge variant="outline" className="border-green-200">
                        {scheme.state}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-xl text-green-900">{scheme.title}</CardTitle>
                </div>
                <CardDescription className="text-gray-600">{scheme.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="space-y-4">
                  <div className="bg-green-50/50 rounded-lg p-4">
                    <h4 className="font-semibold text-green-900 mb-2">Eligibility Criteria</h4>
                    <ul className="list-disc list-inside text-sm space-y-1 text-gray-600">
                      {scheme.eligibility.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-green-50/50 rounded-lg p-4">
                    <h4 className="font-semibold text-green-900 mb-2">Key Benefits</h4>
                    <ul className="list-disc list-inside text-sm space-y-1 text-gray-600">
                      {scheme.benefits.map((benefit, index) => (
                        <li key={index}>{benefit}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700 text-white gap-2"
                  onClick={() => window.open(scheme.applicationLink, '_blank')}
                >
                  Apply Now
                  <ExternalLink size={16} />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2">
            <Button
              variant="outline"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="w-10 h-10 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                onClick={() => handlePageChange(page)}
                className={`w-10 h-10 p-0 ${
                  currentPage === page ? 'bg-green-600 hover:bg-green-700' : ''
                }`}
              >
                {page}
              </Button>
            ))}
            <Button
              variant="outline"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="w-10 h-10 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* No Results */}
        {filteredSchemes.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
            <p className="text-gray-500 text-lg mb-4">No schemes found matching your search criteria.</p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory(null);
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
