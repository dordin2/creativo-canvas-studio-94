
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Canvas } from "@/types/designTypes";

type ProjectContextType = {
  projectId: string | null;
  projectName: string;
  isLoading: boolean;
  saveProject: (canvases: Canvas[], activeCanvasIndex: number) => Promise<void>;
};

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider = ({ children }: { children: ReactNode }) => {
  const { projectId } = useParams<{ projectId: string }>();
  const [projectName, setProjectName] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    if (projectId) {
      fetchProjectDetails();
    } else {
      setIsLoading(false);
    }
  }, [projectId]);
  
  const fetchProjectDetails = async () => {
    try {
      setIsLoading(true);
      
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
      } else {
        // If project not found, redirect to projects page
        toast.error('Project not found');
        navigate('/');
      }
    } catch (error) {
      console.error('Error fetching project details:', error);
      toast.error('Failed to load project details');
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };
  
  const saveProject = async (canvases: Canvas[], activeCanvasIndex: number) => {
    if (!projectId) return;
    
    try {
      // Update the project's updated_at timestamp
      const { error: projectError } = await supabase
        .from('projects')
        .update({ updated_at: new Date() })
        .eq('id', projectId);
        
      if (projectError) {
        throw projectError;
      }
      
      // Check if canvas data already exists for this project
      const { data: existingCanvas, error: fetchError } = await supabase
        .from('project_canvases')
        .select('id')
        .eq('project_id', projectId)
        .maybeSingle();
        
      if (fetchError) {
        throw fetchError;
      }
      
      const canvasData = {
        canvases,
        activeCanvasIndex
      };
      
      if (existingCanvas) {
        // Update existing canvas data
        const { error: updateError } = await supabase
          .from('project_canvases')
          .update({ 
            canvas_data: canvasData,
            updated_at: new Date()
          })
          .eq('id', existingCanvas.id);
          
        if (updateError) {
          throw updateError;
        }
      } else {
        // Create new canvas data
        const { error: insertError } = await supabase
          .from('project_canvases')
          .insert([{ 
            project_id: projectId,
            canvas_data: canvasData
          }]);
          
        if (insertError) {
          throw insertError;
        }
      }
      
      toast.success('Project saved successfully');
    } catch (error) {
      console.error('Error saving project:', error);
      toast.error('Failed to save project');
    }
  };
  
  const value = {
    projectId,
    projectName,
    isLoading,
    saveProject
  };
  
  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  
  return context;
};
