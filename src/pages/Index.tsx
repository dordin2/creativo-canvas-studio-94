
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Canvas from "@/components/Canvas";
import Properties from "@/components/Properties";
import { DesignProvider } from "@/context/DesignContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Layers } from "lucide-react";

const Index = () => {
  const [isLoading, setIsLoading] = useState(true);
  const isMobile = useIsMobile();
  const [showProperties, setShowProperties] = useState(false);

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

  if (isMobile) {
    return (
      <DesignProvider>
        <div className="flex flex-col h-screen overflow-hidden">
          <Header />
          <div className="flex flex-1 overflow-hidden relative">
            <div className="w-full h-full overflow-hidden">
              <Canvas />
            </div>
            
            {/* Mobile Sidebar Trigger */}
            <Sheet>
              <SheetTrigger asChild>
                <button className="absolute left-4 bottom-4 bg-white p-3 rounded-full shadow-lg">
                  <Menu className="h-6 w-6 text-canvas-purple" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] p-0">
                <Sidebar />
              </SheetContent>
            </Sheet>
            
            {/* Mobile Properties Trigger */}
            <Sheet open={showProperties} onOpenChange={setShowProperties}>
              <SheetTrigger asChild>
                <button className="absolute right-4 bottom-4 bg-white p-3 rounded-full shadow-lg">
                  <Layers className="h-6 w-6 text-canvas-purple" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] p-0">
                <Properties />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </DesignProvider>
    );
  }

  return (
    <DesignProvider>
      <div className="flex flex-col h-screen overflow-hidden">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <div className="flex-shrink-0 w-64 hidden md:block">
            <Sidebar />
          </div>
          <div className="flex-1 overflow-hidden">
            <Canvas />
          </div>
          <div className="flex-shrink-0 w-80 hidden md:block">
            <Properties />
          </div>
        </div>
      </div>
    </DesignProvider>
  );
};

export default Index;
