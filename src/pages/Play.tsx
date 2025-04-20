
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
  const [canvases, setCanvases] = useState<CanvasType[]>([]);
  const [activeCanvasIndex, setActiveCanvasIndex] = useState(0);
  const [projectName, setProjectName] = useState("");
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const isMobile = useIsMobile();
  const { user } = useAuth();

  // New: track error for better feedback.
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) {
      navigate('/');
      return;
    }
    loadProjectData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

      if (projectError || !projectData) {
        setError('Project not found');
        toast.error('Project not found');
        setTimeout(() => navigate('/'), 1200);
        return;
      }

      // Access control:
      // If NOT public AND there is a user AND user != project owner: deny.
      // If NOT public AND NO user: deny.
      // Public: allow all (even if !user).
      if (projectData.is_public === false) {
        // Project is private
        if (!user?.id || user.id !== projectData.user_id) {
          setError("This project is private");
          toast.error("This project is private");
          setTimeout(() => navigate('/'), 1200);
          return;
        }
      }

      setProjectName(projectData.name);

      // Fetch canvas data
      const { data, error } = await supabase
        .from('project_canvases')
        .select('canvas_data')
        .eq('project_id', projectId)
        .maybeSingle();

      if (error) {
        setError("Failed to load project data");
        toast.error("Failed to load project data");
        setTimeout(() => navigate('/'), 1200);
        return;
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
          setError("Invalid project data format");
          toast.error("Invalid project data format");
          setTimeout(() => navigate('/'), 1200);
          return;
        }
      } else {
        setError("No canvas data found for this project");
        toast.error("No canvas data found for this project");
        setTimeout(() => navigate('/'), 1200);
        return;
      }
    } catch (error) {
      setError('Unknown error loading project data');
      toast.error('Unknown error loading project data');
      setTimeout(() => navigate('/'), 1200);
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

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <h2 className="text-2xl font-semibold mb-4 text-red-500">Error</h2>
        <p className="text-md text-gray-700 mb-8">{error}</p>
        <Button variant="secondary" onClick={() => navigate("/")}>
          Go Home
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
