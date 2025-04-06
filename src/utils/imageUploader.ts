
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

export const processVideoUpload = (
  file: File,
  onSuccess: (data: Partial<DesignElement>) => void
): void => {
  if (!file.type.startsWith('video/')) {
    toast.error("Please upload a valid video file");
    return;
  }
  
  const reader = new FileReader();
  reader.onload = (e) => {
    if (e.target?.result) {
      const dataUrl = e.target.result as string;
      
      // Create a video element to get natural dimensions
      const video = document.createElement('video');
      
      // Set up event listeners before setting the src
      video.onloadedmetadata = () => {
        // Get the natural dimensions of the uploaded video
        const naturalWidth = video.videoWidth;
        const naturalHeight = video.videoHeight;
        
        // Calculate scaled dimensions to make the video start at a reasonable size
        // Max dimension (width or height) will be 300px
        const MAX_DIMENSION = 300;
        let scaledWidth = naturalWidth;
        let scaledHeight = naturalHeight;
        
        // Scale down only if the video is larger than our target size
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
        
        // Provide the processed video data
        onSuccess({
          dataUrl,
          src: undefined, // Clear the external URL when using a local file
          file: file,
          size: {
            width: scaledWidth,
            height: scaledHeight
          },
          originalSize: {  // Store original size for scaling
            width: naturalWidth,
            height: naturalHeight
          },
          // Set default video properties
          videoAutoplay: false,
          videoMuted: true,
          videoControls: true,
          videoLoop: false
        });
        
        toast.success("Video uploaded successfully");
      };
      
      video.onerror = () => {
        toast.error("Failed to load video dimensions");
      };
      
      // Set the source to the data URL to trigger the onload event
      video.src = dataUrl;
      // We need to set preload to 'metadata' to ensure dimensions are loaded
      video.preload = 'metadata';
    }
  };
  
  reader.onerror = () => {
    toast.error("Failed to load video");
  };
  
  reader.readAsDataURL(file);
};
