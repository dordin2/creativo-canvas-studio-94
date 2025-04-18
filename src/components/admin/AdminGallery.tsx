
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Images, Upload, Trash2 } from 'lucide-react';
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

interface LibraryImage {
  id: string;
  name: string;
  image_path: string;
  created_at: string;
}

export function AdminGallery() {
  const [images, setImages] = useState<LibraryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageName, setImageName] = useState('');

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

  const handleUpload = async () => {
    if (!imageFile || !imageName) {
      toast.error('Please select an image and provide a name');
      return;
    }

    try {
      // Upload image to storage
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('library_elements')
        .upload(fileName, imageFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('library_elements')
        .getPublicUrl(fileName);

      // Insert metadata into library_elements
      const { error: insertError } = await supabase
        .from('library_elements')
        .insert({
          name: imageName,
          image_path: urlData.publicUrl
        });

      if (insertError) throw insertError;

      toast.success('Element uploaded successfully');
      fetchAdminImages();
      setImageFile(null);
      setImageName('');
    } catch (error) {
      console.error('Error uploading element:', error);
      toast.error('Failed to upload element');
    }
  };

  const handleDelete = async (imageId: string) => {
    try {
      const imageToDelete = images.find(img => img.id === imageId);
      if (!imageToDelete) return;

      // Extract filename from URL
      const fileName = imageToDelete.image_path.split('/').pop();
      if (!fileName) throw new Error('Invalid file path');

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('library_elements')
        .remove([fileName]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('library_elements')
        .delete()
        .eq('id', imageId);

      if (dbError) throw dbError;

      toast.success('Image deleted successfully');
      fetchAdminImages();
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('Failed to delete image');
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
          Gallery
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Element Gallery</DialogTitle>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          <div className="space-y-4 p-4 border rounded-lg">
            <h3 className="text-lg font-medium">Upload New Element</h3>
            <div className="space-y-4">
              <Input 
                type="file" 
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                accept="image/*"
              />
              <Input 
                placeholder="Element Name" 
                value={imageName}
                onChange={(e) => setImageName(e.target.value)}
              />
              <Button 
                onClick={handleUpload} 
                disabled={!imageFile || !imageName}
                className="w-full"
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload
              </Button>
            </div>
          </div>

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
                  className="border rounded-lg p-2 hover:bg-gray-50 transition-colors relative group"
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
                  <Button 
                    variant="destructive" 
                    size="icon" 
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleDelete(image.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
