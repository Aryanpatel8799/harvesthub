import { useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload } from 'lucide-react';

interface SoilCertificationProps {
  farmerId: string;
  onUploadSuccess?: () => void;
}

const SoilCertification = ({ farmerId, onUploadSuccess }: SoilCertificationProps) => {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
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

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('certificate', file);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/farmers/${farmerId}/soil-certification`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to upload certificate');
      }

      toast({
        title: 'Success',
        description: 'Soil certification uploaded successfully'
      });

      if (onUploadSuccess) {
        onUploadSuccess();
      }

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to upload certificate',
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Soil Certification</h3>
        <p className="text-sm text-gray-500">
          Upload your soil certification document. This will be reviewed by our admin team.
        </p>
      </div>

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          variant="outline"
          className="w-full"
        >
          <Upload className="w-4 h-4 mr-2" />
          {isUploading ? 'Uploading...' : 'Upload Certificate'}
        </Button>
        <p className="mt-2 text-sm text-gray-500">
          Supported formats: JPG, PNG, GIF (max. 5MB)
        </p>
      </div>
    </Card>
  );
};

export default SoilCertification; 