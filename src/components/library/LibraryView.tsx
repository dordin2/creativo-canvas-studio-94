
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useDesignState } from "@/context/DesignContext";
import { Loader2, Cloud, RefreshCw, AlertCircle } from "lucide-react";
import { 
  getInitialLibraryImageData, 
  processLibraryImageInBackground 
} from "@/utils/libraryImageProcessor";
import { cn } from "@/lib/utils";
import { syncLibraryWithStorage, verifyImageExists } from "@/utils/librarySync";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface LibraryImage {
  id: string;
  image_path: string;
  name: string;
  file_name?: string;
  description?: string;
  category?: string;
  created_at?: string;
  created_by?: string;
}

interface LibraryViewProps {
  onClose: () => void;
  autoSync?: boolean;
}

export const LibraryView = ({ onClose, autoSync = false }: LibraryViewProps) => {
  const { addElement, updateElement, canvasRef, isGameMode } = useDesignState();
  const queryClient = useQueryClient();
  const [syncingLibrary, setSyncingLibrary] = useState(false);
  const [brokenImages, setBrokenImages] = useState<Set<string>>(new Set());
  
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
            const fileName = image.file_name || image.image_path?.split('/').pop() || '';
            if (fileName) {
              const exists = await verifyImageExists(fileName);
              if (!exists) {
                broken.add(image.id);
              }
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

  const handleRefreshLibrary = async () => {
    setSyncingLibrary(true);
    try {
      await syncLibraryWithStorage();
      queryClient.invalidateQueries({ queryKey: ['library-images'] });
    } finally {
      setSyncingLibrary(false);
    }
  };
  
  const handleImageClick = async (image: LibraryImage) => {
    // Don't allow clicking on broken images
    if (brokenImages.has(image.id)) {
      return;
    }
    
    try {
      // Get filename - prefer file_name field, fallback to extracting from image_path
      const fileName = image.file_name || image.image_path?.split('/').pop() || '';
      
      if (!fileName) {
        console.error('No filename available for image:', image);
        return;
      }
      
      // Generate the correct URL for the new library bucket
      const { data: urlData } = supabase.storage
        .from('library')
        .getPublicUrl(fileName);
      
      const imageUrl = urlData.publicUrl;
      
      const canvasDimensions = canvasRef ? {
        width: canvasRef.clientWidth,
        height: canvasRef.clientHeight
      } : undefined;
      
      const initialData = await getInitialLibraryImageData(
        imageUrl,
        canvasDimensions?.width,
        canvasDimensions?.height
      );
      
      const newElement = addElement('image', {
        ...initialData,
        src: imageUrl,
        name: image.name,
        storageType: 'cloud',
        cloudStorage: {
          url: imageUrl,
          path: `library/${fileName}`
        }
      });
      
      processLibraryImageInBackground(
        imageUrl,
        newElement,
        (updates) => updateElement(newElement.id, updates)
      );
      
      onClose();
    } catch (error) {
      console.error('Error processing library image:', error);
    }
  };
  
  if (isLoading || syncingLibrary) {
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
        <Button onClick={handleRefreshLibrary}>Try Again</Button>
      </div>
    );
  }
  
  if (!images?.length) {
    return (
      <div className="text-center py-8 flex flex-col items-center gap-4">
        <div className="text-muted-foreground">
          No images available in library
        </div>
        <Button onClick={handleRefreshLibrary} variant="outline" className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />
          Refresh Library
        </Button>
      </div>
    );
  }

  const validImages = images.filter(image => !brokenImages.has(image.id));

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex justify-end pb-2 border-b flex-shrink-0">
        <Button
          size="sm"
          variant="outline" 
          onClick={handleRefreshLibrary}
          disabled={syncingLibrary || isLoading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={cn("w-4 h-4", syncingLibrary && "animate-spin")} />
          Sync Library
        </Button>
      </div>
      
      {validImages.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          All images appear to be broken. Try syncing the library.
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4">
            {images?.map((image) => {
              // Get filename - prefer file_name field, fallback to extracting from image_path
              const fileName = image.file_name || image.image_path?.split('/').pop() || '';
              
              if (!fileName) {
                return null; // Skip images without valid filenames
              }
              
              // Generate the correct URL for display
              const { data: urlData } = supabase.storage
                .from('library')
                .getPublicUrl(fileName);
              
              const displayUrl = urlData.publicUrl;
              
              return (
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
                    src={displayUrl}
                    alt={image.name}
                    className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                    onError={() => {
                      setBrokenImages(prev => new Set(prev).add(image.id));
                    }}
                  />
                  <div className="absolute bottom-1 right-1 bg-black/50 p-1 rounded-md opacity-70 group-hover:opacity-100">
                    <Cloud className="w-3 h-3 text-white" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent text-white text-xs">
                    <div className="font-medium truncate">{image.name}</div>
                    {image.description && (
                      <div className="text-gray-300 truncate">{image.description}</div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
