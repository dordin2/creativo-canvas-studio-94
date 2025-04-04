
import React, { useState } from "react";
import { DesignElement } from "@/types/designTypes";
import { Lock } from "lucide-react";
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
  
  return (
    <>
      <div 
        className="flex flex-col items-center justify-center w-full h-full p-3 cursor-pointer"
        onClick={handleClick}
      >
        <Lock className="w-8 h-8 text-gray-700 mb-2" />
        <p className="text-sm font-medium text-center text-gray-700 line-clamp-2">
          {element.puzzleConfig?.name || "Puzzle"}
        </p>
        <div className="text-xs text-gray-500 mt-1">
          {element.puzzleConfig?.placeholders || 3} placeholders
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
