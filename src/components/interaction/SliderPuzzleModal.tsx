
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
import { Slider } from "@/components/ui/slider";

interface SliderPuzzleModalProps {
  isOpen: boolean;
  onClose: () => void;
  element: DesignElement;
}

export const SliderPuzzleModal = ({
  isOpen,
  onClose,
  element,
}: SliderPuzzleModalProps) => {
  const [open, setOpen] = useState(isOpen);
  const [currentValues, setCurrentValues] = useState<number[]>([]);
  const [isPuzzleSolved, setIsPuzzleSolved] = useState(false);
  
  const puzzleConfig = element.sliderPuzzleConfig || element.interaction?.sliderPuzzleConfig;
  
  useEffect(() => {
    setOpen(isOpen);
  }, [isOpen]);
  
  useEffect(() => {
    if (puzzleConfig && open) {
      // Initialize slider values
      setCurrentValues(puzzleConfig.currentValues || Array(puzzleConfig.sliderCount || 3).fill(0));
      setIsPuzzleSolved(false);
    }
  }, [open, puzzleConfig]);
  
  if (!puzzleConfig) {
    return null;
  }
  
  const { 
    name, 
    orientation = 'horizontal', 
    sliderCount = 3, 
    maxValue = 10,
    solution = [] 
  } = puzzleConfig;
  
  const handleSliderChange = (index: number, values: number[]) => {
    if (isPuzzleSolved) return;
    
    const newValues = [...currentValues];
    newValues[index] = values[0];
    setCurrentValues(newValues);
  };
  
  const checkSolution = () => {
    // Check if current values match the solution
    if (solution.length === 0) {
      // No solution defined, so any selection is valid
      toast.success("Puzzle completed!");
      setIsPuzzleSolved(true);
      return;
    }
    
    // Compare arrays
    const isCorrect = currentValues.length === solution.length && 
      currentValues.every((value, index) => value === solution[index]);
    
    if (isCorrect) {
      toast.success("Correct combination!");
      setIsPuzzleSolved(true);
    } else {
      toast.error("Incorrect combination. Try again!");
    }
  };
  
  const resetSliders = () => {
    setCurrentValues(Array(sliderCount).fill(0));
  };
  
  const handleClose = () => {
    setOpen(false);
    onClose();
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md" onInteractOutside={handleClose}>
        <DialogHeader>
          <DialogTitle>{name || "Slider Puzzle"}</DialogTitle>
          <DialogDescription>
            {isPuzzleSolved 
              ? "Correct combination! You've solved the puzzle." 
              : "Adjust the sliders to find the correct combination"
            }
          </DialogDescription>
        </DialogHeader>
        
        <div className={`space-y-8 py-4 ${isPuzzleSolved ? 'pointer-events-none' : ''}`}>
          {Array.from({ length: sliderCount }).map((_, index) => {
            return (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Slider {index + 1}</span>
                  <span className={`font-mono text-sm px-2 py-0.5 rounded-md ${
                    isPuzzleSolved ? 
                      (currentValues[index] === solution[index] ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700') : 
                      'bg-blue-100 text-blue-700'
                  }`}>
                    {currentValues[index] || 0}
                  </span>
                </div>
                
                <Slider
                  defaultValue={[currentValues[index] || 0]}
                  max={maxValue}
                  step={1}
                  onValueChange={(values) => handleSliderChange(index, values)}
                  className={`${
                    orientation === 'vertical' ? 'h-52' : ''
                  } ${
                    isPuzzleSolved ? 
                      (currentValues[index] === solution[index] ? 'bg-green-100' : 'bg-red-100') : 
                      ''
                  }`}
                  orientation={orientation}
                />
              </div>
            );
          })}
        </div>
        
        <DialogFooter className="flex justify-between">
          {!isPuzzleSolved && (
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={resetSliders}
              >
                Reset
              </Button>
              <Button onClick={checkSolution}>
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
