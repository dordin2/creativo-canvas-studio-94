import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, ALargeSmall, Palette, Text } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { ImagesTab } from "./tabs/ImagesTab";
import { UploadTab } from "./tabs/UploadTab";
import { ShapesTab } from "./tabs/ShapesTab";
import { PuzzlesTab } from "./tabs/PuzzlesTab";
import { useDesignState } from "@/context/DesignContext";

export const ElementsModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { t, language } = useLanguage();
  const { addElement } = useDesignState();

  const colorSwatches = [
    "#FFFFFF", "#F3F4F6", "#E5E7EB", "#D1D5DB",
    "#FEE2E2", "#FEE7AA", "#D1FAE5", "#DBEAFE",
    "#8B5CF6", "#EC4899", "#F59E0B", "#10B981"
  ];

  const gradients = [
    "linear-gradient(to right, #fc466b, #3f5efb)",
    "linear-gradient(to right, #8a2387, #e94057, #f27121)",
    "linear-gradient(to right, #00b09b, #96c93d)",
    "linear-gradient(to right, #ff9966, #ff5e62)",
    "linear-gradient(to right, #7f7fd5, #86a8e7, #91eae4)"
  ];

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="h-14 flex flex-col gap-1 items-center justify-center">
          <Plus className="h-5 w-5" />
          <span className="text-xs">{t('sidebar.elements')}</span>
        </Button>
      </SheetTrigger>
      <SheetContent side={language === 'he' ? 'right' : 'left'} className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>{t('sidebar.elements')}</SheetTitle>
        </SheetHeader>
        
        <div className="mt-6">
          <Tabs defaultValue="elements" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="elements">
                <Plus className="h-4 w-4 mr-2" />
                <span>{t('sidebar.elements')}</span>
              </TabsTrigger>
              <TabsTrigger value="text">
                <ALargeSmall className="h-4 w-4 mr-2" />
                <span>{t('sidebar.text')}</span>
              </TabsTrigger>
              <TabsTrigger value="background">
                <Palette className="h-4 w-4 mr-2" />
                <span>{t('sidebar.background')}</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="elements">
              <Tabs defaultValue="images" className="w-full">
                <TabsList className="grid grid-cols-4 gap-2">
                  <TabsTrigger value="images">Images</TabsTrigger>
                  <TabsTrigger value="upload">Upload</TabsTrigger>
                  <TabsTrigger value="shapes">Shapes</TabsTrigger>
                  <TabsTrigger value="puzzles">Puzzles</TabsTrigger>
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
            </TabsContent>

            <TabsContent value="text" className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start h-12"
                onClick={() => {
                  addElement('heading');
                  setIsOpen(false);
                }}
              >
                <Text className="h-4 w-4 mr-2" />
                <span className="text-lg font-bold">{t('sidebar.heading')}</span>
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start h-12"
                onClick={() => {
                  addElement('subheading');
                  setIsOpen(false);
                }}
              >
                <Text className="h-4 w-4 mr-2" />
                <span className="text-base font-semibold">{t('sidebar.subheading')}</span>
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start h-12"
                onClick={() => {
                  addElement('paragraph');
                  setIsOpen(false);
                }}
              >
                <Text className="h-4 w-4 mr-2" />
                <span className="text-sm">{t('sidebar.paragraph')}</span>
              </Button>
            </TabsContent>

            <TabsContent value="background">
              <h3 className="text-sm font-medium mb-3">{t('sidebar.solid.colors')}</h3>
              <div className="grid grid-cols-4 gap-2 mb-6">
                {colorSwatches.map((color, index) => (
                  <button
                    key={index}
                    className="w-full aspect-square rounded border hover:scale-105 transition-transform"
                    style={{ backgroundColor: color }}
                    onClick={() => {
                      addElement('background', { color });
                      setIsOpen(false);
                    }}
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
                    onClick={() => {
                      addElement('background', { gradient });
                      setIsOpen(false);
                    }}
                    aria-label={`Gradient background ${index + 1}`}
                  />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
};
