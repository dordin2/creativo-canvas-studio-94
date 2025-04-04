
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { DesignElement } from "@/types/designTypes";

interface PuzzleModalProps {
  isOpen: boolean;
  onClose: () => void;
  element: DesignElement;
}

const PuzzleModal: React.FC<PuzzleModalProps> = ({ isOpen, onClose, element }) => {
  const [currentStates, setCurrentStates] = useState<number[]>([]);
  const [solved, setSolved] = useState(false);
  
  const puzzleConfig = element.puzzleConfig || {
    name: 'Puzzle',
    placeholders: 3,
    images: [],
    solution: []
  };
  
  // Initialize current states when modal opens or puzzle changes
  useEffect(() => {
    if (isOpen) {
      // Reset to initial state (all placeholders at image 0)
      setCurrentStates(Array(puzzleConfig.placeholders).fill(0));
      setSolved(false);
    }
  }, [isOpen, puzzleConfig.placeholders]);
  
  // Check if the puzzle is solved
  useEffect(() => {
    if (puzzleConfig.images.length === 0 || currentStates.length === 0) return;
    
    const isSolved = currentStates.every((state, index) => {
      return state === puzzleConfig.solution[index];
    });
    
    if (isSolved && !solved && isOpen) {
      setSolved(true);
      // Show success message
      toast.success("Great job! Puzzle solved correctly!", {
        duration: 2000 // 2 seconds duration
      });
      
      // Close after delay
      setTimeout(() => {
        onClose();
      }, 2000);
    }
  }, [currentStates, puzzleConfig.solution, solved, isOpen, onClose]);
  
  const cyclePlaceholder = (index: number, direction: 'next' | 'prev') => {
    if (puzzleConfig.images.length === 0) return;
    
    setCurrentStates(prev => {
      const newStates = [...prev];
      if (direction === 'next') {
        newStates[index] = (newStates[index] + 1) % puzzleConfig.images.length;
      } else {
        newStates[index] = (newStates[index] - 1 + puzzleConfig.images.length) % puzzleConfig.images.length;
      }
      return newStates;
    });
  };
  
  if (!isOpen) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md md:max-w-xl lg:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">{puzzleConfig.name}</DialogTitle>
          <DialogClose asChild>
            <Button variant="ghost" size="icon" className="absolute right-4 top-4">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </DialogClose>
        </DialogHeader>
        
        <div className="py-6">
          {puzzleConfig.images.length > 0 ? (
            <div className="flex flex-wrap justify-center gap-8">
              {Array.from({ length: puzzleConfig.placeholders }).map((_, idx) => (
                <div key={idx} className="relative flex items-center justify-center">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute left-0 z-10"
                    onClick={() => cyclePlaceholder(idx, 'prev')}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  
                  <div className="relative w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 border rounded overflow-hidden">
                    <img 
                      src={puzzleConfig.images[currentStates[idx]]} 
                      alt={`Placeholder ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs text-center py-1">
                      Placeholder {idx + 1}
                    </div>
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute right-0 z-10"
                    onClick={() => cyclePlaceholder(idx, 'next')}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500">No images available for this puzzle.</p>
              <p className="text-sm mt-2">Please add images in the puzzle properties.</p>
            </div>
          )}
        </div>
        
        {solved && (
          <div className="flex items-center justify-center text-green-500 gap-2 pb-2">
            <CheckCircle className="h-5 w-5" />
            <span>Puzzle solved! Great job!</span>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PuzzleModal;
