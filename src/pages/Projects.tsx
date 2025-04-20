import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Folder, Clock, LogOut, UserCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Database } from "@/types/database";

type Project = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
};

const Projects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newProjectOpen, setNewProjectOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const navigate = useNavigate();
  const { user, profile, signOut, isLoading: authLoading } = useAuth();
  
  useEffect(() => {
    if (!authLoading) {
      fetchProjects();
    }
  }, [authLoading, user]);
  
  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      let query = supabase.from('projects').select('*');
      
      if (user) {
        query = query.eq('user_id', user.id);
      } else {
        query = query.is('user_id', null);
      }
      
      const { data, error } = await query.order('updated_at', { ascending: false });
        
      if (error) {
        throw error;
      }
      
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  };
  
  const createProject = async () => {
    if (!newProjectName.trim()) {
      toast.error('Project name is required');
      return;
    }
    
    try {
      const projectData: any = { 
        name: newProjectName.trim(), 
        description: newProjectDescription.trim() || null 
      };
      
      if (user) {
        projectData.user_id = user.id;
      }
      
      const { data, error } = await supabase
        .from('projects')
        .insert([projectData])
        .select()
        .single();
        
      if (error) {
        throw error;
      }
      
      toast.success('Project created successfully');
      
      const initialCanvasData = {
        canvases: [{
          id: crypto.randomUUID(),
          name: 'Canvas 1',
          elements: []
        }],
        activeCanvasIndex: 0
      };
      
      const { error: canvasError } = await supabase
        .from('project_canvases')
        .insert([
          {
            project_id: data.id,
            canvas_data: initialCanvasData
          }
        ]);
        
      if (canvasError) {
        throw canvasError;
      }
      
      setNewProjectOpen(false);
      setNewProjectName("");
      setNewProjectDescription("");
      
      navigate(`/editor/${data.id}`);
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Failed to create project');
    }
  };
  
  const openProject = (projectId: string) => {
    navigate(`/editor/${projectId}`);
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const goToAuth = () => {
    navigate('/auth');
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-10 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-canvas-purple">CreativoCanvas Projects</h1>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <div className="flex items-center mr-4">
                  <UserCircle className="h-5 w-5 mr-2 text-gray-600" />
                  <span className="text-gray-700 font-medium">
                    {profile?.display_name || user.email}
                  </span>
                </div>
                <Button 
                  variant="outline"
                  className="mr-2"
                  onClick={signOut}
                >
                  <LogOut className="mr-2 h-4 w-4" /> Log Out
                </Button>
              </>
            ) : (
              <Button 
                variant="outline"
                className="mr-2"
                onClick={goToAuth}
              >
                <UserCircle className="mr-2 h-4 w-4" /> Log In
              </Button>
            )}
            <Button 
              onClick={() => setNewProjectOpen(true)}
              className="bg-canvas-purple hover:bg-canvas-purple/90"
            >
              <Plus className="mr-2 h-4 w-4" /> New Project
            </Button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-12 h-12 border-4 border-canvas-purple border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-gray-100">
            <Folder className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold text-gray-600 mb-2">No projects yet</h2>
            <p className="text-gray-500 mb-6">Create your first project to get started</p>
            <Button 
              onClick={() => setNewProjectOpen(true)}
              className="bg-canvas-purple hover:bg-canvas-purple/90"
            >
              <Plus className="mr-2 h-4 w-4" /> Create New Project
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card key={project.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-xl text-canvas-purple">{project.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  {project.description && (
                    <p className="text-gray-500 mb-4">{project.description}</p>
                  )}
                  <div className="flex items-center text-sm text-gray-400">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>Updated: {formatDate(project.updated_at)}</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={() => openProject(project.id)} 
                    className="w-full bg-canvas-purple hover:bg-canvas-purple/90"
                  >
                    Open Project
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      <Dialog open={newProjectOpen} onOpenChange={setNewProjectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="project-name" className="text-sm font-medium">
                Project Name
              </label>
              <Input
                id="project-name"
                placeholder="Enter project name"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="project-description" className="text-sm font-medium">
                Description (optional)
              </label>
              <Input
                id="project-description"
                placeholder="Enter project description"
                value={newProjectDescription}
                onChange={(e) => setNewProjectDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewProjectOpen(false)}>Cancel</Button>
            <Button onClick={createProject} className="bg-canvas-purple hover:bg-canvas-purple/90">
              Create Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Projects;
