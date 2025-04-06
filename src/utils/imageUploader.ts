
import { toast } from "sonner";
import { DesignElement } from "@/types/designTypes";

export const processImageUpload = (
  file: File, 
  onSuccess: (data: Partial<DesignElement>) => void
): void => {
  if (!file.type.startsWith('image/')) {
    toast.error("Please upload a valid image file");
    return;
  }
  
  const reader = new FileReader();
  reader.onload = (e) => {
    if (e.target?.result) {
      const dataUrl = e.target.result as string;
      
      // Create a new image element to get the natural dimensions
      const img = new Image();
      img.onload = () => {
        // Get the natural dimensions of the uploaded image
        const naturalWidth = img.naturalWidth;
        const naturalHeight = img.naturalHeight;
        
        // Calculate scaled dimensions to make the image start at a reasonable size
        // Max dimension (width or height) will be 300px
        const MAX_DIMENSION = 300;
        let scaledWidth = naturalWidth;
        let scaledHeight = naturalHeight;
        
        // Scale down only if the image is larger than our target size
        if (naturalWidth > MAX_DIMENSION || naturalHeight > MAX_DIMENSION) {
          if (naturalWidth > naturalHeight) {
            // Landscape orientation
            scaledWidth = MAX_DIMENSION;
            scaledHeight = (naturalHeight / naturalWidth) * MAX_DIMENSION;
          } else {
            // Portrait or square orientation
            scaledHeight = MAX_DIMENSION;
            scaledWidth = (naturalWidth / naturalHeight) * MAX_DIMENSION;
          }
        }
        
        // Provide the processed image data
        onSuccess({ 
          dataUrl, 
          src: undefined, // Clear the external URL when using a local file
          size: {
            width: scaledWidth,
            height: scaledHeight
          },
          originalSize: {  // Store original size for scaling
            width: naturalWidth,
            height: naturalHeight
          }
        });
        
        toast.success("Image uploaded successfully");
      };
      
      img.onerror = () => {
        toast.error("Failed to load image dimensions");
      };
      
      // Set the source to the data URL to trigger the onload event
      img.src = dataUrl;
    }
  };
  
  reader.onerror = () => {
    toast.error("Failed to load image");
  };
  
  reader.readAsDataURL(file);
};
