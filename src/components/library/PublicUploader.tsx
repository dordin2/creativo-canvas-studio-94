
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Upload } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const FILE_SIZE_LIMIT = 5 * 1024 * 1024; // 5MB limit
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

export function PublicUploader() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageName, setImageName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Validate the selected file
  const validateFile = (file: File): boolean => {
    if (file.size > FILE_SIZE_LIMIT) {
      toast.error(`File too large. Limit is ${FILE_SIZE_LIMIT / 1024 / 1024}MB`);
      return false;
    }

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      toast.error('Unsupported file type. Use JPG, PNG, GIF or WebP');
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
      if (!imageName) {
        // Set default name from file name without extension
        const defaultName = file.name.split('.').slice(0, -1).join('.') || file.name;
        setImageName(defaultName);
      }
    } else {
      // Reset the input
      e.target.value = '';
      setImageFile(null);
    }
  };

  const handleUpload = async () => {
    if (!imageFile || !imageName) {
      toast.error('Please select an image and enter a name');
      return;
    }

    try {
      setIsUploading(true);
      
      // Rate limiting check
      const recentUploads = localStorage.getItem('recentUploads');
      const uploads = recentUploads ? JSON.parse(recentUploads) : [];
      const now = Date.now();
      
      // Filter uploads from last 5 minutes
      const recentUploadCount = uploads.filter((time: number) => now - time < 300000).length;
      
      if (recentUploadCount >= 10) {
        toast.error('Upload limit reached. Try again later');
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

      // Insert metadata into library_elements
      const { error: insertError } = await supabase
        .from('library_elements')
        .insert({
          name: imageName,
          image_path: urlData.publicUrl,
          created_by: user?.id || null
        });

      if (insertError) throw insertError;

      toast.success('Image uploaded successfully');
      queryClient.invalidateQueries({ queryKey: ['library-images'] });
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
      toast.error('Error uploading the image');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4 border rounded-lg p-4">
      <h3 className="text-lg font-medium">Upload to Library</h3>
      <div className="space-y-4">
        <Input
          type="file"
          onChange={handleFileChange}
          accept={ALLOWED_FILE_TYPES.join(',')}
        />
        <Input
          placeholder="Image name"
          value={imageName}
          onChange={(e) => setImageName(e.target.value)}
          maxLength={50}
        />
        <Button
          onClick={handleUpload}
          disabled={!imageFile || !imageName || isUploading}
          className="w-full"
        >
          <Upload className="mr-2 h-4 w-4" />
          {isUploading ? 'Uploading...' : 'Upload'}
        </Button>
      </div>
    </div>
  );
}
