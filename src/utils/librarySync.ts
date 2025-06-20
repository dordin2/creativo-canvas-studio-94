
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface StorageItem {
  name: string;
  id: string;
  updated_at: string;
  created_at: string;
  last_accessed_at: string;
  metadata: Record<string, any>;
}

interface LibraryElement {
  id: string;
  name: string;
  image_path: string;
  created_at: string;
  created_by?: string;
}

/**
 * Synchronizes the library_elements table with actual files in storage
 * Now handles both library_elements and user_uploads buckets
 */
export const syncLibraryWithStorage = async (): Promise<boolean> => {
  try {
    // Step 1: Get all entries from library_elements table
    const { data: libraryElements, error: dbError } = await supabase
      .from('library_elements')
      .select('*');
    
    if (dbError) {
      console.error('Error fetching library elements:', dbError);
      toast.error('Failed to fetch library elements');
      return false;
    }

    // Step 2: Check which images point to user_uploads vs library_elements
    const userUploadsImages = libraryElements.filter(element => 
      element.image_path.includes('user_uploads')
    );
    
    const libraryElementsImages = libraryElements.filter(element => 
      element.image_path.includes('library_elements')
    );

    // Step 3: For user_uploads images, verify they exist in user_uploads bucket
    for (const element of userUploadsImages) {
      const exists = await verifyImageExists(element.image_path);
      if (!exists) {
        console.warn(`Image ${element.id} references missing file: ${element.image_path}`);
        // Optionally delete the database entry
        const { error } = await supabase
          .from('library_elements')
          .delete()
          .eq('id', element.id);
        
        if (error) {
          console.error(`Error deleting missing entry ${element.id}:`, error);
        }
      }
    }

    // Step 4: For library_elements images, check if they exist in library_elements bucket
    const { data: storageFiles, error: storageError } = await supabase
      .storage
      .from('library_elements')
      .list();
    
    if (storageError) {
      console.error('Error fetching library_elements storage files:', storageError);
      // Don't fail the sync if we can't access library_elements bucket
    } else {
      const storageFileNames = storageFiles.map(file => file.name);
      
      // Find missing files (in DB but not in library_elements storage)
      const missingInStorage = libraryElementsImages.filter(element => {
        const fileName = element.image_path.split('/').pop();
        return fileName && !storageFileNames.includes(fileName);
      });

      // Delete entries for missing files
      for (const element of missingInStorage) {
        const { error } = await supabase
          .from('library_elements')
          .delete()
          .eq('id', element.id);
        
        if (error) {
          console.error(`Error deleting entry ${element.id}:`, error);
        }
      }

      // Find files in library_elements storage that aren't in the DB
      const dbFilePaths = libraryElementsImages.map(element => {
        return element.image_path.split('/').pop();
      });
      
      const missingInDb = storageFiles.filter(file => 
        !dbFilePaths.includes(file.name)
      );

      // Add entries for files that exist in library_elements storage but not in DB
      for (const file of missingInDb) {
        const { data: urlData } = supabase.storage
          .from('library_elements')
          .getPublicUrl(file.name);

        if (urlData) {
          const { error } = await supabase
            .from('library_elements')
            .insert({
              name: file.name.substring(0, 50),
              image_path: urlData.publicUrl,
            });
          
          if (error) {
            console.error(`Error inserting entry for ${file.name}:`, error);
          }
        }
      }

      const totalChanges = missingInStorage.length + missingInDb.length;
      if (totalChanges > 0) {
        toast.success(`Library synchronized: ${missingInStorage.length} removed, ${missingInDb.length} added`);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error synchronizing library:', error);
    toast.error('Failed to synchronize library');
    return false;
  }
};

/**
 * Checks if an image still exists in storage (works for both buckets)
 */
export const verifyImageExists = async (imagePath: string): Promise<boolean> => {
  try {
    if (!imagePath) return false;
    
    // Determine which bucket this image is in
    const isUserUploads = imagePath.includes('user_uploads');
    const isLibraryElements = imagePath.includes('library_elements');
    
    if (!isUserUploads && !isLibraryElements) {
      console.warn('Image path does not match known bucket patterns:', imagePath);
      return false;
    }
    
    // Extract the file path from the full URL
    let filePath: string;
    if (isUserUploads) {
      filePath = imagePath.replace('https://dmwwgrbleohkopoqupzo.supabase.co/storage/v1/object/public/user_uploads/', '');
    } else {
      filePath = imagePath.replace('https://dmwwgrbleohkopoqupzo.supabase.co/storage/v1/object/public/library_elements/', '');
    }
    
    const bucketName = isUserUploads ? 'user_uploads' : 'library_elements';
    
    // Check if the file exists in the appropriate bucket
    const { data, error } = await supabase
      .storage
      .from(bucketName)
      .list('', {
        search: filePath.includes('/') ? filePath.split('/')[0] : filePath
      });
    
    if (error) {
      console.error('Error verifying image exists:', error);
      return false;
    }
    
    // For user_uploads, we need to check in the folder structure
    if (isUserUploads && filePath.includes('/')) {
      const [folderName, fileName] = filePath.split('/');
      
      // List files in the specific folder
      const { data: folderData, error: folderError } = await supabase
        .storage
        .from('user_uploads')
        .list(folderName);
      
      if (folderError) {
        console.error('Error checking folder:', folderError);
        return false;
      }
      
      return folderData?.some(file => file.name === fileName) || false;
    }
    
    // For library_elements or direct files
    return data?.some(file => file.name === filePath) || false;
  } catch (error) {
    console.error('Error verifying image exists:', error);
    return false;
  }
};
