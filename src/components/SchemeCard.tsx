import { FileText, ChevronRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type SchemeCardProps = {
  id: string;
  title: string;
  description: string;
  eligibility: string;
  amount?: string;
  category: string;
  icon?: React.ReactNode;
  className?: string;
};

const SchemeCard = ({
  id,
  title,
  description,
  eligibility,
  amount,
  category,
  icon = <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-harvest-600" />,
  className,
}: SchemeCardProps) => {
  return (
    <div 
      className={cn(
        "group bg-white rounded-lg sm:rounded-xl overflow-hidden shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300",
        className
      )}
    >
      <div className="p-3 sm:p-4 lg:p-5">
        {/* Header */}
        <div className="flex items-start gap-2 sm:gap-3 mb-2 sm:mb-3">
          <div className="flex-shrink-0 p-1.5 sm:p-2 bg-harvest-50 rounded-lg">
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-2">
              <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 leading-tight sm:leading-snug truncate">
                {title}
              </h3>
              <span className="inline-flex items-center rounded-full bg-harvest-50 px-2 py-0.5 text-[10px] sm:text-xs font-medium text-harvest-700">
                {category}
              </span>
            </div>
            <p className="mt-1 text-[11px] sm:text-xs lg:text-sm text-gray-500 line-clamp-2">
              {description}
            </p>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-2 sm:space-y-3">
          {amount && (
            <div className="flex items-baseline gap-1.5 sm:gap-2">
              <span className="text-[11px] sm:text-xs lg:text-sm font-medium text-gray-500">Amount:</span>
              <span className="text-sm sm:text-base lg:text-lg font-semibold text-harvest-600">{amount}</span>
            </div>
          )}
          
          <div>
            <h4 className="text-[11px] sm:text-xs lg:text-sm font-medium text-gray-500 mb-0.5 sm:mb-1">Eligibility</h4>
            <p className="text-[11px] sm:text-xs lg:text-sm text-gray-700">{eligibility}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 sm:gap-2">
          <Button 
            variant="default"
            className="w-full sm:w-auto bg-harvest-600 hover:bg-harvest-700 text-white text-[11px] sm:text-xs lg:text-sm py-1.5 sm:py-2"
          >
            Apply Now
            <ArrowUpRight className="ml-1 h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
          
          <Button
            variant="ghost"
            className="w-full sm:w-auto text-gray-500 hover:text-gray-700 text-[11px] sm:text-xs lg:text-sm py-1.5 sm:py-2"
          >
            Learn More
            <ChevronRight className="ml-1 h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SchemeCard;
