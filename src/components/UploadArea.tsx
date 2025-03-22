
import { useState } from "react";
import { Upload, Camera } from "lucide-react";
import { cn } from "@/lib/utils";

type UploadAreaProps = {
  onFileUpload: (file: File) => void;
  className?: string;
  supportedFormats?: string;
  maxSize?: number; // in MB
};

const UploadArea = ({
  onFileUpload,
  className,
  supportedFormats = "JPG, PNG, WEBP",
  maxSize = 5, // 5MB default
}: UploadAreaProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndUpload(e.target.files[0]);
    }
  };

  const validateAndUpload = (file: File) => {
    setError(null);
    
    // Check file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError(`Invalid file type. Please upload ${supportedFormats}.`);
      return;
    }
    
    // Check file size
    const fileSizeInMB = file.size / (1024 * 1024);
    if (fileSizeInMB > maxSize) {
      setError(`File size exceeds ${maxSize}MB limit.`);
      return;
    }
    
    onFileUpload(file);
  };
  
  return (
    <div 
      className={cn(
        "border-2 border-dashed rounded-lg p-6 transition-colors",
        isDragging ? "border-harvest-500 bg-harvest-50" : "border-gray-300 hover:border-harvest-400",
        className
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex flex-col items-center justify-center space-y-3">
        {isDragging ? (
          <Upload className="w-10 h-10 text-harvest-500" />
        ) : (
          <div className="bg-harvest-100 rounded-full p-3">
            <Upload className="w-6 h-6 text-harvest-600" />
          </div>
        )}

        <div className="text-center">
          <p className="text-sm font-medium text-gray-700">
            Drag & drop a file here, or{" "}
            <label className="text-harvest-600 hover:text-harvest-700 cursor-pointer">
              browse
              <input
                type="file"
                className="hidden"
                onChange={handleFileInput}
                accept="image/jpeg,image/png,image/webp"
              />
            </label>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Supports: {supportedFormats} (Max {maxSize}MB)
          </p>
        </div>

        <div className="flex items-center mt-4">
          <div className="h-px bg-gray-300 w-16"></div>
          <span className="mx-2 text-xs text-gray-500">OR</span>
          <div className="h-px bg-gray-300 w-16"></div>
        </div>

        <button className="flex items-center justify-center px-4 py-2 bg-harvest-600 hover:bg-harvest-700 text-white rounded-md transition-colors">
          <Camera size={16} className="mr-2" />
          <span>Take a Photo</span>
        </button>

        {error && (
          <p className="text-sm text-red-600 mt-2">{error}</p>
        )}
      </div>
    </div>
  );
};

export default UploadArea;
