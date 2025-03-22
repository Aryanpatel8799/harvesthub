
import { Lightbulb, Sprout, Calendar, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

type RecommendationType = 'crop' | 'market' | 'weather' | 'action';

type AIRecommendationProps = {
  type: RecommendationType;
  title: string;
  description: string;
  className?: string;
};

const AIRecommendation = ({ type, title, description, className }: AIRecommendationProps) => {
  const getIcon = () => {
    switch (type) {
      case 'crop':
        return <Sprout size={20} className="text-green-600" />;
      case 'market':
        return <TrendingUp size={20} className="text-blue-600" />;
      case 'weather':
        return <Calendar size={20} className="text-orange-600" />;
      case 'action':
        return <Lightbulb size={20} className="text-amber-600" />;
      default:
        return <Lightbulb size={20} className="text-amber-600" />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'crop':
        return 'bg-green-50';
      case 'market':
        return 'bg-blue-50';
      case 'weather':
        return 'bg-orange-50';
      case 'action':
        return 'bg-amber-50';
      default:
        return 'bg-amber-50';
    }
  };

  return (
    <div 
      className={cn(
        "rounded-lg p-4 flex items-start gap-3 animate-fade-in", 
        getBackgroundColor(),
        className
      )}
    >
      <div className="mt-0.5">{getIcon()}</div>
      <div>
        <h4 className="font-medium text-gray-800 mb-1">{title}</h4>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  );
};

export default AIRecommendation;
