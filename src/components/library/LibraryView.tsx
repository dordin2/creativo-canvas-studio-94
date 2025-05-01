
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useDesignState } from "@/context/DesignContext";
import { Loader2, Cloud } from "lucide-react";
import { 
  getInitialLibraryImageData, 
  processLibraryImageInBackground 
} from "@/utils/libraryImageProcessor";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { calculateAppropriateImageSize } from "@/utils/elementUtils";

interface LibraryImage {
  id: string;
  image_path: string;
  name: string;
}

export const LibraryView = ({ onClose }: { onClose: () => void }) => {
  const { addElement, updateElement, canvasRef } = useDesignState();
  const { user } = useAuth();
  
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
      // Get canvas dimensions for appropriate sizing
      const canvasDimensions = canvasRef ? {
        width: canvasRef.clientWidth,
        height: canvasRef.clientHeight
      } : undefined;
      
      // Initial basic data to show something immediately
      const img = new Image();
      img.src = image.image_path;
      
      // Create a temporary element with basic info
      const elementId = crypto.randomUUID();
      const initialElement = addElement('image', {
        name: image.name,
        src: image.image_path,
        cacheKey: `library_${elementId}`,
        storageType: 'cloud',
        cloudStorage: {
          url: image.image_path,
          path: image.image_path.replace(
            `https://dmwwgrbleohkopoqupzo.supabase.co/storage/v1/object/public/`,
            ''
          )
        },
        isLoading: true, // Add loading state to show loading indicator
      });

      // Start processing in the background
      // Process the image like we do with uploaded images
      img.onload = async () => {
        // Get original dimensions
        const width = img.naturalWidth;
        const height = img.naturalHeight;
        
        // Calculate appropriate size based on canvas dimensions
        const appropriateSize = calculateAppropriateImageSize(
          width,
          height,
          canvasDimensions?.width,
          canvasDimensions?.height
        );
        
        // Update element with proper size info immediately
        updateElement(initialElement.id, {
          size: appropriateSize,
          originalSize: { width, height },
        });

        // Process image in background and update with full data when ready
        processLibraryImageInBackground(
          image.image_path,
          initialElement,
          (updates) => updateElement(initialElement.id, {
            ...updates,
            isLoading: false // Remove loading state when processing is complete
          })
        );
      };
      
      img.onerror = () => {
        console.error("Error loading library image:", image.image_path);
        updateElement(initialElement.id, { isLoading: false });
      };
      
      // Close the dialog
      onClose();
    } catch (error) {
      console.error('Error processing library image:', error);
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
        >
          <img
            src={image.image_path}
            alt={image.name}
            className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
          />
          <div className="absolute bottom-1 right-1 bg-black/50 p-1 rounded-md opacity-70 group-hover:opacity-100">
            <Cloud className="w-3 h-3 text-white" />
          </div>
        </button>
      ))}
    </div>
  );
};
