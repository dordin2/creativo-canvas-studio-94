
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { uploadExampleImageToLibrary } from "@/utils/uploadExampleImage";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

export const UploadExampleButton = () => {
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);
  
  const handleUpload = async () => {
    setIsUploading(true);
    try {
      const success = await uploadExampleImageToLibrary();
      if (success) {
        // Refresh the library view
        queryClient.invalidateQueries({ queryKey: ['library-images'] });
      }
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <Button 
      onClick={handleUpload}
      disabled={isUploading}
      variant="outline"
      size="sm"
      className="flex items-center gap-2"
    >
      <Upload className="w-4 h-4" />
      {isUploading ? 'Uploading...' : 'Upload Example Image'}
    </Button>
  );
};
