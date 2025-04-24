
import React, { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Images, Upload, Trash2, AlertCircle } from 'lucide-react';
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface LibraryImage {
  id: string;
  image_path: string;
  name: string;
  created_at: string;
  created_by?: string; // Track who created the image
}

const FILE_SIZE_LIMIT = 5 * 1024 * 1024; // 5MB limit
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

export function AdminGallery() {
  const [images, setImages] = useState<LibraryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageName, setImageName] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const { user, profile, session } = useAuth();
  const navigate = useNavigate();

  // Check if user is authenticated and has admin rights
  useEffect(() => {
    if (!user) {
      toast.error('יש להתחבר כדי לגשת לגלריית האדמין');
      navigate('/auth');
      return;
    }

    // Check for admin role
    const checkAdminRole = async () => {
      try {
        const { data, error } = await supabase.rpc('is_admin');
        
        if (error) {
          console.error('Error checking admin status:', error);
          setIsAdmin(false);
          return;
        }
        
        setIsAdmin(!!data);
        
        if (!data) {
          toast.error('הגישה מוגבלת למנהלים בלבד');
          navigate('/');
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      }
    };

    checkAdminRole();
  }, [user, navigate]);

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
      toast.error('נכשל בטעינת הגלריה');
    } finally {
      setIsLoading(false);
    }
  };

  // Validate the selected file
  const validateFile = (file: File): boolean => {
    // Check file size
    if (file.size > FILE_SIZE_LIMIT) {
      toast.error(`קובץ גדול מדי. המגבלה היא ${FILE_SIZE_LIMIT / 1024 / 1024}MB`);
      return false;
    }

    // Check file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      toast.error('סוג קובץ לא נתמך. השתמש ב-JPG, PNG, GIF או WebP');
      return false;
    }

    return true;
  };

  // Generate a safe filename
  const generateSafeFilename = (originalName: string): string => {
    // Remove special characters and spaces
    const baseName = originalName
      .replace(/[^\w\s.-]/g, '')
      .replace(/\s+/g, '_')
      .toLowerCase();
    
    // Add timestamp to ensure uniqueness
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
      // Rate limiting check - could be enhanced with a proper service
      const recentUploads = localStorage.getItem('recentUploads');
      const uploads = recentUploads ? JSON.parse(recentUploads) : [];
      const now = Date.now();
      
      // Filter uploads from last 5 minutes
      const recentUploadCount = uploads.filter((time: number) => now - time < 300000).length;
      
      if (recentUploadCount >= 10) {
        toast.error('הגעת למגבלת העלאות. נסה שוב מאוחר יותר');
        return;
      }
      
      // Update recent uploads
      uploads.push(now);
      localStorage.setItem('recentUploads', JSON.stringify(uploads));

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
      fetchAdminImages();
      setImageFile(null);
      setImageName('');
      
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
      fetchAdminImages();
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('תקלה במחיקת התמונה');
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchAdminImages();
    }
    // eslint-disable-next-line
  }, [isAdmin]);

  if (!user) {
    return (
      <div className="p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            יש להתחבר כדי לגשת לאזור זה
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            גישה מוגבלת למנהלים בלבד
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-4 p-4 border rounded-lg max-w-2xl mx-auto">
        <h3 className="text-lg font-medium">העלאת אלמנט חדש לספריה</h3>
        <div className="space-y-4">
          <Input
            type="file"
            onChange={handleFileChange}
            accept={ALLOWED_FILE_TYPES.join(',')}
          />
          <Input
            placeholder="שם לאלמנט"
            value={imageName}
            onChange={(e) => setImageName(e.target.value)}
            maxLength={50} // Limit name length
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
