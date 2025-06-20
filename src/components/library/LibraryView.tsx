

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useDesignState } from "@/context/DesignContext";
import { Loader2, Cloud, AlertCircle } from "lucide-react";
import { 
  getInitialLibraryImageData, 
  processLibraryImageInBackground 
} from "@/utils/libraryImageProcessor";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { syncLibraryWithStorage, verifyImageExists } from "@/utils/librarySync";
import { useState, useEffect } from "react";

interface LibraryImage {
  id: string;
  image_path: string;
  name: string;
}

interface LibraryViewProps {
  onClose: () => void;
  autoSync?: boolean;
}

export const LibraryView = ({ onClose, autoSync = false }: LibraryViewProps) => {
  const { addElement, updateElement, canvasRef, isGameMode } = useDesignState();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [brokenImages, setBrokenImages] = useState<Set<string>>(new Set());
  
  // Auto-sync when component mounts
  useEffect(() => {
    const performAutoSync = async () => {
      try {
        await syncLibraryWithStorage();
        queryClient.invalidateQueries({ queryKey: ['library-images'] });
      } catch (error) {
        console.error('Auto-sync failed:', error);
      }
    };

    performAutoSync();
  }, [queryClient]);
  
  const { data: images, isLoading, isError } = useQuery({
    queryKey: ['library-images'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('library_elements')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      // Pre-check for broken images on load
      if (data) {
        const broken = new Set<string>();
        for (const image of data) {
          try {
            const exists = await verifyImageExists(image.image_path);
            if (!exists) {
              broken.add(image.id);
            }
          } catch (e) {
            console.error(`Error checking image ${image.id}:`, e);
            broken.add(image.id);
          }
        }
        setBrokenImages(broken);
      }
      
      return data as LibraryImage[];
    },
    staleTime: 0 // Always refetch when component mounts
  });
  
  const handleImageClick = async (image: LibraryImage) => {
    // Don't allow clicking on broken images
    if (brokenImages.has(image.id)) {
      return;
    }
    
    try {
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
        storageType: 'cloud',
        cloudStorage: {
          url: image.image_path,
          path: image.image_path.replace(
            `https://dmwwgrbleohkopoqupzo.supabase.co/storage/v1/object/public/`,
            ''
          )
        }
      });
      
      processLibraryImageInBackground(
        image.image_path,
        newElement,
        (updates) => updateElement(newElement.id, updates)
      );
      
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
  
  if (isError) {
    return (
      <div className="text-center py-8 text-muted-foreground flex flex-col items-center gap-4">
        <AlertCircle className="w-10 h-10 text-destructive" />
        <p>Error loading library elements</p>
      </div>
    );
  }
  
  if (!images?.length) {
    return (
      <div className="text-center py-8 flex flex-col items-center gap-4">
        <div className="text-muted-foreground">
          No images available in library
        </div>
      </div>
    );
  }

  const validImages = images.filter(image => !brokenImages.has(image.id));

  return (
    <div className="h-full w-full">
      {validImages.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          All images appear to be broken. Try refreshing the page.
        </div>
      ) : (
        <div className="h-full overflow-y-auto overscroll-contain">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4">
            {images?.map((image) => (
              <button
                key={image.id}
                onClick={() => handleImageClick(image)}
                className={cn(
                  "aspect-square relative group overflow-hidden rounded-lg border transition-colors",
                  brokenImages.has(image.id)
                    ? "opacity-40 cursor-not-allowed border-destructive" 
                    : "hover:border-primary"
                )}
                disabled={brokenImages.has(image.id)}
              >
                {brokenImages.has(image.id) ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-muted/30">
                    <AlertCircle className="w-8 h-8 text-destructive" />
                  </div>
                ) : null}
                
                <img
                  src={image.image_path}
                  alt={image.name}
                  className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                  onError={() => {
                    setBrokenImages(prev => new Set(prev).add(image.id));
                  }}
                />
                <div className="absolute bottom-1 right-1 bg-black/50 p-1 rounded-md opacity-70 group-hover:opacity-100">
                  <Cloud className="w-3 h-3 text-white" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

