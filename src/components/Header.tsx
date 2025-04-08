
import { Button } from "@/components/ui/button";
import { Download, Share, Undo, Redo, Layers, Settings } from "lucide-react";
import { useDesignState } from "@/context/DesignContext";
import { useLanguage } from "@/context/LanguageContext";
import { toast } from "sonner";
import { useState } from "react";
import LanguageSwitcher from "./LanguageSwitcher";
import GameModeToggle from "./GameModeToggle";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import LayersList from "./LayersList";
import MessageBoxSettingsDialog from "./MessageBoxSettingsDialog";

const Header = () => {
  const { canvasRef, undo, redo, canUndo, canRedo } = useDesignState();
  const { t, language } = useLanguage();
  const [isMessageBoxSettingsOpen, setIsMessageBoxSettingsOpen] = useState(false);

  const handleDownload = () => {
    if (!canvasRef) return;
    
    try {
      // Create a temporary canvas to draw everything
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const canvasElement = canvasRef;
      
      // Set the canvas dimensions
      canvas.width = canvasElement.clientWidth;
      canvas.height = canvasElement.clientHeight;
      
      if (ctx) {
        // Draw white background
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw the HTML content
        const data = new XMLSerializer().serializeToString(canvasElement);
        const img = new Image();
        const svgBlob = new Blob([data], { type: "image/svg+xml;charset=utf-8" });
        const url = URL.createObjectURL(svgBlob);
        
        img.onload = function() {
          ctx.drawImage(img, 0, 0);
          URL.revokeObjectURL(url);
          
          const imgURI = canvas
            .toDataURL("image/png")
            .replace("image/png", "image/octet-stream");
          
          // Trigger download
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

  return (
    <header className={`flex justify-between items-center py-3 px-6 border-b border-gray-200 bg-white shadow-sm ${language === 'he' ? 'rtl' : 'ltr'}`}>
      <div className="flex items-center gap-3">
        <div className="font-bold text-xl bg-gradient-to-r from-canvas-purple to-canvas-indigo bg-clip-text text-transparent">
          {t('app.title')}
        </div>
        <div className="h-6 w-px bg-gray-200 mx-1"></div>
        <LanguageSwitcher />
      </div>
      
      <div className="flex items-center gap-4">
        <GameModeToggle />
        <div className="h-6 w-px bg-gray-200"></div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={undo} 
            title={t('app.undo')}
            disabled={!canUndo}
            className="hover:bg-gray-50"
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={redo} 
            title={t('app.redo')}
            disabled={!canRedo}
            className="hover:bg-gray-50"
          >
            <Redo className="h-4 w-4" />
          </Button>
          <div className="w-px h-6 bg-gray-200 mx-1"></div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsMessageBoxSettingsOpen(true)}
            title="Message Box Settings"
            className="hover:bg-gray-50"
          >
            <Settings className="h-4 w-4" />
          </Button>
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
      
      <MessageBoxSettingsDialog 
        isOpen={isMessageBoxSettingsOpen}
        onClose={() => setIsMessageBoxSettingsOpen(false)}
      />
    </header>
  );
};

export default Header;
