
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
 * - Removes database entries for files that don't exist in storage
 * - Updates database with files that exist in storage but not in database
 */
export const syncLibraryWithStorage = async (): Promise<boolean> => {
  try {
    // Step 1: Get all files from storage
    const { data: storageFiles, error: storageError } = await supabase
      .storage
      .from('library_elements')
      .list();
    
    if (storageError) {
      console.error('Error fetching storage files:', storageError);
      toast.error('Failed to fetch storage files');
      return false;
    }

    // Step 2: Get all entries from library_elements table
    const { data: libraryElements, error: dbError } = await supabase
      .from('library_elements')
      .select('*');
    
    if (dbError) {
      console.error('Error fetching library elements:', dbError);
      toast.error('Failed to fetch library elements');
      return false;
    }

    // Step 3: Find missing files (in DB but not in storage)
    const storageFileNames = storageFiles.map(file => file.name);
    const missingInStorage = libraryElements.filter(element => {
      const fileName = element.image_path.split('/').pop();
      return fileName && !storageFileNames.includes(fileName);
    });

    // Step 4: Delete entries for missing files
    for (const element of missingInStorage) {
      const { error } = await supabase
        .from('library_elements')
        .delete()
        .eq('id', element.id);
      
      if (error) {
        console.error(`Error deleting entry ${element.id}:`, error);
      }
    }

    // Step 5: Find files in storage that aren't in the DB
    const dbFilePaths = libraryElements.map(element => {
      return element.image_path.split('/').pop();
    });
    
    const missingInDb = storageFiles.filter(file => 
      !dbFilePaths.includes(file.name)
    );

    // Step 6: Add entries for files that exist in storage but not in DB
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

    // Return success if we made it this far
    const totalChanges = missingInStorage.length + missingInDb.length;
    if (totalChanges > 0) {
      toast.success(`Library synchronized: ${missingInStorage.length} removed, ${missingInDb.length} added`);
    }
    
    return true;
  } catch (error) {
    console.error('Error synchronizing library:', error);
    toast.error('Failed to synchronize library');
    return false;
  }
};

/**
 * Checks if an image still exists in storage
 */
export const verifyImageExists = async (imagePath: string): Promise<boolean> => {
  try {
    if (!imagePath) return false;
    
    // Extract the file name from the path
    const fileName = imagePath.split('/').pop();
    if (!fileName) return false;
    
    // Check if the file exists in storage
    const { data, error } = await supabase
      .storage
      .from('library_elements')
      .list('', {
        search: fileName
      });
    
    if (error) {
      console.error('Error verifying image exists:', error);
      return false;
    }
    
    return data?.some(file => file.name === fileName) || false;
  } catch (error) {
    console.error('Error verifying image exists:', error);
    return false;
  }
};
