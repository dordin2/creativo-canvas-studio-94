
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
  CircleCheck
} from "lucide-react";
import { useDesignState } from "@/context/DesignContext";
import { useLanguage } from "@/context/LanguageContext";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const Sidebar = () => {
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
      name: language === 'en' ? 'Click Sequence Puzzle' : 'פאזל לחיצה לפי סדר',
      clickSequencePuzzleConfig: {
        name: language === 'en' ? 'Click Sequence Puzzle' : 'פאזל לחיצה לפי סדר',
        images: [],
        solution: [],
        maxAttempts: 3,
        currentProgress: 0,
        attempts: 0
      }
    });
  };

  return (
    <div className={`sidebar-panel border-r flex flex-col ${language === 'he' ? 'rtl' : 'ltr'}`}>
      <Tabs defaultValue="elements" className="flex-1 flex flex-col">
        <TabsList className="grid grid-cols-3 mx-2 mt-2">
          <TabsTrigger value="elements">{t('sidebar.elements')}</TabsTrigger>
          <TabsTrigger value="text">{t('sidebar.text')}</TabsTrigger>
          <TabsTrigger value="background">{t('sidebar.background')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="elements" className="flex-1 overflow-auto p-4">
          <h3 className="text-sm font-medium mb-3">{t('sidebar.shapes')}</h3>
          <div className="grid grid-cols-2 gap-2 mb-6">
            <Button variant="outline" className="h-14 flex flex-col gap-1 items-center justify-center" 
                    onClick={() => addElement('rectangle')}>
              <Square className="h-5 w-5" />
              <span className="text-xs">{t('sidebar.rectangle')}</span>
            </Button>
            <Button variant="outline" className="h-14 flex flex-col gap-1 items-center justify-center"
                    onClick={() => addElement('circle')}>
              <Circle className="h-5 w-5" />
              <span className="text-xs">{t('sidebar.circle')}</span>
            </Button>
            <Button variant="outline" className="h-14 flex flex-col gap-1 items-center justify-center"
                    onClick={() => addElement('triangle')}>
              <Triangle className="h-5 w-5" />
              <span className="text-xs">{t('sidebar.triangle')}</span>
            </Button>
            <Button variant="outline" className="h-14 flex flex-col gap-1 items-center justify-center"
                    onClick={() => addElement('line')}>
              <div className="w-5 h-0.5 bg-current"></div>
              <span className="text-xs">{t('sidebar.line')}</span>
            </Button>
          </div>
          
          <h3 className="text-sm font-medium mb-3">{t('sidebar.media')}</h3>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" className="h-14 flex flex-col gap-1 items-center justify-center"
                    onClick={() => addElement('image')}>
              <Image className="h-5 w-5" />
              <span className="text-xs">{t('sidebar.image')}</span>
            </Button>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="h-14 flex flex-col gap-1 items-center justify-center">
                  <Lock className="h-5 w-5" />
                  <span className="text-xs">{t('sidebar.puzzle')}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-60 p-2">
                <div className="grid gap-2">
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
              </PopoverContent>
            </Popover>
            
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
              <CircleCheck className="h-5 w-5 text-purple-600" />
              <span className="text-xs">{language === 'en' ? 'Click Sequence' : 'פאזל לחיצה לפי סדר'}</span>
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="text" className="flex-1 overflow-auto p-4">
          <h3 className="text-sm font-medium mb-3">{t('sidebar.text.styles')}</h3>
          <div className="flex flex-col gap-2">
            <Button variant="outline" className="justify-start h-12" onClick={() => addElement('heading')}>
              <Text className="h-4 w-4 mr-2" />
              <span className="text-lg font-bold">{t('sidebar.heading')}</span>
            </Button>
            <Button variant="outline" className="justify-start h-12" onClick={() => addElement('subheading')}>
              <Text className="h-4 w-4 mr-2" />
              <span className="text-base font-semibold">{t('sidebar.subheading')}</span>
            </Button>
            <Button variant="outline" className="justify-start h-12" onClick={() => addElement('paragraph')}>
              <Text className="h-4 w-4 mr-2" />
              <span className="text-sm">{t('sidebar.paragraph')}</span>
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="background" className="flex-1 overflow-auto p-4">
          <h3 className="text-sm font-medium mb-3">{t('sidebar.solid.colors')}</h3>
          <div className="grid grid-cols-4 gap-2 mb-6">
            {colorSwatches.map((color, index) => (
              <button
                key={index}
                className="w-12 h-12 rounded border hover:scale-105 transition-transform"
                style={{ backgroundColor: color }}
                onClick={() => addElement('background', { color })}
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
                onClick={() => addElement('background', { gradient })}
                aria-label={`Gradient background ${index + 1}`}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Sidebar;
