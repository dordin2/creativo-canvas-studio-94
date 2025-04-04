
import React, { useState } from "react";
import { DesignElement } from "@/types/designTypes";
import { CircleCheck, Layers } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import ClickSequencePuzzleModal from "./ClickSequencePuzzleModal";

interface ClickSequencePuzzleElementProps {
  element: DesignElement;
  onClick: (e: React.MouseEvent) => void;
}

const ClickSequencePuzzleElement: React.FC<ClickSequencePuzzleElementProps> = ({ element, onClick }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { language } = useLanguage();
  
  const handleClick = (e: React.MouseEvent) => {
    // Handle regular element click for selection
    onClick(e);
    
    // Then open the puzzle modal
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };
  
  const puzzleConfig = element.clickSequencePuzzleConfig || {
    name: language === 'en' ? 'Click Sequence Puzzle' : 'פאזל לחיצה לפי סדר',
    images: [],
    solution: [],
    maxAttempts: 3,
    currentProgress: 0,
    attempts: 0
  };
  
  return (
    <>
      <div 
        className={`flex flex-col items-center justify-center w-full h-full p-3 cursor-pointer ${language === 'he' ? 'rtl' : 'ltr'}`}
        onClick={handleClick}
      >
        <CircleCheck className="w-8 h-8 text-purple-700 mb-2" />
        <p className="text-sm font-medium text-center text-gray-700 line-clamp-2">
          {puzzleConfig.name}
        </p>
        <div className="text-xs text-gray-500 mt-1">
          {language === 'en' ? 'Click Sequence Puzzle' : 'פאזל לחיצה לפי סדר'}: {puzzleConfig.images.length} {language === 'en' ? 'images' : 'תמונות'}
        </div>
      </div>
      
      <ClickSequencePuzzleModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        element={element} 
      />
    </>
  );
};

export default ClickSequencePuzzleElement;
