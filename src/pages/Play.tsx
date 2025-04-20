import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Canvas from "@/components/Canvas";
import InventoryPanel from "@/components/inventory/InventoryPanel";
import InventoryIcon from "@/components/inventory/InventoryIcon";
import { Button } from "@/components/ui/button";
import { Maximize, Minimize } from "lucide-react";
import { Canvas as CanvasType, Json } from "@/types/designTypes";
import { DesignProvider } from "@/context/DesignContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/context/AuthContext";
import { useProject } from "@/context/ProjectContext";
import { toast } from "sonner";

function createDefaultCanvas(): CanvasType {
  return {
    id: crypto.randomUUID(),
    name: "Canvas 1",
    elements: [],
  };
}

const Play = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [canvases, setCanvases] = useState<CanvasType[]>([]);
  const [activeCanvasIndex, setActiveCanvasIndex] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const { projectName, isPublic } = useProject();

  useEffect(() => {
    if (!projectId) {
      setErrorMessage('No project ID found in link.');
      setIsLoading(false);
      navigate('/');
      return;
    }
    loadProjectData();
  // eslint-disable-next-line
  }, [projectId]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const loadProjectData = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const { data, error } = await supabase
        .from('project_canvases')
        .select('canvas_data')
        .eq('project_id', projectId)
        .maybeSingle();

      if (error) {
        setErrorMessage('Could not load canvas data');
        toast.error('Could not load canvas data');
        setCanvases([createDefaultCanvas()]);
        setActiveCanvasIndex(0);
        setIsLoading(false);
        return;
      }

      let canvasesArr: CanvasType[] = [];
      let index = 0;
      if (data?.canvas_data) {
        try {
          const jsonData = data.canvas_data as Json;
          if (
            typeof jsonData === 'object' &&
            jsonData !== null &&
            'canvases' in jsonData &&
            Array.isArray(jsonData.canvases)
          ) {
            canvasesArr = jsonData.canvases as unknown as CanvasType[];
            index = typeof jsonData.activeCanvasIndex === "number" ? jsonData.activeCanvasIndex : 0;
          } else {
            setErrorMessage('Invalid canvas structure, loading default canvas');
            toast.error('Invalid canvas structure, loading default canvas');
            canvasesArr = [createDefaultCanvas()];
            index = 0;
          }
        } catch (err) {
          setErrorMessage('Corrupted canvas data, loading default canvas');
          toast.error('Corrupted canvas data, loading default canvas');
          canvasesArr = [createDefaultCanvas()];
          index = 0;
        }
      } else {
        setErrorMessage('No canvas found, blank canvas loaded');
        toast.info('No canvas found, blank canvas loaded');
        canvasesArr = [createDefaultCanvas()];
        index = 0;
      }
      setCanvases(canvasesArr);
      setActiveCanvasIndex(index < canvasesArr.length ? index : 0);

      if (canvasesArr.length === 0) {
        setErrorMessage('No canvas found for this project; blank canvas loaded.');
        toast.error('No canvas found for this project; blank canvas loaded.');
        setCanvases([createDefaultCanvas()]);
        setActiveCanvasIndex(0);
      }
    } catch (error) {
      setErrorMessage('Error loading project or canvas. Blank canvas loaded.');
      toast.error('Error loading project or canvas. Blank canvas loaded.');
      setCanvases([createDefaultCanvas()]);
      setActiveCanvasIndex(0);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
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

  if (errorMessage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2 text-canvas-purple">{projectName || 'No Project'}</h2>
          <p className="text-red-500 mb-8">
            {errorMessage}
          </p>
          <Button variant="default" onClick={() => navigate("/")}>Back to Projects</Button>
          <Button variant="outline" className="ml-2" onClick={loadProjectData}>Retry</Button>
        </div>
      </div>
    );
  }

  if (!canvases.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2 text-canvas-purple">{projectName || 'No Project'}</h2>
          <p className="text-gray-500 mb-8">
            No canvas found or error loading. Try reloading or returning to your projects.
          </p>
          <Button variant="default" onClick={() => navigate("/")}>Back to Projects</Button>
        </div>
      </div>
    );
  }

  return (
    <DesignProvider initialState={{ canvases, activeCanvasIndex, isGameMode: true }}>
      <div className="flex flex-col h-screen overflow-hidden p-0 m-0">
        <div className="flex-1 overflow-hidden h-screen w-screen p-0 m-0">
          <div className="fixed-canvas-container">
            <Canvas isFullscreen={true} isMobileView={isMobile} />
          </div>
        </div>
        <InventoryPanel />
        <InventoryIcon />
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
