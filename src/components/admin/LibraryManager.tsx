
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { PlusCircle, Trash2, RefreshCw, FileImage } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Define types for library elements
interface LibraryElement {
  id: string;
  name: string;
  image_path: string;
  created_at: string;
  created_by: string;
  imageUrl?: string; // Full URL after processing
}

const LibraryManager = () => {
  const { user } = useAuth();
  const [elements, setElements] = useState<LibraryElement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
  
  // Function to get full image URL from storage path
  const getImageUrl = async (path: string) => {
    try {
      const { data } = await supabase.storage.from('library').getPublicUrl(path);
      return data.publicUrl;
    } catch (error) {
      console.error("Error getting image URL:", error);
      return null;
    }
  };
  
  // Load all library elements
  const loadLibraryElements = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('library_elements')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      // Get image URLs for all elements
      const elementsWithUrls = await Promise.all(
        (data || []).map(async (element) => {
          const imageUrl = await getImageUrl(element.image_path);
          return { ...element, imageUrl };
        })
      );
      
      setElements(elementsWithUrls);
    } catch (error) {
      console.error("Error loading library elements:", error);
      toast.error("Failed to load library elements.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load elements on mount
  useEffect(() => {
    loadLibraryElements();
  }, []);
  
  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      
      // Auto-fill filename from file if not set yet
      if (!fileName) {
        // Remove file extension and replace dashes/underscores with spaces
        const nameWithoutExtension = file.name
          .split('.').slice(0, -1).join('.')
          .replace(/[-_]/g, ' ');
        setFileName(nameWithoutExtension);
      }
    }
  };
  
  // Handle upload
  const handleUpload = async () => {
    if (!selectedFile || !fileName.trim() || !user) {
      toast.error("Please select a file and enter a name.");
      return;
    }
    
    try {
      setUploading(true);
      
      // Create a unique file path
      const fileExt = selectedFile.name.split('.').pop();
      const filePath = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      
      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('library')
        .upload(filePath, selectedFile);
        
      if (uploadError) throw uploadError;
      
      // Create entry in library_elements table
      const { error: insertError } = await supabase
        .from('library_elements')
        .insert({
          name: fileName.trim(),
          image_path: filePath,
          created_by: user.id
        });
        
      if (insertError) throw insertError;
      
      toast.success("Element uploaded successfully!");
      
      // Reset form
      setFileName("");
      setSelectedFile(null);
      
      // Reload elements
      await loadLibraryElements();
      
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Failed to upload file. Please try again.");
    } finally {
      setUploading(false);
    }
  };
  
  // Handle delete
  const handleDelete = async (id: string) => {
    try {
      // Find the element to get its image path
      const elementToDelete = elements.find(el => el.id === id);
      
      if (!elementToDelete) {
        toast.error("Element not found.");
        return;
      }
      
      // Delete the database entry
      const { error: deleteDbError } = await supabase
        .from('library_elements')
        .delete()
        .eq('id', id);
        
      if (deleteDbError) throw deleteDbError;
      
      // Delete the file from storage
      const { error: deleteStorageError } = await supabase.storage
        .from('library')
        .remove([elementToDelete.image_path]);
        
      if (deleteStorageError) {
        console.error("Error deleting file from storage:", deleteStorageError);
        // Continue anyway, the database entry is deleted
      }
      
      toast.success("Element deleted successfully!");
      
      // Update the list
      setElements(elements.filter(el => el.id !== id));
      
    } catch (error) {
      console.error("Error deleting element:", error);
      toast.error("Failed to delete element. Please try again.");
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Library Elements</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={loadLibraryElements}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="h-4 w-4 mr-2" />
                Upload New Element
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Upload Library Element</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="file">Element Image</Label>
                  <Input
                    id="file"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  {selectedFile && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                      <FileImage className="h-4 w-4" />
                      {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="name">Element Name</Label>
                  <Input
                    id="name"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    placeholder="Enter element name"
                  />
                </div>
              </div>
              
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button 
                  onClick={handleUpload} 
                  disabled={uploading || !selectedFile || !fileName.trim()}
                >
                  {uploading ? "Uploading..." : "Upload"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center p-8">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : elements.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-md">
          <FileImage className="h-12 w-12 mx-auto text-gray-400 mb-3" />
          <h3 className="text-lg font-medium mb-2">No Elements Yet</h3>
          <p className="text-gray-500 mb-4">Upload your first library element to get started.</p>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="h-4 w-4 mr-2" />
                Upload Element
              </Button>
            </DialogTrigger>
            {/* Dialog content is duplicated, but it's easier to maintain this way */}
            <DialogContent className="sm:max-w-md">
              {/* Same dialog content as above */}
            </DialogContent>
          </Dialog>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {elements.map((element) => (
            <div 
              key={element.id} 
              className="relative group bg-white border rounded-md overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="aspect-square flex items-center justify-center overflow-hidden bg-slate-100">
                {element.imageUrl ? (
                  <img 
                    src={element.imageUrl} 
                    alt={element.name}
                    className="w-full h-full object-contain p-2"
                  />
                ) : (
                  <FileImage className="h-12 w-12 text-gray-300" />
                )}
              </div>
              
              <div className="p-3 flex justify-between items-center">
                <h3 className="font-medium text-sm truncate mr-2">{element.name}</h3>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Element</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{element.name}"? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => handleDelete(element.id)}
                        className="bg-red-500 hover:bg-red-600"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LibraryManager;
