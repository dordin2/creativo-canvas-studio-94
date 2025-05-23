import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Text, 
  Image, 
  Square, 
  Circle, 
  Triangle, 
  Lock, 
  Hash,
  Languages,
  MoveHorizontal,
  MousePointerClick,
  SlidersHorizontal,
  SlidersVertical
} from "lucide-react";
import { useDesignState, ElementType } from "@/context/DesignContext";
import { useLanguage } from "@/context/LanguageContext";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";

const MobileSidebar = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const { addElement } = useDesignState();
  const { t, language } = useLanguage();

  // Color swatches for backgrounds
  const colorSwatches = [
    "#FFFFFF", "#F3F4F6", "#E5E7EB", "#D1D5DB",
    "#FEE2E2", "#FEE7AA", "#D1FAE5", "#DBEAFE",
    "#8B5CF6", "#EC4899", "#F59E0B", "#10B981"
  ];

  // Pre-defined gradient backgrounds
  const gradients = [
    "linear-gradient(to right, #fc466b, #3f5efb)",
    "linear-gradient(to right, #8a2387, #e94057, #f27121)",
    "linear-gradient(to right, #00b09b, #96c93d)",
    "linear-gradient(to right, #ff9966, #ff5e62)",
    "linear-gradient(to right, #7f7fd5, #86a8e7, #91eae4)"
  ];

  // Handle puzzle options
  const handleImagePuzzleClick = () => {
    addElement('puzzle' as ElementType, {
      puzzleConfig: {
        name: language === 'en' ? 'Image Puzzle' : 'פאזל תמונה',
        type: 'image',
        placeholders: 3,
        images: [],
        solution: [0, 0, 0]
      }
    });
    onClose();
  };

  const handleNumberPuzzleClick = () => {
    addElement('puzzle' as ElementType, {
      puzzleConfig: {
        name: language === 'en' ? 'Number Lock' : 'מנעול מספרים',
        type: 'number',
        placeholders: 3,
        images: [],
        solution: [0, 0, 0],
        maxNumber: 9
      }
    });
    onClose();
  };

  const handleAlphabetPuzzleClick = () => {
    addElement('puzzle' as ElementType, {
      puzzleConfig: {
        name: language === 'en' ? 'Alphabet Lock' : 'מנעול אותיות',
        type: 'alphabet',
        placeholders: 3,
        images: [],
        solution: [0, 0, 0],
        maxLetter: 'Z'
      }
    });
    onClose();
  };

  const handleSequencePuzzleClick = () => {
    addElement('sequencePuzzle' as ElementType, {
      name: language === 'en' ? 'Sequence Puzzle' : 'פאזל רצף',
      sequencePuzzleConfig: {
        name: language === 'en' ? 'Sequence Puzzle' : 'פאזל רצף',
        images: [],
        solution: [],
        currentOrder: []
      }
    });
    onClose();
  };
  
  const handleClickSequencePuzzleClick = () => {
    addElement('clickSequencePuzzle' as ElementType, {
      name: language === 'en' ? 'Click Sequence Puzzle' : 'פאזל רצף קליקים',
      clickSequencePuzzleConfig: {
        name: language === 'en' ? 'Click Sequence Puzzle' : 'פאזל רצף קליקים',
        images: [],
        solution: [],
        clickedIndices: []
      }
    });
    onClose();
  };

  const handleHorizontalSliderPuzzleClick = () => {
    addElement('sliderPuzzle' as ElementType, {
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
    onClose();
  };

  const handleVerticalSliderPuzzleClick = () => {
    addElement('sliderPuzzle' as ElementType, {
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
    onClose();
  };

  const handleAddElement = (type: ElementType, config = {}) => {
    addElement(type, config);
    onClose();
  };

  return (
    <div className={`mobile-sidebar ${language === 'he' ? 'rtl' : 'ltr'} w-full`}>
      <Tabs defaultValue="elements" className="w-full">
        <TabsList className="grid grid-cols-3 w-full mb-4">
          <TabsTrigger value="elements">{t('sidebar.elements')}</TabsTrigger>
          <TabsTrigger value="text">{t('sidebar.text')}</TabsTrigger>
          <TabsTrigger value="background">{t('sidebar.background')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="elements" className="pb-16">
          <h3 className="text-sm font-medium mb-3">{t('sidebar.shapes')}</h3>
          <div className="grid grid-cols-2 gap-2 mb-6">
            <Button variant="outline" className="h-14 flex flex-col gap-1 items-center justify-center" 
                    onClick={() => handleAddElement('rectangle')}>
              <Square className="h-5 w-5" />
              <span className="text-xs">{t('sidebar.rectangle')}</span>
            </Button>
            <Button variant="outline" className="h-14 flex flex-col gap-1 items-center justify-center"
                    onClick={() => handleAddElement('circle')}>
              <Circle className="h-5 w-5" />
              <span className="text-xs">{t('sidebar.circle')}</span>
            </Button>
            <Button variant="outline" className="h-14 flex flex-col gap-1 items-center justify-center"
                    onClick={() => handleAddElement('triangle')}>
              <Triangle className="h-5 w-5" />
              <span className="text-xs">{t('sidebar.triangle')}</span>
            </Button>
            <Button variant="outline" className="h-14 flex flex-col gap-1 items-center justify-center"
                    onClick={() => handleAddElement('line')}>
              <div className="w-5 h-0.5 bg-current"></div>
              <span className="text-xs">{t('sidebar.line')}</span>
            </Button>
          </div>
          
          <h3 className="text-sm font-medium mb-3">{t('sidebar.media')}</h3>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" className="h-14 flex flex-col gap-1 items-center justify-center"
                    onClick={() => handleAddElement('image')}>
              <Image className="h-5 w-5" />
              <span className="text-xs">{t('sidebar.image')}</span>
            </Button>
            
            <Drawer>
              <DrawerTrigger asChild>
                <Button variant="outline" className="h-14 flex flex-col gap-1 items-center justify-center">
                  <Lock className="h-5 w-5" />
                  <span className="text-xs">{t('sidebar.puzzle')}</span>
                </Button>
              </DrawerTrigger>
              <DrawerContent className="px-4 pb-8">
                <div className="grid gap-2 mt-6">
                  <h3 className="text-lg font-medium mb-2">{t('sidebar.puzzle')}</h3>
                  <Button
                    variant="outline" 
                    className="justify-start"
                    onClick={handleImagePuzzleClick}
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    {t('sidebar.image.puzzle')}
                  </Button>
                  <Button
                    variant="outline" 
                    className="justify-start"
                    onClick={handleNumberPuzzleClick}
                  >
                    <Hash className="h-4 w-4 mr-2" />
                    {t('sidebar.number.lock')}
                  </Button>
                  <Button
                    variant="outline" 
                    className="justify-start"
                    onClick={handleAlphabetPuzzleClick}
                  >
                    <Languages className="h-4 w-4 mr-2" />
                    {t('sidebar.alphabet.lock')}
                  </Button>
                </div>
              </DrawerContent>
            </Drawer>
            
            <Button 
              variant="outline" 
              className="h-14 flex flex-col gap-1 items-center justify-center"
              onClick={handleSequencePuzzleClick}
            >
              <MoveHorizontal className="h-5 w-5 text-blue-600" />
              <span className="text-xs">{language === 'en' ? 'Sequence Puzzle' : 'פאזל רצף'}</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-14 flex flex-col gap-1 items-center justify-center"
              onClick={handleClickSequencePuzzleClick}
            >
              <MousePointerClick className="h-5 w-5 text-green-600" />
              <span className="text-xs">{language === 'en' ? 'Click Sequence' : 'רצף קליקים'}</span>
            </Button>
            
            <Drawer>
              <DrawerTrigger asChild>
                <Button variant="outline" className="h-14 flex flex-col gap-1 items-center justify-center">
                  <SlidersHorizontal className="h-5 w-5 text-purple-600" />
                  <span className="text-xs">{language === 'en' ? 'Slider Puzzle' : 'פאזל מחוונים'}</span>
                </Button>
              </DrawerTrigger>
              <DrawerContent className="px-4 pb-8">
                <div className="grid gap-2 mt-6">
                  <h3 className="text-lg font-medium mb-2">{language === 'en' ? 'Slider Puzzles' : 'פאזל מחוונים'}</h3>
                  <Button
                    variant="outline" 
                    className="justify-start"
                    onClick={handleHorizontalSliderPuzzleClick}
                  >
                    <SlidersHorizontal className="h-4 w-4 mr-2 text-purple-600" />
                    {language === 'en' ? 'Horizontal Sliders' : 'מחוונים אופקיים'}
                  </Button>
                  <Button
                    variant="outline" 
                    className="justify-start"
                    onClick={handleVerticalSliderPuzzleClick}
                  >
                    <SlidersVertical className="h-4 w-4 mr-2 text-purple-600" />
                    {language === 'en' ? 'Vertical Sliders' : 'מחוונים אנכיים'}
                  </Button>
                </div>
              </DrawerContent>
            </Drawer>
          </div>
        </TabsContent>
        
        <TabsContent value="text" className="pb-16">
          <h3 className="text-sm font-medium mb-3">{t('sidebar.text.styles')}</h3>
          <div className="flex flex-col gap-2">
            <Button variant="outline" className="justify-start h-12" onClick={() => handleAddElement('heading')}>
              <Text className="h-4 w-4 mr-2" />
              <span className="text-lg font-bold">{t('sidebar.heading')}</span>
            </Button>
            <Button variant="outline" className="justify-start h-12" onClick={() => handleAddElement('subheading')}>
              <Text className="h-4 w-4 mr-2" />
              <span className="text-base font-semibold">{t('sidebar.subheading')}</span>
            </Button>
            <Button variant="outline" className="justify-start h-12" onClick={() => handleAddElement('paragraph')}>
              <Text className="h-4 w-4 mr-2" />
              <span className="text-sm">{t('sidebar.paragraph')}</span>
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="background" className="pb-16">
          <h3 className="text-sm font-medium mb-3">{t('sidebar.solid.colors')}</h3>
          <div className="grid grid-cols-4 gap-2 mb-6">
            {colorSwatches.map((color, index) => (
              <button
                key={index}
                className="w-full aspect-square rounded border hover:scale-105 transition-transform"
                style={{ backgroundColor: color }}
                onClick={() => handleAddElement('background', { color })}
                aria-label={`Background color ${color}`}
              />
            ))}
          </div>
          
          <h3 className="text-sm font-medium mb-3">{t('sidebar.gradients')}</h3>
          <div className="grid grid-cols-2 gap-2">
            {gradients.map((gradient, index) => (
              <button
                key={index}
                className="w-full h-12 rounded border hover:scale-105 transition-transform"
                style={{ background: gradient }}
                onClick={() => handleAddElement('background', { gradient })}
                aria-label={`Gradient background ${index + 1}`}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MobileSidebar;
