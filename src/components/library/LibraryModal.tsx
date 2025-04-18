
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useDesignState } from '@/context/DesignContext';
import { supabase } from '@/integrations/supabase/client';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Library, Trash2 } from 'lucide-react';
import { Database } from '@/types/database';

interface LibraryElement {
  id: string;
  name: string;
  image_path: string;
  created_at: string;
}

export const LibraryModal = () => {
  const [elements, setElements] = useState<LibraryElement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const { user, profile } = useAuth();
  const { addElement } = useDesignState();
  const isAdmin = profile?.roles?.includes('admin');

  const fetchLibraryElements = async () => {
    try {
      const { data, error } = await supabase
        .from('library_elements')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setElements(data || []);
    } catch (error) {
      console.error('Error fetching library elements:', error);
      toast.error('Failed to load library elements');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteElement = async (elementId: string) => {
    try {
      const element = elements.find(e => e.id === elementId);
      if (!element) return;

      const filePath = element.image_path.split('/').pop();
      if (!filePath) throw new Error('Invalid file path');

      const { error: storageError } = await supabase.storage
        .from('library_elements')
        .remove([filePath]);
      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from('library_elements')
        .delete()
        .eq('id', elementId);
      if (dbError) throw dbError;
      
      toast.success('Element deleted successfully');
      fetchLibraryElements();
    } catch (error) {
      console.error('Error deleting element:', error);
      toast.error('Failed to delete element');
    }
  };

  const handleImageClick = (element: LibraryElement) => {
    try {
      console.log("Adding image from gallery:", element.image_path);
      
      // Add the image element to the scene with the src property set directly
      addElement('image', {
        src: element.image_path,
        name: element.name,
      });
      
      // Close the modal after adding
      setIsOpen(false);
      toast.success('Image added to scene');
    } catch (error) {
      console.error('Error adding image to scene:', error);
      toast.error('Failed to add image to scene');
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchLibraryElements();
    }
  }, [isOpen]);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="h-14 flex flex-col gap-1 items-center justify-center">
          <Library className="h-5 w-5" />
          <span className="text-xs">Gallery</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Element Library</SheetTitle>
          <SheetDescription>
            Click on an image to add it to your scene
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : elements.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No elements found
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {elements.map(element => (
                <div 
                  key={element.id} 
                  className="border rounded-lg p-2 hover:bg-gray-50 transition-colors relative cursor-pointer"
                  onClick={() => handleImageClick(element)}
                >
                  <img 
                    src={element.image_path} 
                    alt={element.name} 
                    className="w-full h-32 object-contain bg-gray-50 rounded-md" 
                  />
                  <p className="mt-2 text-sm font-medium truncate">{element.name}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(element.created_at).toLocaleDateString()}
                  </p>
                  {isAdmin && (
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteElement(element.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
