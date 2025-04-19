
import { useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useDesignState } from '@/context/DesignContext';
import { Upload } from 'lucide-react';
import { processImageUpload } from '@/utils/imageUploader';

interface UploadTabProps {
  onClose: () => void;
}

export const UploadTab = ({ onClose }: UploadTabProps) => {
  const { addElement } = useDesignState();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleImageUpload = useCallback((file: File) => {
    const element = addElement('image');
    
    processImageUpload(
      file,
      (updatedData) => {
        element.dataUrl = updatedData.dataUrl;
        element.thumbnailDataUrl = updatedData.thumbnailDataUrl;
        element.file = updatedData.file;
        element.fileMetadata = updatedData.fileMetadata;
        element.originalSize = updatedData.originalSize;
        element.size = updatedData.size;
        element.cacheKey = updatedData.cacheKey;
      }
    );
    
    onClose();
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
    fileInputRef.current?.click();
  }, []);

  return (
    <div className="space-y-4 mt-4">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        className="hidden"
      />
      <Button 
        variant="outline" 
        onClick={triggerFileInput}
        className="w-full h-12 flex items-center gap-2"
      >
        <Upload className="h-4 w-4" />
        <span>Upload Image</span>
      </Button>
    </div>
  );
};
