
import React, { useState } from "react";
import { DesignElement } from "@/types/designTypes";
import { Lock, Hash, AlphabetLatin } from "lucide-react";
import PuzzleModal from "./PuzzleModal";

interface PuzzleElementProps {
  element: DesignElement;
  onClick: (e: React.MouseEvent) => void;
}

const PuzzleElement: React.FC<PuzzleElementProps> = ({ element, onClick }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
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
  
  const getPuzzleIcon = () => {
    switch(puzzleType) {
      case 'image':
        return <Lock className="w-8 h-8 text-gray-700 mb-2" />;
      case 'number':
        return <Hash className="w-8 h-8 text-gray-700 mb-2" />;
      case 'alphabet':
        return <AlphabetLatin className="w-8 h-8 text-gray-700 mb-2" />;
      default:
        return <Lock className="w-8 h-8 text-gray-700 mb-2" />;
    }
  };
  
  const getPuzzleLabel = () => {
    switch(puzzleType) {
      case 'image':
        return 'Image Puzzle';
      case 'number':
        return 'Number Lock';
      case 'alphabet':
        return 'Alphabet Lock';
      default:
        return 'Puzzle';
    }
  };
  
  const getPlaceholderLabel = () => {
    switch(puzzleType) {
      case 'image':
        return 'placeholders';
      case 'number':
        return 'digits';
      case 'alphabet':
        return 'letters';
      default:
        return 'placeholders';
    }
  };
  
  return (
    <>
      <div 
        className="flex flex-col items-center justify-center w-full h-full p-3 cursor-pointer"
        onClick={handleClick}
      >
        {getPuzzleIcon()}
        <p className="text-sm font-medium text-center text-gray-700 line-clamp-2">
          {element.puzzleConfig?.name || "Puzzle"}
        </p>
        <div className="text-xs text-gray-500 mt-1">
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
