
import React, { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Upload, Trash2 } from 'lucide-react';
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";

interface AdminLibraryViewProps {
  onClose: () => void;
}

interface LibraryImage {
  id: string;
  image_path: string;
  name: string;
  created_at: string;
  created_by?: string;
}

const FILE_SIZE_LIMIT = 5 * 1024 * 1024; // 5MB limit
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

export const AdminLibraryView: React.FC<AdminLibraryViewProps> = () => {
  const [images, setImages] = useState<LibraryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageName, setImageName] = useState('');
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    if (isAdmin) {
      fetchLibraryImages();
    }
  }, [isAdmin]);

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
      toast.error('נכשל בטעינת הספרייה');
    } finally {
      setIsLoading(false);
    }
  };

  // Validate the selected file
  const validateFile = (file: File): boolean => {
    if (file.size > FILE_SIZE_LIMIT) {
      toast.error(`קובץ גדול מדי. המגבלה היא ${FILE_SIZE_LIMIT / 1024 / 1024}MB`);
      return false;
    }

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      toast.error('סוג קובץ לא נתמך. השתמש ב-JPG, PNG, GIF או WebP');
      return false;
    }

    return true;
  };

  // Generate a safe filename
  const generateSafeFilename = (originalName: string): string => {
    const baseName = originalName
      .replace(/[^\w\s.-]/g, '')
      .replace(/\s+/g, '_')
      .toLowerCase();
    
    const timestamp = Date.now();
    const extension = baseName.split('.').pop() || 'jpg';
    
    return `${timestamp}_${baseName.substring(0, 50)}.${extension}`;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && validateFile(file)) {
      setImageFile(file);
    } else {
      // Reset the input
      e.target.value = '';
      setImageFile(null);
    }
  };

  const handleUpload = async () => {
    if (!user || !isAdmin) {
      toast.error('אין לך הרשאות מנהל');
      return;
    }
    
    if (!imageFile || !imageName) {
      toast.error('נא לבחור תמונה ולהזין שם');
      return;
    }

    try {
      // Rate limiting check
      const recentUploads = localStorage.getItem('recentUploads');
      const uploads = recentUploads ? JSON.parse(recentUploads) : [];
      const now = Date.now();
      
      // Filter uploads from last 5 minutes
      const recentUploadCount = uploads.filter((time: number) => now - time < 300000).length;
      
      if (recentUploadCount >= 10) {
        toast.error('הגעת למגבלת העלאות. נסה שוב מאוחר יותר');
        return;
      }

      // Create a safe filename
      const safeFileName = generateSafeFilename(imageFile.name);

      // Upload image to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('library_elements')
        .upload(safeFileName, imageFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('library_elements')
        .getPublicUrl(safeFileName);

      // Insert metadata into library_elements with audit info
      const { error: insertError } = await supabase
        .from('library_elements')
        .insert({
          name: imageName,
          image_path: urlData.publicUrl,
          created_by: user.id
        });

      if (insertError) throw insertError;

      toast.success('תמונה עלתה בהצלחה');
      fetchLibraryImages();
      setImageFile(null);
      setImageName('');
      
      // Update recent uploads
      uploads.push(now);
      localStorage.setItem('recentUploads', JSON.stringify(uploads));
      
      // Reset the file input
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error) {
      console.error('Error uploading element:', error);
      toast.error('תקלה בהעלאת התמונה');
    }
  };

  const handleDelete = async (imageId: string) => {
    if (!user || !isAdmin) {
      toast.error('אין לך הרשאות מנהל');
      return;
    }
    
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
      fetchLibraryImages();
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('תקלה במחיקת התמונה');
    }
  };

  if (!isAdmin) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        גישה מוגבלת למנהלים בלבד
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4 border rounded-lg p-4">
        <h3 className="text-lg font-medium">העלאת תמונה חדשה לספרייה</h3>
        <div className="space-y-4">
          <Input
            type="file"
            onChange={handleFileChange}
            accept={ALLOWED_FILE_TYPES.join(',')}
          />
          <Input
            placeholder="שם לתמונה"
            value={imageName}
            onChange={(e) => setImageName(e.target.value)}
            maxLength={50}
          />
          <Button
            onClick={handleUpload}
            disabled={!imageFile || !imageName || !isAdmin}
            className="w-full"
          >
            <Upload className="mr-2 h-4 w-4" />
            העלאה
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <div className="w-12 h-12 border-4 border-canvas-purple border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : !images?.length ? (
        <div className="text-center py-8 text-muted-foreground">
          אין תמונות בספרייה
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {images.map((image) => (
            <div
              key={image.id}
              className="relative group aspect-square"
            >
              <img
                src={image.image_path}
                alt={image.name}
                className="w-full h-full object-cover rounded-lg border hover:border-primary transition-colors"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100">
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => handleDelete(image.id)}
                  className="z-10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-black bg-opacity-50 text-white text-sm truncate rounded-b-lg">
                {image.name}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
