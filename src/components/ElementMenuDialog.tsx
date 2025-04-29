
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
import { Square, Type, Lock, MoveHorizontal, MousePointerClick, SlidersHorizontal, Circle, Triangle, Image, X, Palette } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { processImageUpload } from "@/utils/imageUploader";
import { LibraryView } from "./library/LibraryView";

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
  }, [open]);

  const preventZoom = (e: WheelEvent) => {
    if (e.ctrlKey) {
      e.preventDefault();
    }
  };

  const shapes = [
    { icon: Square, label: language === 'en' ? 'Rectangle' : 'מלבן', type: 'rectangle' },
    { icon: Circle, label: language === 'en' ? 'Circle' : 'עיגול', type: 'circle' },
    { icon: Triangle, label: language === 'en' ? 'Triangle' : 'משולש', type: 'triangle' },
    { 
      icon: () => <div className="w-5 h-0.5 bg-current"></div>, 
      label: language === 'en' ? 'Line' : 'קו', 
      type: 'line' 
    }
  ];

  const text = [
    { 
      icon: Type, 
      label: language === 'en' ? 'Heading' : 'כותרת', 
      type: 'heading',
      className: 'text-lg font-bold'
    },
    { 
      icon: Type, 
      label: language === 'en' ? 'Subheading' : 'כותרת משנה', 
      type: 'subheading',
      className: 'text-base font-semibold'
    },
    { 
      icon: Type, 
      label: language === 'en' ? 'Paragraph' : 'פסקה', 
      type: 'paragraph',
      className: 'text-sm'
    }
  ];

  const puzzles = [
    { 
      icon: Lock, 
      label: language === 'en' ? 'Lock' : 'מנעול', 
      type: 'puzzle',
      className: 'bg-[#E5DEFF]'
    },
    { 
      icon: MoveHorizontal, 
      label: language === 'en' ? 'Sequence' : 'רצף', 
      type: 'sequencePuzzle',
      className: 'bg-[#E5DEFF]'
    },
    { 
      icon: MousePointerClick, 
      label: language === 'en' ? 'Clicks' : 'קלicks', 
      type: 'clickSequencePuzzle',
      className: 'bg-[#E5DEFF]'
    },
    { 
      icon: SlidersHorizontal, 
      label: language === 'en' ? 'Slider' : 'מחוון', 
      type: 'sliderPuzzle',
      className: 'bg-[#E5DEFF]'
    }
  ];

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

  const solidColors = [
    { color: '#F1F0FB', label: language === 'en' ? 'Soft Gray' : 'אפור בהיר' },
    { color: '#FEF7CD', label: language === 'en' ? 'Soft Yellow' : 'צהוב בהיר' },
    { color: '#E5DEFF', label: language === 'en' ? 'Soft Purple' : 'סגול בהיר' },
    { color: '#D3E4FD', label: language === 'en' ? 'Soft Blue' : 'כחול בהיר' },
    { color: '#FFDEE2', label: language === 'en' ? 'Soft Pink' : 'ורוד בהיר' },
    { color: '#FDE1D3', label: language === 'en' ? 'Soft Peach' : 'אפרסק בהיר' },
    { color: '#F2FCE2', label: language === 'en' ? 'Soft Green' : 'ירוק בהיר' },
    { color: '#FFFFFF', label: language === 'en' ? 'Pure White' : 'לבן' },
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

  const gridColumnsClass = isMobile ? 'grid-cols-2' : 'sm:grid-cols-4';

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
                {language === 'en' ? 'Add New Element' : 'הוספת אלמנט חדש'}
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

          <Tabs defaultValue="shapes" className="flex-1 flex flex-col">
            <div className="border-b bg-white overflow-x-auto">
              <TabsList className={cn(
                "w-full justify-start h-12 bg-transparent px-2",
                isMobile ? "flex-wrap" : "justify-center gap-4"
              )}>
                <TabsTrigger value="shapes" className="data-[state=active]:bg-transparent data-[state=active]:text-canvas-purple">
                  {language === 'en' ? 'Shapes' : 'צורות'}
                </TabsTrigger>
                <TabsTrigger value="text" className="data-[state=active]:bg-transparent data-[state=active]:text-canvas-purple">
                  {language === 'en' ? 'Text' : 'טקסט'}
                </TabsTrigger>
                <TabsTrigger value="puzzles" className="data-[state=active]:bg-transparent data-[state=active]:text-canvas-purple">
                  {language === 'en' ? 'Puzzles' : 'פאזלים'}
                </TabsTrigger>
                <TabsTrigger value="media" className="data-[state=active]:bg-transparent data-[state=active]:text-canvas-purple">
                  {language === 'en' ? 'Media' : 'מדיה'}
                </TabsTrigger>
                <TabsTrigger value="backgrounds" className="data-[state=active]:bg-transparent data-[state=active]:text-canvas-purple">
                  {language === 'en' ? 'Backgrounds' : 'רקעים'}
                </TabsTrigger>
                <TabsTrigger value="library" className="data-[state=active]:bg-transparent data-[state=active]:text-canvas-purple">
                  {language === 'en' ? 'Library' : 'ספרייה'}
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
                  <TabsContent value="shapes" className="m-0">
                    <div className={`grid ${gridColumnsClass} gap-3`}>
                      {shapes.map((shape) => (
                        <Button
                          key={shape.type}
                          variant="outline"
                          className={cn(
                            "flex flex-col items-center justify-center gap-2 bg-[#F1F0FB] hover:bg-[#F1F0FB]/90",
                            isMobile ? "h-20" : "h-24"
                          )}
                          onClick={() => handleElementClick(shape.type)}
                        >
                          <shape.icon className="h-6 w-6" />
                          <span>{shape.label}</span>
                        </Button>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="text" className="m-0">
                    <div className={`grid ${isMobile ? 'grid-cols-1' : 'sm:grid-cols-3'} gap-3`}>
                      {text.map((item) => (
                        <Button
                          key={item.type}
                          variant="outline"
                          className={cn(
                            "flex flex-col items-center justify-center gap-2 bg-[#FEF7CD] hover:bg-[#FEF7CD]/90",
                            isMobile ? "h-20" : "h-24"
                          )}
                          onClick={() => handleElementClick(item.type)}
                        >
                          <item.icon className="h-6 w-6" />
                          <span className={item.className}>{item.label}</span>
                        </Button>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="puzzles" className="m-0">
                    <div className={`grid ${gridColumnsClass} gap-3`}>
                      {puzzles.map((puzzle) => (
                        <Button
                          key={puzzle.type}
                          variant="outline"
                          className={cn(
                            "flex flex-col items-center justify-center gap-2",
                            puzzle.className,
                            "hover:opacity-90",
                            isMobile ? "h-20" : "h-24"
                          )}
                          onClick={() => handleElementClick(puzzle.type)}
                        >
                          <puzzle.icon className="h-6 w-6" />
                          <span>{puzzle.label}</span>
                        </Button>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="media" className="m-0">
                    <div className={`grid ${gridColumnsClass} gap-3`}>
                      <Button
                        variant="outline"
                        className={cn(
                          "flex flex-col items-center justify-center gap-2 bg-[#D3E4FD] hover:bg-[#D3E4FD]/90",
                          isMobile ? "h-20" : "h-24"
                        )}
                        onClick={() => handleElementClick('image')}
                      >
                        <Image className="h-6 w-6" />
                        <span>{language === 'en' ? 'Upload Image' : 'העלאת תמונה'}</span>
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="backgrounds" className="m-0">
                    <div className="space-y-5">
                      <div>
                        <h3 className="text-sm font-medium mb-3">
                          {language === 'en' ? 'Solid Colors' : 'צבעים אחידים'}
                        </h3>
                        <div className={`grid ${gridColumnsClass} gap-3`}>
                          {solidColors.map((item) => (
                            <Button
                              key={item.color}
                              variant="outline"
                              className={cn(
                                "flex flex-col items-center justify-center gap-2 hover:opacity-90",
                                isMobile ? "h-16" : "h-24"
                              )}
                              style={{ backgroundColor: item.color }}
                              onClick={() => handleBackgroundClick({ color: item.color })}
                            >
                              <span className="text-xs text-gray-600">{item.label}</span>
                            </Button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium mb-3">
                          {language === 'en' ? 'Gradients' : 'גרדיאנטים'}
                        </h3>
                        <div className={`grid ${isMobile ? 'grid-cols-1' : 'sm:grid-cols-4'} gap-3`}>
                          {gradients.map((item) => (
                            <Button
                              key={item.gradient}
                              variant="outline"
                              className={cn(
                                "flex flex-col items-center justify-center gap-2 hover:opacity-90",
                                isMobile ? "h-16" : "h-24"
                              )}
                              style={{ background: item.gradient }}
                              onClick={() => handleBackgroundClick({ gradient: item.gradient })}
                            >
                              <span className="text-xs text-white text-shadow">{item.label}</span>
                            </Button>
                          ))}
                        </div>
                      </div>
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
