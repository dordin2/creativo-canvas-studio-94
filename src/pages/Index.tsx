
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Canvas from "@/components/Canvas";
import Properties from "@/components/Properties";
import CanvasTabs from "@/components/CanvasTabs";
import { useDesignState } from "@/context/DesignContext";
import InventoryPanel from "@/components/inventory/InventoryPanel";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Maximize, Minimize } from "lucide-react";

const Index = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { isGameMode, toggleGameMode } = useDesignState();
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    // Simulate loading resources
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);
  
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);
  
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error("Error attempting to enable fullscreen:", err);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(err => {
          console.error("Error attempting to exit fullscreen:", err);
        });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-canvas-purple mb-4">
            CreativoCanvas
          </h1>
          <div className="w-12 h-12 border-4 border-canvas-purple border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {!isGameMode && <Header />}
      <div className={`flex flex-1 overflow-hidden ${isGameMode ? 'h-screen w-screen' : ''}`}>
        {!isGameMode && (
          <div className="flex-shrink-0 w-64">
            <Sidebar />
          </div>
        )}
        <div className="flex-1 overflow-hidden flex flex-col">
          {!isGameMode ? (
            <>
              <CanvasTabs />
              <Canvas />
            </>
          ) : (
            <Canvas />
          )}
        </div>
        {!isGameMode && (
          <div className="flex-shrink-0 w-80">
            <Properties />
          </div>
        )}
      </div>
      {isGameMode && (
        <>
          <InventoryPanel />
          <div className="absolute bottom-4 left-4 z-[100] flex gap-2">
            <Button 
              variant="secondary" 
              className="shadow-md bg-white hover:bg-gray-100"
              onClick={toggleGameMode}
            >
              <ChevronLeft className="mr-1" />
              Exit Game Mode
            </Button>
            
            <Button
              variant="secondary"
              className="shadow-md bg-white hover:bg-gray-100"
              onClick={toggleFullscreen}
              title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            >
              {isFullscreen ? <Minimize className="mr-1" /> : <Maximize className="mr-1" />}
              {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default Index;
