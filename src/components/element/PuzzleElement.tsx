
import React, { useState } from "react";
import { DesignElement } from "@/types/designTypes";
import { Lock, Hash, LetterCase } from "lucide-react";
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
  
  // Function to get the appropriate icon based on puzzle type
  const getPuzzleIcon = () => {
    switch(puzzleType) {
      case 'image':
        return <Lock className="w-8 h-8 text-gray-700 mb-2" />;
      case 'number':
        return <Hash className="w-8 h-8 text-gray-700 mb-2" />;
      case 'english':
      case 'hebrew':
        return <LetterCase className="w-8 h-8 text-gray-700 mb-2" />;
      default:
        return <Lock className="w-8 h-8 text-gray-700 mb-2" />;
    }
  };
  
  // Function to get the puzzle type display name
  const getPuzzleTypeName = () => {
    switch(puzzleType) {
      case 'image': return 'Image Puzzle';
      case 'number': return 'Number Lock';
      case 'english': return 'English Letters';
      case 'hebrew': return 'Hebrew Letters';
      default: return 'Puzzle';
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
          {getPuzzleTypeName()}: {element.puzzleConfig?.placeholders || 3} {puzzleType === 'image' ? 'placeholders' : 'characters'}
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
