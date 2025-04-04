
import React, { useState } from "react";
import { DesignElement } from "@/types/designTypes";
import { MousePointerClick } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import ClickSequencePuzzleModal from "./ClickSequencePuzzleModal";

interface ClickSequencePuzzleElementProps {
  element: DesignElement;
  onClick: (e: React.MouseEvent) => void;
}

const ClickSequencePuzzleElement: React.FC<ClickSequencePuzzleElementProps> = ({ element, onClick }) => {
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
  
  const clickSequencePuzzleConfig = element.clickSequencePuzzleConfig || {
    name: language === 'en' ? 'Click Sequence Puzzle' : 'פאזל רצף קליקים',
    images: [],
    solution: [],
    clickedIndices: []
  };
  
  return (
    <>
      <div 
        className={`flex flex-col items-center justify-center w-full h-full p-3 cursor-pointer ${language === 'he' ? 'rtl' : 'ltr'}`}
        onClick={handleClick}
      >
        <MousePointerClick className="w-8 h-8 text-green-700 mb-2" />
        <p className="text-sm font-medium text-center text-gray-700 line-clamp-2">
          {clickSequencePuzzleConfig.name}
        </p>
        <div className="text-xs text-gray-500 mt-1">
          {language === 'en' ? 'Click Sequence Puzzle' : 'פאזל רצף קליקים'}: {clickSequencePuzzleConfig.images.length} {language === 'en' ? 'images' : 'תמונות'}
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
