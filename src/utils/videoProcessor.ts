
import { toast } from "sonner";
import { DesignElement } from "@/types/designTypes";

interface VideoMetadata {
  duration: number;
  width: number;
  height: number;
}

interface ProcessedVideo {
  dataUrl: string;
  thumbnailDataUrl: string;
  duration: number;
  width: number;
  height: number;
  size: { width: number; height: number };
  originalSize: { width: number; height: number };
}

// In-memory cache for processed videos
const videoCache = new Map<string, ProcessedVideo>();

// Process and generate video thumbnail
export const processVideoUpload = async (
  file: File,
  onComplete: (data: Partial<DesignElement>) => void,
  maxWidth?: number,
  maxHeight?: number
): Promise<void> => {
  try {
    // Generate a cache key based on file metadata
    const cacheKey = `video_${file.name}_${file.size}_${file.lastModified}`;
    
    // Check if this video is already in the cache
    if (videoCache.has(cacheKey)) {
      console.log("Using cached video:", cacheKey);
      const cachedVideo = videoCache.get(cacheKey)!;
      onComplete({
        dataUrl: cachedVideo.dataUrl,
        thumbnailDataUrl: cachedVideo.thumbnailDataUrl,
        videoDuration: cachedVideo.duration,
        originalSize: cachedVideo.originalSize,
        size: cachedVideo.size,
        cacheKey
      });
      return;
    }
    
    // Create object URL for the video file
    const videoUrl = URL.createObjectURL(file);
    
    // Show loading toast
    const loadingToast = toast.loading("Processing video...");
    
    try {
      // Get video metadata (duration, dimensions)
      const metadata = await getVideoMetadata(videoUrl);
      
      // Generate a thumbnail from the video
      const thumbnailDataUrl = await generateVideoThumbnail(videoUrl, metadata);
      
      // Calculate appropriate size while maintaining aspect ratio
      const { width, height } = calculateAspectRatio(
        metadata.width, 
        metadata.height, 
        maxWidth, 
        maxHeight
      );
      
      // Store the video in cache
      const processedVideo: ProcessedVideo = {
        dataUrl: videoUrl,
        thumbnailDataUrl,
        duration: metadata.duration,
        width: metadata.width,
        height: metadata.height,
        size: { width, height },
        originalSize: { width: metadata.width, height: metadata.height }
      };
      
      videoCache.set(cacheKey, processedVideo);
      
      // Update the element with the processed video data
      onComplete({
        dataUrl: videoUrl,
        thumbnailDataUrl,
        videoDuration: metadata.duration,
        originalSize: { width: metadata.width, height: metadata.height },
        size: { width, height },
        cacheKey,
        fileMetadata: {
          name: file.name,
          type: file.type,
          size: file.size,
          lastModified: file.lastModified
        }
      });
      
      toast.dismiss(loadingToast);
      toast.success("Video processed successfully");
    } catch (error) {
      toast.dismiss(loadingToast);
      throw error; // Re-throw to be caught by the outer try/catch
    }
  } catch (error) {
    console.error("Error processing video:", error);
    toast.error("Error processing video. Please try again.");
    
    // Return a fallback in case of error
    onComplete({
      dataUrl: "",
      thumbnailDataUrl: "",
      videoDuration: 0
    });
  }
};

// Get video metadata (dimensions and duration)
const getVideoMetadata = (videoUrl: string): Promise<VideoMetadata> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    
    // Set a timeout to prevent hanging if video loading takes too long
    const timeout = setTimeout(() => {
      video.remove();
      reject(new Error("Video metadata loading timeout"));
    }, 10000); // 10-second timeout
    
    video.onloadedmetadata = () => {
      clearTimeout(timeout);
      const metadata: VideoMetadata = {
        duration: video.duration,
        width: video.videoWidth,
        height: video.videoHeight
      };
      video.remove();
      resolve(metadata);
    };
    
    video.onerror = () => {
      clearTimeout(timeout);
      video.remove();
      reject(new Error("Failed to load video metadata"));
    };
    
    video.src = videoUrl;
    // Preload metadata only (don't load the entire video)
    video.preload = "metadata";
  });
};

// Generate a thumbnail from the video at the 1-second mark
const generateVideoThumbnail = async (
  videoUrl: string, 
  metadata: VideoMetadata
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    if (!context) {
      reject(new Error("Failed to get canvas context"));
      return;
    }
    
    // Set a timeout to prevent hanging
    const timeout = setTimeout(() => {
      video.remove();
      canvas.remove();
      reject(new Error("Thumbnail generation timeout"));
    }, 10000); // 10-second timeout
    
    video.onloadeddata = () => {
      try {
        clearTimeout(timeout);
        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Draw the video frame to the canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert canvas to data URL (thumbnail)
        const thumbnailDataUrl = canvas.toDataURL('image/jpeg', 0.7);
        
        // Clean up
        video.remove();
        canvas.remove();
        
        resolve(thumbnailDataUrl);
      } catch (error) {
        clearTimeout(timeout);
        reject(error);
      }
    };
    
    video.onerror = () => {
      clearTimeout(timeout);
      video.remove();
      canvas.remove();
      reject(new Error("Failed to generate video thumbnail"));
    };
    
    // Set the current time to get a frame from near the beginning
    video.onloadedmetadata = () => {
      // Choose a frame at 1s or at the 10% mark for very short videos
      const seekTime = Math.min(1, metadata.duration * 0.1);
      video.currentTime = seekTime;
    };
    
    video.src = videoUrl;
    // Preload enough data to get a frame
    video.preload = "auto";
  });
};

// Calculate aspect ratio while constraining to max dimensions
const calculateAspectRatio = (
  originalWidth: number,
  originalHeight: number,
  maxWidth?: number,
  maxHeight?: number
): { width: number; height: number } => {
  let width = originalWidth;
  let height = originalHeight;
  
  // Default max dimensions if not provided
  maxWidth = maxWidth || 640;
  maxHeight = maxHeight || 480;
  
  // Calculate aspect ratio for resizing
  const aspectRatio = originalWidth / originalHeight;
  
  // Resize to fit within max dimensions while maintaining aspect ratio
  if (width > maxWidth) {
    width = maxWidth;
    height = width / aspectRatio;
  }
  
  if (height > maxHeight) {
    height = maxHeight;
    width = height * aspectRatio;
  }
  
  return { width, height };
};

// Function to get a video from cache by key
export const getVideoFromCache = (key: string): ProcessedVideo | undefined => {
  return videoCache.get(key);
};

// Function to clear video cache when needed
export const clearVideoCache = (): void => {
  videoCache.forEach((cachedVideo) => {
    // Revoke object URLs to prevent memory leaks
    if (cachedVideo.dataUrl.startsWith('blob:')) {
      URL.revokeObjectURL(cachedVideo.dataUrl);
    }
  });
  videoCache.clear();
};

// Initialize video caching system
export const initVideoStorage = (): void => {
  // Register beforeunload event to clean up video URLs
  window.addEventListener('beforeunload', () => {
    clearVideoCache();
  });
  
  console.log("Video storage initialized");
};
