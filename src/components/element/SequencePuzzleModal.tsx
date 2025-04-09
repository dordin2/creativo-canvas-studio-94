
import React, { useState, useEffect } from "react";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, ArrowLeftRight, CheckCircle } from "lucide-react";
import { DndContext, DragEndEvent, DragStartEvent, useSensor, PointerSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, arrayMove, useSortable, horizontalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { toast } from "sonner";
import { useLanguage } from "@/context/LanguageContext";
import { DesignElement } from "@/types/designTypes";

interface SortableItemProps {
  id: string;
  url: string;
  index: number;
}

const SortableItem = ({ id, url, index }: SortableItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id
  });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.8 : 1,
    cursor: 'grab'
  };
  
  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners}
      className="p-1 rounded border bg-white shadow-sm"
    >
      <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 flex items-center justify-center overflow-hidden">
        <img 
          src={url} 
          alt={`Puzzle piece ${index + 1}`} 
          className="max-w-full max-h-full object-contain"
        />
      </div>
    </div>
  );
};

interface SequencePuzzleModalProps {
  isOpen: boolean;
  onClose: () => void;
  element: DesignElement;
  onPuzzleSolved?: () => void;
}

const SequencePuzzleModal: React.FC<SequencePuzzleModalProps> = ({ 
  isOpen, 
  onClose, 
  element,
  onPuzzleSolved
}) => {
  const puzzleConfig = element.sequencePuzzleConfig;
  const [items, setItems] = useState<{id: string, url: string}[]>([]);
  const [solved, setSolved] = useState(false);
  const { t, language } = useLanguage();
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );
  
  useEffect(() => {
    if (isOpen && puzzleConfig) {
      // Initialize items
      const initialItems = puzzleConfig.images.map((url, index) => ({
        id: `item-${index}`,
        url
      }));
      
      // Apply the current order if it exists
      if (puzzleConfig.currentOrder && puzzleConfig.currentOrder.length === puzzleConfig.images.length) {
        const orderedItems: {id: string, url: string}[] = [];
        puzzleConfig.currentOrder.forEach(imageIndex => {
          if (imageIndex >= 0 && imageIndex < initialItems.length) {
            orderedItems.push(initialItems[imageIndex]);
          }
        });
        
        // In case there are any issues with the order, fall back to the initialItems
        setItems(orderedItems.length === initialItems.length ? orderedItems : initialItems);
      } else {
        setItems(initialItems);
      }
      
      setSolved(false);
    }
  }, [isOpen, puzzleConfig]);
  
  useEffect(() => {
    if (items.length === 0 || !puzzleConfig || !puzzleConfig.solution) return;
    
    // Check if the current order matches the solution
    const currentOrder = items.map(item => {
      const id = item.id;
      const index = parseInt(id.split('-')[1], 10);
      return index;
    });
    
    const isSolved = puzzleConfig.solution.every((solutionIndex, i) => {
      return currentOrder[i] === solutionIndex;
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
  }, [items, puzzleConfig, solved, onClose, t, onPuzzleSolved]);
  
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    if (active.id !== over.id) {
      setItems(items => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        
        return arrayMove(items, oldIndex, newIndex);
      });
    }
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
          <DialogTitle className="text-xl">{puzzleConfig.name || t('puzzle.sequence.title')}</DialogTitle>
          <DialogDescription className="sr-only">
            {t('puzzle.sequence.description')}
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
                <div className="inline-flex p-2 rounded-full bg-muted">
                  <ArrowLeftRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
              
              <DndContext 
                sensors={sensors}
                onDragEnd={handleDragEnd}
              >
                <SortableContext 
                  items={items.map(item => item.id)}
                  strategy={horizontalListSortingStrategy}
                >
                  <div className="flex justify-center gap-4 flex-wrap">
                    {items.map((item, index) => (
                      <SortableItem 
                        key={item.id} 
                        id={item.id} 
                        url={item.url} 
                        index={index}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
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

export default SequencePuzzleModal;
