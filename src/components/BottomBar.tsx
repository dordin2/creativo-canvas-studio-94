
import React from 'react';
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Plus, Palette, MousePointer, PuzzlePiece, LayoutGrid } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import MobileSidebar from "./MobileSidebar";
import MobileProperties from "./MobileProperties";
import { useDesignState } from "@/context/DesignContext";

const BottomBar = () => {
  const { t, language } = useLanguage();
  const { activeElement } = useDesignState();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 px-4">
      <div className="flex justify-around items-center">
        <Drawer>
          <DrawerTrigger asChild>
            <Button variant="ghost" size="icon" className="flex flex-col items-center gap-1">
              <Plus className="h-5 w-5" />
              <span className="text-xs">{t('bottomBar.add')}</span>
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <div className="mt-2 px-4">
              <MobileSidebar isOpen={true} onClose={() => {}} />
            </div>
          </DrawerContent>
        </Drawer>

        <Drawer>
          <DrawerTrigger asChild>
            <Button variant="ghost" size="icon" className="flex flex-col items-center gap-1">
              <Palette className="h-5 w-5" />
              <span className="text-xs">{t('bottomBar.style')}</span>
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <div className="mt-2">
              <MobileProperties />
            </div>
          </DrawerContent>
        </Drawer>

        <Button variant="ghost" size="icon" className="flex flex-col items-center gap-1">
          <MousePointer className="h-5 w-5" />
          <span className="text-xs">{t('bottomBar.interact')}</span>
        </Button>

        <Button variant="ghost" size="icon" className="flex flex-col items-center gap-1">
          <PuzzlePiece className="h-5 w-5" />
          <span className="text-xs">{t('bottomBar.puzzle')}</span>
        </Button>

        <Button variant="ghost" size="icon" className="flex flex-col items-center gap-1">
          <LayoutGrid className="h-5 w-5" />
          <span className="text-xs">{t('bottomBar.rooms')}</span>
        </Button>
      </div>
    </div>
  );
};

export default BottomBar;
