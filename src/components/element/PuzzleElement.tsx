
import React, { useState } from "react";
import { DesignElement } from "@/types/designTypes";
import { Lock, Hash, Languages, Code } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import PuzzleModal from "./PuzzleModal";

interface PuzzleElementProps {
  element: DesignElement;
  onClick: (e: React.MouseEvent) => void;
}

const PuzzleElement: React.FC<PuzzleElementProps> = ({ element, onClick }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { t, language } = useLanguage();
  
  const handleClick = (e: React.MouseEvent) => {
    // Handle regular element click for selection
    onClick(e);
    
    // Then open the puzzle modal
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };
  
  const puzzleType = element.puzzleConfig?.type || 'image';
  const puzzleCategory = element.puzzleConfig?.category || 'general';
  
  const getPuzzleIcon = () => {
    if (puzzleCategory === 'coding') {
      return <Code className="w-8 h-8 text-indigo-600 mb-2" />;
    }
    
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
    if (puzzleCategory === 'coding') {
      return language === 'en' ? 'Coding Puzzle' : 'פאזל קודנים';
    }
    
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
    <>
      <div 
        className={`flex flex-col items-center justify-center w-full h-full p-3 cursor-pointer ${language === 'he' ? 'rtl' : 'ltr'} ${puzzleCategory === 'coding' ? 'bg-indigo-50' : ''}`}
        onClick={handleClick}
      >
        {getPuzzleIcon()}
        <p className={`text-sm font-medium text-center line-clamp-2 ${puzzleCategory === 'coding' ? 'text-indigo-700' : 'text-gray-700'}`}>
          {element.puzzleConfig?.name || (language === 'en' ? "Puzzle" : "פאזל")}
        </p>
        <div className={`text-xs mt-1 ${puzzleCategory === 'coding' ? 'text-indigo-500' : 'text-gray-500'}`}>
          {getPuzzleLabel()}: {element.puzzleConfig?.placeholders || 3} {getPlaceholderLabel()}
        </div>
      </div>
      
      <PuzzleModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        element={element} 
      />
    </>
  );
};

export default PuzzleElement;
