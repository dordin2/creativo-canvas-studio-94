
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
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const { t, language } = useLanguage();
  
  // Use refs to prevent excessive updates to the global state
  const isInitialized = useRef(false);
  const pendingUpdate = useRef(false);
  const timeoutRef = useRef<number | null>(null);
  const draggedItemRef = useRef<HTMLDivElement | null>(null);
  const dragPreviewRef = useRef<HTMLDivElement | null>(null);
  
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
      setIsDragging(false);
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
  
  // Setup and cleanup drag preview element
  useEffect(() => {
    // Create cursor preview element
    const preview = document.createElement('div');
    preview.id = 'sequence-item-preview';
    preview.style.display = 'none';
    document.body.appendChild(preview);
    dragPreviewRef.current = preview;
    
    // Mouse move handler for drag preview
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || draggedItem === null || !dragPreviewRef.current) return;
      
      // Position the preview at the cursor with a slight offset
      dragPreviewRef.current.style.left = `${e.clientX - 20}px`;
      dragPreviewRef.current.style.top = `${e.clientY - 20}px`;
      
      // Find what we're hovering over for drop detection
      const elementsUnderCursor = document.elementsFromPoint(e.clientX, e.clientY);
      let foundDropTarget = false;
      
      // Find the drop target elements
      for (const el of elementsUnderCursor) {
        if (el.classList.contains('sequence-item') && !el.classList.contains('dragging')) {
          const targetIndex = parseInt(el.getAttribute('data-index') || '-1');
          if (targetIndex !== -1 && targetIndex !== draggedItem) {
            // Add drop target styling
            el.classList.add('drop-target');
            foundDropTarget = true;
          }
        } else if (el.classList.contains('drop-target')) {
          // Remove drop target styling from elements we're not hovering over
          el.classList.remove('drop-target');
        }
      }
      
      // Remove drop styling from all elements if we didn't find a valid target
      if (!foundDropTarget) {
        document.querySelectorAll('.drop-target').forEach(el => {
          el.classList.remove('drop-target');
        });
      }
    };
    
    // Mouse up handler to end dragging
    const handleMouseUp = (e: MouseEvent) => {
      if (!isDragging || draggedItem === null) return;
      
      // Check if we're over a valid drop target
      const elementsUnderCursor = document.elementsFromPoint(e.clientX, e.clientY);
      let dropTargetIndex = -1;
      
      for (const el of elementsUnderCursor) {
        if (el.classList.contains('sequence-item') && !el.classList.contains('dragging')) {
          const targetIndex = parseInt(el.getAttribute('data-index') || '-1');
          if (targetIndex !== -1 && targetIndex !== draggedItem) {
            dropTargetIndex = targetIndex;
            break;
          }
        }
      }
      
      // If we found a valid drop target, reorder the items
      if (dropTargetIndex !== -1) {
        // Make a copy of the current order
        const newOrder = [...currentOrder];
        const draggedItemValue = newOrder[draggedItem];
        
        // Remove the dragged item from its original position
        newOrder.splice(draggedItem, 1);
        
        // Insert it at the target position
        newOrder.splice(dropTargetIndex, 0, draggedItemValue);
        
        // Update state
        setCurrentOrder(newOrder);
        
        // Update global state with debouncing
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
      }
      
      // Clean up after drag ends
      if (draggedItemRef.current) {
        draggedItemRef.current.classList.remove('dragging');
        draggedItemRef.current = null;
      }
      
      // Hide the drag preview
      if (dragPreviewRef.current) {
        dragPreviewRef.current.style.display = 'none';
        dragPreviewRef.current.innerHTML = '';
      }
      
      // Remove all drop target styling
      document.querySelectorAll('.drop-target').forEach(el => {
        el.classList.remove('drop-target');
      });
      
      // Reset drag state
      setIsDragging(false);
      setDraggedItem(null);
    };
    
    // Add event listeners
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    
    // Clean up event listeners and cursor preview on unmount
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
      
      // Remove the preview element on unmount
      if (dragPreviewRef.current) {
        document.body.removeChild(dragPreviewRef.current);
      }
    };
  }, [isDragging, draggedItem, element.id, updateElement, currentOrder, sequencePuzzleConfig]);
  
  // Helper function to shuffle an array
  const shuffleArray = (array: number[]): number[] => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };
  
  // Start dragging
  const handleDragStart = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Set the item as dragging
    draggedItemRef.current = e.currentTarget as HTMLDivElement;
    draggedItemRef.current.classList.add('dragging');
    
    // Store starting position for calculations
    setDragStartPos({ x: e.clientX, y: e.clientY });
    
    // Set drag state
    setDraggedItem(index);
    setIsDragging(true);
    
    // Create a clone of the element for the drag preview
    if (dragPreviewRef.current) {
      const imageElement = draggedItemRef.current.querySelector('img');
      if (imageElement) {
        const clone = document.createElement('img');
        clone.src = imageElement.src;
        clone.style.width = '100%';
        clone.style.height = '100%';
        clone.style.objectFit = 'contain';
        
        // Clear and add the new preview content
        dragPreviewRef.current.innerHTML = '';
        dragPreviewRef.current.appendChild(clone);
        dragPreviewRef.current.style.display = 'flex';
        
        // Position initially at cursor location
        dragPreviewRef.current.style.left = `${e.clientX - 20}px`;
        dragPreviewRef.current.style.top = `${e.clientY - 20}px`;
      }
    }
  };
  
  // Reset the puzzle
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
                    data-index={arrayIndex}
                    className="sequence-item cursor-grab relative transition-transform"
                    onMouseDown={(e) => handleDragStart(e, arrayIndex)}
                  >
                    <div className="flex flex-col items-center">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 border-2 border-blue-300 rounded-md overflow-hidden bg-white relative flex items-center justify-center">
                        {sequencePuzzleConfig.images[imageIndex] && (
                          <img
                            src={sequencePuzzleConfig.images[imageIndex]}
                            alt={`Image ${imageIndex + 1}`}
                            className="max-w-full max-h-full object-contain"
                            style={{ pointerEvents: 'none' }}
                          />
                        )}
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
