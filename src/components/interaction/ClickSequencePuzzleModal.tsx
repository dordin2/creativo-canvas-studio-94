
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
import { toast } from "sonner";

interface ClickSequencePuzzleModalProps {
  isOpen: boolean;
  onClose: () => void;
  element: DesignElement;
}

const ClickSequencePuzzleModal = ({
  isOpen,
  onClose,
  element,
}: ClickSequencePuzzleModalProps) => {
  const [open, setOpen] = useState(isOpen);
  const [clickedIndices, setClickedIndices] = useState<number[]>([]);
  const [isPuzzleSolved, setIsPuzzleSolved] = useState(false);
  
  const puzzleConfig = element.clickSequencePuzzleConfig || element.interaction?.clickSequencePuzzleConfig;
  
  useEffect(() => {
    setOpen(isOpen);
  }, [isOpen]);
  
  useEffect(() => {
    if (puzzleConfig && open) {
      // Initialize with empty clicked indices
      setClickedIndices([]);
      setIsPuzzleSolved(false);
    }
  }, [open, puzzleConfig]);
  
  if (!puzzleConfig) {
    return null;
  }
  
  const { name, images = [], solution = [] } = puzzleConfig;
  
  const handleItemClick = (index: number) => {
    // If puzzle already solved, do nothing
    if (isPuzzleSolved) return;
    
    // If already clicked, update click order
    const existingIndex = clickedIndices.indexOf(index);
    
    if (existingIndex >= 0) {
      // Remove this item and all items clicked after it
      const newClickedIndices = clickedIndices.slice(0, existingIndex);
      setClickedIndices(newClickedIndices);
    } else {
      // Add to clicked indices
      setClickedIndices([...clickedIndices, index]);
    }
  };
  
  const checkSolution = () => {
    // Check if clicked items match the solution
    if (solution.length === 0) {
      // No solution defined, so any selection is valid
      toast.success("Puzzle completed!");
      setIsPuzzleSolved(true);
      return;
    }
    
    // Compare arrays
    const isCorrect = clickedIndices.length === solution.length && 
      clickedIndices.every((value, index) => value === solution[index]);
    
    if (isCorrect) {
      toast.success("Correct sequence!");
      setIsPuzzleSolved(true);
    } else {
      toast.error("Incorrect sequence. Try again!");
      setClickedIndices([]);
    }
  };
  
  const resetClicks = () => {
    setClickedIndices([]);
  };
  
  const handleClose = () => {
    setOpen(false);
    onClose();
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-lg" onInteractOutside={handleClose}>
        <DialogHeader>
          <DialogTitle>{name || "Click Sequence Puzzle"}</DialogTitle>
          <DialogDescription>
            {isPuzzleSolved 
              ? "Correct sequence! You've solved the puzzle." 
              : "Click the items in the correct sequence"
            }
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-wrap justify-center gap-4 py-4">
          {images.map((image, index) => {
            const clickOrder = clickedIndices.indexOf(index);
            const isClicked = clickOrder !== -1;
            
            return (
              <div 
                key={index} 
                className={`
                  w-16 h-16 border-2 
                  ${isClicked 
                    ? (isPuzzleSolved 
                      ? (solution.indexOf(index) === clickOrder ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50') 
                      : 'border-green-500 bg-green-50') 
                    : 'border-gray-300'} 
                  rounded-md flex items-center justify-center cursor-pointer relative
                  ${isPuzzleSolved ? 'pointer-events-none' : ''}
                `}
                onClick={() => handleItemClick(index)}
              >
                <img 
                  src={image} 
                  alt={`Click item ${index}`}
                  className="max-w-full max-h-full object-contain"
                />
                
                {isClicked && (
                  <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {clickOrder + 1}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        <DialogFooter className="flex justify-between">
          {!isPuzzleSolved && (
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={resetClicks} 
                disabled={clickedIndices.length === 0}
              >
                Reset
              </Button>
              <Button 
                onClick={checkSolution} 
                disabled={clickedIndices.length === 0}
              >
                Check Solution
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

export default ClickSequencePuzzleModal;
