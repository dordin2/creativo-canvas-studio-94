
import { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useDesignState } from '@/context/DesignContext';
import { useLanguage } from '@/context/LanguageContext';
import { Lock, Puzzle, SlidersHorizontal, MousePointerClick } from 'lucide-react';

interface PuzzlesTabProps {
  onClose: () => void;
}

export const PuzzlesTab = ({ onClose }: PuzzlesTabProps) => {
  const { addElement } = useDesignState();
  const { language } = useLanguage();
  
  const handleAddPuzzle = useCallback((type: string, config: any) => {
    addElement(type, config);
    onClose();
  }, [addElement, onClose]);

  return (
    <div className="space-y-2 mt-4">
      <Button 
        variant="outline" 
        className="w-full justify-start h-12"
        onClick={() => handleAddPuzzle('puzzle', {
          puzzleConfig: {
            name: language === 'en' ? 'Puzzle' : 'פאזל',
            type: 'image',
            placeholders: 3,
            images: [],
            solution: [0, 0, 0]
          }
        })}
      >
        <Lock className="h-4 w-4 mr-2" />
        <span>{language === 'en' ? 'Image/Number Puzzle' : 'פאזל תמונה/מספרים'}</span>
      </Button>

      <Button 
        variant="outline" 
        className="w-full justify-start h-12"
        onClick={() => handleAddPuzzle('sequencePuzzle', {
          name: language === 'en' ? 'Sequence Puzzle' : 'פאזל רצף',
          sequencePuzzleConfig: {
            name: language === 'en' ? 'Sequence Puzzle' : 'פאזל רצף',
            images: [],
            solution: [],
            currentOrder: []
          }
        })}
      >
        <MousePointerClick className="h-4 w-4 mr-2" />
        <span>{language === 'en' ? 'Sequence Puzzle' : 'פאזל רצף'}</span>
      </Button>

      <Button 
        variant="outline" 
        className="w-full justify-start h-12"
        onClick={() => handleAddPuzzle('clickSequencePuzzle', {
          name: language === 'en' ? 'Click Sequence Puzzle' : 'פאזל רצף קליקים',
          clickSequencePuzzleConfig: {
            name: language === 'en' ? 'Click Sequence Puzzle' : 'פאזל רצף קליקים',
            images: [],
            solution: [],
            clickedIndices: []
          }
        })}
      >
        <MousePointerClick className="h-4 w-4 mr-2" />
        <span>{language === 'en' ? 'Click Sequence Puzzle' : 'פאזל רצף קליקים'}</span>
      </Button>

      <Button 
        variant="outline" 
        className="w-full justify-start h-12"
        onClick={() => handleAddPuzzle('sliderPuzzle', {
          name: language === 'en' ? 'Slider Puzzle' : 'פאזל מחוונים',
          sliderPuzzleConfig: {
            name: language === 'en' ? 'Slider Puzzle' : 'פאזל מחוונים',
            orientation: 'horizontal',
            sliderCount: 3,
            solution: [5, 7, 3],
            currentValues: [0, 0, 0],
            maxValue: 10
          }
        })}
      >
        <SlidersHorizontal className="h-4 w-4 mr-2" />
        <span>{language === 'en' ? 'Slider Puzzle' : 'פאזל מחוונים'}</span>
      </Button>
    </div>
  );
};
