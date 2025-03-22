import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Upload, Loader2, RefreshCw } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface DetectionResult {
  disease: string;
  confidence: number;
  treatment: string;
  prevention: string;
  supplement_name: string;
  supplement_image: string;
  supplement_link: string;
}

const DiseaseDetection = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<DetectionResult | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
      setResult(null); // Reset previous results
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
   
  };

  const handleReset = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setResult(null);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8 bg-gradient-to-r from-green-700 to-green-500 rounded-2xl p-6 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-2">Plant Disease Detection</h1>
        <p className="text-green-100">Upload a photo of your plant to detect diseases</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Upload Image</CardTitle>
            <CardDescription>
              Select a clear image of the affected plant part
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="cursor-pointer block"
              >
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Selected plant"
                      className="max-h-[300px] mx-auto rounded-lg"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity rounded-lg">
                      <p className="text-white">Click to change image</p>
                    </div>
                  </div>
                ) : (
                  <div className="py-8">
                    <Upload className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-500">Click to upload an image</p>
                  </div>
                )}
              </label>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleSubmit}
                className="flex-1"
                disabled={!selectedImage || isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  'Detect Disease'
                )}
              </Button>
              {selectedImage && (
                <Button
                  variant="outline"
                  onClick={handleReset}
                  disabled={isLoading}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {result ? (
          <Card>
            <CardHeader>
              <CardTitle>Detection Results</CardTitle>
              <CardDescription>
                Analysis of the uploaded plant image
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold">Detected Disease</h3>
                <p className="text-lg text-green-700">{result.disease}</p>
                <p className="text-sm text-gray-500">
                  Confidence: {(result.confidence * 100).toFixed(2)}%
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">Treatment</h3>
                <p className="text-gray-700">{result.treatment}</p>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">Prevention</h3>
                <p className="text-gray-700">{result.prevention}</p>
              </div>

              {result.supplement_name && (
                <div className="space-y-2 mt-4 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold">Recommended Product</h3>
                  <div className="flex items-center gap-4">
                    {result.supplement_image && (
                      <img 
                        src={result.supplement_image} 
                        alt={result.supplement_name}
                        className="w-20 h-20 object-cover rounded"
                      />
                    )}
                    <div>
                      <p className="font-medium">{result.supplement_name}</p>
                      {result.supplement_link && (
                        <a 
                          href={result.supplement_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          View Product
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Instructions</CardTitle>
              <CardDescription>
                How to get the best results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-green-700 font-semibold">1</span>
                  </div>
                  <p className="text-gray-600">Take a clear, well-lit photo of the affected plant part</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-green-700 font-semibold">2</span>
                  </div>
                  <p className="text-gray-600">Ensure the diseased area is clearly visible in the image</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-green-700 font-semibold">3</span>
                  </div>
                  <p className="text-gray-600">Upload the image and wait for the analysis results</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DiseaseDetection;