
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

const Play = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [canvases, setCanvases] = useState<CanvasType[]>([]);
  const [activeCanvasIndex, setActiveCanvasIndex] = useState(0);
  const [projectName, setProjectName] = useState("");
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [isFullscreen, setIsFullscreen] = useState(false);

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
      
      // Fetch project name
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('name')
        .eq('id', projectId)
        .single();
      
      if (projectError) {
        throw projectError;
      }
      
      if (projectData) {
        setProjectName(projectData.name);
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
        // Properly assert the type with a type guard
        const jsonData = data.canvas_data as Json;
        
        // Check if the structure matches what we expect
        if (typeof jsonData === 'object' && jsonData !== null && 
            'canvases' in jsonData && 'activeCanvasIndex' in jsonData &&
            Array.isArray(jsonData.canvases)) {
          
          // Now we can safely cast to the expected type
          setCanvases(jsonData.canvases as unknown as CanvasType[]);
          setActiveCanvasIndex(jsonData.activeCanvasIndex as number);
        } else {
          console.error("Invalid canvas data structure:", jsonData);
          throw new Error('Invalid project data format');
        }
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

  return (
    <DesignProvider initialState={{ canvases, activeCanvasIndex, isGameMode: true }}>
      <div className="flex flex-col h-screen overflow-hidden p-0 m-0">
        <div className="flex-1 overflow-hidden h-screen w-screen p-0 m-0">
          <div className="fixed-canvas-container">
            <Canvas isFullscreen={true} />
          </div>
        </div>
        
        <InventoryPanel />
        <InventoryIcon />
        
        <div className="absolute bottom-4 right-4 z-[100]">
          <Button 
            variant="secondary" 
            className="shadow-md bg-white hover:bg-gray-100"
            onClick={toggleFullscreen}
          >
            {isFullscreen ? <Minimize className="mr-1" /> : <Maximize className="mr-1" />}
            {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          </Button>
        </div>
      </div>
    </DesignProvider>
  );
};

export default Play;
