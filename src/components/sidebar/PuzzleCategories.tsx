
import { Button } from "@/components/ui/button";
import { useDesignState } from "@/context/DesignContext";
import { useLanguage } from "@/context/LanguageContext";
import { Lock, MoveHorizontal, MousePointerClick, SlidersHorizontal } from "lucide-react";

export const PuzzleCategories = () => {
  const { addElement } = useDesignState();
  const { t, language } = useLanguage();

  // Handle puzzle options
  const handleLockPuzzleClick = () => {
    addElement('puzzle', {
      puzzleConfig: {
        name: language === 'en' ? 'Lock Puzzle' : 'פאזל מנעול',
        type: 'image',
        placeholders: 3,
        images: [],
        solution: [0, 0, 0]
      }
    });
  };

  const handleSequencePuzzleClick = () => {
    addElement('sequencePuzzle', {
      name: language === 'en' ? 'Sequence Puzzle' : 'פאזל רצף',
      sequencePuzzleConfig: {
        name: language === 'en' ? 'Sequence Puzzle' : 'פאזל רצף',
        images: [],
        solution: [],
        currentOrder: []
      }
    });
  };
  
  const handleClickSequencePuzzleClick = () => {
    addElement('clickSequencePuzzle', {
      name: language === 'en' ? 'Click Sequence Puzzle' : 'פאזל רצף קליקים',
      clickSequencePuzzleConfig: {
        name: language === 'en' ? 'Click Sequence Puzzle' : 'פאזל רצף קליקים',
        images: [],
        solution: [],
        clickedIndices: []
      }
    });
  };

  const handleSliderPuzzleClick = () => {
    addElement('sliderPuzzle', {
      name: language === 'en' ? 'Slider Puzzle' : 'פאזל מחוונים',
      sliderPuzzleConfig: {
        name: language === 'en' ? 'Slider Puzzle' : 'פאזל מחוונים',
        orientation: 'horizontal',
        sliderCount: 3,
        solution: [5, 7, 3],
        currentValues: [0, 0, 0],
        maxValue: 10
      }
    });
  };

  return (
    <div className="grid grid-cols-2 gap-2">
      <Button 
        variant="outline" 
        className="h-14 flex flex-col gap-1 items-center justify-center bg-[#E5DEFF] hover:bg-[#E5DEFF]/90"
        onClick={handleLockPuzzleClick}
      >
        <Lock className="h-5 w-5" />
        <span className="text-xs">{language === 'en' ? 'Lock' : 'מנעול'}</span>
      </Button>
      
      <Button 
        variant="outline" 
        className="h-14 flex flex-col gap-1 items-center justify-center bg-[#E5DEFF] hover:bg-[#E5DEFF]/90"
        onClick={handleSequencePuzzleClick}
      >
        <MoveHorizontal className="h-5 w-5" />
        <span className="text-xs">{language === 'en' ? 'Sequence' : 'רצף'}</span>
      </Button>

      <Button 
        variant="outline" 
        className="h-14 flex flex-col gap-1 items-center justify-center bg-[#E5DEFF] hover:bg-[#E5DEFF]/90"
        onClick={handleClickSequencePuzzleClick}
      >
        <MousePointerClick className="h-5 w-5" />
        <span className="text-xs">{language === 'en' ? 'Clicks' : 'קליקים'}</span>
      </Button>

      <Button 
        variant="outline" 
        className="h-14 flex flex-col gap-1 items-center justify-center bg-[#E5DEFF] hover:bg-[#E5DEFF]/90"
        onClick={handleSliderPuzzleClick}
      >
        <SlidersHorizontal className="h-5 w-5" />
        <span className="text-xs">{language === 'en' ? 'Slider' : 'מחוון'}</span>
      </Button>
    </div>
  );
};
