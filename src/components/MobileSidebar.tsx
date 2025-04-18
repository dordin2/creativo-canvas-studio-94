import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Text } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useDesignState } from "@/context/DesignContext";
import { ElementsModal } from "./elements/ElementsModal";
import { Button } from "@/components/ui/button";
import {
  Square,
  Circle,
  Triangle,
  Image,
  Lock,
  Puzzle,
  SlidersHorizontal,
  MousePointerClick
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { LibraryModal } from "@/components/library/LibraryModal";
import { ALargeSmall } from 'lucide-react';

const MobileSidebar = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { addElement } = useDesignState();
  const { t, language } = useLanguage();

  const handleAddElement = (type: any, config = {}) => {
    addElement(type, config);
    onClose();
  };

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
    <div className={`mobile-sidebar ${language === 'he' ? 'rtl' : 'ltr'} w-full`}>
      <Tabs defaultValue="elements" className="w-full">
        <TabsList className="grid grid-cols-3 w-full mb-4">
          <TabsTrigger value="elements">{t('sidebar.elements')}</TabsTrigger>
          <TabsTrigger value="text">
            <ALargeSmall className="h-4 w-4 mr-2" />
            {t('sidebar.text')}
          </TabsTrigger>
          <TabsTrigger value="background">{t('sidebar.background')}</TabsTrigger>
        </TabsList>

        <TabsContent value="elements" className="pb-16">
          <ElementsModal />
        </TabsContent>

        <TabsContent value="text" className="pb-16">
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
