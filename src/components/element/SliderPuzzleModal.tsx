
import React, { useState, useEffect } from "react";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, SlidersHorizontal, CheckCircle } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { useLanguage } from "@/context/LanguageContext";
import { DesignElement } from "@/types/designTypes";

interface SliderPuzzleModalProps {
  isOpen: boolean;
  onClose: () => void;
  element: DesignElement;
  onPuzzleSolved?: () => void;
}

export const SliderPuzzleModal: React.FC<SliderPuzzleModalProps> = ({ 
  isOpen, 
  onClose, 
  element,
  onPuzzleSolved
}) => {
  const puzzleConfig = element.sliderPuzzleConfig;
  const [sliderValues, setSliderValues] = useState<number[]>([]);
  const [solved, setSolved] = useState(false);
  const { t, language } = useLanguage();
  
  useEffect(() => {
    if (isOpen && puzzleConfig) {
      // Initialize slider values with current values
      setSliderValues(puzzleConfig.currentValues || Array(puzzleConfig.sliderCount).fill(0));
      setSolved(false);
    }
  }, [isOpen, puzzleConfig]);
  
  useEffect(() => {
    if (!puzzleConfig || !puzzleConfig.solution || sliderValues.length === 0) return;
    
    // Check if the slider values match the solution
    const isSolved = sliderValues.every((value, index) => {
      return value === puzzleConfig.solution[index];
    });
    
    if (isSolved && !solved) {
      setSolved(true);
      toast.success(t('toast.success.puzzle'), {
        duration: 2000
      });
      
      // Call the onPuzzleSolved callback if provided
      if (onPuzzleSolved) {
        onPuzzleSolved();
      }
      
      // Close after delay
      setTimeout(() => {
        onClose();
      }, 2000);
    }
  }, [sliderValues, puzzleConfig, solved, onClose, t, onPuzzleSolved]);
  
  const handleSliderChange = (index: number, value: number[]) => {
    if (solved) return;
    
    setSliderValues(prev => {
      const newValues = [...prev];
      newValues[index] = value[0];
      return newValues;
    });
  };
  
  if (!puzzleConfig) {
    return null;
  }
  
  const isHorizontal = puzzleConfig.orientation === 'horizontal';
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose();
      }
    }}>
      <DialogContent className={`sm:max-w-md md:max-w-xl lg:max-w-3xl xl:max-w-4xl ${language === 'he' ? 'rtl' : 'ltr'}`}>
        <DialogHeader>
          <DialogTitle className="text-xl">{puzzleConfig.name || t('puzzle.slider.title')}</DialogTitle>
          <DialogDescription className="sr-only">
            {t('puzzle.slider.description')}
          </DialogDescription>
          <DialogClose asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-4 top-4"
              onClick={() => onClose()}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">{t('puzzle.modal.close')}</span>
            </Button>
          </DialogClose>
        </DialogHeader>
        
        <div className="py-6">
          <div className="flex justify-center mb-6">
            <div className="inline-flex p-2 rounded-full bg-muted">
              <SlidersHorizontal className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>
          
          <div className={`space-y-8 max-w-md mx-auto ${isHorizontal ? '' : 'flex items-center gap-8 space-y-0'}`}>
            {Array.from({ length: puzzleConfig.sliderCount }).map((_, index) => (
              <div key={index} className={`relative ${isHorizontal ? 'w-full' : 'h-40'}`}>
                <div className="flex items-center gap-4">
                  {isHorizontal ? (
                    <>
                      <Slider
                        value={[sliderValues[index] || 0]}
                        min={0}
                        max={puzzleConfig.maxValue}
                        step={1}
                        className="w-full"
                        onValueChange={(value) => handleSliderChange(index, value)}
                        disabled={solved}
                      />
                      <span className="w-8 text-center text-lg font-semibold">
                        {sliderValues[index] || 0}
                      </span>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-4 h-full">
                      <span className="text-lg font-semibold">
                        {sliderValues[index] || 0}
                      </span>
                      <Slider
                        value={[sliderValues[index] || 0]}
                        min={0}
                        max={puzzleConfig.maxValue}
                        step={1}
                        orientation="vertical"
                        className="h-40"
                        onValueChange={(value) => handleSliderChange(index, value)}
                        disabled={solved}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {solved && (
          <div className="flex items-center justify-center text-green-500 gap-2 pb-2">
            <CheckCircle className="h-5 w-5" />
            <span>{t('puzzle.modal.solved')}</span>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
