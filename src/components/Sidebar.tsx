
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Text, Image, Square, Circle, Triangle } from "lucide-react";
import { useDesignState } from "@/context/DesignContext";
import { useLanguage } from "@/context/LanguageContext";
import { PuzzleCategories } from "./sidebar/PuzzleCategories";

const Sidebar = () => {
  const { addElement } = useDesignState();
  const { t, language } = useLanguage();

  // Color swatches for backgrounds
  const colorSwatches = ["#FFFFFF", "#F3F4F6", "#E5E7EB", "#D1D5DB", "#FEE2E2", "#FEE7AA", "#D1FAE5", "#DBEAFE", "#8B5CF6", "#EC4899", "#F59E0B", "#10B981"];

  // Pre-defined gradient backgrounds
  const gradients = ["linear-gradient(to right, #fc466b, #3f5efb)", "linear-gradient(to right, #8a2387, #e94057, #f27121)", "linear-gradient(to right, #00b09b, #96c93d)", "linear-gradient(to right, #ff9966, #ff5e62)", "linear-gradient(to right, #7f7fd5, #86a8e7, #91eae4)"];

  return (
    <div className="h-full p-4 space-y-4 overflow-y-auto sidebar-panel">
      <Tabs defaultValue="elements" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="elements" className="flex-1">
            {language === 'en' ? 'Elements' : 'אלמנטים'}
          </TabsTrigger>
          <TabsTrigger value="backgrounds" className="flex-1">
            {language === 'en' ? 'Background' : 'רקע'}
          </TabsTrigger>
          <TabsTrigger value="puzzles" className="flex-1">
            {language === 'en' ? 'Puzzles' : 'חידות'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="elements" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              className="h-14 flex flex-col gap-1 items-center justify-center"
              onClick={() => addElement('text')}
            >
              <Text className="h-5 w-5" />
              <span className="text-xs">{language === 'en' ? 'Text' : 'טקסט'}</span>
            </Button>

            <Button
              variant="outline"
              className="h-14 flex flex-col gap-1 items-center justify-center"
              onClick={() => addElement('image')}
            >
              <Image className="h-5 w-5" />
              <span className="text-xs">{language === 'en' ? 'Image' : 'תמונה'}</span>
            </Button>

            <Button
              variant="outline"
              className="h-14 flex flex-col gap-1 items-center justify-center"
              onClick={() => addElement('rectangle')}
            >
              <Square className="h-5 w-5" />
              <span className="text-xs">{language === 'en' ? 'Rectangle' : 'מלבן'}</span>
            </Button>

            <Button
              variant="outline"
              className="h-14 flex flex-col gap-1 items-center justify-center"
              onClick={() => addElement('circle')}
            >
              <Circle className="h-5 w-5" />
              <span className="text-xs">{language === 'en' ? 'Circle' : 'עיגול'}</span>
            </Button>

            <Button
              variant="outline"
              className="h-14 flex flex-col gap-1 items-center justify-center"
              onClick={() => addElement('triangle')}
            >
              <Triangle className="h-5 w-5" />
              <span className="text-xs">{language === 'en' ? 'Triangle' : 'משולש'}</span>
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="backgrounds" className="mt-4">
          <div className="space-y-4">
            <div className="grid grid-cols-6 gap-2">
              {colorSwatches.map((color, index) => (
                <button
                  key={index}
                  className="w-8 h-8 rounded-lg border border-gray-200"
                  style={{ backgroundColor: color }}
                  onClick={() => addElement('background', { color })}
                />
              ))}
            </div>

            <div className="space-y-2">
              {gradients.map((gradient, index) => (
                <button
                  key={index}
                  className="w-full h-12 rounded-lg border border-gray-200"
                  style={{ background: gradient }}
                  onClick={() => addElement('background', { gradient })}
                />
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="puzzles" className="mt-4">
          <PuzzleCategories />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Sidebar;
