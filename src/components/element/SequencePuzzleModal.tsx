
import React, { useState, useEffect, useRef } from "react";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/context/LanguageContext";
import { DesignElement } from "@/types/designTypes";
import { useDesignState } from "@/context/DesignContext";

interface SequencePuzzleModalProps {
  isOpen: boolean;
  onClose: () => void;
  element: DesignElement;
}

const SequencePuzzleModal: React.FC<SequencePuzzleModalProps> = ({ isOpen, onClose, element }) => {
  const { updateElement } = useDesignState();
  const [solved, setSolved] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<number[]>([]);
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  const { t, language } = useLanguage();
  
  // Use refs to prevent excessive updates to the global state
  const isInitialized = useRef(false);
  const pendingUpdate = useRef(false);
  const timeoutRef = useRef<number | null>(null);
  
  const sequencePuzzleConfig = element.sequencePuzzleConfig || {
    name: language === 'en' ? 'Sequence Puzzle' : 'פאזל רצף',
    images: [],
    solution: [],
    currentOrder: []
  };
  
  // Initialize current order when modal opens or puzzle changes
  useEffect(() => {
    if (!isOpen) {
      // Reset state when modal closes
      setSolved(false);
      setDraggedItem(null);
      isInitialized.current = false;
      return;
    }
    
    // Only initialize once when the modal opens
    if (!isInitialized.current) {
      let initialOrder: number[];
      
      if (sequencePuzzleConfig.currentOrder.length === sequencePuzzleConfig.images.length) {
        initialOrder = [...sequencePuzzleConfig.currentOrder];
      } else if (sequencePuzzleConfig.images.length > 0) {
        // Create a shuffled order if there's no current order
        const indices = Array.from({ length: sequencePuzzleConfig.images.length }, (_, i) => i);
        initialOrder = shuffleArray([...indices]);
      } else {
        initialOrder = [];
      }
      
      setCurrentOrder(initialOrder);
      isInitialized.current = true;
    }
  }, [isOpen, sequencePuzzleConfig.images.length]);
  
  // Check if the puzzle is solved, but avoid updating the global state too frequently
  useEffect(() => {
    if (!isOpen || currentOrder.length === 0 || sequencePuzzleConfig.solution.length === 0) return;
    
    const isSolved = sequencePuzzleConfig.solution.every((solutionIndex, index) => {
      return solutionIndex === currentOrder[index];
    });
    
    if (isSolved && !solved) {
      setSolved(true);
      
      // Update the element with the current order, but only once
      if (!pendingUpdate.current) {
        pendingUpdate.current = true;
        
        // Clear any existing timeout
        if (timeoutRef.current !== null) {
          window.clearTimeout(timeoutRef.current);
        }
        
        // Use a timeout to debounce the update
        timeoutRef.current = window.setTimeout(() => {
          updateElement(element.id, {
            sequencePuzzleConfig: {
              ...sequencePuzzleConfig,
              currentOrder: [...currentOrder]
            }
          });
          pendingUpdate.current = false;
          timeoutRef.current = null;
          
          // Show success message
          toast.success(t('toast.success.sequence'), {
            duration: 2000 // 2 seconds duration
          });
          
          // Close after delay
          setTimeout(() => {
            onClose();
          }, 2000);
        }, 300);
      }
    }
  }, [currentOrder, sequencePuzzleConfig.solution, solved, isOpen, onClose, t, element.id, updateElement]);
  
  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  // Helper function to shuffle an array
  const shuffleArray = (array: number[]): number[] => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };
  
  // Handle drag start
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    // Store the index in dataTransfer to retrieve it on drop
    e.dataTransfer.setData('text/plain', index.toString());
    e.dataTransfer.effectAllowed = 'move';
    
    // Add visual styling
    e.currentTarget.classList.add('dragging');
    setDraggedItem(index);
  };
  
  // Handle drag over - required to enable dropping
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    // Add a class to highlight drop target
    if (!e.currentTarget.classList.contains('drag-over')) {
      e.currentTarget.classList.add('drag-over');
    }
  };
  
  // Remove highlight when drag leaves element
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('drag-over');
  };
  
  // Handle drop - move the dragged item to this position
  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetIndex: number) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    
    // Get the dragged item index from dataTransfer
    const draggedIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
    
    if (isNaN(draggedIndex) || draggedIndex === targetIndex) return;
    
    // Reorder the items
    const newOrder = [...currentOrder];
    const draggedItemValue = newOrder[draggedIndex];
    
    // Remove the dragged item, then insert at the new position
    newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, draggedItemValue);
    
    // Update state with new order
    setCurrentOrder(newOrder);
    setDraggedItem(null);
    
    // Update global state, but debounce it
    if (!pendingUpdate.current) {
      pendingUpdate.current = true;
      
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = window.setTimeout(() => {
        updateElement(element.id, {
          sequencePuzzleConfig: {
            ...sequencePuzzleConfig,
            currentOrder: newOrder
          }
        });
        pendingUpdate.current = false;
        timeoutRef.current = null;
      }, 300);
    }
  };
  
  // Clear styling on drag end
  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('dragging');
    setDraggedItem(null);
  };
  
  // Reset the puzzle with shuffled order
  const handleReset = () => {
    const initialOrder = Array.from({ length: sequencePuzzleConfig.images.length }, (_, i) => i);
    const shuffled = shuffleArray([...initialOrder]);
    setCurrentOrder(shuffled);
    setSolved(false);
    
    // Update the element with the shuffled order
    if (!pendingUpdate.current) {
      pendingUpdate.current = true;
      
      // Clear any existing timeout
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
      
      // Use a timeout to debounce the update
      timeoutRef.current = window.setTimeout(() => {
        updateElement(element.id, {
          sequencePuzzleConfig: {
            ...sequencePuzzleConfig,
            currentOrder: shuffled
          }
        });
        pendingUpdate.current = false;
        timeoutRef.current = null;
        
        toast.info(t('toast.info.reset'));
      }, 300);
    }
  };
  
  // Add some CSS for drag and drop styles
  useEffect(() => {
    // Add CSS for drag and drop operations
    const style = document.createElement('style');
    style.textContent = `
      .dragging {
        opacity: 0.6;
        transform: scale(1.05);
        z-index: 100;
      }
      .drag-over {
        border: 2px dashed #3b82f6;
        background-color: rgba(59, 130, 246, 0.1);
        transform: scale(1.02);
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose();
      }
    }}>
      <DialogContent className={`sm:max-w-md md:max-w-xl lg:max-w-3xl xl:max-w-4xl ${language === 'he' ? 'rtl' : 'ltr'}`}>
        <DialogHeader>
          <DialogTitle className="text-xl">{sequencePuzzleConfig.name}</DialogTitle>
          <DialogDescription className="sr-only">{language === 'en' ? 'Drag images to put them in the correct order' : 'גרור תמונות כדי לסדר אותן בסדר הנכון'}</DialogDescription>
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
          {sequencePuzzleConfig.images.length > 0 ? (
            <div className="space-y-4">
              <div className="flex flex-row justify-center items-center gap-4 flex-wrap">
                {currentOrder.map((imageIndex, arrayIndex) => (
                  <div 
                    key={arrayIndex}
                    draggable="true"
                    onDragStart={(e) => handleDragStart(e, arrayIndex)}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, arrayIndex)}
                    onDragEnd={handleDragEnd}
                    className="relative transition-all duration-200 cursor-move"
                  >
                    <div className="flex flex-col items-center">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 border-2 border-blue-300 rounded-md overflow-hidden cursor-grab active:cursor-grabbing hover:border-blue-500 bg-white relative">
                        <img
                          src={sequencePuzzleConfig.images[imageIndex]}
                          alt={`Image ${imageIndex + 1}`}
                          className="w-full h-full object-cover"
                          draggable="false" // Prevent image-specific dragging
                        />
                        <div className="absolute top-0 left-0 bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-br">
                          {arrayIndex + 1}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-center mt-4">
                <Button variant="outline" onClick={handleReset}>
                  {language === 'en' ? 'Shuffle Images' : 'ערבב תמונות'}
                </Button>
              </div>
              
              <div className="text-center text-sm text-gray-500 mt-2">
                {language === 'en' 
                  ? 'Drag and drop images to put them in the correct order' 
                  : 'גרור ושחרר תמונות כדי לסדר אותן בסדר הנכון'}
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
          <div className="flex items-center justify-center text-green-500 gap-2 pb-2">
            <CheckCircle className="h-5 w-5" />
            <span>{language === 'en' ? 'Puzzle solved correctly!' : 'הפאזל נפתר בהצלחה!'}</span>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SequencePuzzleModal;
