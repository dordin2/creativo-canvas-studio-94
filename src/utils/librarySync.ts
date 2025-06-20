
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

// Basic interface that works with existing columns
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
 * Synchronizes the library_elements table with actual files in the library storage bucket
 */
export const syncLibraryWithStorage = async (): Promise<boolean> => {
  try {
    console.log('Starting library sync...');
    
    // Step 1: Get all files from the library storage bucket
    const { data: storageFiles, error: storageError } = await supabase
      .storage
      .from('library')
      .list();
    
    if (storageError) {
      console.error('Error fetching storage files:', storageError);
      toast.error('Failed to fetch storage files');
      return false;
    }

    console.log('Found storage files:', storageFiles?.length || 0);

    // Step 2: Get all entries from library_elements table
    const { data: libraryElements, error: dbError } = await supabase
      .from('library_elements')
      .select('*');
    
    if (dbError) {
      console.error('Error fetching library elements:', dbError);
      toast.error('Failed to fetch library elements');
      return false;
    }

    console.log('Found library elements in DB:', libraryElements?.length || 0);

    const typedLibraryElements = libraryElements as LibraryElement[];

    // Step 3: Find missing files (in DB but not in storage)
    const storageFileNames = storageFiles?.map(file => file.name) || [];
    const missingInStorage = typedLibraryElements.filter(element => {
      const fileName = element.file_name || element.image_path?.split('/').pop() || '';
      return fileName && !storageFileNames.includes(fileName);
    });

    console.log('Files missing from storage:', missingInStorage.length);

    // Step 4: Delete entries for missing files
    for (const element of missingInStorage) {
      console.log('Deleting DB entry for missing file:', element.file_name || element.name);
      const { error } = await supabase
        .from('library_elements')
        .delete()
        .eq('id', element.id);
      
      if (error) {
        console.error(`Error deleting entry ${element.id}:`, error);
      }
    }

    // Step 5: Find files in storage that aren't in the DB
    const dbFileNames = typedLibraryElements
      .map(element => element.file_name || element.image_path?.split('/').pop() || '')
      .filter(Boolean);
    
    const missingInDb = storageFiles?.filter(file => 
      !dbFileNames.includes(file.name) && 
      (file.name.toLowerCase().endsWith('.png') || 
       file.name.toLowerCase().endsWith('.jpg') || 
       file.name.toLowerCase().endsWith('.jpeg') ||
       file.name.toLowerCase().endsWith('.gif') ||
       file.name.toLowerCase().endsWith('.webp'))
    ) || [];

    console.log('Files missing from DB:', missingInDb.length);

    // Step 6: Add entries for files that exist in storage but not in DB
    for (const file of missingInDb) {
      console.log('Adding DB entry for file:', file.name);
      
      const { data: urlData } = supabase.storage
        .from('library')
        .getPublicUrl(file.name);

      if (urlData) {
        // Create a display name from filename
        const displayName = file.name
          .replace(/\.[^/.]+$/, '') // Remove extension
          .replace(/[-_]/g, ' ') // Replace dashes and underscores with spaces
          .replace(/\b\w/g, l => l.toUpperCase()); // Capitalize first letter of each word

        // Start with basic required fields
        const insertData: any = {
          name: displayName,
          image_path: urlData.publicUrl
        };

        // Try to add optional fields if they exist in the table
        try {
          insertData.file_name = file.name;
          insertData.description = `File synced from storage: ${file.name}`;
          insertData.category = 'synced';
        } catch (e) {
          console.log('Adding basic fields only, optional columns may not exist');
        }

        console.log('Inserting entry for file:', file.name, 'with data:', insertData);

        const { error } = await supabase
          .from('library_elements')
          .insert(insertData);
        
        if (error) {
          console.error(`Error inserting entry for ${file.name}:`, error);
          
          // If the error is about missing columns, try with just basic fields
          if (error.message.includes('column') && error.message.includes('does not exist')) {
            console.log('Retrying with basic fields only...');
            const basicInsertData = {
              name: displayName,
              image_path: urlData.publicUrl
            };
            
            const { error: retryError } = await supabase
              .from('library_elements')
              .insert(basicInsertData);
              
            if (retryError) {
              console.error(`Failed to insert even basic entry for ${file.name}:`, retryError);
            } else {
              console.log(`Successfully added basic DB entry for ${file.name}`);
            }
          }
        } else {
          console.log(`Successfully added DB entry for ${file.name}`);
        }
      }
    }

    // Return success if we made it this far
    const totalChanges = missingInStorage.length + missingInDb.length;
    if (totalChanges > 0) {
      toast.success(`Library synchronized: ${missingInStorage.length} removed, ${missingInDb.length} added`);
      console.log(`Sync complete: ${missingInStorage.length} removed, ${missingInDb.length} added`);
    } else {
      console.log('Library already in sync');
    }
    
    return true;
  } catch (error) {
    console.error('Error synchronizing library:', error);
    toast.error('Failed to synchronize library');
    return false;
  }
};

/**
 * Checks if an image still exists in the library storage bucket
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
