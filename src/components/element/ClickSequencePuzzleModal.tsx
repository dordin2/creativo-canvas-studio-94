
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
    
    const isSolved = clickSequencePuzzleConfig.solution.length === clickedIndices.length && 
                     clickSequencePuzzleConfig.solution.every((solutionIndex, index) => {
                       return solutionIndex === clickedIndices[index];
                     });
    
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
    
    // Check if this index was already clicked
    if (clickedIndices.includes(index)) {
      // If it's the last item clicked, remove it
      if (clickedIndices[clickedIndices.length - 1] === index) {
        const newClickedIndices = [...clickedIndices];
        newClickedIndices.pop();
        setClickedIndices(newClickedIndices);
        
        // Update the global state
        updateClickIndicesState(newClickedIndices);
      } else {
        // If it's not the last item, flash to indicate it can't be unclicked
        toast.error(language === 'en' ? 'You can only undo the last click' : 'ניתן לבטל רק את הלחיצה האחרונה', {
          duration: 2000
        });
      }
    } else {
      // Add this index to clicked indices
      const newClickedIndices = [...clickedIndices, index];
      setClickedIndices(newClickedIndices);
      
      // Update the global state
      updateClickIndicesState(newClickedIndices);
    }
  };
  
  // Update the global state with debouncing
  const updateClickIndicesState = (newClickedIndices: number[]) => {
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
            clickedIndices: newClickedIndices
          }
        });
        pendingUpdate.current = false;
        timeoutRef.current = null;
      }, 300);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose();
      }
    }}>
      <DialogContent className={`sm:max-w-md md:max-w-xl lg:max-w-3xl xl:max-w-4xl ${language === 'he' ? 'rtl' : 'ltr'}`}>
        <DialogHeader>
          <DialogTitle className="text-xl">{clickSequencePuzzleConfig.name}</DialogTitle>
          <DialogDescription className="sr-only">{language === 'en' ? 'Click images in the correct order' : 'לחץ על התמונות בסדר הנכון'}</DialogDescription>
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
            <div className="space-y-6">
              {/* Images grid */}
              <div className="flex flex-row justify-center items-center gap-4 flex-wrap">
                {clickSequencePuzzleConfig.images.map((image, index) => {
                  const isClicked = clickedIndices.includes(index);
                  const clickPosition = clickedIndices.indexOf(index);
                  
                  return (
                    <div 
                      key={index}
                      onClick={() => handleImageClick(index)}
                      className={`relative transition-transform cursor-pointer 
                                ${isClicked ? 'ring-2 ring-blue-500' : 'hover:scale-105'}`}
                    >
                      <div className="flex flex-col items-center">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 border-2 border-gray-300 rounded-md overflow-hidden hover:border-blue-500 bg-white relative">
                          <img
                            src={image}
                            alt={`Image ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          
                          {/* Position number badge - show when clicked */}
                          {isClicked && (
                            <div className="absolute top-0 left-0 bg-blue-600 text-white font-bold px-2 py-0.5 rounded-br">
                              {clickPosition + 1}
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-center mt-1">
                          {language === 'en' ? `Image ${index + 1}` : `תמונה ${index + 1}`}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="text-center text-sm text-gray-500 mt-2">
                {language === 'en' 
                  ? 'Click on the images in the correct sequence order' 
                  : 'לחץ על התמונות בסדר הנכון'}
              </div>
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
          )}
        </div>
        
        {solved && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-md mb-4">
            <div className="flex items-center justify-center text-green-600 gap-2">
              <CheckCircle className="h-6 w-6" />
              <span className="text-lg font-semibold">
                {language === 'en' ? 'Puzzle solved correctly!' : 'הפאזל נפתר בהצלחה!'}
              </span>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ClickSequencePuzzleModal;
