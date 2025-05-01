
import React, { useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDesignState } from "@/context/DesignContext";
import { useLanguage } from "@/context/LanguageContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  Square, 
  Type, 
  Image, 
  X, 
  Circle, 
  Triangle,
  Lock, 
  Hash,
  Languages,
  MoveHorizontal,
  MousePointerClick,
  SlidersHorizontal,
  SlidersVertical,
  Palette
} from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { LibraryView } from "./library/LibraryView";
import { Drawer, DrawerContent, DrawerTrigger } from "./ui/drawer";

interface ElementMenuDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ElementMenuDialog: React.FC<ElementMenuDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const { addElement, handleImageUpload } = useDesignState();
  const { language } = useLanguage();
  const isMobile = useIsMobile();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const preventZoom = React.useCallback((e: WheelEvent) => {
    if (e.ctrlKey) {
      e.preventDefault();
    }
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      document.addEventListener("wheel", preventZoom, { passive: false });
    } else {
      document.body.style.overflow = "";
      document.removeEventListener("wheel", preventZoom);
    }

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("wheel", preventZoom);
    };
  }, [open, preventZoom]);

  const handleImageUploadClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const newElement = addElement('image');
      handleImageUpload(newElement.id, file);
      onOpenChange(false);
    }
  };

  const handleElementClick = (type: string, config?: any) => {
    if (type === 'image') {
      fileInputRef.current?.click();
    } else {
      addElement(type as any, config);
      onOpenChange(false);
    }
  };

  // Handle puzzle options
  const handleImagePuzzleClick = () => {
    addElement('puzzle' as any, {
      puzzleConfig: {
        name: language === 'en' ? 'Image Puzzle' : 'פאזל תמונה',
        type: 'image',
        placeholders: 3,
        images: [],
        solution: [0, 0, 0]
      }
    });
    onOpenChange(false);
  };

  const handleNumberPuzzleClick = () => {
    addElement('puzzle' as any, {
      puzzleConfig: {
        name: language === 'en' ? 'Number Lock' : 'מנעול מספרים',
        type: 'number',
        placeholders: 3,
        images: [],
        solution: [0, 0, 0],
        maxNumber: 9
      }
    });
    onOpenChange(false);
  };

  const handleAlphabetPuzzleClick = () => {
    addElement('puzzle' as any, {
      puzzleConfig: {
        name: language === 'en' ? 'Alphabet Lock' : 'מנעול אותיות',
        type: 'alphabet',
        placeholders: 3,
        images: [],
        solution: [0, 0, 0],
        maxLetter: 'Z'
      }
    });
    onOpenChange(false);
  };

  const handleSequencePuzzleClick = () => {
    addElement('sequencePuzzle' as any, {
      name: language === 'en' ? 'Sequence Puzzle' : 'פאזל רצף',
      sequencePuzzleConfig: {
        name: language === 'en' ? 'Sequence Puzzle' : 'פאזל רצף',
        images: [],
        solution: [],
        currentOrder: []
      }
    });
    onOpenChange(false);
  };
  
  const handleClickSequencePuzzleClick = () => {
    addElement('clickSequencePuzzle' as any, {
      name: language === 'en' ? 'Click Sequence Puzzle' : 'פאזל רצף קליקים',
      clickSequencePuzzleConfig: {
        name: language === 'en' ? 'Click Sequence Puzzle' : 'פאזל רצף קליקים',
        images: [],
        solution: [],
        clickedIndices: []
      }
    });
    onOpenChange(false);
  };

  const handleHorizontalSliderPuzzleClick = () => {
    addElement('sliderPuzzle' as any, {
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
    onOpenChange(false);
  };

  const handleVerticalSliderPuzzleClick = () => {
    addElement('sliderPuzzle' as any, {
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
    onOpenChange(false);
  };

  const solidColors = [
    { color: '#F1F0FB', label: language === 'en' ? 'Soft Gray' : 'אפור בהיר' },
    { color: '#FEF7CD', label: language === 'en' ? 'Soft Yellow' : 'צהוב בהיר' },
    { color: '#E5DEFF', label: language === 'en' ? 'Soft Purple' : 'סגול בהיר' },
    { color: '#D3E4FD', label: language === 'en' ? 'Soft Blue' : 'כחול בהיר' },
    { color: '#FFDEE2', label: language === 'en' ? 'Soft Pink' : 'ורוד בהיר' },
    { color: '#FDE1D3', label: language === 'en' ? 'Soft Peach' : 'אפרסק בהיר' },
  ];

  const gradients = [
    { gradient: 'linear-gradient(to right, #ffc3a0 0%, #ffafbd 100%)', label: language === 'en' ? 'Peach Sunset' : 'שקיעת אפרסק' },
    { gradient: 'linear-gradient(to top, #e6b980 0%, #eacda3 100%)', label: language === 'en' ? 'Golden Hour' : 'שעת זהב' },
    { gradient: 'linear-gradient(to right, #243949 0%, #517fa4 100%)', label: language === 'en' ? 'Ocean Blue' : 'כחול אוקיינוס' },
    { gradient: 'linear-gradient(108deg, rgba(223,234,247,1) 11.2%, rgba(244,248,252,1) 91.1%)', label: language === 'en' ? 'Soft Sky' : 'שמיים בהירים' },
  ];

  const handleBackgroundClick = (style: any) => {
    addElement('background', style);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(
        "max-h-[90vh] p-0 gap-0 overflow-hidden",
        isMobile ? "w-[95vw] max-w-full" : "max-w-[800px] w-[800px]"
      )}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b">
            <DialogHeader className="flex flex-row items-center gap-2">
              <DialogTitle className="text-xl text-canvas-purple font-bold">
                {language === 'en' ? 'Add Element' : 'הוספת אלמנט'}
              </DialogTitle>
            </DialogHeader>
            <DialogClose asChild>
              <button
                className="text-gray-700 hover:text-canvas-purple transition-colors"
                aria-label={language === 'en' ? 'Close menu' : 'סגור תפריט'}
              >
                <X size={24} />
              </button>
            </DialogClose>
          </div>

          <Tabs defaultValue="elements" className="flex-1 flex flex-col">
            <div className="border-b bg-white overflow-x-auto">
              <TabsList className={cn(
                "w-full justify-start h-12 bg-transparent px-2",
                isMobile ? "grid grid-cols-3" : "justify-center gap-4"
              )}>
                <TabsTrigger value="elements" className="data-[state=active]:bg-transparent data-[state=active]:text-canvas-purple">
                  {language === 'en' ? 'Elements' : 'אלמנטים'}
                </TabsTrigger>
                <TabsTrigger value="text" className="data-[state=active]:bg-transparent data-[state=active]:text-canvas-purple">
                  {language === 'en' ? 'Text' : 'טקסט'}
                </TabsTrigger>
                <TabsTrigger value="background" className="data-[state=active]:bg-transparent data-[state=active]:text-canvas-purple">
                  {language === 'en' ? 'Background' : 'רקע'}
                </TabsTrigger>
              </TabsList>
            </div>

            <input
              type="file"
              id="image-upload"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleImageUploadClick}
            />

            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-4 pb-12">
                  <TabsContent value="elements" className="m-0">
                    <h3 className="text-sm font-medium mb-3">
                      {language === 'en' ? 'Shapes' : 'צורות'}
                    </h3>
                    <div className={`grid ${isMobile ? 'grid-cols-2' : 'sm:grid-cols-4'} gap-3 mb-6`}>
                      <Button
                        variant="outline"
                        className="h-16 flex flex-col gap-2 items-center justify-center bg-[#F1F0FB] hover:bg-[#F1F0FB]/90"
                        onClick={() => handleElementClick('rectangle')}
                      >
                        <Square className="h-5 w-5" />
                        <span className="text-xs">{language === 'en' ? 'Rectangle' : 'מלבן'}</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-16 flex flex-col gap-2 items-center justify-center bg-[#F1F0FB] hover:bg-[#F1F0FB]/90"
                        onClick={() => handleElementClick('circle')}
                      >
                        <Circle className="h-5 w-5" />
                        <span className="text-xs">{language === 'en' ? 'Circle' : 'עיגול'}</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-16 flex flex-col gap-2 items-center justify-center bg-[#F1F0FB] hover:bg-[#F1F0FB]/90"
                        onClick={() => handleElementClick('triangle')}
                      >
                        <Triangle className="h-5 w-5" />
                        <span className="text-xs">{language === 'en' ? 'Triangle' : 'משולש'}</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-16 flex flex-col gap-2 items-center justify-center bg-[#F1F0FB] hover:bg-[#F1F0FB]/90"
                        onClick={() => handleElementClick('line')}
                      >
                        <div className="w-5 h-0.5 bg-current mb-1"></div>
                        <span className="text-xs">{language === 'en' ? 'Line' : 'קו'}</span>
                      </Button>
                    </div>
                    
                    <h3 className="text-sm font-medium mb-3">
                      {language === 'en' ? 'Media' : 'מדיה'}
                    </h3>
                    <div className={`grid ${isMobile ? 'grid-cols-2' : 'sm:grid-cols-4'} gap-3 mb-6`}>
                      <Button
                        variant="outline"
                        className="h-16 flex flex-col gap-2 items-center justify-center bg-[#D3E4FD] hover:bg-[#D3E4FD]/90"
                        onClick={() => handleElementClick('image')}
                      >
                        <Image className="h-5 w-5" />
                        <span className="text-xs">{language === 'en' ? 'Image' : 'תמונה'}</span>
                      </Button>
                      
                      <Drawer>
                        <DrawerTrigger asChild>
                          <Button 
                            variant="outline" 
                            className="h-16 flex flex-col gap-2 items-center justify-center bg-[#E5DEFF] hover:bg-[#E5DEFF]/90"
                          >
                            <Lock className="h-5 w-5" />
                            <span className="text-xs">{language === 'en' ? 'Lock Puzzle' : 'מנעול פאזל'}</span>
                          </Button>
                        </DrawerTrigger>
                        <DrawerContent className="px-4 pb-8">
                          <div className="grid gap-2 mt-6">
                            <h3 className="text-lg font-medium mb-2">{language === 'en' ? 'Lock Puzzles' : 'פאזל מנעול'}</h3>
                            <Button
                              variant="outline" 
                              className="justify-start"
                              onClick={handleImagePuzzleClick}
                            >
                              <Image className="h-4 w-4 mr-2" />
                              {language === 'en' ? 'Image Puzzle' : 'פאזל תמונה'}
                            </Button>
                            <Button
                              variant="outline" 
                              className="justify-start"
                              onClick={handleNumberPuzzleClick}
                            >
                              <Hash className="h-4 w-4 mr-2" />
                              {language === 'en' ? 'Number Lock' : 'מנעול מספרים'}
                            </Button>
                            <Button
                              variant="outline" 
                              className="justify-start"
                              onClick={handleAlphabetPuzzleClick}
                            >
                              <Languages className="h-4 w-4 mr-2" />
                              {language === 'en' ? 'Alphabet Lock' : 'מנעול אותיות'}
                            </Button>
                          </div>
                        </DrawerContent>
                      </Drawer>
                      
                      <Button 
                        variant="outline" 
                        className="h-16 flex flex-col gap-2 items-center justify-center bg-[#E5DEFF] hover:bg-[#E5DEFF]/90"
                        onClick={handleSequencePuzzleClick}
                      >
                        <MoveHorizontal className="h-5 w-5 text-blue-600" />
                        <span className="text-xs">{language === 'en' ? 'Sequence' : 'רצף'}</span>
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="h-16 flex flex-col gap-2 items-center justify-center bg-[#E5DEFF] hover:bg-[#E5DEFF]/90"
                        onClick={handleClickSequencePuzzleClick}
                      >
                        <MousePointerClick className="h-5 w-5 text-green-600" />
                        <span className="text-xs">{language === 'en' ? 'Click Sequence' : 'רצף קליקים'}</span>
                      </Button>
                      
                      <Drawer>
                        <DrawerTrigger asChild>
                          <Button 
                            variant="outline"
                            className="h-16 flex flex-col gap-2 items-center justify-center bg-[#E5DEFF] hover:bg-[#E5DEFF]/90"
                          >
                            <SlidersHorizontal className="h-5 w-5 text-purple-600" />
                            <span className="text-xs">{language === 'en' ? 'Slider Puzzle' : 'מחוון פאזל'}</span>
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
                    
                    <h3 className="text-sm font-medium mb-3">
                      {language === 'en' ? 'Library' : 'ספרייה'}
                    </h3>
                    <div className="mb-4">
                      <Button 
                        variant="outline" 
                        className="w-full h-12 justify-start"
                        onClick={() => document.querySelector('[data-state="inactive"][value="library"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))}
                      >
                        <LibraryView onClose={() => onOpenChange(false)} />
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="text" className="m-0">
                    <h3 className="text-sm font-medium mb-3">
                      {language === 'en' ? 'Text Styles' : 'סגנונות טקסט'}
                    </h3>
                    <div className="flex flex-col gap-2">
                      <Button 
                        variant="outline" 
                        className="justify-start h-14 bg-[#FEF7CD] hover:bg-[#FEF7CD]/90" 
                        onClick={() => handleElementClick('heading')}
                      >
                        <Type className="h-4 w-4 mr-2" />
                        <span className="text-lg font-bold">{language === 'en' ? 'Heading' : 'כותרת'}</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="justify-start h-14 bg-[#FEF7CD] hover:bg-[#FEF7CD]/90" 
                        onClick={() => handleElementClick('subheading')}
                      >
                        <Type className="h-4 w-4 mr-2" />
                        <span className="text-base font-semibold">{language === 'en' ? 'Subheading' : 'כותרת משנה'}</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="justify-start h-14 bg-[#FEF7CD] hover:bg-[#FEF7CD]/90" 
                        onClick={() => handleElementClick('paragraph')}
                      >
                        <Type className="h-4 w-4 mr-2" />
                        <span className="text-sm">{language === 'en' ? 'Paragraph' : 'פסקה'}</span>
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="background" className="m-0">
                    <h3 className="text-sm font-medium mb-3">
                      {language === 'en' ? 'Solid Colors' : 'צבעים אחידים'}
                    </h3>
                    <div className={`grid ${isMobile ? 'grid-cols-3' : 'grid-cols-6'} gap-3 mb-6`}>
                      {solidColors.map((item, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          className="h-16 p-0 flex flex-col items-center justify-end hover:opacity-90"
                          style={{ backgroundColor: item.color }}
                          onClick={() => handleBackgroundClick({ color: item.color })}
                        >
                          <div className="w-full bg-white bg-opacity-70 py-1 text-center">
                            <span className="text-xs text-gray-700">{item.label}</span>
                          </div>
                        </Button>
                      ))}
                    </div>

                    <h3 className="text-sm font-medium mb-3">
                      {language === 'en' ? 'Gradients' : 'גרדיאנטים'}
                    </h3>
                    <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-3`}>
                      {gradients.map((item, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          className="h-14 flex items-center justify-center hover:opacity-90 relative"
                          style={{ background: item.gradient }}
                          onClick={() => handleBackgroundClick({ gradient: item.gradient })}
                        >
                          <span className="text-sm text-white text-shadow">{item.label}</span>
                        </Button>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="library" className="m-0">
                    <LibraryView onClose={() => onOpenChange(false)} />
                  </TabsContent>
                </div>
              </ScrollArea>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};
