
import React, { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AdminLibraryViewProps {
  onClose: () => void;
}

interface LibraryImage {
  id: string;
  image_path: string;
  name: string;
  created_at: string;
}

export const AdminLibraryView: React.FC<AdminLibraryViewProps> = ({ onClose }) => {
  const [images, setImages] = useState<LibraryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLibraryImages();
  }, []);

  const fetchLibraryImages = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('library_elements')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setImages(data || []);
    } catch (error) {
      console.error('Error fetching images:', error);
      toast.error('Failed to load library images');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="w-12 h-12 border-4 border-canvas-purple border-t-transparent rounded-full animate-spin"></div>
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
          onClick={() => {
            toast.info('Image management is handled in the Admin Gallery');
            onClose();
          }}
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
