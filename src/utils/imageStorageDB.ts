
import { toast } from "sonner";
import { openDB, IDBPDatabase } from "idb";
import { DesignElement, FileMetadata } from "@/types/designTypes";

// Database configuration
const DB_NAME = "creativoCanvas";
const DB_VERSION = 1;
const IMAGE_STORE = "images";
const THUMBNAIL_STORE = "thumbnails";
const METADATA_STORE = "imageMetadata";

// Interface for stored image data
interface StoredImage {
  id: string;
  dataUrl: string;
  timestamp: number;
}

interface ImageMetadata {
  id: string;
  fileMetadata?: FileMetadata;
  originalSize?: { width: number; height: number };
  timestamp: number;
  cacheKey: string;
  size: number; // size in bytes
}

// Initialize the IndexedDB database
const initDB = async (): Promise<IDBPDatabase> => {
  try {
    return await openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Create image stores if they don't exist
        if (!db.objectStoreNames.contains(IMAGE_STORE)) {
          db.createObjectStore(IMAGE_STORE, { keyPath: "id" });
        }
        
        if (!db.objectStoreNames.contains(THUMBNAIL_STORE)) {
          db.createObjectStore(THUMBNAIL_STORE, { keyPath: "id" });
        }
        
        if (!db.objectStoreNames.contains(METADATA_STORE)) {
          db.createObjectStore(METADATA_STORE, { keyPath: "id" });
        }
      }
    });
  } catch (error) {
    console.error("Error initializing IndexedDB:", error);
    toast.error("Failed to initialize image storage");
    throw error;
  }
};

// Returns a database connection
const getDB = async (): Promise<IDBPDatabase> => {
  try {
    return await initDB();
  } catch (error) {
    console.error("Failed to get database connection:", error);
    throw error;
  }
};

// Save image to IndexedDB
export const saveImageToStorage = async (
  id: string,
  dataUrl: string,
  thumbnailDataUrl: string,
  metadata: {
    fileMetadata?: FileMetadata;
    originalSize?: { width: number; height: number };
    cacheKey: string;
  }
): Promise<void> => {
  try {
    const db = await getDB();
    const tx = db.transaction([IMAGE_STORE, THUMBNAIL_STORE, METADATA_STORE], "readwrite");
    
    const timestamp = Date.now();
    
    // Store the main image
    await tx.objectStore(IMAGE_STORE).put({
      id,
      dataUrl,
      timestamp
    });
    
    // Store the thumbnail
    await tx.objectStore(THUMBNAIL_STORE).put({
      id,
      dataUrl: thumbnailDataUrl,
      timestamp
    });
    
    // Store metadata
    await tx.objectStore(METADATA_STORE).put({
      id,
      ...metadata,
      timestamp,
      size: estimateDataUrlSize(dataUrl)
    });
    
    await tx.done;
    
    console.log("ImageStorageDB - Saved image to IndexedDB:", id);
  } catch (error) {
    console.error("Error saving image to IndexedDB:", error);
  }
};

// Load image from IndexedDB
export const getImageFromStorage = async (id: string): Promise<string | null> => {
  try {
    const db = await getDB();
    const image = await db.get(IMAGE_STORE, id);
    
    if (image) {
      // Update access timestamp
      await db.put(IMAGE_STORE, { ...image, timestamp: Date.now() });
      return image.dataUrl;
    }
    
    return null;
  } catch (error) {
    console.error("Error retrieving image from IndexedDB:", error);
    return null;
  }
};

// Load thumbnail from IndexedDB
export const getThumbnailFromStorage = async (id: string): Promise<string | null> => {
  try {
    const db = await getDB();
    const thumbnail = await db.get(THUMBNAIL_STORE, id);
    
    if (thumbnail) {
      return thumbnail.dataUrl;
    }
    
    return null;
  } catch (error) {
    console.error("Error retrieving thumbnail from IndexedDB:", error);
    return null;
  }
};

// Get image metadata
export const getImageMetadata = async (id: string): Promise<ImageMetadata | null> => {
  try {
    const db = await getDB();
    return await db.get(METADATA_STORE, id);
  } catch (error) {
    console.error("Error retrieving image metadata from IndexedDB:", error);
    return null;
  }
};

// Delete image and its related data from storage
export const deleteImageFromStorage = async (id: string): Promise<void> => {
  try {
    const db = await getDB();
    const tx = db.transaction([IMAGE_STORE, THUMBNAIL_STORE, METADATA_STORE], "readwrite");
    
    await tx.objectStore(IMAGE_STORE).delete(id);
    await tx.objectStore(THUMBNAIL_STORE).delete(id);
    await tx.objectStore(METADATA_STORE).delete(id);
    
    await tx.done;
    
    console.log("ImageStorageDB - Deleted image from IndexedDB:", id);
  } catch (error) {
    console.error("Error deleting image from IndexedDB:", error);
  }
};

// Prune old images to maintain storage limits
export const pruneImageStorage = async (maxSizeInMB: number = 50): Promise<void> => {
  try {
    const db = await getDB();
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    
    // Get all metadata to calculate total size
    const metadataStore = db.transaction(METADATA_STORE).objectStore(METADATA_STORE);
    const allMetadata = await metadataStore.getAll();
    
    // Calculate current size and sort by timestamp (oldest first)
    let currentSize = allMetadata.reduce((total, item) => total + item.size, 0);
    allMetadata.sort((a, b) => a.timestamp - b.timestamp);
    
    if (currentSize <= maxSizeInBytes) {
      return; // No pruning needed
    }
    
    console.log(`ImageStorageDB - Storage size (${(currentSize/1024/1024).toFixed(2)}MB) exceeds limit (${maxSizeInMB}MB), pruning...`);
    
    // Begin pruning oldest items until we're under the limit
    const tx = db.transaction([IMAGE_STORE, THUMBNAIL_STORE, METADATA_STORE], "readwrite");
    
    for (const metadata of allMetadata) {
      if (currentSize <= maxSizeInBytes) {
        break;
      }
      
      // Delete this image to free space
      await tx.objectStore(IMAGE_STORE).delete(metadata.id);
      await tx.objectStore(THUMBNAIL_STORE).delete(metadata.id);
      await tx.objectStore(METADATA_STORE).delete(metadata.id);
      
      currentSize -= metadata.size;
      console.log(`ImageStorageDB - Pruned image ${metadata.id}, freed ${(metadata.size/1024).toFixed(2)}KB`);
    }
    
    await tx.done;
    
    console.log(`ImageStorageDB - Pruning complete, new storage size: ${(currentSize/1024/1024).toFixed(2)}MB`);
  } catch (error) {
    console.error("Error pruning image storage:", error);
  }
};

// Check if an image exists in storage
export const checkImageExists = async (id: string): Promise<boolean> => {
  try {
    const db = await getDB();
    const count = await db.count(IMAGE_STORE, id);
    return count > 0;
  } catch (error) {
    console.error("Error checking if image exists in IndexedDB:", error);
    return false;
  }
};

// Estimate data URL size in bytes
const estimateDataUrlSize = (dataUrl: string): number => {
  // Base64 string is approximately 4/3 of binary size
  const base64Length = dataUrl.substring(dataUrl.indexOf(',') + 1).length;
  return Math.ceil(base64Length * 0.75);
};

// Initialize database on module load
initDB().catch(console.error);
