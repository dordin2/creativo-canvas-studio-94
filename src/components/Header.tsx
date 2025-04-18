import React from 'react';
import { Button } from "@/components/ui/button";
import { Download, Share, Undo, Redo, Layers, Menu, Globe, Lock, Save } from "lucide-react";
import { useDesignState } from "@/context/DesignContext";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import LanguageSwitcher from "./LanguageSwitcher";
import GameModeToggle from "./GameModeToggle";
import InteractiveModeToggle from "./InteractiveModeToggle";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import LayersList from "./LayersList";
import { useProject } from "@/context/ProjectContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { AdminGallery } from './admin/AdminGallery';
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { LibraryModal } from './library/LibraryModal';

const Header = () => {
  const {
    canvasRef,
    undo,
    redo,
    canUndo,
    canRedo
  } = useDesignState();
  const {
    t,
    language
  } = useLanguage();
  const {
    projectId
  } = useProject();
  const isMobile = useIsMobile();
  const {
    profile
  } = useAuth();
  const isAdmin = profile?.roles?.includes('admin');
  const isPublic = profile?.isPublic;

  const handleDownload = () => {
    if (!canvasRef) return;
    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const canvasElement = canvasRef;
      canvas.width = canvasElement.clientWidth;
      canvas.height = canvasElement.clientHeight;
      if (ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        const data = new XMLSerializer().serializeToString(canvasElement);
        const img = new Image();
        const svgBlob = new Blob([data], {
          type: "image/svg+xml;charset=utf-8"
        });
        const url = URL.createObjectURL(svgBlob);
        img.onload = function () {
          ctx.drawImage(img, 0, 0);
          URL.revokeObjectURL(url);
          const imgURI = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
          const link = document.createElement("a");
          link.download = "canvas-design.png";
          link.href = imgURI;
          link.click();
          toast.success(t('toast.success.download'));
        };
        img.src = url;
      }
    } catch (error) {
      console.error("Error downloading design:", error);
      toast.error("Failed to download design. Please try again.");
    }
  };

  const handleShare = () => {
    toast.info(t('toast.info.share'));
  };

  const handleSaveProject = () => {
    // Implement save project logic here
  };

  const toggleProjectVisibility = () => {
    // Implement toggle project visibility logic here
  };

  if (isMobile) {
    return <header className={`flex justify-between items-center py-2 px-4 border-b border-gray-200 bg-white shadow-sm ${language === 'he' ? 'rtl' : 'ltr'}`}>
        <div className="flex items-center">
          
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={handleSaveProject} className="aspect-square">
            <Save className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleShare} className="aspect-square">
            <Share className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={toggleProjectVisibility} className="aspect-square">
            {isPublic ? (
              <Globe className="h-5 w-5 text-green-500" />
            ) : (
              <Lock className="h-5 w-5 text-red-500" />
            )}
          </Button>
          <GameModeToggle />
          <InteractiveModeToggle />
          <Drawer>
            <DrawerTrigger asChild>
              <Button variant="outline" size="icon" className="hover:bg-gray-50">
                <Menu className="h-4 w-4" />
              </Button>
            </DrawerTrigger>
            <DrawerContent className="px-4 pb-6 pt-2">
              <div className="space-y-4 mt-2">
                <h3 className="font-medium text-lg">{t('app.tools')}</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" onClick={undo} disabled={!canUndo} className="justify-start hover:bg-gray-50">
                    <Undo className="h-4 w-4 mr-2" />
                    {t('app.undo')}
                  </Button>
                  <Button variant="outline" onClick={redo} disabled={!canRedo} className="justify-start hover:bg-gray-50">
                    <Redo className="h-4 w-4 mr-2" />
                    {t('app.redo')}
                  </Button>
                </div>
                
                <div className="pt-2">
                  <h3 className="font-medium mb-2">{language === 'he' ? 'שכבות' : 'Layers'}</h3>
                  <div className="border rounded-md p-2 bg-gray-50">
                    <LayersList />
                  </div>
                </div>
                
                <div className="pt-2">
                  <h3 className="font-medium mb-2">{t('app.settings')}</h3>
                  <LanguageSwitcher />
                </div>
              </div>
            </DrawerContent>
          </Drawer>
        </div>
      </header>;
  }

  return <header className={`flex justify-between items-center py-3 px-6 border-b border-gray-200 bg-white shadow-sm ${language === 'he' ? 'rtl' : 'ltr'}`}>
      <div className="flex items-center gap-3">
        <div className="font-bold text-xl bg-gradient-to-r from-canvas-purple to-canvas-indigo bg-clip-text text-transparent">
          {t('app.title')}
        </div>
        <div className="h-6 w-px bg-gray-200 mx-1"></div>
        <LanguageSwitcher />
      </div>
      
      <div className="flex items-center gap-4">
        <GameModeToggle />
        <InteractiveModeToggle />
        {isAdmin && <AdminGallery />}
        <div className="h-6 w-px bg-gray-200"></div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={undo} title={t('app.undo')} disabled={!canUndo} className="hover:bg-gray-50">
            <Undo className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={redo} title={t('app.redo')} disabled={!canRedo} className="hover:bg-gray-50">
            <Redo className="h-4 w-4" />
          </Button>
          <div className="w-px h-6 bg-gray-200 mx-1"></div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="gap-2 hover:bg-gray-50">
                <Layers className="h-4 w-4" />
                <span>{language === 'he' ? 'שכבות' : 'Layers'}</span>
              </Button>
            </SheetTrigger>
            <SheetContent side={language === 'he' ? 'right' : 'left'} className="w-80">
              <div className="py-6">
                <h2 className="text-lg font-semibold mb-4 border-b pb-2">{language === 'he' ? 'שכבות' : 'Layers'}</h2>
                <LayersList />
              </div>
            </SheetContent>
          </Sheet>
          <Button variant="outline" className="gap-2 hover:bg-gray-50" onClick={handleShare}>
            <Share className="h-4 w-4" />
            <span>{t('app.share')}</span>
          </Button>
          <Button className="gap-2 bg-gradient-to-r from-canvas-purple to-canvas-indigo hover:from-canvas-purple-dark hover:to-canvas-indigo hover:shadow-md transition-shadow button-glow" onClick={handleDownload}>
            <Download className="h-4 w-4" />
            <span>{t('app.download')}</span>
          </Button>
        </div>
      </div>
    </header>;
};

export default Header;
