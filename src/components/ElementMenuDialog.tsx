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

  const backgroundColors = [
    { color: "#8E9196", name: "Neutral Gray" },
    { color: "#9b87f5", name: "Primary Purple" },
    { color: "#F2FCE2", name: "Soft Green" },
    { color: "#FEF7CD", name: "Soft Yellow" },
    { color: "#FEC6A1", name: "Soft Orange" },
    { color: "#E5DEFF", name: "Soft Purple" },
    { color: "#FFDEE2", name: "Soft Pink" },
    { color: "#D3E4FD", name: "Soft Blue" },
  ];

  const backgroundGradients = [
    { gradient: "linear-gradient(135deg, #fdfcfb 0%, #e2d1c3 100%)", name: "Warm Sand" },
    { gradient: "linear-gradient(to right, #ee9ca7, #ffdde1)", name: "Soft Peach" },
    { gradient: "linear-gradient(to top, #accbee 0%, #e7f0fd 100%)", name: "Cool Sky" },
    { gradient: "linear-gradient(to top, #d299c2 0%, #fef9d7 100%)", name: "Sweet Morning" },
    { gradient: "linear-gradient(90deg, hsla(24, 100%, 83%, 1) 0%, hsla(341, 91%, 68%, 1) 100%)", name: "Sunset" },
    { gradient: "linear-gradient(90deg, hsla(221, 45%, 73%, 1) 0%, hsla(220, 78%, 29%, 1) 100%)", name: "Deep Ocean" },
    { gradient: "linear-gradient(90deg, hsla(139, 70%, 75%, 1) 0%, hsla(63, 90%, 76%, 1) 100%)", name: "Fresh Grass" },
    { gradient: "linear-gradient(90deg, hsla(186, 33%, 94%, 1) 0%, hsla(216, 41%, 79%, 1) 100%)", name: "Gentle Sky" },
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
    } else if (type === 'background') {
      addElement('background', config);
      onOpenChange(false);
    } else {
      addElement(type as any, config);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[800px] w-[800px] max-h-[800px] h-[800px] p-0 gap-0 overflow-hidden">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b">
            <DialogHeader className="flex flex-row items-center gap-4">
              <DialogTitle className="text-xl text-canvas-purple font-bold">
                {language === 'en' ? 'Add New Element' : 'הוספת אלמנט חדש'}
              </DialogTitle>
            </DialogHeader>
            <DialogClose asChild>
              <button
                className="text-gray-700 hover:text-canvas-purple transition-colors"
                aria-label={language === 'en' ? 'Close menu' : 'סגור תפריט'}
              >
                <X size={28} />
              </button>
            </DialogClose>
          </div>

          <Tabs defaultValue="shapes" className="flex-1 flex flex-col">
            <div className="border-b bg-white">
              <TabsList className="w-full justify-center h-12 bg-transparent gap-4">
                <TabsTrigger value="shapes" className="data-[state=active]:bg-transparent data-[state=active]:text-canvas-purple">
                  {language === 'en' ? 'Shapes' : 'צורות'}
                </TabsTrigger>
                <TabsTrigger value="text" className="data-[state=active]:bg-transparent data-[state=active]:text-canvas-purple">
                  {language === 'en' ? 'Text' : 'טקסט'}
                </TabsTrigger>
                <TabsTrigger value="puzzles" className="data-[state=active]:bg-transparent data-[state=active]:text-canvas-purple">
                  {language === 'en' ? 'Puzzles' : 'פאזלים'}
                </TabsTrigger>
                <TabsTrigger value="backgrounds" className="data-[state=active]:bg-transparent data-[state=active]:text-canvas-purple">
                  {language === 'en' ? 'Backgrounds' : 'רקעים'}
                </TabsTrigger>
                <TabsTrigger value="media" className="data-[state=active]:bg-transparent data-[state=active]:text-canvas-purple">
                  {language === 'en' ? 'Media' : 'מדיה'}
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
                <div className="p-6">
                  <TabsContent value="shapes" className="m-0">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {shapes.map((shape) => (
                        <Button
                          key={shape.type}
                          variant="outline"
                          className="h-24 flex flex-col items-center justify-center gap-2 bg-[#F1F0FB] hover:bg-[#F1F0FB]/90"
                          onClick={() => handleElementClick(shape.type)}
                        >
                          <shape.icon className="h-8 w-8" />
                          <span>{shape.label}</span>
                        </Button>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="text" className="m-0">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {text.map((item) => (
                        <Button
                          key={item.type}
                          variant="outline"
                          className="h-24 flex flex-col items-center justify-center gap-2 bg-[#FEF7CD] hover:bg-[#FEF7CD]/90"
                          onClick={() => handleElementClick(item.type)}
                        >
                          <item.icon className="h-8 w-8" />
                          <span className={item.className}>{item.label}</span>
                        </Button>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="puzzles" className="m-0">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {puzzles.map((puzzle) => (
                        <Button
                          key={puzzle.type}
                          variant="outline"
                          className={cn(
                            "h-24 flex flex-col items-center justify-center gap-2",
                            puzzle.className,
                            "hover:opacity-90"
                          )}
                          onClick={() => handleElementClick(puzzle.type)}
                        >
                          <puzzle.icon className="h-8 w-8" />
                          <span>{puzzle.label}</span>
                        </Button>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="backgrounds" className="m-0">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-4">
                          {language === 'en' ? 'Solid Colors' : 'צבעים אחידים'}
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                          {backgroundColors.map((bg) => (
                            <Button
                              key={bg.color}
                              variant="outline"
                              className="h-24 flex flex-col items-center justify-center gap-2"
                              style={{ backgroundColor: bg.color }}
                              onClick={() => handleElementClick('background', { color: bg.color })}
                            >
                              <Palette className="h-8 w-8" style={{ color: 'white' }} />
                              <span className="text-white text-shadow">{bg.name}</span>
                            </Button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-4">
                          {language === 'en' ? 'Gradients' : 'גרדיאנטים'}
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                          {backgroundGradients.map((bg) => (
                            <Button
                              key={bg.gradient}
                              variant="outline"
                              className="h-24 flex flex-col items-center justify-center gap-2"
                              style={{ background: bg.gradient }}
                              onClick={() => handleElementClick('background', { gradient: bg.gradient })}
                            >
                              <Palette className="h-8 w-8" style={{ color: 'white' }} />
                              <span className="text-white text-shadow">{bg.name}</span>
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="media" className="m-0">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <Button
                        variant="outline"
                        className="h-24 flex flex-col items-center justify-center gap-2 bg-[#D3E4FD] hover:bg-[#D3E4FD]/90"
                        onClick={() => handleElementClick('image')}
                      >
                        <Image className="h-8 w-8" />
                        <span>{language === 'en' ? 'Upload Image' : 'העלאת תמונה'}</span>
                      </Button>
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
