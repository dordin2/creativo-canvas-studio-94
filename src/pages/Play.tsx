
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

const Play = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [canvases, setCanvases] = useState<CanvasType[] | null>(null);
  const [activeCanvasIndex, setActiveCanvasIndex] = useState<number>(0);
  const [projectName, setProjectName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const isMobile = useIsMobile();
  const { user } = useAuth();

  useEffect(() => {
    if (!projectId) {
      navigate('/');
      return;
    }

    loadProjectData();
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
      setError(null);

      // Fetch project details
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (projectError) {
        throw projectError;
      }

      if (projectData) {
        if (projectData.user_id && projectData.is_public === false && user?.id !== projectData.user_id) {
          toast.error("This project is private");
          navigate('/');
          return;
        }
        setProjectName(projectData.name);
      } else {
        throw new Error('Project not found');
      }

      // Fetch canvas data
      const { data, error } = await supabase
        .from('project_canvases')
        .select('canvas_data')
        .eq('project_id', projectId)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (data && data.canvas_data) {
        const jsonData = data.canvas_data as Json;
        if (
          typeof jsonData === 'object' &&
          jsonData !== null &&
          'canvases' in jsonData &&
          'activeCanvasIndex' in jsonData &&
          Array.isArray(jsonData.canvases)
        ) {
          setCanvases(jsonData.canvases as unknown as CanvasType[]);
          setActiveCanvasIndex(jsonData.activeCanvasIndex as number);
        } else {
          setError("Invalid canvas data structure");
          setCanvases(null);
          throw new Error('Invalid project data format');
        }
      } else {
        setError("No canvas data found");
        setCanvases(null);
      }
    } catch (error: any) {
      setError(error?.message || 'Unknown error');
      console.error('Error loading project data:', error);
      navigate('/');
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

  if (error || !canvases || canvases.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
        <h1 className="text-3xl font-bold text-red-600 mb-4">
          {error ? "Error loading game" : "No data found"}
        </h1>
        <p className="text-md text-gray-600 mb-6">
          {error ? error : "There was a problem loading this game. Double check your link or contact support."}
        </p>
        <Button variant="secondary" onClick={() => window.location.reload()}>
          Try Again
        </Button>
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

