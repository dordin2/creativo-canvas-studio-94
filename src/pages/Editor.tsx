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
import { ChevronLeft, Save, Share2, Globe, Lock } from "lucide-react";
import { useProject } from "@/context/ProjectContext";
import { Canvas as CanvasType, Json } from "@/types/designTypes";
import { Database } from "@/types/database";

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
  const { projectName, saveProject, isPublic, toggleProjectVisibility } = useProject();

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
        
        const jsonData = data.canvas_data as Json;
        
        if (typeof jsonData === 'object' && jsonData !== null && 
            'canvases' in jsonData && 'activeCanvasIndex' in jsonData &&
            Array.isArray(jsonData.canvases)) {
          
          const canvasData = {
            canvases: jsonData.canvases as unknown as CanvasType[],
            activeCanvasIndex: jsonData.activeCanvasIndex as number
          };
          
          updateCanvases(canvasData.canvases);
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

  const handleSaveProject = async () => {
    try {
      await saveProject(canvases, activeCanvasIndex);
    } catch (error) {
      console.error('Error saving project:', error);
      toast.error('Failed to save project');
    }
  };

  const handleShareGame = () => {
    const shareUrl = `${window.location.origin}/play/${projectId}`;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl)
        .then(() => {
          toast.success('Game link copied to clipboard!');
        })
        .catch((err) => {
          console.error('Failed to copy link:', err);
          promptManualCopy(shareUrl);
        });
    } else {
      promptManualCopy(shareUrl);
    }
  };

  const promptManualCopy = (url: string) => {
    toast.info(
      <div>
        <p>Copy this link to share your game:</p>
        <div className="p-2 bg-gray-100 rounded mt-2 select-all">
          {url}
        </div>
      </div>
    );
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
        <div className="bg-white border-b border-gray-200 py-2 px-4 flex items-center justify-between z-30 relative">
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
          <div className="flex gap-2">
            <Button 
              onClick={toggleProjectVisibility}
              variant="outline"
              className="bg-white hover:bg-gray-50"
            >
              {isPublic ? (
                <Globe className="mr-2 h-4 w-4 text-green-500" />
              ) : (
                <Lock className="mr-2 h-4 w-4 text-red-500" />
              )}
              {isPublic ? 'Public' : 'Private'}
            </Button>
            <Button 
              onClick={handleShareGame}
              variant="outline"
              className="bg-white hover:bg-gray-50"
            >
              <Share2 className="mr-2 h-4 w-4" />
              Share Game
            </Button>
            <Button 
              onClick={handleSaveProject}
              className="bg-canvas-purple hover:bg-canvas-purple/90"
            >
              <Save className="mr-2 h-4 w-4" />
              Save Project
            </Button>
          </div>
        </div>
      )}
      {!isGameMode && <div className="z-30 relative"><Header /></div>}
      <div className={`flex flex-1 overflow-hidden relative ${isGameMode ? 'h-screen w-screen p-0 m-0' : ''}`}>
        {!isGameMode && (
          <div className="flex-shrink-0 w-64 z-20 relative">
            <Sidebar />
          </div>
        )}
        <div className="flex-1 overflow-hidden flex flex-col relative z-1">
          {!isGameMode ? (
            <>
              <div className="z-10 relative">
                <CanvasTabs />
              </div>
              <div className="flex-1 relative z-1">
                <Canvas />
              </div>
            </>
          ) : (
            <div className="fixed-canvas-container z-1">
              <Canvas isFullscreen={true} />
            </div>
          )}
        </div>
        {!isGameMode && (
          <div className="flex-shrink-0 w-80 z-20 relative">
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
