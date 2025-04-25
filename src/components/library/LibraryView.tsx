
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useDesignState } from "@/context/DesignContext";
import { Loader2 } from "lucide-react";
import { processLibraryImage } from "@/utils/imageUploader";
import { toast } from "sonner";

interface LibraryImage {
  id: string;
  image_path: string;
  name: string;
}

export const LibraryView = ({ onClose }: { onClose: () => void }) => {
  const { addElement, canvasRef } = useDesignState();
  
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
    const loadingToast = toast.loading("Processing image...");
    
    try {
      // Get canvas dimensions if available
      const canvasDimensions = canvasRef ? {
        width: canvasRef.clientWidth,
        height: canvasRef.clientHeight
      } : undefined;
      
      // Process the library image
      const processedImage = await processLibraryImage(
        image.image_path,
        canvasDimensions?.width,
        canvasDimensions?.height
      );
      
      // Create new image element with the processed library image
      addElement('image', {
        ...processedImage,
        name: image.name
      });
      
      toast.dismiss(loadingToast);
      toast.success("Image added to canvas");
      onClose();
    } catch (error) {
      console.error('Error processing library image:', error);
      toast.dismiss(loadingToast);
      toast.error("Failed to process image");
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
        </button>
      ))}
    </div>
  );
};
