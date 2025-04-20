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
import { toast } from "sonner";
import { Database } from "@/types/database";

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
  const [projectName, setProjectName] = useState("");
  const [errorInfo, setErrorInfo] = useState<string | null>(null);
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const isMobile = useIsMobile();
  const { user } = useAuth();

  useEffect(() => {
    if (!projectId) {
      toast.error('No project ID in URL');
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
      setCanvases([]);
      setActiveCanvasIndex(0);
      setErrorInfo(null);

      // Step 1: Load project meta info
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .maybeSingle();

      if (projectError || !projectData) {
        const msg = 'Project not found';
        setErrorInfo(msg);
        toast.error(msg);
        console.error("Supabase returned error or no project data:", projectError, projectData);
        navigate('/');
        return;
      }

      // If project is private and user is not owner, block access
      if (projectData.is_public !== true && (!user || user?.id !== projectData.user_id)) {
        const msg = "This project is private. Only the owner can view it.";
        setErrorInfo(msg);
        toast.error(msg);
        navigate('/');
        return;
      }
      setProjectName(projectData.name);

      // Step 2: Load canvas data
      const { data, error } = await supabase
        .from('project_canvases')
        .select('canvas_data')
        .eq('project_id', projectId)
        .maybeSingle();

      if (error) {
        const msg = 'Could not load canvas data';
        setErrorInfo(msg);
        toast.error(msg);
        setCanvases([]);
        setActiveCanvasIndex(0);
        setIsLoading(false);
        console.error("Supabase project_canvases error:", error);
        return;
      }

      let canvasesArr: CanvasType[] = [];
      let index = 0;
      let debugLog = {};

      if (data?.canvas_data) {
        const jsonData = data.canvas_data as Json;
        debugLog = { jsonData, typeofJson: typeof jsonData };
        if (
          typeof jsonData === 'object' &&
          jsonData !== null &&
          'canvases' in jsonData &&
          Array.isArray((jsonData as any).canvases)
        ) {
          canvasesArr = (jsonData as any).canvases;
          index = typeof (jsonData as any).activeCanvasIndex === "number" ? (jsonData as any).activeCanvasIndex : 0;
          debugLog = { ...debugLog, canvasesArr, length: canvasesArr.length, index };
          if (!canvasesArr.length) {
            const msg = "No canvases found in project data.";
            setErrorInfo(msg);
            toast.error(msg);
          }
        } else {
          const msg = "Invalid canvas structure, loading default canvas.";
          setErrorInfo(msg);
          toast.error(msg);
          debugLog = { ...debugLog, error: "Invalid structure" };
          canvasesArr = [createDefaultCanvas()];
        }
      } else {
        const msg = "No canvas_data found, using default.";
        setErrorInfo(msg);
        toast.error(msg);
        canvasesArr = [createDefaultCanvas()];
        debugLog = { ...debugLog, error: "No canvas_data found" };
      }
      setCanvases(canvasesArr);
      setActiveCanvasIndex(index < canvasesArr.length ? index : 0);

      // Extra safety: Check if canvasesArr is valid
      if (!canvasesArr.length || !Array.isArray(canvasesArr)) {
        const msg = "No canvas found for this project; blank canvas loaded.";
        setErrorInfo(msg);
        toast.error(msg);
        setCanvases([createDefaultCanvas()]);
        setActiveCanvasIndex(0);
      } else if (!canvasesArr[0]?.id) {
        const msg = "Malformed canvas data, loading default.";
        setErrorInfo(msg);
        toast.error(msg);
        setCanvases([createDefaultCanvas()]);
        setActiveCanvasIndex(0);
      }

      // Debug: Log the situation for console analysis
      console.log("loadProjectData debug:", {
        projectId,
        projectData,
        canvasQueryData: data,
        debugLog,
        canvasesArr
      });
    } catch (error) {
      const msg = 'Error loading project or canvas';
      setErrorInfo(msg);
      toast.error(msg);
      console.error("Unhandled error loading project/canvas:", error);
      setCanvases([createDefaultCanvas()]);
      setActiveCanvasIndex(0);
      setProjectName('Unknown Project');
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

  if ((!canvases.length || errorInfo) && !isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2 text-canvas-purple">{projectName || 'No Project'}</h2>
          <p className="text-gray-500 mb-6">
            {errorInfo 
              ? errorInfo 
              : "No canvas found or error loading. Try reloading or returning to your projects."
            }
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
