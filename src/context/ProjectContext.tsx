
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Canvas } from "@/types/designTypes";
import { useAuth } from "@/context/AuthContext";
import { Database } from "@/types/database";

type ProjectContextType = {
  projectId: string | null;
  projectName: string;
  isPublic: boolean;
  isLoading: boolean;
  saveProject: (canvases: Canvas[], activeCanvasIndex: number) => Promise<void>;
  toggleProjectVisibility: () => Promise<void>;
};

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider = ({ children }: { children: ReactNode }) => {
  const { projectId } = useParams<{ projectId: string }>();
  const [projectName, setProjectName] = useState<string>("");
  const [isPublic, setIsPublic] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const { user } = useAuth();
  
  useEffect(() => {
    if (projectId) {
      // Performance timer start
      const startTime = performance.now();
      console.log("ProjectContext - Loading project data for:", projectId);
      
      fetchProjectDetails();
    } else {
      setIsLoading(false);
    }
  }, [projectId, user]);
  
  const fetchProjectDetails = async () => {
    if (!projectId) {
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      
      // First, quickly load just the basic project metadata
      const startTime = performance.now();
      
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('name, is_public, user_id')
        .eq('id', projectId)
        .single();
        
      if (projectError) {
        throw projectError;
      }
      
      if (projectData) {
        const endTime = performance.now();
        console.log(`ProjectContext - Project metadata loaded in ${Math.round(endTime - startTime)}ms`);
        
        // Check if this is a private project and the user has access
        if (projectData.user_id && projectData.is_public === false && user?.id !== projectData.user_id) {
          toast.error("You don't have access to this project");
          navigate('/');
          return;
        }
        
        setProjectName(projectData.name);
        setIsPublic(projectData.is_public || false);
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
  
  // Debounce and batch save requests
  let saveDebounceTimer: ReturnType<typeof setTimeout> | null = null;
  let saveQueue: { canvases: Canvas[], activeCanvasIndex: number } | null = null;
  
  const toggleProjectVisibility = async () => {
    if (!projectId || !user) return;
    
    try {
      const newIsPublic = !isPublic;
      
      const { error } = await supabase
        .from('projects')
        .update({ is_public: newIsPublic })
        .eq('id', projectId)
        .eq('user_id', user.id);
        
      if (error) {
        throw error;
      }
      
      setIsPublic(newIsPublic);
      toast.success(newIsPublic ? 'Project is now public' : 'Project is now private');
    } catch (error) {
      console.error('Error updating project visibility:', error);
      toast.error('Failed to update project visibility');
    }
  };
  
  const saveProject = async (canvases: Canvas[], activeCanvasIndex: number) => {
    if (!projectId) return;
    
    // Store in save queue
    saveQueue = { canvases, activeCanvasIndex };
    
    // If there's already a timer, clear it
    if (saveDebounceTimer) {
      clearTimeout(saveDebounceTimer);
    }
    
    // Set a new timer to execute the save operation
    saveDebounceTimer = setTimeout(async () => {
      if (!saveQueue) return;
      
      try {
        const saveStartTime = performance.now();
        
        // Update the project's updated_at timestamp
        const { error: projectError } = await supabase
          .from('projects')
          .update({ updated_at: new Date().toISOString() })
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
        
        // Optimize the JSON data before storing
        // Strip any unnecessarily large or temporary data that doesn't need to be persisted
        const optimizedCanvases = saveQueue.canvases.map(canvas => {
          // Create a optimized copy of the canvas
          const optimizedCanvas = {
            ...canvas,
            elements: canvas.elements.map(element => {
              // For image elements, don't store full dataUrls in database
              if (element.type === 'image') {
                const { dataUrl, thumbnailDataUrl, ...rest } = element;
                return {
                  ...rest,
                  // If the element has a src (URL to an image), we can restore it later
                  // No need to store large data URLs in the database
                };
              }
              return element;
            })
          };
          return optimizedCanvas;
        });
        
        // We need to serialize and stringify the canvas data properly
        const canvasData = {
          canvases: JSON.parse(JSON.stringify(optimizedCanvases)),
          activeCanvasIndex: saveQueue.activeCanvasIndex
        };
        
        if (existingCanvas) {
          // Update existing canvas data
          const { error: updateError } = await supabase
            .from('project_canvases')
            .update({ 
              canvas_data: canvasData,
              updated_at: new Date().toISOString()
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
        
        const saveEndTime = performance.now();
        console.log(`ProjectContext - Project saved in ${Math.round(saveEndTime - saveStartTime)}ms`);
        
        toast.success('Project saved successfully');
        saveQueue = null;
      } catch (error) {
        console.error('Error saving project:', error);
        toast.error('Failed to save project');
      }
    }, 2000); // Debounce for 2 seconds
  };
  
  const value = {
    projectId,
    projectName,
    isPublic,
    isLoading,
    saveProject,
    toggleProjectVisibility
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
