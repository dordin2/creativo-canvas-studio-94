
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Canvas from "@/components/Canvas";
import InventoryPanel from "@/components/inventory/InventoryPanel";
import InventoryIcon from "@/components/inventory/InventoryIcon";
import { Button } from "@/components/ui/button";
import { Maximize, Minimize, ChevronLeft } from "lucide-react";
import { Canvas as CanvasType, Json } from "@/types/designTypes";
import { DesignProvider } from "@/context/DesignContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

// Create a default canvas to use as fallback
function createDefaultCanvas(): CanvasType {
  return {
    id: crypto.randomUUID(),
    name: "Canvas 1",
    elements: [],
  };
}

const Play = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [canvases, setCanvases] = useState<CanvasType[]>([createDefaultCanvas()]);
  const [activeCanvasIndex, setActiveCanvasIndex] = useState(0);
  const [projectName, setProjectName] = useState("Untitled Project");
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const isMobile = useIsMobile();
  const { user } = useAuth();

  // Check for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Load project data on component mount
  useEffect(() => {
    if (!projectId) {
      setProjectName("Untitled Project");
      setCanvases([createDefaultCanvas()]);
      setActiveCanvasIndex(0);
      setIsLoading(false);
      return;
    }
    loadProjectData();
    // eslint-disable-next-line
  }, [projectId]);

  const loadProjectData = async () => {
    try {
      setIsLoading(true);

      // Step 1: Load project metadata
      const { data: projectData } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .maybeSingle();

      setProjectName(projectData?.name || "Untitled Project");

      // Step 2: Load canvas data
      const { data, error } = await supabase
        .from('project_canvases')
        .select('canvas_data')
        .eq('project_id', projectId)
        .maybeSingle();

      // Parse and validate canvas data
      if (!error && data?.canvas_data) {
        try {
          const jsonData = data.canvas_data as Json;
          if (
            typeof jsonData === 'object' && 
            jsonData !== null && 
            'canvases' in jsonData && 
            Array.isArray((jsonData as any).canvases) &&
            (jsonData as any).canvases.length > 0
          ) {
            const canvasArr = (jsonData as any).canvases as CanvasType[];
            const activeIndex = typeof (jsonData as any).activeCanvasIndex === "number" 
              ? (jsonData as any).activeCanvasIndex 
              : 0;
            setCanvases(canvasArr);
            setActiveCanvasIndex(
              activeIndex < canvasArr.length ? activeIndex : 0
            );
          } else {
            setCanvases([createDefaultCanvas()]);
            setActiveCanvasIndex(0);
          }
        } catch {
          setCanvases([createDefaultCanvas()]);
          setActiveCanvasIndex(0);
        }
      } else {
        setCanvases([createDefaultCanvas()]);
        setActiveCanvasIndex(0);
      }
    } catch {
      setCanvases([createDefaultCanvas()]);
      setActiveCanvasIndex(0);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        toast.error("Could not enter fullscreen mode");
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-canvas-purple mb-4">
            CreativoCanvas
          </h1>
          <div className="w-12 h-12 border-4 border-canvas-purple border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading game...</p>
        </div>
      </div>
    );
  }

  // Always show the game view, no access/permission check
  return (
    <DesignProvider 
      initialState={{ 
        canvases, 
        activeCanvasIndex, 
        isGameMode: true 
      }}
    >
      <div className="flex flex-col h-screen overflow-hidden p-0 m-0">
        <div className="flex-1 overflow-hidden h-screen w-screen p-0 m-0">
          <div className="fixed-canvas-container">
            <Canvas isFullscreen={true} isMobileView={isMobile} />
          </div>
        </div>
        
        <InventoryPanel />
        <InventoryIcon />
        
        <div className="absolute bottom-4 left-4 z-[100]">
          <Button 
            variant="secondary" 
            className="shadow-md bg-white hover:bg-gray-100 px-2 py-1 text-sm flex items-center" 
            onClick={() => navigate("/")}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Exit
          </Button>
        </div>
        
        <div className={`absolute ${isMobile ? 'bottom-2 right-2' : 'bottom-4 right-4'} z-[100]`}>
          <Button 
            variant="secondary" 
            className={`shadow-md bg-white hover:bg-gray-100 ${isMobile ? 'px-2 py-1 text-xs' : ''}`}
            onClick={toggleFullscreen}
          >
            {isFullscreen ? <Minimize className={isMobile ? "h-4 w-4" : "mr-1"} /> : <Maximize className={isMobile ? "h-4 w-4" : "mr-1"} />}
            {!isMobile && (isFullscreen ? 'Exit Fullscreen' : 'Fullscreen')}
          </Button>
        </div>
      </div>
    </DesignProvider>
  );
};

export default Play;

