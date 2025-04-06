
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
  
  const isInitialized = useRef(false);
  const pendingUpdate = useRef(false);
  const timeoutRef = useRef<number | null>(null);
  const dragItemRef = useRef<HTMLDivElement | null>(null);
  const dragImageRef = useRef<HTMLImageElement | null>(null);
  
  const sequencePuzzleConfig = element.sequencePuzzleConfig || {
    name: language === 'en' ? 'Sequence Puzzle' : 'פאזל רצף',
    images: [],
    solution: [],
    currentOrder: []
  };
  
  useEffect(() => {
    if (!isOpen) {
      setSolved(false);
      setDraggedItem(null);
      isInitialized.current = false;
      return;
    }
    
    if (!isInitialized.current) {
      let initialOrder: number[];
      
      if (sequencePuzzleConfig.currentOrder.length === sequencePuzzleConfig.images.length) {
        initialOrder = [...sequencePuzzleConfig.currentOrder];
      } else if (sequencePuzzleConfig.images.length > 0) {
        const indices = Array.from({ length: sequencePuzzleConfig.images.length }, (_, i) => i);
        initialOrder = shuffleArray([...indices]);
      } else {
        initialOrder = [];
      }
      
      setCurrentOrder(initialOrder);
      isInitialized.current = true;
    }
  }, [isOpen, sequencePuzzleConfig.images.length]);
  
  useEffect(() => {
    if (!isOpen || currentOrder.length === 0 || sequencePuzzleConfig.solution.length === 0) return;
    
    const isSolved = sequencePuzzleConfig.solution.every((solutionIndex, index) => {
      return solutionIndex === currentOrder[index];
    });
    
    if (isSolved && !solved) {
      setSolved(true);
      
      if (!pendingUpdate.current) {
        pendingUpdate.current = true;
        
        if (timeoutRef.current !== null) {
          window.clearTimeout(timeoutRef.current);
        }
        
        timeoutRef.current = window.setTimeout(() => {
          updateElement(element.id, {
            sequencePuzzleConfig: {
              ...sequencePuzzleConfig,
              currentOrder: [...currentOrder]
            }
          });
          pendingUpdate.current = false;
          timeoutRef.current = null;
          
          toast.success(t('toast.success.sequence'), {
            duration: 2000
          });
          
          setTimeout(() => {
            onClose();
          }, 2000);
        }, 300);
      }
    }
  }, [currentOrder, sequencePuzzleConfig.solution, solved, isOpen, onClose, t, element.id, updateElement]);
  
  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  const shuffleArray = (array: number[]): number[] => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };
  
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.stopPropagation();
    
    const dragGhost = document.createElement('div');
    dragGhost.style.position = 'absolute';
    dragGhost.style.width = '1px';
    dragGhost.style.height = '1px';
    dragGhost.style.top = '-500px';
    dragGhost.style.opacity = '0';
    document.body.appendChild(dragGhost);
    
    e.dataTransfer.setDragImage(dragGhost, 0, 0);
    e.dataTransfer.effectAllowed = 'move';
    
    setDraggedItem(index);
    dragItemRef.current = e.currentTarget;
    
    e.currentTarget.classList.add('dragging');
    
    setTimeout(() => {
      document.body.removeChild(dragGhost);
    }, 0);
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    e.currentTarget.classList.add('drag-over');
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('drag-over');
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetIndex: number) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    
    if (draggedItem === null) return;
    
    if (dragItemRef.current) {
      dragItemRef.current.classList.remove('dragging');
    }
    
    const newOrder = [...currentOrder];
    const draggedItemValue = newOrder[draggedItem];
    
    newOrder.splice(draggedItem, 1);
    newOrder.splice(targetIndex, 0, draggedItemValue);
    
    setCurrentOrder(newOrder);
    setDraggedItem(null);
    dragItemRef.current = null;
    
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
  
  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('dragging');
    
    setDraggedItem(null);
    dragItemRef.current = null;
  };
  
  const handleReset = () => {
    const initialOrder = Array.from({ length: sequencePuzzleConfig.images.length }, (_, i) => i);
    const shuffled = shuffleArray([...initialOrder]);
    setCurrentOrder(shuffled);
    setSolved(false);
    
    if (!pendingUpdate.current) {
      pendingUpdate.current = true;
      
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
      
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
                    draggable={true}
                    onDragStart={(e) => handleDragStart(e, arrayIndex)}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, arrayIndex)}
                    onDragEnd={handleDragEnd}
                    className="relative transition-transform"
                  >
                    <div className="flex flex-col items-center">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 border-2 border-blue-300 rounded-md overflow-hidden cursor-grab active:cursor-grabbing hover:border-blue-500 bg-white relative">
                        {sequencePuzzleConfig.images[imageIndex] && (
                          <img
                            ref={arrayIndex === draggedItem ? dragImageRef : null}
                            src={sequencePuzzleConfig.images[imageIndex]}
                            alt={`Image ${imageIndex + 1}`}
                            className="w-full h-full object-cover no-select"
                            style={{ 
                              pointerEvents: 'none', 
                              touchAction: 'none', 
                              userSelect: 'none',
                              // Fix: Use CSS variable instead of direct WebkitUserDrag property
                              // which causes TypeScript error
                              WebkitUserSelect: 'none',
                              MozUserSelect: 'none',
                              msUserSelect: 'none'
                            }}
                            draggable={false}
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
