
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
  file_name?: string;
  description?: string;
  category?: string;
  created_at?: string;
  created_by?: string;
}

/**
 * Synchronizes the library_elements table with actual files in the new library storage bucket
 * - Removes database entries for files that don't exist in storage
 * - Updates database with files that exist in storage but not in database
 */
export const syncLibraryWithStorage = async (): Promise<boolean> => {
  try {
    // Step 1: Get all files from the new library storage bucket
    const { data: storageFiles, error: storageError } = await supabase
      .storage
      .from('library')
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
      const fileName = element.file_name || element.image_path?.split('/').pop() || '';
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
    const dbFileNames = libraryElements
      .map(element => element.file_name || element.image_path?.split('/').pop() || '')
      .filter(Boolean);
    
    const missingInDb = storageFiles.filter(file => 
      !dbFileNames.includes(file.name) && 
      (file.name.toLowerCase().endsWith('.png') || 
       file.name.toLowerCase().endsWith('.jpg') || 
       file.name.toLowerCase().endsWith('.jpeg'))
    );

    // Step 6: Add entries for files that exist in storage but not in DB
    for (const file of missingInDb) {
      const { data: urlData } = supabase.storage
        .from('library')
        .getPublicUrl(file.name);

      if (urlData) {
        // Create a display name from filename
        const displayName = file.name
          .replace(/\.[^/.]+$/, '') // Remove extension
          .replace(/[-_]/g, ' ') // Replace dashes and underscores with spaces
          .replace(/\b\w/g, l => l.toUpperCase()); // Capitalize first letter of each word

        const { error } = await supabase
          .from('library_elements')
          .insert({
            name: displayName,
            image_path: urlData.publicUrl,
            file_name: file.name,
            description: null
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
 * Checks if an image still exists in the new library storage bucket
 */
export const verifyImageExists = async (fileName: string): Promise<boolean> => {
  try {
    if (!fileName) return false;
    
    // Check if the file exists in the library storage bucket
    const { data, error } = await supabase
      .storage
      .from('library')
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
