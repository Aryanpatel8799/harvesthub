
import { AlertTriangle, Clipboard } from "lucide-react";
import { cn } from "@/lib/utils";

type DiseaseCardProps = {
  id: string;
  plantName: string;
  diseaseName: string;
  detectedDate: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  treatment: string;
  className?: string;
};

const DiseaseCard = ({
  id,
  plantName,
  diseaseName,
  detectedDate,
  severity,
  description,
  treatment,
  className,
}: DiseaseCardProps) => {
  const getSeverityColor = () => {
    switch (severity) {
      case 'low':
        return 'text-yellow-600 bg-yellow-50';
      case 'medium':
        return 'text-orange-600 bg-orange-50';
      case 'high':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-yellow-600 bg-yellow-50';
    }
  };

  return (
    <div className={cn(
      "bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100",
      className
    )}>
      <div className="p-6">
        <div className="flex items-center mb-3">
          <div className="mr-3">
            <AlertTriangle size={20} className="text-orange-500" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-800">{plantName} - {diseaseName}</h3>
            <p className="text-sm text-gray-500">Detected on {detectedDate}</p>
          </div>
          <div className={cn(
            "ml-auto px-2 py-1 rounded-full text-xs font-medium",
            getSeverityColor()
          )}>
            {severity.charAt(0).toUpperCase() + severity.slice(1)} Severity
          </div>
        </div>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600">{description}</p>
        </div>
        
        <div className="bg-blue-50 rounded-lg p-4 mb-4">
          <div className="flex items-start">
            <Clipboard size={18} className="text-blue-600 mr-2 mt-0.5" />
            <div>
              <div className="text-sm font-medium text-gray-800 mb-1">Recommended Treatment</div>
              <p className="text-sm text-gray-600">{treatment}</p>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between space-x-2">
          <button className="flex-1 px-4 py-2 bg-harvest-600 hover:bg-harvest-700 text-white rounded-md transition-colors text-sm">
            View Treatment Details
          </button>
          <button className="px-4 py-2 bg-white hover:bg-gray-50 text-harvest-700 border border-harvest-300 rounded-md transition-colors text-sm">
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default DiseaseCard;
