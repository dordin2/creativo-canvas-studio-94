
// הקוד של גלריית האדמין כפי שמופיע בדיף שסיפקת (כולל העלאה, מחיקה, הצגת תמונות וכו')
import React, { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Images, Upload, Trash2 } from 'lucide-react';
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

interface LibraryImage {
  id: string;
  image_path: string;
  name: string;
  created_at: string;
}

export function AdminGallery() {
  const [images, setImages] = useState<LibraryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageName, setImageName] = useState('');

  const fetchAdminImages = async () => {
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
      toast.error('Failed to load gallery');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!imageFile || !imageName) {
      toast.error('נא לבחור תמונה ולהזין שם');
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

      toast.success('תמונה עלתה בהצלחה');
      fetchAdminImages();
      setImageFile(null);
      setImageName('');
    } catch (error) {
      console.error('Error uploading element:', error);
      toast.error('תקלה בהעלאת התמונה');
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

      toast.success('התמונה נמחקה');
      fetchAdminImages();
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('תקלה במחיקת התמונה');
    }
  };

  useEffect(() => {
    fetchAdminImages();
    // eslint-disable-next-line
  }, []);

  return (
    <div>
      <div className="space-y-4 p-4 border rounded-lg max-w-2xl mx-auto">
        <h3 className="text-lg font-medium">העלאת אלמנט חדש לספריה</h3>
        <div className="space-y-4">
          <Input
            type="file"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            accept="image/*"
          />
          <Input
            placeholder="שם לאלמנט"
            value={imageName}
            onChange={(e) => setImageName(e.target.value)}
          />
          <Button
            onClick={handleUpload}
            disabled={!imageFile || !imageName}
            className="w-full"
          >
            <Upload className="mr-2 h-4 w-4" />
            העלאה
          </Button>
        </div>
      </div>
      <div className="mt-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {images.map((image) => (
              <div
                key={image.id}
                className="border rounded-lg p-2 hover:bg-gray-50 transition-colors relative group"
              >
                <img
                  src={image.image_path}
                  alt={image.name}
                  className="rounded max-h-36 w-full object-contain mb-2 bg-gray-100"
                  />
                <div className="flex justify-between items-center">
                  <span className="font-medium">{image.name}</span>
                  <p className="text-xs text-gray-500">
                    {new Date(image.created_at).toLocaleDateString()}
                  </p>
                </div>
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
    </div>
  );
}
