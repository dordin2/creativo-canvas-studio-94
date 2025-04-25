
import { useState, useEffect } from "react";
import { DesignElement } from "@/types/designTypes";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight, RotateCcw } from "lucide-react";
import { toast } from "sonner";

interface SequencePuzzleModalProps {
  isOpen: boolean;
  onClose: () => void;
  element: DesignElement;
}

const SequencePuzzleModal = ({
  isOpen,
  onClose,
  element,
}: SequencePuzzleModalProps) => {
  const [open, setOpen] = useState(isOpen);
  const [currentOrder, setCurrentOrder] = useState<number[]>([]);
  const [isPuzzleSolved, setIsPuzzleSolved] = useState(false);
  
  const puzzleConfig = element.sequencePuzzleConfig || element.interaction?.sequencePuzzleConfig;
  
  useEffect(() => {
    setOpen(isOpen);
  }, [isOpen]);
  
  useEffect(() => {
    if (puzzleConfig && open) {
      // Start with empty sequence
      setCurrentOrder([]);
      setIsPuzzleSolved(false);
    }
  }, [open, puzzleConfig]);
  
  if (!puzzleConfig) {
    return null;
  }
  
  const { name, images = [], solution = [] } = puzzleConfig;
  
  const handleItemClick = (index: number) => {
    // If puzzle already solved or item already selected, do nothing
    if (isPuzzleSolved || currentOrder.includes(index)) return;
    
    // Add the item to the sequence
    setCurrentOrder([...currentOrder, index]);
  };
  
  const checkSolution = () => {
    // Need at least one item selected to check
    if (currentOrder.length === 0) return;
    
    // Check if current order matches the solution
    if (solution.length === 0) {
      // No solution defined, so any selection is valid
      toast.success("Puzzle completed!");
      setIsPuzzleSolved(true);
      return;
    }
    
    // Compare arrays
    const isCorrect = currentOrder.length === solution.length && 
      currentOrder.every((value, index) => value === solution[index]);
    
    if (isCorrect) {
      toast.success("Sequence correct!");
      setIsPuzzleSolved(true);
    } else {
      toast.error("Incorrect sequence. Try again!");
      // Reset sequence on wrong answer
      setCurrentOrder([]);
    }
  };
  
  const resetSequence = () => {
    setCurrentOrder([]);
  };
  
  const handleClose = () => {
    setOpen(false);
    onClose();
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-lg" onInteractOutside={handleClose}>
        <DialogHeader>
          <DialogTitle>{name || "Sequence Puzzle"}</DialogTitle>
          <DialogDescription>
            {isPuzzleSolved 
              ? "Correct sequence! You've solved the puzzle." 
              : "Click the items in the correct sequence"}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Current sequence display */}
          <div className="flex flex-wrap items-center justify-center gap-2 min-h-[60px] p-4 border-2 border-dashed border-gray-300 rounded-md">
            {currentOrder.length === 0 ? (
              <span className="text-gray-400">Click items to create a sequence</span>
            ) : (
              currentOrder.map((itemIndex, sequenceIndex) => (
                <div key={`seq-${sequenceIndex}`} className="flex items-center">
                  <div className="w-10 h-10 border border-blue-400 rounded-md flex items-center justify-center bg-blue-50 relative">
                    <img 
                      src={images[itemIndex]} 
                      alt={`Sequence item ${itemIndex}`}
                      className="max-w-full max-h-full object-contain"
                    />
                    <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {sequenceIndex + 1}
                    </div>
                  </div>
                  {sequenceIndex < currentOrder.length - 1 && (
                    <ArrowRight className="mx-1 text-gray-400" size={16} />
                  )}
                </div>
              ))
            )}
          </div>
          
          {/* Available items to click */}
          <div className="flex flex-wrap justify-center gap-3">
            {images.map((image, index) => {
              const isSelected = currentOrder.includes(index);
              
              return (
                <div 
                  key={index} 
                  className={`
                    w-16 h-16 border-2 
                    ${isSelected ? 'border-blue-500 bg-blue-50 opacity-50' : 'border-gray-300'} 
                    rounded-md flex items-center justify-center 
                    ${!isSelected && !isPuzzleSolved ? 'cursor-pointer hover:border-blue-300' : 'cursor-default'}
                    ${isPuzzleSolved ? 'pointer-events-none' : ''}
                  `}
                  onClick={() => !isSelected && handleItemClick(index)}
                >
                  <img 
                    src={image} 
                    alt={`Sequence item ${index}`}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              );
            })}
          </div>
        </div>
        
        <DialogFooter className="flex justify-between">
          {!isPuzzleSolved && (
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={resetSequence} 
                disabled={currentOrder.length === 0}
              >
                <RotateCcw size={16} className="mr-1" />
                Reset
              </Button>
              <Button 
                onClick={checkSolution} 
                disabled={currentOrder.length === 0}
              >
                <Check size={16} className="mr-1" />
                Check
              </Button>
            </div>
          )}
          <Button onClick={handleClose}>
            {isPuzzleSolved ? 'Close' : 'Cancel'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SequencePuzzleModal;
