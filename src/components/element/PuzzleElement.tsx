
import React from "react";
import { DesignElement } from "@/types/designTypes";
import { Lock, Hash, Languages } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface PuzzleElementProps {
  element: DesignElement;
  onClick: (e: React.MouseEvent) => void;
}

const PuzzleElement: React.FC<PuzzleElementProps> = ({ element, onClick }) => {
  const { language } = useLanguage();
  
  const handleClick = (e: React.MouseEvent) => {
    // Handle regular element click for selection
    onClick(e);
  };
  
  const puzzleType = element.puzzleConfig?.type || 'image';
  
  const getPuzzleIcon = () => {
    switch(puzzleType) {
      case 'image':
        return <Lock className="w-8 h-8 text-gray-700 mb-2" />;
      case 'number':
        return <Hash className="w-8 h-8 text-gray-700 mb-2" />;
      case 'alphabet':
        return <Languages className="w-8 h-8 text-gray-700 mb-2" />;
      default:
        return <Lock className="w-8 h-8 text-gray-700 mb-2" />;
    }
  };
  
  const getPuzzleLabel = () => {
    switch(puzzleType) {
      case 'image':
        return language === 'en' ? 'Image Puzzle' : 'פאזל תמונה';
      case 'number':
        return language === 'en' ? 'Number Lock' : 'מנעול מספרים';
      case 'alphabet':
        return language === 'en' ? 'Alphabet Lock' : 'מנעול אותיות';
      default:
        return language === 'en' ? 'Puzzle' : 'פאזל';
    }
  };
  
  const getPlaceholderLabel = () => {
    switch(puzzleType) {
      case 'image':
        return language === 'en' ? 'placeholders' : 'מיקומים';
      case 'number':
        return language === 'en' ? 'digits' : 'ספרות';
      case 'alphabet':
        return language === 'en' ? 'letters' : 'אותיות';
      default:
        return language === 'en' ? 'placeholders' : 'מיקומים';
    }
  };
  
  return (
    <div 
      className={`flex flex-col items-center justify-center w-full h-full p-3 cursor-pointer ${language === 'he' ? 'rtl' : 'ltr'}`}
      onClick={handleClick}
    >
      {getPuzzleIcon()}
      <p className="text-sm font-medium text-center text-gray-700 line-clamp-2">
        {element.puzzleConfig?.name || (language === 'en' ? "Puzzle" : "פאזל")}
      </p>
      <div className="text-xs text-gray-500 mt-1">
        {getPuzzleLabel()}: {element.puzzleConfig?.placeholders || 3} {getPlaceholderLabel()}
      </div>
    </div>
  );
};

export default PuzzleElement;
