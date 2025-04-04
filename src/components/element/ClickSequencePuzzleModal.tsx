
import React, { useState, useEffect } from "react";
import { DesignElement } from "@/types/designTypes";
import { useDesignState } from "@/context/DesignContext";
import { useLanguage } from "@/context/LanguageContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { MousePointer, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ClickSequencePuzzleModalProps {
  isOpen: boolean;
  onClose: () => void;
  element: DesignElement;
}

const ClickSequencePuzzleModal: React.FC<ClickSequencePuzzleModalProps> = ({ 
  isOpen, 
  onClose, 
  element 
}) => {
  const { updateElement } = useDesignState();
  const { t, language } = useLanguage();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [puzzleSolved, setPuzzleSolved] = useState(false);
  
  const config = element.clickSequencePuzzleConfig || {
    name: language === 'en' ? 'Click Sequence Puzzle' : 'פאזל לחיצה לפי סדר',
    images: [],
    solution: [],
    currentStep: 0
  };
  
  // Reset the puzzle state when opening the modal
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      setPuzzleSolved(false);
      
      // Reset the element's current step too
      updateElement(element.id, {
        clickSequencePuzzleConfig: {
          ...config,
          currentStep: 0
        }
      });
    }
  }, [isOpen, element.id, updateElement, config]);
  
  // Handle image click
  const handleImageClick = (imageIndex: number) => {
    // If puzzle is already solved, do nothing
    if (puzzleSolved) return;
    
    // Check if the clicked image is the next one in the solution sequence
    if (config.solution[currentStep] === imageIndex) {
      // Correct click
      const nextStep = currentStep + 1;
      
      // Update the current step
      setCurrentStep(nextStep);
      
      // Check if the puzzle is solved (all steps completed)
      if (nextStep >= config.solution.length) {
        setPuzzleSolved(true);
        console.log("Puzzle solved! Showing success toast.");
        toast.success(language === 'en' ? 'Great job! Puzzle solved correctly!' : 'כל הכבוד! הפאזל נפתר בהצלחה!', {
          duration: 3000
        });
      }
    } else {
      // Incorrect click - reset to the beginning
      setCurrentStep(0);
      console.log("Incorrect click - resetting to the beginning");
    }
  };
  
  // Handle closing the modal
  const handleClose = () => {
    // Reset puzzle state
    setCurrentStep(0);
    setPuzzleSolved(false);
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className={`sm:max-w-[500px] ${language === 'he' ? 'rtl' : 'ltr'}`}>
        <DialogHeader>
          <DialogTitle>{config.name}</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          {config.images.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {language === 'en' ? 'No images added to this puzzle yet.' : 'אין תמונות בפאזל זה עדיין.'}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                {config.images.map((imageUrl, index) => (
                  <div 
                    key={index}
                    className="relative aspect-square overflow-hidden border rounded-md cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => handleImageClick(index)}
                  >
                    <img 
                      src={imageUrl} 
                      alt={`Puzzle image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
              
              {/* Progress indicator */}
              <div className="mt-3 mb-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    {language === 'en' ? 'Progress:' : 'התקדמות:'} {currentStep}/{config.solution.length}
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full mt-1">
                  {config.solution.length > 0 && (
                    <div 
                      className="h-full bg-blue-500 rounded-full transition-all duration-300"
                      style={{ width: `${(currentStep / config.solution.length) * 100}%` }}
                    />
                  )}
                </div>
              </div>
              
              {/* Success message */}
              {puzzleSolved && (
                <Alert className="mt-4 bg-green-50 border-green-200">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <AlertDescription className="flex items-center gap-2 text-green-700 font-medium">
                    {language === 'en' ? 'Puzzle solved! Great job!' : 'הפאזל נפתר! כל הכבוד!'}
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}
        </div>
        
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleClose}>
            {t('puzzle.modal.close')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ClickSequencePuzzleModal;
