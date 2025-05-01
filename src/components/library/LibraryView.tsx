
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useDesignState } from "@/context/DesignContext";
import { Loader2 } from "lucide-react";
import { 
  getInitialLibraryImageData, 
  processLibraryImageInBackground 
} from "@/utils/libraryImageProcessor";
import { useState } from "react";

interface LibraryImage {
  id: string;
  image_path: string;
  name: string;
}

export const LibraryView = ({ onClose }: { onClose: () => void }) => {
  const { addElement, updateElement, canvasRef } = useDesignState();
  const [loadingImageId, setLoadingImageId] = useState<string | null>(null);
  
  const { data: images, isLoading } = useQuery({
    queryKey: ['library-images'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('library_elements')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data as LibraryImage[];
    }
  });
  
  const handleImageClick = async (image: LibraryImage) => {
    try {
      setLoadingImageId(image.id);
      
      const canvasDimensions = canvasRef ? {
        width: canvasRef.clientWidth,
        height: canvasRef.clientHeight
      } : undefined;
      
      const initialData = await getInitialLibraryImageData(
        image.image_path,
        canvasDimensions?.width,
        canvasDimensions?.height
      );
      
      const newElement = addElement('image', {
        ...initialData,
        src: image.image_path,
        name: image.name,
        isImageLoading: true // Add loading state
      });
      
      // Process image in background for higher quality
      processLibraryImageInBackground(
        image.image_path,
        newElement,
        (updates) => {
          updateElement(newElement.id, {
            ...updates,
            isImageLoading: false // Clear loading state when done
          });
          setLoadingImageId(null);
        }
      );
      
      onClose();
    } catch (error) {
      console.error('Error processing library image:', error);
      setLoadingImageId(null);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }
  
  if (!images?.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No images available in library
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4">
      {images?.map((image) => (
        <button
          key={image.id}
          onClick={() => handleImageClick(image)}
          className="aspect-square relative group overflow-hidden rounded-lg border hover:border-primary transition-colors"
          disabled={loadingImageId === image.id}
        >
          {loadingImageId === image.id && (
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-10">
              <Loader2 className="w-5 h-5 animate-spin text-white" />
            </div>
          )}
          <img
            src={image.image_path}
            alt={image.name}
            className={`w-full h-full object-cover group-hover:opacity-90 transition-opacity ${loadingImageId === image.id ? 'opacity-70' : ''}`}
          />
        </button>
      ))}
    </div>
  );
};
