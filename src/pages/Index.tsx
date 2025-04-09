
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Canvas from "@/components/Canvas";
import Properties from "@/components/Properties";
import CanvasTabs from "@/components/CanvasTabs";
import { useDesignState } from "@/context/DesignContext";
import InventoryPanel from "@/components/inventory/InventoryPanel";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

const Index = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { isGameMode, toggleGameMode } = useDesignState();

  useEffect(() => {
    // Simulate loading resources
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

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
            <div className="fixed-canvas-container">
              <Canvas isFullscreen={true} />
            </div>
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
          <div className="absolute bottom-4 left-4 z-[100]">
            <Button 
              variant="secondary" 
              className="shadow-md bg-white hover:bg-gray-100"
              onClick={toggleGameMode}
            >
              <ChevronLeft className="mr-1" />
              Exit Game Mode
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default Index;
