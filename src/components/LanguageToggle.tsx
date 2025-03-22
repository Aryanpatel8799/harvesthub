import { useState } from "react";
import { cn } from "@/lib/utils";

const LanguageToggle = () => {
  const [language, setLanguage] = useState<"english" | "hindi">("english");

  const toggleLanguage = () => {
    setLanguage(language === "english" ? "hindi" : "english");
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center justify-center px-3 py-1 rounded-full bg-harvest-800 hover:bg-harvest-900 transition-colors duration-200"
    >
      <span className={cn(
        "text-sm font-medium transition-opacity duration-200",
        language === "english" ? "opacity-40" : "opacity-100"
      )}>
        हिंदी
      </span>
      <span className="mx-1 text-harvest-400">/</span>
      <span className={cn(
        "text-sm font-medium transition-opacity duration-200",
        language === "hindi" ? "opacity-40" : "opacity-100"
      )}>
        English
      </span>
    </button>
  );
};

export default LanguageToggle;
