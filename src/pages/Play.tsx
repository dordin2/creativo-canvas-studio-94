
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Canvas as CanvasType, Json } from "@/types/designTypes";
import Canvas from "@/components/Canvas";
import { DesignProvider } from "@/context/DesignContext";
import { ProjectProvider } from "@/context/ProjectContext";
import InventoryPanel from "@/components/inventory/InventoryPanel";
import InventoryIcon from "@/components/inventory/InventoryIcon";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Maximize, Minimize } from "lucide-react";

const Play = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [canvases, setCanvases] = useState<CanvasType[]>([]);
  const [activeCanvasIndex, setActiveCanvasIndex] = useState(0);
  const { projectId } = useParams<{ projectId: string }>();
  const [projectDetails, setProjectDetails] = useState<{ name?: string; isPublic?: boolean }>({});
  
  useEffect(() => {
    if (!projectId) {
      toast.error("No project ID provided");
      return;
    }
    
    loadProjectData();
    loadProjectDetails();
  }, [projectId]);
  
  const loadProjectData = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('project_canvases')
        .select('canvas_data')
        .eq('project_id', projectId)
        .maybeSingle();
      
      if (error) {
        throw error;
      }
      
      if (data && data.canvas_data) {
        console.log("Loaded project data:", data.canvas_data);
        
        const jsonData = data.canvas_data as Json;
        
        if (typeof jsonData === 'object' && jsonData !== null && 
            'canvases' in jsonData && 'activeCanvasIndex' in jsonData &&
            Array.isArray(jsonData.canvases)) {
          
          const canvasData = {
            canvases: jsonData.canvases as unknown as CanvasType[],
            activeCanvasIndex: jsonData.activeCanvasIndex as number
          };
          
          setCanvases(canvasData.canvases);
          setActiveCanvasIndex(canvasData.activeCanvasIndex);
        } else {
          console.error("Invalid canvas data structure:", jsonData);
          toast.error('Invalid project data format');
        }
      }
      
    } catch (error) {
      console.error('Error loading project data:', error);
      toast.error('Failed to load project data');
    } finally {
      setIsLoading(false);
    }
  };
  
  const loadProjectDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('name, is_public')
        .eq('id', projectId)
        .maybeSingle();
      
      if (error) {
        throw error;
      }
      
      if (data) {
        setProjectDetails({
          name: data.name,
          isPublic: data.is_public
        });
      }
      
    } catch (error) {
      console.error('Error loading project details:', error);
    }
  };
  
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        toast.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };
  
  const goBack = () => {
    window.history.back();
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
    <ProjectProvider initialData={{ projectId, projectName: projectDetails.name }}>
      <DesignProvider initialState={{ canvases, activeCanvasIndex, isGameMode: true }}>
        <div className="h-screen w-screen overflow-hidden relative">
          <div className="fixed-canvas-container z-1">
            <Canvas isFullscreen={true} />
          </div>
          
          <InventoryPanel />
          <InventoryIcon />
          
          <div className="absolute bottom-4 left-4 z-[100]">
            <Button 
              variant="secondary" 
              className="shadow-md bg-white hover:bg-gray-100"
              onClick={goBack}
            >
              <ChevronLeft className="mr-1" />
              Exit Game
            </Button>
          </div>
          
          <div className="absolute bottom-4 right-4 z-[100]">
            <Button 
              variant="secondary" 
              className="shadow-md bg-white hover:bg-gray-100"
              onClick={toggleFullscreen}
            >
              {isFullscreen ? (
                <Minimize className="h-5 w-5" />
              ) : (
                <Maximize className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </DesignProvider>
    </ProjectProvider>
  );
};

export default Play;
