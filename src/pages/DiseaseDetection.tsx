
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import UploadArea from "@/components/UploadArea";
import DiseaseCard from "@/components/DiseaseCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";

const DiseaseDetection = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Mock disease detection function - in a real app would connect to an AI API
  const detectDisease = (file: File) => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const mockResults = [
        {
          id: "1",
          plantName: "Tomato",
          diseaseName: "Late Blight",
          detectedDate: new Date().toLocaleDateString(),
          severity: "medium" as const,
          description: "Late blight is a potentially serious disease of potato and tomato, caused by the fungus-like oomycete pathogen Phytophthora infestans.",
          treatment: "Apply copper-based fungicides every 7-10 days in wet weather. Ensure good air circulation by spacing plants adequately. Remove and destroy infected plant parts."
        },
        {
          id: "2",
          plantName: "Apple Tree",
          diseaseName: "Leaf Spot",
          detectedDate: new Date().toLocaleDateString(),
          severity: "low" as const,
          description: "Leaf spot is a common term for a variety of diseases affecting the leaves of plants and trees. These are often caused by fungi, but can also be caused by bacteria.",
          treatment: "Remove and destroy infected leaves. Apply appropriate fungicide. Avoid overhead watering to keep foliage dry."
        }
      ];
      
      setResults(mockResults);
      setIsLoading(false);
    }, 2000);
  };

  const handleFileUpload = (file: File) => {
    console.log("File uploaded:", file);
    detectDisease(file);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <div className="flex-1 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="py-8 md:py-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Plant Disease Detection
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-3xl">
              Upload an image of your plant to identify potential diseases and get treatment recommendations.
            </p>

            {/* Search and filter */}
            <div className="flex gap-4 mb-8">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  type="text"
                  placeholder="Search for diseases or symptoms..."
                  className="pl-10 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                <span>Filter</span>
              </Button>
            </div>

            {/* Upload section */}
            <div className="mb-10">
              <UploadArea 
                onFileUpload={handleFileUpload} 
                className="max-w-2xl mx-auto"
                supportedFormats="JPG, PNG, WEBP"
                maxSize={10}
              />
            </div>

            {/* Results section */}
            {results.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Detection Results</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {results.map((result) => (
                    <DiseaseCard
                      key={result.id}
                      id={result.id}
                      plantName={result.plantName}
                      diseaseName={result.diseaseName}
                      detectedDate={result.detectedDate}
                      severity={result.severity}
                      description={result.description}
                      treatment={result.treatment}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Disease prevention tips */}
            <div className="mt-12 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Disease Prevention Tips</h3>
              <ul className="list-disc pl-5 space-y-2 text-gray-700">
                <li>Maintain good air circulation around plants</li>
                <li>Water at the base of plants, not on foliage</li>
                <li>Remove and destroy diseased plant parts</li>
                <li>Practice crop rotation to prevent buildup of pathogens</li>
                <li>Use disease-resistant varieties when available</li>
                <li>Keep garden tools clean and disinfected</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiseaseDetection;
