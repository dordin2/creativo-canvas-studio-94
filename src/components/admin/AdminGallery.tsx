
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Images } from 'lucide-react';
import { toast } from "sonner";

interface LibraryImage {
  id: string;
  name: string;
  image_path: string;
  created_at: string;
}

export function AdminGallery() {
  const [images, setImages] = useState<LibraryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAdminImages = async () => {
    try {
      const { data, error } = await supabase
        .from('library_elements')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setImages(data || []);
    } catch (error) {
      console.error('Error fetching admin images:', error);
      toast.error('Failed to load admin images');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminImages();
  }, []);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Images className="h-4 w-4" />
          Admin Gallery
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Admin Gallery</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : images.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No images found
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {images.map((image) => (
                <div 
                  key={image.id} 
                  className="border rounded-lg p-2 hover:bg-gray-50 transition-colors"
                >
                  <img 
                    src={image.image_path} 
                    alt={image.name}
                    className="w-full h-32 object-contain bg-gray-50 rounded-md"
                  />
                  <p className="mt-2 text-sm font-medium truncate">{image.name}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(image.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
