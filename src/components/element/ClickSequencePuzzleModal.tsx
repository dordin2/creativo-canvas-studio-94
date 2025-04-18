import React, { useState, useEffect, useRef } from "react";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/context/LanguageContext";
import { DesignElement } from "@/types/designTypes";
import { useDesignState } from "@/context/DesignContext";

interface ClickSequencePuzzleModalProps {
  isOpen: boolean;
  onClose: () => void;
  element: DesignElement;
}

const ClickSequencePuzzleModal: React.FC<ClickSequencePuzzleModalProps> = ({ isOpen, onClose, element }) => {
  const { updateElement } = useDesignState();
  const [solved, setSolved] = useState(false);
  const [clickedIndices, setClickedIndices] = useState<number[]>([]);
  const { t, language } = useLanguage();
  
  // Use a ref to prevent excessive updates to the global state
  const isInitialized = useRef(false);
  const pendingUpdate = useRef(false);
  const timeoutRef = useRef<number | null>(null);
  
  const clickSequencePuzzleConfig = element.clickSequencePuzzleConfig || {
    name: language === 'en' ? 'Click Sequence Puzzle' : 'פאזל רצף קליקים',
    images: [],
    solution: [],
    clickedIndices: []
  };
  
  // Initialize when modal opens or puzzle changes
  useEffect(() => {
    if (!isOpen) {
      // Reset state when modal closes
      setSolved(false);
      isInitialized.current = false;
      return;
    }
    
    // Only initialize once when the modal opens
    if (!isInitialized.current) {
      let initialClickedIndices: number[] = [];
      
      if (clickSequencePuzzleConfig.clickedIndices.length > 0) {
        initialClickedIndices = [...clickSequencePuzzleConfig.clickedIndices];
      }
      
      setClickedIndices(initialClickedIndices);
      isInitialized.current = true;
    }
  }, [isOpen, clickSequencePuzzleConfig]);
  
  // Check if the puzzle is solved when clicked indices change
  useEffect(() => {
    if (!isOpen || clickedIndices.length === 0 || clickSequencePuzzleConfig.solution.length === 0) return;
    
    // Check if the sequence is valid so far
    const isValidSoFar = clickedIndices.every((clickedIndex, index) => {
      return clickedIndex === clickSequencePuzzleConfig.solution[index];
    });
    
    // If the sequence is invalid, silently reset the clicked indices
    if (!isValidSoFar) {
      setClickedIndices([]);
      return;
    }
    
    // Check if the puzzle is fully solved
    const isSolved = clickSequencePuzzleConfig.solution.length === clickedIndices.length && isValidSoFar;
    
    // Update the solved state and handle success
    if (isSolved && !solved) {
      setSolved(true);
      
      // Update the element with the current clicked indices, but only once
      if (!pendingUpdate.current) {
        pendingUpdate.current = true;
        
        // Clear any existing timeout
        if (timeoutRef.current !== null) {
          window.clearTimeout(timeoutRef.current);
        }
        
        // Use a timeout to debounce the update
        timeoutRef.current = window.setTimeout(() => {
          updateElement(element.id, {
            clickSequencePuzzleConfig: {
              ...clickSequencePuzzleConfig,
              clickedIndices: [...clickedIndices]
            }
          });
          pendingUpdate.current = false;
          timeoutRef.current = null;
          
          // Show success message with extended duration
          toast.success(language === 'en' ? 'Puzzle solved correctly!' : 'הפאזל נפתר בהצלחה!', {
            duration: 3000 // Extended duration
          });
          
          // Close after a delay to ensure user sees the success state
          setTimeout(() => {
            onClose();
          }, 3000);
        }, 300);
      }
    }
  }, [clickedIndices, clickSequencePuzzleConfig.solution, solved, isOpen, onClose, language, element.id, updateElement]);
  
  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  // Handle image click
  const handleImageClick = (index: number) => {
    if (solved) return; // Don't allow clicks if already solved
    
    // Simply add the clicked index to the sequence
    const newClickedIndices = [...clickedIndices, index];
    setClickedIndices(newClickedIndices);
    
    // We don't need to update global state here as the effect will handle that if the puzzle is solved
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose();
      }
    }}>
      <DialogContent className={`sm:max-w-md md:max-w-xl lg:max-w-3xl xl:max-w-4xl bg-white ${language === 'he' ? 'rtl' : 'ltr'}`}>
        <DialogHeader>
          <DialogTitle className="text-xl">{clickSequencePuzzleConfig.name}</DialogTitle>
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
          {clickSequencePuzzleConfig.images.length > 0 ? (
            <div className="flex flex-row justify-center gap-4 flex-wrap">
              {clickSequencePuzzleConfig.images.map((image, index) => (
                <div 
                  key={index} 
                  onClick={() => !solved && handleImageClick(index)}
                  className={`relative transition-transform cursor-pointer hover:scale-105 ${solved ? 'cursor-default' : ''}`}
                >
                  <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 border rounded overflow-hidden flex items-center justify-center bg-white shadow-sm">
                    <img 
                      src={image} 
                      alt={`Sequence image ${index + 1}`}
                      className="max-w-full max-h-full object-contain bg-white"
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-white">
              <p className="text-gray-500">
                {language === 'en' ? 'No images available for this puzzle.' : 'אין תמונות זמינות לפאזל זה.'}
              </p>
            </div>
          )}
        </div>

        {solved && (
          <div className="flex items-center justify-center text-green-600 gap-2 p-4 bg-green-50 rounded-lg border border-green-100">
            <CheckCircle className="h-5 w-5" />
            <span>{t('puzzle.modal.solved')}</span>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ClickSequencePuzzleModal;
