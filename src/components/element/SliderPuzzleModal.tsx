
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { DesignElement, useDesignState } from "@/context/DesignContext";
import { toast } from "sonner";
import { Check } from "lucide-react";

interface SliderPuzzleModalProps {
  element: DesignElement;
  isOpen: boolean;
  onClose: () => void;
}

export const SliderPuzzleModal: React.FC<SliderPuzzleModalProps> = ({ element, isOpen, onClose }) => {
  const { updateElementWithoutHistory, commitToHistory } = useDesignState();
  const config = element.sliderPuzzleConfig;
  
  const [sliderValues, setSliderValues] = useState<number[]>([]);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  
  useEffect(() => {
    if (config) {
      setSliderValues([...config.currentValues]);
      setIsCorrect(null); // Reset correctness status when modal opens
    }
  }, [config, isOpen]);
  
  if (!config) return null;
  
  const handleSliderChange = (value: number[], index: number) => {
    const newValues = [...sliderValues];
    newValues[index] = value[0];
    setSliderValues(newValues);
    
    // Automatically check if the solution is correct
    const isCorrectSolution = newValues.every((val, idx) => val === config.solution[idx]);
    setIsCorrect(isCorrectSolution);
    
    if (isCorrectSolution && isCorrect === false) {
      // Only show success toast when transitioning from incorrect to correct
      toast.success("Correct combination!");
    }
  };
  
  const handleSave = () => {
    if (!config) return;
    
    updateElementWithoutHistory(element.id, {
      sliderPuzzleConfig: {
        ...config,
        currentValues: sliderValues
      }
    });
    
    commitToHistory();
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{config.name}</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <div className={`space-y-6 ${config.orientation === 'vertical' ? 'flex justify-around' : ''}`}>
            {sliderValues.map((value, index) => (
              <div 
                key={index} 
                className={`
                  ${config.orientation === 'horizontal' ? 'flex items-center gap-4' : 'flex flex-col items-center gap-4 h-64'}
                `}
              >
                <span className="text-sm w-8 text-center">{value}</span>
                <div className={config.orientation === 'horizontal' ? 'flex-1' : 'h-full'}>
                  <Slider
                    value={[value]}
                    min={0}
                    max={config.maxValue}
                    step={1}
                    onValueChange={(newValue) => handleSliderChange(newValue, index)}
                    className={config.orientation === 'vertical' ? 'h-full flex-col' : 'w-full'}
                    orientation={config.orientation}
                  />
                </div>
              </div>
            ))}
          </div>
          
          {isCorrect === true && (
            <div className="mt-4 p-2 rounded-lg text-center bg-green-100 text-green-800">
              <div className="flex items-center justify-center gap-2">
                <Check size={16} />
                <span>Correct combination!</span>
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter className="sm:justify-between">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
