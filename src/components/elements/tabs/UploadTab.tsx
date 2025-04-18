
import { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useDesignState } from '@/context/DesignState';
import { Upload } from 'lucide-react';

interface UploadTabProps {
  onClose: () => void;
}

export const UploadTab = ({ onClose }: UploadTabProps) => {
  const { addElement } = useDesignState();
  
  const handleImageUpload = useCallback(() => {
    const element = addElement('image');
    onClose();
    return element;
  }, [addElement, onClose]);

  return (
    <div className="space-y-4 mt-4">
      <Button 
        variant="outline" 
        onClick={handleImageUpload}
        className="w-full h-12 flex items-center gap-2"
      >
        <Upload className="h-4 w-4" />
        <span>Upload Image</span>
      </Button>
    </div>
  );
};
