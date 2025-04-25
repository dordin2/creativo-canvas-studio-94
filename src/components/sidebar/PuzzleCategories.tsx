
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
    <div className="space-y-6">
      {/* Basic Puzzles */}
      <div>
        <h3 className="text-sm font-medium mb-3 text-purple-700">{t('sidebar.basic.puzzles')}</h3>
        <div className="grid grid-cols-1 gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="h-14 flex flex-col gap-1 items-center justify-center w-full bg-[#E5DEFF] hover:bg-[#E5DEFF]/90">
                <Lock className="h-5 w-5" />
                <span className="text-xs">{t('sidebar.puzzle')}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-60 p-2">
              <div className="grid gap-2">
                <Button variant="outline" className="justify-start" onClick={handleImagePuzzleClick}>
                  <Lock className="h-4 w-4 mr-2" />
                  {t('sidebar.image.puzzle')}
                </Button>
                <Button variant="outline" className="justify-start" onClick={handleNumberPuzzleClick}>
                  <Hash className="h-4 w-4 mr-2" />
                  {t('sidebar.number.lock')}
                </Button>
                <Button variant="outline" className="justify-start" onClick={handleAlphabetPuzzleClick}>
                  <Languages className="h-4 w-4 mr-2" />
                  {t('sidebar.alphabet.lock')}
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Sequence Puzzles */}
      <div>
        <h3 className="text-sm font-medium mb-3 text-blue-700">{t('sidebar.sequence.puzzles')}</h3>
        <div className="grid grid-cols-2 gap-2">
          <Button 
            variant="outline" 
            className="h-14 flex flex-col gap-1 items-center justify-center bg-[#D3E4FD] hover:bg-[#D3E4FD]/90"
            onClick={handleSequencePuzzleClick}
          >
            <MoveHorizontal className="h-5 w-5" />
            <span className="text-xs">{language === 'en' ? 'Sequence' : 'רצף'}</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-14 flex flex-col gap-1 items-center justify-center bg-[#F2FCE2] hover:bg-[#F2FCE2]/90"
            onClick={handleClickSequencePuzzleClick}
          >
            <MousePointerClick className="h-5 w-5" />
            <span className="text-xs">{language === 'en' ? 'Click' : 'קליקים'}</span>
          </Button>
        </div>
      </div>

      {/* Slider Puzzles */}
      <div>
        <h3 className="text-sm font-medium mb-3 text-orange-700">{t('sidebar.slider.puzzles')}</h3>
        <div className="grid grid-cols-2 gap-2">
          <Button 
            variant="outline" 
            className="h-14 flex flex-col gap-1 items-center justify-center bg-[#FEC6A1] hover:bg-[#FEC6A1]/90"
            onClick={handleHorizontalSliderPuzzleClick}
          >
            <SlidersHorizontal className="h-5 w-5" />
            <span className="text-xs">{language === 'en' ? 'Horizontal' : 'אופקי'}</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-14 flex flex-col gap-1 items-center justify-center bg-[#FFDEE2] hover:bg-[#FFDEE2]/90"
            onClick={handleVerticalSliderPuzzleClick}
          >
            <SlidersVertical className="h-5 w-5" />
            <span className="text-xs">{language === 'en' ? 'Vertical' : 'אנכי'}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
