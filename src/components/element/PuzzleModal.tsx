
import React, { useState, useEffect } from "react";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/context/LanguageContext";
import { DesignElement, PuzzleType } from "@/types/designTypes";

interface PuzzleModalProps {
  isOpen: boolean;
  onClose: () => void;
  element: DesignElement;
}

const PuzzleModal: React.FC<PuzzleModalProps> = ({ isOpen, onClose, element }) => {
  const [currentStates, setCurrentStates] = useState<number[]>([]);
  const [solved, setSolved] = useState(false);
  const { t, language } = useLanguage();
  
  const puzzleConfig = element.puzzleConfig || {
    name: language === 'en' ? 'Puzzle' : 'פאזל',
    type: 'image' as PuzzleType,
    placeholders: 3,
    images: [],
    solution: [],
    maxNumber: 9,
    maxLetter: 'Z'
  };
  
  const puzzleType = puzzleConfig.type || 'image';
  
  // Initialize current states when modal opens or puzzle changes
  useEffect(() => {
    if (isOpen) {
      // Reset to initial state (all placeholders at image 0 or number 0)
      setCurrentStates(Array(puzzleConfig.placeholders).fill(0));
      setSolved(false);
    }
  }, [isOpen, puzzleConfig.placeholders]);
  
  // Check if the puzzle is solved
  useEffect(() => {
    if (currentStates.length === 0) return;
    
    const isSolved = currentStates.every((state, index) => {
      return state === puzzleConfig.solution[index];
    });
    
    if (isSolved && !solved && isOpen) {
      setSolved(true);
      // Show success message
      toast.success(t('toast.success.puzzle'), {
        duration: 2000 // 2 seconds duration
      });
      
      // Close after delay
      setTimeout(() => {
        onClose();
      }, 2000);
    }
  }, [currentStates, puzzleConfig.solution, solved, isOpen, onClose, t]);
  
  const cyclePlaceholder = (index: number) => {
    if (puzzleType === 'image' && puzzleConfig.images.length === 0) return;
    
    setCurrentStates(prev => {
      const newStates = [...prev];
      if (puzzleType === 'image') {
        // Only cycle forward, looping back to the first image
        newStates[index] = (newStates[index] + 1) % puzzleConfig.images.length;
      } else if (puzzleType === 'number') {
        // For number puzzles, cycle through numbers 0-9 or up to maxNumber
        const maxNum = puzzleConfig.maxNumber || 9;
        newStates[index] = (newStates[index] + 1) % (maxNum + 1);
      } else if (puzzleType === 'alphabet') {
        // For alphabet puzzles, cycle through A-Z or up to maxLetter
        const maxLetterCode = (puzzleConfig.maxLetter?.charCodeAt(0) || 90) - 65; // 'Z' is 90, 'A' is 65
        newStates[index] = (newStates[index] + 1) % (maxLetterCode + 1);
      }
      return newStates;
    });
  };
  
  const getDisplayValue = (state: number, type: PuzzleType) => {
    if (type === 'number') {
      return state.toString();
    } else if (type === 'alphabet') {
      // Convert number (0-25) to letter (A-Z)
      return String.fromCharCode(65 + state);
    }
    return state.toString();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose();
      }
    }}>
      <DialogContent className={`sm:max-w-md md:max-w-xl lg:max-w-3xl xl:max-w-4xl ${language === 'he' ? 'rtl' : 'ltr'}`}>
        <DialogHeader>
          <DialogTitle className="text-xl">{puzzleConfig.name}</DialogTitle>
          <DialogDescription className="sr-only">Interactive puzzle - click to solve</DialogDescription>
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
          {puzzleType === 'image' ? (
            puzzleConfig.images.length > 0 ? (
              <div className="flex flex-row justify-center gap-4 flex-wrap">
                {Array.from({ length: puzzleConfig.placeholders }).map((_, idx) => (
                  <div key={idx} className="relative">
                    <div 
                      className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 border rounded overflow-hidden cursor-pointer transition-all hover:brightness-90 active:scale-95"
                      onClick={() => cyclePlaceholder(idx)}
                    >
                      <img 
                        src={puzzleConfig.images[currentStates[idx]]} 
                        alt={`Puzzle piece ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-500">
                  {language === 'en' ? 'No images available for this puzzle.' : 'אין תמונות זמינות לפאזל זה.'}
                </p>
                <p className="text-sm mt-2">
                  {language === 'en' ? 'Please add images in the puzzle properties.' : 'אנא הוסף תמונות במאפייני הפאזל.'}
                </p>
              </div>
            )
          ) : (
            // Number or Alphabet puzzle UI
            <div className="flex flex-row justify-center gap-4 flex-wrap">
              {Array.from({ length: puzzleConfig.placeholders }).map((_, idx) => (
                <div key={idx} className="relative">
                  <div 
                    className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 border-2 border-gray-300 rounded-md flex items-center justify-center cursor-pointer transition-all hover:border-primary active:scale-95 bg-white"
                    onClick={() => cyclePlaceholder(idx)}
                  >
                    <span className="text-3xl sm:text-4xl md:text-5xl font-bold">
                      {getDisplayValue(currentStates[idx], puzzleType)}
                    </span>
                  </div>
                </div>
              ))}
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

export default PuzzleModal;
