
import { useCallback, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useDesignState } from '@/context/DesignContext';
import { Loader2, Upload } from 'lucide-react';
import { processImageUpload } from '@/utils/imageUploader';

interface UploadTabProps {
  onClose: () => void;
}

export const UploadTab = ({ onClose }: UploadTabProps) => {
  const { addElement } = useDesignState();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const handleImageUpload = useCallback(async (file: File) => {
    setIsUploading(true);
    
    try {
      // Process image first
      const imageData = await new Promise((resolve, reject) => {
        processImageUpload(file, resolve, reject);
      });
      
      // Only create element after image is processed
      const element = addElement('image', imageData);
      onClose();
    } catch (error) {
      console.error('Failed to process image:', error);
    } finally {
      setIsUploading(false);
    }
  }, [addElement, onClose]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    if (!file.type.startsWith('image/')) {
      console.error('Selected file is not an image');
      return;
    }
    
    handleImageUpload(file);
  }, [handleImageUpload]);

  const triggerFileInput = useCallback(() => {
    if (!isUploading) {
      fileInputRef.current?.click();
    }
  }, [isUploading]);

  return (
    <div className="space-y-4 mt-4">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        className="hidden"
        disabled={isUploading}
      />
      <Button 
        variant="outline" 
        onClick={triggerFileInput}
        className="w-full h-12 flex items-center gap-2"
        disabled={isUploading}
      >
        {isUploading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Upload className="h-4 w-4" />
        )}
        <span>{isUploading ? 'Processing...' : 'Upload Image'}</span>
      </Button>
    </div>
  );
};
