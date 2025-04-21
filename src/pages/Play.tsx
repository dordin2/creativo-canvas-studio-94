
import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
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
  const [projectOwnerId, setProjectOwnerId] = useState<string | null>(null);
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  // NEW: check if we're using the ?asUserId=OWNER_ID mode, for "view as owner"
  const asUserId = searchParams.get('asUserId');
  const [isViewingAsOwner, setIsViewingAsOwner] = useState<boolean>(false);

  useEffect(() => {
    if (!projectId) {
      navigate('/');
      return;
    }
    loadProjectData();
    // eslint-disable-next-line
  }, [projectId, user, asUserId]);

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
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .maybeSingle();

      if (projectError || !projectData) {
        toast.error('Project not found');
        navigate('/');
        return;
      }
      setProjectName(projectData.name);
      setProjectOwnerId(projectData.user_id || null);

      // Check for special view-as-owner public mode
      if (projectData.is_public !== true) {
        // If not public, only allow owner or view-as-owner link
        // user?.id === owner OR asUserId === owner
        if (!(user && user.id === projectData.user_id) && asUserId !== projectData.user_id) {
          toast.error("This project is private");
          navigate('/');
          return;
        }
        if (asUserId === projectData.user_id) {
          setIsViewingAsOwner(true);
        }
      } else {
        setIsViewingAsOwner(false);
      }

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
          console.error("Invalid canvas data structure:", jsonData);
          throw new Error('Invalid project data format');
        }
      } else {
        setCanvases([]);
        setActiveCanvasIndex(0);
        toast.error('No canvas data found for this project');
      }
    } catch (error) {
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

  if (!canvases.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2 text-canvas-purple">{projectName || 'No Project'}</h2>
          <p className="text-gray-500 mb-8">No canvas found for this project.</p>
          <Button variant="default" onClick={() => navigate("/")}>Back to Projects</Button>
        </div>
      </div>
    );
  }

  return (
    <DesignProvider initialState={{ canvases, activeCanvasIndex, isGameMode: true }}>
      <div className="flex flex-col h-screen overflow-hidden p-0 m-0">
        {/* If in "view as owner" mode, show a notice */}
        {isViewingAsOwner && (
          <div className="w-full bg-yellow-100 text-yellow-700 text-center py-1 px-3 text-xs shadow z-[200]">
            Viewing as project OWNER (Preview Link)
          </div>
        )}
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
