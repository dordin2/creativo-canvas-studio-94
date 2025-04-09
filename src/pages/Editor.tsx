
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Canvas from "@/components/Canvas";
import Properties from "@/components/Properties";
import CanvasTabs from "@/components/CanvasTabs";
import { useDesignState } from "@/context/DesignContext";
import InventoryPanel from "@/components/inventory/InventoryPanel";
import InventoryIcon from "@/components/inventory/InventoryIcon";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Save } from "lucide-react";
import { useProject } from "@/context/ProjectContext";

const Editor = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { 
    isGameMode, 
    toggleGameMode, 
    canvases, 
    activeCanvasIndex, 
    setCanvases: updateCanvases
  } = useDesignState();
  const { projectName, saveProject } = useProject();

  useEffect(() => {
    if (!projectId) {
      navigate('/');
      return;
    }
    
    loadProjectData();
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
        
        // Type checking for the canvas data
        const canvasData = data.canvas_data as {
          canvases: any[];
          activeCanvasIndex: number;
        };
        
        if (canvasData.canvases && Array.isArray(canvasData.canvases)) {
          updateCanvases(canvasData.canvases);
        } else {
          console.error("Invalid canvas data structure:", canvasData);
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

  const handleSaveProject = async () => {
    try {
      await saveProject(canvases, activeCanvasIndex);
    } catch (error) {
      console.error('Error saving project:', error);
      toast.error('Failed to save project');
    }
  };

  const goBackToProjects = () => {
    navigate('/');
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
    <div className={`flex flex-col h-screen overflow-hidden ${isGameMode ? 'p-0 m-0' : ''}`}>
      {!isGameMode && (
        <div className="bg-white border-b border-gray-200 py-2 px-4 flex items-center justify-between">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              onClick={goBackToProjects}
              className="mr-2"
            >
              <ChevronLeft className="mr-1" />
              Back to Projects
            </Button>
            <h1 className="text-xl font-semibold text-canvas-purple">{projectName}</h1>
          </div>
          <Button 
            onClick={handleSaveProject}
            className="bg-canvas-purple hover:bg-canvas-purple/90"
          >
            <Save className="mr-2 h-4 w-4" />
            Save Project
          </Button>
        </div>
      )}
      {!isGameMode && <Header />}
      <div className={`flex flex-1 overflow-hidden ${isGameMode ? 'h-screen w-screen p-0 m-0' : ''}`}>
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
          <InventoryIcon />
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

export default Editor;
