import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Upload, Loader2, RefreshCw, Leaf } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import SoilDetailsForm from "@/components/farmer/SoilDetailsForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const DiseaseDetection = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
      setResult(null);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedImage) {
      toast({ title: "No image selected", description: "Please upload an image." });
      return;
    }
    
    setIsLoading(true);
    const formData = new FormData();
    formData.append("image", selectedImage);

    try {
      const response = await fetch("http://localhost:5000/api/predict", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to get prediction");
      }

      const data = await response.json();
      setResult(data);
    } catch (error) {
      toast({ title: "Error", description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto space-y-8"
      >
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-block p-3 rounded-full bg-green-100 mb-4"
          >
            <Leaf className="h-8 w-8 text-green-600" />
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Plant Health Analysis</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Analyze your plant's health and soil conditions for optimal farming practices.
          </p>
        </div>

        <Tabs defaultValue="disease" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="disease">Disease Detection</TabsTrigger>
            {user?.type === 'farmer' && (
              <TabsTrigger value="soil">Soil Analysis</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="disease">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="shadow-xl rounded-xl overflow-hidden border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                  <CardTitle className="text-2xl font-bold">Disease Detection</CardTitle>
                  <CardDescription className="text-green-50">Upload a clear image of the affected plant area</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 p-8">
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" id="image-upload" />
                  <motion.label
                    htmlFor="image-upload"
                    className="cursor-pointer block text-center border-2 border-dashed border-gray-300 rounded-xl p-6 transition-all hover:border-green-500 hover:bg-green-50"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    {imagePreview ? (
                      <motion.img
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        src={imagePreview}
                        alt="Selected"
                        className="max-h-[400px] mx-auto rounded-lg shadow-lg"
                      />
                    ) : (
                      <div className="py-12">
                        <Upload className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-600 text-lg">Click or drag and drop to upload an image</p>
                        <p className="text-sm text-gray-500 mt-2">Supported formats: JPG, PNG, WEBP</p>
                      </div>
                    )}
                  </motion.label>
                  <div className="flex gap-4 justify-center">
                    <Button
                      onClick={handleSubmit}
                      disabled={!selectedImage || isLoading}
                      className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-2 rounded-full hover:from-green-600 hover:to-emerald-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                    >
                      {isLoading ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <Loader2 className="h-5 w-5" />
                        </motion.div>
                      ) : (
                        "Analyze Image"
                      )}
                    </Button>
                    {selectedImage && (
                      <Button
                        variant="outline"
                        onClick={handleReset}
                        className="border-gray-300 hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-all"
                      >
                        <RefreshCw className="h-5 w-5" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="shadow-xl rounded-xl overflow-hidden border-0 bg-white/90 backdrop-blur-sm mt-8">
                  <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                    <CardTitle className="text-2xl font-bold">Detection Results</CardTitle>
                    <CardDescription className="text-blue-50">{result.title}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-8 space-y-6">
                    <div className="bg-blue-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-blue-900 mb-3">Analysis</h3>
                      <p className="text-gray-700 leading-relaxed">{result.description}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-green-900 mb-3">Prevention Measures</h3>
                      <p className="text-gray-700 leading-relaxed">{result.prevent}</p>
                    </div>
                    {/* {result.image_url && (
                      <div className="mt-6">
                        <img
                          src={result.image_url}
                          alt={result.title}
                          className="w-full max-w-md mx-auto rounded-lg shadow-lg"
                        />
                      </div>
                    )} */}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </TabsContent>

          {user?.type === 'farmer' && (
            <TabsContent value="soil">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <SoilDetailsForm />
              </motion.div>
            </TabsContent>
          )}
        </Tabs>
      </motion.div>
    </div>
  );
};

export default DiseaseDetection;