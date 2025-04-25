import { Button } from "@/components/ui/button";
import { useDesignState } from "@/context/DesignContext";
import { useLanguage } from "@/context/LanguageContext";
import { Lock, Hash, Languages, MoveHorizontal, MousePointerClick, SlidersHorizontal, SlidersVertical } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export const PuzzleCategories = () => {
  const { addElement } = useDesignState();
  const { t, language } = useLanguage();

  // Handle puzzle options
  const handleImagePuzzleClick = () => {
    addElement('puzzle', {
      puzzleConfig: {
        name: language === 'en' ? 'Image Puzzle' : 'פאזל תמונה',
        type: 'image',
        placeholders: 3,
        images: [],
        solution: [0, 0, 0]
      }
    });
  };

  const handleNumberPuzzleClick = () => {
    addElement('puzzle', {
      puzzleConfig: {
        name: language === 'en' ? 'Number Lock' : 'מנעול מספרים',
        type: 'number',
        placeholders: 3,
        images: [],
        solution: [0, 0, 0],
        maxNumber: 9
      }
    });
  };

  const handleAlphabetPuzzleClick = () => {
    addElement('puzzle', {
      puzzleConfig: {
        name: language === 'en' ? 'Alphabet Lock' : 'מנעול אותיות',
        type: 'alphabet',
        placeholders: 3,
        images: [],
        solution: [0, 0, 0],
        maxLetter: 'Z'
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

  const handleHorizontalSliderPuzzleClick = () => {
    addElement('sliderPuzzle', {
      name: language === 'en' ? 'Horizontal Slider Puzzle' : 'פאזל מחוונים אופקי',
      sliderPuzzleConfig: {
        name: language === 'en' ? 'Horizontal Slider Puzzle' : 'פאזל מחוונים אופקי',
        orientation: 'horizontal',
        sliderCount: 3,
        solution: [5, 7, 3],
        currentValues: [0, 0, 0],
        maxValue: 10
      }
    });
  };

  const handleVerticalSliderPuzzleClick = () => {
    addElement('sliderPuzzle', {
      name: language === 'en' ? 'Vertical Slider Puzzle' : 'פאזל מחוונים אנכי',
      sliderPuzzleConfig: {
        name: language === 'en' ? 'Vertical Slider Puzzle' : 'פאזל מחוונים אנכי',
        orientation: 'vertical',
        sliderCount: 3,
        solution: [8, 4, 6],
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
        onClick={handleImagePuzzleClick}
      >
        <Lock className="h-5 w-5" />
        <span className="text-xs">{language === 'en' ? 'Image Puzzle' : 'פאזל תמונה'}</span>
      </Button>
      
      <Button 
        variant="outline" 
        className="h-14 flex flex-col gap-1 items-center justify-center bg-[#E5DEFF] hover:bg-[#E5DEFF]/90"
        onClick={handleNumberPuzzleClick}
      >
        <Hash className="h-5 w-5" />
        <span className="text-xs">{language === 'en' ? 'Number Lock' : 'מנעול מספרים'}</span>
      </Button>
      
      <Button 
        variant="outline" 
        className="h-14 flex flex-col gap-1 items-center justify-center bg-[#E5DEFF] hover:bg-[#E5DEFF]/90"
        onClick={handleAlphabetPuzzleClick}
      >
        <Languages className="h-5 w-5" />
        <span className="text-xs">{language === 'en' ? 'Alphabet Lock' : 'מנעול אותיות'}</span>
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
        <span className="text-xs">{language === 'en' ? 'Click' : 'קליקים'}</span>
      </Button>

      <Button 
        variant="outline" 
        className="h-14 flex flex-col gap-1 items-center justify-center bg-[#E5DEFF] hover:bg-[#E5DEFF]/90"
        onClick={handleHorizontalSliderPuzzleClick}
      >
        <SlidersHorizontal className="h-5 w-5" />
        <span className="text-xs">{language === 'en' ? 'H-Slider' : 'מחוון אופקי'}</span>
      </Button>

      <Button 
        variant="outline" 
        className="h-14 flex flex-col gap-1 items-center justify-center bg-[#E5DEFF] hover:bg-[#E5DEFF]/90"
        onClick={handleVerticalSliderPuzzleClick}
      >
        <SlidersVertical className="h-5 w-5" />
        <span className="text-xs">{language === 'en' ? 'V-Slider' : 'מחוון אנכי'}</span>
      </Button>
    </div>
  );
};
