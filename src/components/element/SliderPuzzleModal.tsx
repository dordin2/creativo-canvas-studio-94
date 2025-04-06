
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { DesignElement, useDesignState } from "@/context/DesignContext";
import { toast } from "sonner";
import { Check, X } from "lucide-react";

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
    }
  }, [config, isOpen]);
  
  if (!config) return null;
  
  const handleSliderChange = (value: number[], index: number) => {
    const newValues = [...sliderValues];
    newValues[index] = value[0];
    setSliderValues(newValues);
    
    // Reset the correctness status when user makes changes
    if (isCorrect !== null) {
      setIsCorrect(null);
    }
  };
  
  const handleCheck = () => {
    if (!config) return;
    
    // Check if the current values match the solution
    const isCorrectSolution = sliderValues.every((value, index) => value === config.solution[index]);
    setIsCorrect(isCorrectSolution);
    
    if (isCorrectSolution) {
      toast.success("Correct combination!");
    } else {
      toast.error("Incorrect combination. Try again!");
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
          <div className={`space-y-6 ${config.orientation === 'vertical' ? 'flex justify-center gap-8 h-64' : ''}`}>
            {sliderValues.map((value, index) => (
              <div key={index} className={`${config.orientation === 'vertical' ? 'h-full flex flex-col gap-2' : 'flex items-center gap-4'}`}>
                <span className="text-sm w-8 text-center">{value}</span>
                <div className={config.orientation === 'vertical' ? 'flex-1 flex justify-center' : 'flex-1'}>
                  <Slider
                    orientation={config.orientation}
                    value={[value]}
                    min={0}
                    max={config.maxValue}
                    step={1}
                    onValueChange={(newValue) => handleSliderChange(newValue, index)}
                    className={config.orientation === 'vertical' ? 'h-full' : 'w-full'}
                  />
                </div>
              </div>
            ))}
          </div>
          
          {isCorrect !== null && (
            <div className={`mt-4 p-2 rounded-lg text-center ${isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {isCorrect ? (
                <div className="flex items-center justify-center gap-2">
                  <Check size={16} />
                  <span>Correct combination!</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <X size={16} />
                  <span>Incorrect combination</span>
                </div>
              )}
            </div>
          )}
        </div>
        
        <DialogFooter className="sm:justify-between">
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button variant="secondary" onClick={handleCheck}>Check</Button>
          </div>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
