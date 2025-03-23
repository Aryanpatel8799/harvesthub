import { useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Upload, Loader2 } from 'lucide-react';

interface SoilDetailsFormProps {
  onSubmitSuccess?: () => void;
}

const soilTypes = ['Clay', 'Sandy', 'Loamy', 'Silt', 'Peat', 'Chalky'];

const SoilDetailsForm = ({ onSubmitSuccess }: SoilDetailsFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    soilType: '',
    pH: '',
    organicMatter: '',
    nitrogen: '',
    phosphorus: '',
    potassium: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Error',
        description: 'Please upload an image file',
        variant: 'destructive'
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Error',
        description: 'File size should be less than 5MB',
        variant: 'destructive'
      });
      return;
    }

    setSelectedFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      toast({
        title: 'Error',
        description: 'Please upload a soil certificate',
        variant: 'destructive'
      });
      return;
    }

    // Validate numeric fields
    const numericFields = ['pH', 'organicMatter', 'nitrogen', 'phosphorus', 'potassium'];
    for (const field of numericFields) {
      const value = parseFloat(formData[field as keyof typeof formData]);
      if (isNaN(value) || value < 0) {
        toast({
          title: 'Error',
          description: `Please enter a valid value for ${field}`,
          variant: 'destructive'
        });
        return;
      }
    }

    // Validate pH range
    const pH = parseFloat(formData.pH);
    if (pH < 0 || pH > 14) {
      toast({
        title: 'Error',
        description: 'pH must be between 0 and 14',
        variant: 'destructive'
      });
      return;
    }

    // Validate organic matter percentage
    const organicMatter = parseFloat(formData.organicMatter);
    if (organicMatter < 0 || organicMatter > 100) {
      toast({
        title: 'Error',
        description: 'Organic matter must be between 0 and 100%',
        variant: 'destructive'
      });
      return;
    }

    try {
      setIsLoading(true);
      const submitFormData = new FormData();
      
      // Append soil details
      Object.entries(formData).forEach(([key, value]) => {
        submitFormData.append(key, value);
      });

      // Append certificate file
      submitFormData.append('certificate', selectedFile);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/farmers/${user?._id}/soil-details`, {
        method: 'POST',
        credentials: 'include',
        body: submitFormData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to submit soil details');
      }

      toast({
        title: 'Success',
        description: 'Soil details submitted successfully'
      });

      // Reset form
      setFormData({
        soilType: '',
        pH: '',
        organicMatter: '',
        nitrogen: '',
        phosphorus: '',
        potassium: '',
      });
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to submit soil details',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label>Soil Type</Label>
            <Select
              value={formData.soilType}
              onValueChange={(value) => setFormData(prev => ({ ...prev, soilType: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select soil type" />
              </SelectTrigger>
              <SelectContent>
                {soilTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="pH">pH Level</Label>
            <Input
              id="pH"
              name="pH"
              type="number"
              step="0.1"
              min="0"
              max="14"
              value={formData.pH}
              onChange={handleInputChange}
              placeholder="Enter pH level (0-14)"
              required
            />
          </div>

          <div>
            <Label htmlFor="organicMatter">Organic Matter (%)</Label>
            <Input
              id="organicMatter"
              name="organicMatter"
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={formData.organicMatter}
              onChange={handleInputChange}
              placeholder="Enter organic matter percentage"
              required
            />
          </div>

          <div>
            <Label htmlFor="nitrogen">Nitrogen (mg/kg)</Label>
            <Input
              id="nitrogen"
              name="nitrogen"
              type="number"
              step="0.1"
              min="0"
              value={formData.nitrogen}
              onChange={handleInputChange}
              placeholder="Enter nitrogen content"
              required
            />
          </div>

          <div>
            <Label htmlFor="phosphorus">Phosphorus (mg/kg)</Label>
            <Input
              id="phosphorus"
              name="phosphorus"
              type="number"
              step="0.1"
              min="0"
              value={formData.phosphorus}
              onChange={handleInputChange}
              placeholder="Enter phosphorus content"
              required
            />
          </div>

          <div>
            <Label htmlFor="potassium">Potassium (mg/kg)</Label>
            <Input
              id="potassium"
              name="potassium"
              type="number"
              step="0.1"
              min="0"
              value={formData.potassium}
              onChange={handleInputChange}
              placeholder="Enter potassium content"
              required
            />
          </div>

          <div>
            <Label>Soil Certificate</Label>
            <div className="mt-2">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {selectedFile ? selectedFile.name : 'Upload Certificate'}
                </Button>
                <p className="mt-2 text-sm text-gray-500">
                  Upload a clear image of your soil test certificate (max. 5MB)
                </p>
              </div>
            </div>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading || !selectedFile}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            'Submit Soil Details'
          )}
        </Button>
      </form>
    </Card>
  );
};

export default SoilDetailsForm; 