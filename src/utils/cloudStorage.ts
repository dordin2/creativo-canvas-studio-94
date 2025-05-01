import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { compressImageToWebP, createThumbnail } from "@/utils/imageUploader";
import { CloudStorage, DesignElement } from "@/types/designTypes";
import { getImageFromCache, storeImageInCache } from "@/utils/imageUploader";

// Bucket for storing user uploaded images
const BUCKET_NAME = 'user_uploads';

/**
 * Uploads an image to Supabase storage and returns the storage path
 */
export const uploadImageToCloud = async (
  file: File | string,
  elementId: string,
  userId?: string
): Promise<CloudStorage | null> => {
  try {
    if (!supabase) {
      console.error("Supabase client not initialized");
      return null;
    }

    // If no user ID provided, try to get from current session
    if (!userId) {
      const { data: sessionData } = await supabase.auth.getSession();
      userId = sessionData?.session?.user?.id;
      
      if (!userId) {
        toast.error("User not authenticated. Images will be stored locally.");
        return null;
      }
    }

    // Generate unique file paths that include the user ID for security
    const folderPath = `${userId}/${elementId}`;
    const fullImagePath = `${folderPath}/full.webp`;
    const thumbnailPath = `${folderPath}/thumb.webp`;

    let dataUrl: string;
    let thumbnailDataUrl: string;
    let filename: string;

    // Process the file or data URL
    if (typeof file === 'string') {
      // It's already a data URL
      dataUrl = file;
      thumbnailDataUrl = await createThumbnail(dataUrl);
      filename = 'image.webp';
    } else {
      // It's a File object
      const reader = new FileReader();
      dataUrl = await new Promise((resolve) => {
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });
      
      // Compress image and create thumbnail
      const compressResult = await compressImageToWebP(dataUrl);
      dataUrl = compressResult.dataUrl;
      thumbnailDataUrl = await createThumbnail(dataUrl);
      filename = file.name;
    }

    // Extract binary data from data URLs
    const imageBlob = await fetch(dataUrl).then(res => res.blob());
    const thumbnailBlob = await fetch(thumbnailDataUrl).then(res => res.blob());

    // Upload full image
    const { error: uploadError, data: uploadData } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fullImagePath, imageBlob, {
        contentType: 'image/webp',
        upsert: true
      });

    if (uploadError) {
      console.error("Error uploading image:", uploadError);
      toast.error("Failed to upload image to cloud storage");
      return null;
    }

    // Upload thumbnail
    const { error: thumbnailError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(thumbnailPath, thumbnailBlob, {
        contentType: 'image/webp',
        upsert: true
      });

    if (thumbnailError) {
      console.error("Error uploading thumbnail:", thumbnailError);
    }

    // Get public URLs
    const imageUrl = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fullImagePath).data.publicUrl;

    const thumbnailUrl = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(thumbnailPath).data.publicUrl;

    // Add record to user_images table
    const { data: imageRecord, error: dbError } = await supabase
      .from('user_images')
      .insert({
        user_id: userId,
        storage_path: fullImagePath,
        thumbnail_path: thumbnailPath,
        original_filename: filename,
        element_id: elementId
      })
      .select('id')
      .single();

    if (dbError) {
      console.error("Error recording image metadata:", dbError);
    }

    // Store in memory cache for immediate access
    storeImageInCache(`cloud_${elementId}`, dataUrl);
    storeImageInCache(`cloud_${elementId}_thumbnail`, thumbnailDataUrl, true);
    
    console.log("Successfully uploaded image to cloud storage:", {
      path: fullImagePath,
      thumbnailPath: thumbnailPath,
      url: imageUrl,
      thumbnailUrl: thumbnailUrl
    });

    return {
      path: fullImagePath,
      thumbnailPath: thumbnailPath,
      url: imageUrl,
      thumbnailUrl: thumbnailUrl,
      userId: userId,
      storageId: imageRecord?.id
    };
  } catch (error) {
    console.error("Cloud storage upload error:", error);
    toast.error("Failed to upload to cloud storage");
    return null;
  }
};

/**
 * Fetches an image from cloud storage
 */
export const getImageFromCloud = async (
  element: DesignElement
): Promise<{dataUrl?: string, thumbnailDataUrl?: string}> => {
  try {
    if (!element.cloudStorage) {
      return {};
    }

    // First check local memory cache
    const cachedImage = getImageFromCache(`cloud_${element.id}`);
    const cachedThumbnail = getImageFromCache(`cloud_${element.id}_thumbnail`, true);
    
    if (cachedImage && cachedThumbnail) {
      return {
        dataUrl: cachedImage,
        thumbnailDataUrl: cachedThumbnail
      };
    }
    
    // Otherwise fetch from Supabase Storage
    const imagePath = element.cloudStorage.path;
    const thumbnailPath = element.cloudStorage.thumbnailPath;

    // If we have direct URLs, use them
    if (element.cloudStorage.url) {
      try {
        // Fetch image and convert to data URL
        const imageResponse = await fetch(element.cloudStorage.url);
        const imageBlob = await imageResponse.blob();
        const imageDataUrl = await new Promise<string>(resolve => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(imageBlob);
        });

        // Fetch thumbnail and convert to data URL
        let thumbnailDataUrl: string | undefined;
        if (element.cloudStorage.thumbnailUrl) {
          const thumbnailResponse = await fetch(element.cloudStorage.thumbnailUrl);
          const thumbnailBlob = await thumbnailResponse.blob();
          thumbnailDataUrl = await new Promise<string>(resolve => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(thumbnailBlob);
          });
        }

        // Cache for future use
        if (imageDataUrl) {
          storeImageInCache(`cloud_${element.id}`, imageDataUrl);
        }
        
        if (thumbnailDataUrl) {
          storeImageInCache(`cloud_${element.id}_thumbnail`, thumbnailDataUrl, true);
        }
        
        return {
          dataUrl: imageDataUrl,
          thumbnailDataUrl
        };
      } catch (error) {
        console.error("Error fetching image from URL:", error);
      }
    }

    // If direct URL fetch failed or URLs not available, try download from Supabase
    if (imagePath) {
      const { data: imageData, error: imageError } = await supabase.storage
        .from(BUCKET_NAME)
        .download(imagePath);
      
      if (imageError) {
        console.error("Error downloading image:", imageError);
      } else if (imageData) {
        const imageDataUrl = await new Promise<string>(resolve => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(imageData);
        });
        
        storeImageInCache(`cloud_${element.id}`, imageDataUrl);
        
        // Get thumbnail if available
        if (thumbnailPath) {
          const { data: thumbnailData, error: thumbnailError } = await supabase.storage
            .from(BUCKET_NAME)
            .download(thumbnailPath);
          
          if (!thumbnailError && thumbnailData) {
            const thumbnailDataUrl = await new Promise<string>(resolve => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.readAsDataURL(thumbnailData);
            });
            
            storeImageInCache(`cloud_${element.id}_thumbnail`, thumbnailDataUrl, true);
            
            return {
              dataUrl: imageDataUrl,
              thumbnailDataUrl
            };
          }
        }
        
        return {
          dataUrl: imageDataUrl
        };
      }
    }
    
    return {};
  } catch (error) {
    console.error("Error getting image from cloud:", error);
    return {};
  }
};

/**
 * Deletes an image from cloud storage
 */
export const deleteImageFromCloud = async (element: DesignElement): Promise<boolean> => {
  if (!element.cloudStorage?.path) {
    return false;
  }

  try {
    const imagePath = element.cloudStorage.path;
    const thumbnailPath = element.cloudStorage.thumbnailPath;
    
    // Delete files from storage
    const { error: imageError } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([imagePath]);
    
    if (imageError) {
      console.error("Error deleting image from cloud storage:", imageError);
    }
    
    if (thumbnailPath) {
      const { error: thumbnailError } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([thumbnailPath]);
      
      if (thumbnailError) {
        console.error("Error deleting thumbnail from cloud storage:", thumbnailError);
      }
    }
    
    // Delete metadata from database
    if (element.cloudStorage.storageId) {
      const { error: dbError } = await supabase
        .from('user_images')
        .delete()
        .eq('id', element.cloudStorage.storageId);
      
      if (dbError) {
        console.error("Error deleting image record:", dbError);
      }
    }
    
    return true;
  } catch (error) {
    console.error("Error deleting from cloud storage:", error);
    return false;
  }
};

/**
 * Migrates an image from local storage to cloud storage
 */
export const migrateImageToCloud = async (element: DesignElement): Promise<DesignElement | null> => {
  try {
    if (!element.dataUrl) {
      console.warn("Cannot migrate element without dataUrl:", element.id);
      return null;
    }
    
    const cloudStorage = await uploadImageToCloud(
      element.dataUrl,
      element.id
    );
    
    if (!cloudStorage) {
      return null;
    }
    
    // Return updated element with cloud storage info
    const updatedElement: DesignElement = {
      ...element,
      cloudStorage,
      storageType: 'cloud',
      // Keep dataUrl for immediate display while updating
    };
    
    return updatedElement;
  } catch (error) {
    console.error("Error migrating image to cloud:", error);
    return null;
  }
};

/**
 * Gets a signed URL for downloading private files
 */
export const getSignedUrl = async (path: string): Promise<string | null> => {
  try {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(path, 60 * 60); // 1 hour expiry
    
    if (error) {
      console.error("Error creating signed URL:", error);
      return null;
    }
    
    return data.signedUrl;
  } catch (error) {
    console.error("Error getting signed URL:", error);
    return null;
  }
};

/**
 * Check if user is authenticated to use cloud storage
 */
export const canUseCloudStorage = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.auth.getSession();
    return !!data.session?.user && !error;
  } catch {
    return false;
  }
};
