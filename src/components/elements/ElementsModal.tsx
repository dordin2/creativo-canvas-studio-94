
import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Library, Image, Upload, Shapes, Puzzle } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { ImagesTab } from "./tabs/ImagesTab";
import { UploadTab } from "./tabs/UploadTab";
import { ShapesTab } from "./tabs/ShapesTab";
import { PuzzlesTab } from "./tabs/PuzzlesTab";

export const ElementsModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { language } = useLanguage();

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="h-14 flex flex-col gap-1 items-center justify-center">
          <Library className="h-5 w-5" />
          <span className="text-xs">Elements</span>
        </Button>
      </SheetTrigger>
      <SheetContent side={language === 'he' ? 'right' : 'left'} className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Elements</SheetTitle>
        </SheetHeader>
        
        <div className="mt-6">
          <Tabs defaultValue="images" className="w-full">
            <TabsList className="grid grid-cols-4 gap-2">
              <TabsTrigger value="images" className="flex items-center gap-2">
                <Image className="h-4 w-4" />
                <span>Images</span>
              </TabsTrigger>
              <TabsTrigger value="upload" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                <span>Upload</span>
              </TabsTrigger>
              <TabsTrigger value="shapes" className="flex items-center gap-2">
                <Shapes className="h-4 w-4" />
                <span>Shapes</span>
              </TabsTrigger>
              <TabsTrigger value="puzzles" className="flex items-center gap-2">
                <Puzzle className="h-4 w-4" />
                <span>Puzzles</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="images">
              <ImagesTab onClose={() => setIsOpen(false)} />
            </TabsContent>
            
            <TabsContent value="upload">
              <UploadTab onClose={() => setIsOpen(false)} />
            </TabsContent>
            
            <TabsContent value="shapes">
              <ShapesTab onClose={() => setIsOpen(false)} />
            </TabsContent>
            
            <TabsContent value="puzzles">
              <PuzzlesTab onClose={() => setIsOpen(false)} />
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
};
