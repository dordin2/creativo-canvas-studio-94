
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Check, CircleCheck, CircleX } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/context/LanguageContext";
import { DesignElement } from "@/types/designTypes";
import { useDesignState } from "@/context/DesignContext";

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
  const { language } = useLanguage();
  const [currentProgress, setCurrentProgress] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [clickedIndices, setClickedIndices] = useState<number[]>([]);
  const [gameState, setGameState] = useState<'playing' | 'success' | 'failed'>('playing');
  const [feedback, setFeedback] = useState<string>('');
  
  const puzzleConfig = element.clickSequencePuzzleConfig || {
    name: language === 'en' ? 'Click Sequence Puzzle' : 'פאזל לחיצה לפי סדר',
    images: [],
    solution: [],
    maxAttempts: 3,
    currentProgress: 0,
    attempts: 0
  };
  
  // Initialize or reset the game state when modal is opened
  useEffect(() => {
    if (isOpen) {
      setCurrentProgress(0);
      setAttempts(puzzleConfig.attempts || 0);
      setClickedIndices([]);
      setGameState('playing');
      setFeedback('');
    }
  }, [isOpen, puzzleConfig.attempts]);
  
  // Handle image click
  const handleImageClick = (index: number) => {
    if (gameState !== 'playing') return;
    
    // Add clicked index to the array of clicked indices
    setClickedIndices(prev => [...prev, index]);
    
    const expectedIndex = puzzleConfig.solution[currentProgress];
    
    if (index === expectedIndex) {
      // Correct click
      const newProgress = currentProgress + 1;
      setCurrentProgress(newProgress);
      
      // Provide feedback
      setFeedback(language === 'en' ? 'Correct!' : 'נכון!');
      setTimeout(() => setFeedback(''), 800);
      
      // Check if puzzle is solved
      if (newProgress >= puzzleConfig.solution.length) {
        setGameState('success');
        toast.success(language === 'en' ? 'Puzzle solved!' : 'הפאזל נפתר!');
        
        // Update the element with the new state
        updateElement(element.id, {
          clickSequencePuzzleConfig: {
            ...puzzleConfig,
            currentProgress: newProgress,
            attempts: attempts
          }
        });
        
        // Close modal after delay
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } else {
      // Incorrect click
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      
      // Provide error feedback
      setFeedback(language === 'en' ? 'Incorrect! Try again.' : 'לא נכון! נסה שוב.');
      
      // Check if max attempts reached
      if (puzzleConfig.maxAttempts && newAttempts >= puzzleConfig.maxAttempts) {
        setGameState('failed');
        toast.error(language === 'en' ? 'Too many attempts. Puzzle failed!' : 'יותר מדי ניסיונות. הפאזל נכשל!');
        
        // Update the element with the new state
        updateElement(element.id, {
          clickSequencePuzzleConfig: {
            ...puzzleConfig,
            currentProgress: 0,
            attempts: newAttempts
          }
        });
      } else {
        // Reset progress
        setCurrentProgress(0);
        setClickedIndices([]);
        
        setTimeout(() => setFeedback(''), 1500);
      }
    }
  };
  
  // Reset the puzzle
  const handleReset = () => {
    setCurrentProgress(0);
    setClickedIndices([]);
    setGameState('playing');
    setFeedback('');
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose();
      }
    }}>
      <DialogContent className={`sm:max-w-md md:max-w-xl lg:max-w-3xl ${language === 'he' ? 'rtl' : 'ltr'}`}>
        <DialogHeader>
          <DialogTitle className="text-xl">{puzzleConfig.name}</DialogTitle>
          <DialogDescription>
            {language === 'en' 
              ? 'Click on the images in the correct sequence to solve the puzzle.'
              : 'לחץ על התמונות בסדר הנכון כדי לפתור את הפאזל.'}
          </DialogDescription>
          <DialogClose asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-4 top-4"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </DialogClose>
        </DialogHeader>
        
        {puzzleConfig.images.length > 0 ? (
          <div className="p-4">
            {/* Progress indicator */}
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {language === 'en' ? 'Progress:' : 'התקדמות:'} {currentProgress}/{puzzleConfig.solution.length}
                </span>
                <div className="h-2 w-32 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-purple-600 transition-all duration-300" 
                    style={{ 
                      width: `${(currentProgress / puzzleConfig.solution.length) * 100}%` 
                    }}
                  ></div>
                </div>
              </div>
              
              {puzzleConfig.maxAttempts && (
                <div className="text-sm font-medium">
                  {language === 'en' ? 'Attempts:' : 'ניסיונות:'} {attempts}/{puzzleConfig.maxAttempts}
                </div>
              )}
            </div>
            
            {/* Feedback message */}
            {feedback && (
              <div className={`mb-4 text-center p-2 rounded ${
                feedback.includes('Correct') || feedback.includes('נכון')
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {feedback}
              </div>
            )}
            
            {/* Game state messages */}
            {gameState === 'success' && (
              <div className="mb-4 text-center p-3 bg-green-100 text-green-800 rounded flex items-center justify-center gap-2">
                <CircleCheck className="h-5 w-5" />
                <span>{language === 'en' ? 'Puzzle solved successfully!' : 'הפאזל נפתר בהצלחה!'}</span>
              </div>
            )}
            
            {gameState === 'failed' && (
              <div className="mb-4 text-center p-3 bg-red-100 text-red-800 rounded flex items-center justify-center gap-2">
                <CircleX className="h-5 w-5" />
                <span>
                  {language === 'en'
                    ? 'Too many attempts. Try again!'
                    : 'יותר מדי ניסיונות. נסה שוב!'}
                </span>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleReset}
                  className="ml-2"
                >
                  {language === 'en' ? 'Reset' : 'איפוס'}
                </Button>
              </div>
            )}
            
            {/* Images grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
              {puzzleConfig.images.map((image, index) => (
                <div 
                  key={index}
                  className={`
                    relative aspect-square rounded-md overflow-hidden border-2 cursor-pointer
                    transition-all duration-200
                    ${clickedIndices.includes(index) 
                      ? 'border-purple-500 opacity-70'
                      : 'border-transparent hover:border-purple-300'
                    }
                    ${gameState !== 'playing' ? 'pointer-events-none' : ''}
                  `}
                  onClick={() => handleImageClick(index)}
                >
                  <img 
                    src={image} 
                    alt={`Image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Highlight for clicked images */}
                  {clickedIndices.includes(index) && (
                    <div className="absolute inset-0 bg-purple-500 bg-opacity-20 flex items-center justify-center">
                      <div className="bg-white rounded-full p-1">
                        <Check className="h-4 w-4 text-purple-600" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {/* Controls */}
            <div className="mt-6 flex justify-end gap-2">
              {gameState === 'playing' && (
                <Button 
                  variant="outline" 
                  onClick={handleReset}
                >
                  {language === 'en' ? 'Reset' : 'איפוס'}
                </Button>
              )}
              
              <Button 
                variant="ghost" 
                onClick={onClose}
              >
                {language === 'en' ? 'Close' : 'סגור'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center">
            <p className="text-muted-foreground">
              {language === 'en' 
                ? 'No images are configured for this puzzle.' 
                : 'לא הוגדרו תמונות לפאזל זה.'}
            </p>
            <p className="text-sm mt-2">
              {language === 'en'
                ? 'Add images in the properties panel to play.'
                : 'הוסף תמונות בלוח המאפיינים כדי לשחק.'}
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ClickSequencePuzzleModal;
