
import React, { useState, useEffect } from "react";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, MousePointerClick, RotateCcw, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/context/LanguageContext";
import { DesignElement } from "@/types/designTypes";

interface ClickSequencePuzzleModalProps {
  isOpen: boolean;
  onClose: () => void;
  element: DesignElement;
  onPuzzleSolved?: () => void;
}

const ClickSequencePuzzleModal: React.FC<ClickSequencePuzzleModalProps> = ({ 
  isOpen, 
  onClose, 
  element,
  onPuzzleSolved
}) => {
  const puzzleConfig = element.clickSequencePuzzleConfig;
  const [clickedIndices, setClickedIndices] = useState<number[]>([]);
  const [solved, setSolved] = useState(false);
  const { t, language } = useLanguage();
  
  useEffect(() => {
    if (isOpen && puzzleConfig) {
      // Reset clicked indices when modal opens
      setClickedIndices([]);
      setSolved(false);
    }
  }, [isOpen, puzzleConfig]);
  
  useEffect(() => {
    if (!puzzleConfig || !puzzleConfig.solution) return;
    
    // Check if the click sequence is correct
    if (clickedIndices.length === puzzleConfig.solution.length) {
      const isCorrect = clickedIndices.every((index, i) => {
        return index === puzzleConfig.solution[i];
      });
      
      if (isCorrect && !solved) {
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
      } else if (!isCorrect) {
        // Reset if the sequence is incorrect
        toast.error(t('toast.error.puzzleWrong'), {
          duration: 1500
        });
        
        setTimeout(() => {
          setClickedIndices([]);
        }, 1000);
      }
    }
  }, [clickedIndices, puzzleConfig, solved, onClose, t, onPuzzleSolved]);
  
  const handleImageClick = (index: number) => {
    if (solved) return;
    
    setClickedIndices(prev => [...prev, index]);
  };
  
  const resetSequence = () => {
    setClickedIndices([]);
  };
  
  if (!puzzleConfig) {
    return null;
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose();
      }
    }}>
      <DialogContent className={`sm:max-w-md md:max-w-xl lg:max-w-3xl xl:max-w-4xl ${language === 'he' ? 'rtl' : 'ltr'}`}>
        <DialogHeader>
          <DialogTitle className="text-xl">{puzzleConfig.name || t('puzzle.clickSequence.title')}</DialogTitle>
          <DialogDescription className="sr-only">
            {t('puzzle.clickSequence.description')}
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
          {puzzleConfig.images.length > 0 ? (
            <>
              <div className="flex justify-center mb-4">
                <div className="inline-flex items-center gap-2">
                  <div className="p-2 rounded-full bg-muted">
                    <MousePointerClick className="h-5 w-5 text-muted-foreground" />
                  </div>
                  
                  {clickedIndices.length > 0 && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={resetSequence}
                      className="flex items-center gap-1"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      <span>{t('puzzle.clickSequence.reset')}</span>
                    </Button>
                  )}
                </div>
              </div>
              
              <div className="flex justify-center gap-4 flex-wrap">
                {puzzleConfig.images.map((imageUrl, index) => (
                  <div
                    key={index}
                    className={`
                      relative p-1 rounded border bg-white shadow-sm 
                      ${clickedIndices.includes(index) ? 'outline outline-2 outline-primary' : ''}
                      ${solved ? 'pointer-events-none' : 'cursor-pointer hover:brightness-90 active:scale-95'}
                      transition-all
                    `}
                    onClick={() => handleImageClick(index)}
                  >
                    <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 flex items-center justify-center overflow-hidden">
                      <img 
                        src={imageUrl} 
                        alt={`Puzzle piece ${index + 1}`} 
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                    
                    {clickedIndices.includes(index) && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-semibold">
                        {clickedIndices.findIndex(i => i === index) + 1}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500">
                {language === 'en' ? 'No images available for this puzzle.' : 'אין תמונות זמינות לפאזל זה.'}
              </p>
              <p className="text-sm mt-2">
                {language === 'en' ? 'Please add images in the puzzle properties.' : 'אנא הוסף תמונות במאפייני הפאזל.'}
              </p>
            </div>
          )}
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

export default ClickSequencePuzzleModal;
