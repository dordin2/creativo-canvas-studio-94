
import React from 'react';
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Play, Share2 } from "lucide-react";
import { useDesignState } from "@/context/DesignContext";
import { useLanguage } from "@/context/LanguageContext";
import { useProject } from "@/context/ProjectContext";
import { toast } from "sonner";

const Header = () => {
  const { isGameMode, toggleGameMode, undo, redo, canUndo, canRedo } = useDesignState();
  const { t, language } = useLanguage();
  const { projectId } = useProject();

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/play/${projectId}`;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl)
        .then(() => {
          toast.success(t('toast.success.share'));
        })
        .catch((err) => {
          console.error('Failed to copy link:', err);
          toast.error(t('toast.error.share'));
        });
    }
  };

  return (
    <header className={`flex justify-between items-center py-2 px-4 border-b border-gray-200 bg-white shadow-sm ${language === 'he' ? 'rtl' : 'ltr'}`}>
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={undo} 
          disabled={!canUndo}
          className="hover:bg-gray-50"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={redo} 
          disabled={!canRedo}
          className="hover:bg-gray-50"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={handleShare}
          className="hover:bg-gray-50"
        >
          <Share2 className="h-4 w-4" />
        </Button>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={toggleGameMode}
          className="hover:bg-gray-50"
        >
          <Play className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
};

export default Header;
