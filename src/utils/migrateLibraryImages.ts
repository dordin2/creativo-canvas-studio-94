
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface LibraryElement {
  id: string;
  name: string;
  image_path: string;
  created_at: string;
}

/**
 * Migrates existing library images to user_uploads with WebP compression
 */
export const migrateExistingLibraryImages = async (): Promise<boolean> => {
  try {
    // Get all existing library elements that still point to library_elements bucket
    const { data: elements, error: fetchError } = await supabase
      .from('library_elements')
      .select('*')
      .like('image_path', '%library_elements%');
    
    if (fetchError) {
      console.error('Error fetching library elements:', fetchError);
      toast.error('Failed to fetch library elements');
      return false;
    }

    if (!elements || elements.length === 0) {
      toast.success('No images need migration');
      return true;
    }

    toast.info(`Starting migration of ${elements.length} images...`);

    let successCount = 0;
    let errorCount = 0;

    // Process each image
    for (const element of elements) {
      try {
        console.log(`Processing image ${element.id}: ${element.name}`);

        const { error: processError } = await supabase.functions.invoke('process-library-image', {
          body: {
            imagePath: element.image_path,
            libraryElementId: element.id
          }
        });

        if (processError) {
          console.error(`Failed to process image ${element.id}:`, processError);
          errorCount++;
        } else {
          console.log(`Successfully processed image ${element.id}`);
          successCount++;
        }

        // Add a small delay to avoid overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error) {
        console.error(`Error processing image ${element.id}:`, error);
        errorCount++;
      }
    }

    if (successCount > 0) {
      toast.success(`Migration completed: ${successCount} images processed successfully`);
    }
    
    if (errorCount > 0) {
      toast.error(`${errorCount} images failed to process`);
    }

    return errorCount === 0;
  } catch (error) {
    console.error('Error migrating library images:', error);
    toast.error('Failed to migrate library images');
    return false;
  }
};

/**
 * Checks if any images still need migration
 */
export const checkMigrationNeeded = async (): Promise<number> => {
  try {
    const { data, error } = await supabase
      .from('library_elements')
      .select('id', { count: 'exact' })
      .like('image_path', '%library_elements%');
    
    if (error) {
      console.error('Error checking migration status:', error);
      return 0;
    }

    return data?.length || 0;
  } catch (error) {
    console.error('Error checking migration status:', error);
    return 0;
  }
};
