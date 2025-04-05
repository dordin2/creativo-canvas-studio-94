
import React, { useState } from "react";
import { DesignElement } from "@/types/designTypes";
import { MoveHorizontal } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import SequencePuzzleModal from "./SequencePuzzleModal";

interface SequencePuzzleElementProps {
  element: DesignElement;
  onClick: (e: React.MouseEvent) => void;
}

const SequencePuzzleElement: React.FC<SequencePuzzleElementProps> = ({ element, onClick }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { t, language } = useLanguage();
  
  const handleClick = (e: React.MouseEvent) => {
    // Call the parent onClick handler for selection
    onClick(e);
    
    // Open the puzzle modal
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };
  
  const sequencePuzzleConfig = element.sequencePuzzleConfig || {
    name: language === 'en' ? 'Sequence Puzzle' : 'פאזל רצף',
    images: [],
    solution: [],
    currentOrder: []
  };
  
  return (
    <>
      <div 
        className={`flex flex-col items-center justify-center w-full h-full p-3 cursor-pointer ${language === 'he' ? 'rtl' : 'ltr'}`}
        onClick={handleClick}
      >
        <MoveHorizontal className="w-8 h-8 text-blue-700 mb-2" />
        <p className="text-sm font-medium text-center text-gray-700 line-clamp-2">
          {sequencePuzzleConfig.name}
        </p>
        <div className="text-xs text-gray-500 mt-1">
          {language === 'en' ? 'Sequence Puzzle' : 'פאזל רצף'}: {sequencePuzzleConfig.images.length} {language === 'en' ? 'images' : 'תמונות'}
        </div>
      </div>
      
      <SequencePuzzleModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        element={element} 
      />
    </>
  );
};

export default SequencePuzzleElement;
