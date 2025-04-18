import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { useDesignState } from '@/context/DesignContext';

interface LibraryElement {
  id: string;
  name: string;
  image_path: string;
  created_at: string;
}

interface ImagesTabProps {
  onClose: () => void;
}

export const ImagesTab = ({ onClose }: ImagesTabProps) => {
  const [elements, setElements] = useState<LibraryElement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { profile } = useAuth();
  const { addElement, canvasRef, handleImageUpload } = useDesignState();
  const isAdmin = profile?.roles?.includes('admin');

  const fetchElements = async () => {
    try {
      const { data, error } = await supabase
        .from('library_elements')
        .select('*')
        .eq('category', 'images')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setElements(data || []);
    } catch (error) {
      console.error('Error fetching elements:', error);
      toast.error('Failed to load elements');
    } finally {
      setIsLoading(false);
    }
  };

  const handleElementClick = async (element: LibraryElement) => {
    try {
      const response = await fetch(element.image_path);
      const blob = await response.blob();
      const file = new File([blob], element.name || 'gallery-image.png', { 
        type: blob.type,
        lastModified: new Date().getTime()
      });

      const newElement = addElement('image', {
        name: element.name
      });

      handleImageUpload(newElement.id, file);
      onClose();

    } catch (error) {
      console.error('Error adding element:', error);
      toast.error('Failed to add element');
    }
  };

  const handleDelete = async (elementId: string) => {
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
      
      toast.success('Element deleted');
      fetchElements();
    } catch (error) {
      console.error('Error deleting element:', error);
      toast.error('Failed to delete element');
    }
  };

  useEffect(() => {
    fetchElements();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (elements.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No images found
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 mt-4">
      {elements.map((element) => (
        <div 
          key={element.id} 
          className="border rounded-lg p-2 hover:bg-gray-50 transition-colors relative cursor-pointer group"
          onClick={() => handleElementClick(element)}
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
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(element.id);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      ))}
    </div>
  );
};
