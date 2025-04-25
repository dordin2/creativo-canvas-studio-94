
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
import { Check } from "lucide-react";
import { toast } from "sonner";

interface PuzzleModalProps {
  isOpen: boolean;
  onClose: () => void;
  element: DesignElement;
}

const PuzzleModal = ({
  isOpen,
  onClose,
  element,
}: PuzzleModalProps) => {
  const [open, setOpen] = useState(isOpen);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [isPuzzleSolved, setIsPuzzleSolved] = useState(false);
  
  const puzzleConfig = element.puzzleConfig || element.interaction?.puzzleConfig;
  
  useEffect(() => {
    setOpen(isOpen);
  }, [isOpen]);
  
  useEffect(() => {
    if (open) {
      setSelectedItems([]);
      setIsPuzzleSolved(false);
    }
  }, [open]);
  
  if (!puzzleConfig) {
    return null;
  }
  
  const { name, type, placeholders = 3, images = [], solution = [] } = puzzleConfig;
  
  const handleItemClick = (index: number) => {
    // If puzzle already solved, do nothing
    if (isPuzzleSolved) return;
    
    // Toggle selection
    const isSelected = selectedItems.includes(index);
    if (isSelected) {
      setSelectedItems(selectedItems.filter(i => i !== index));
    } else {
      setSelectedItems([...selectedItems, index]);
    }
  };
  
  const checkSolution = () => {
    // Check if selected items match the solution
    if (solution.length === 0) {
      // No solution defined, so any selection is valid
      toast.success("Puzzle completed!");
      setIsPuzzleSolved(true);
      return;
    }
    
    // Check if all selected items are in the solution
    const allSelected = selectedItems.every(item => solution.includes(item));
    
    // Check if all solution items are selected
    const allSolutionSelected = solution.every(solutionItem => 
      selectedItems.includes(solutionItem)
    );
    
    if (allSelected && allSolutionSelected) {
      toast.success("Puzzle solved correctly!");
      setIsPuzzleSolved(true);
    } else {
      toast.error("Incorrect solution. Try again!");
    }
  };
  
  const handleClose = () => {
    setOpen(false);
    onClose();
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md" onInteractOutside={handleClose}>
        <DialogHeader>
          <DialogTitle>{name || "Puzzle"}</DialogTitle>
          <DialogDescription>
            Select the correct items to solve the puzzle
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-wrap justify-center gap-4 py-4">
          {Array.from({ length: placeholders }).map((_, index) => {
            const image = images[index];
            const isSelected = selectedItems.includes(index);
            const isCorrect = isPuzzleSolved && solution.includes(index);
            
            return (
              <div 
                key={index} 
                className={`
                  w-16 h-16 border-2 
                  ${isSelected 
                    ? (isPuzzleSolved 
                      ? (isCorrect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50') 
                      : 'border-blue-500 bg-blue-50') 
                    : 'border-gray-300'} 
                  rounded-md flex items-center justify-center cursor-pointer relative
                  ${isPuzzleSolved ? 'pointer-events-none' : ''}
                `}
                onClick={() => handleItemClick(index)}
              >
                {type === 'image' && image ? (
                  <img 
                    src={image} 
                    alt={`Puzzle piece ${index}`}
                    className="max-w-full max-h-full object-contain"
                  />
                ) : type === 'number' ? (
                  <span className={`text-lg font-medium ${isSelected ? 'text-blue-700' : 'text-gray-700'}`}>
                    {index + 1}
                  </span>
                ) : type === 'alphabet' ? (
                  <span className={`text-lg font-medium ${isSelected ? 'text-blue-700' : 'text-gray-700'}`}>
                    {String.fromCharCode(65 + index)}
                  </span>
                ) : null}
                
                {isSelected && isPuzzleSolved && isCorrect && (
                  <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-0.5">
                    <Check size={14} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        <DialogFooter className="flex justify-between">
          {!isPuzzleSolved && (
            <Button onClick={checkSolution} disabled={selectedItems.length === 0}>
              Check Solution
            </Button>
          )}
          <Button onClick={handleClose}>
            {isPuzzleSolved ? 'Close' : 'Cancel'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PuzzleModal;
