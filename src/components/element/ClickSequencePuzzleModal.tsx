
import React, { useState, useEffect } from "react";
import { DesignElement } from "@/types/designTypes";
import { useDesignState } from "@/context/DesignContext";
import { useLanguage } from "@/context/LanguageContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { MousePointer } from "lucide-react";

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
        toast.success(language === 'en' ? 'Great job! Puzzle solved correctly!' : 'כל הכבוד! הפאזל נפתר בהצלחה!');
      }
    } else {
      // Incorrect click - silently reset to the beginning
      setCurrentStep(0);
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
              
              {puzzleSolved && (
                <div className="p-3 bg-green-100 text-green-800 rounded-md text-center mt-4">
                  {language === 'en' ? 'Puzzle solved! Great job!' : 'הפאזל נפתר! כל הכבוד!'}
                </div>
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
