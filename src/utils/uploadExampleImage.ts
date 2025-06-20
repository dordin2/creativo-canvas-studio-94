
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const uploadExampleImageToLibrary = async (): Promise<boolean> => {
  try {
    console.log('Starting upload of example image to library bucket...');
    
    // Fetch the image from the uploaded file
    const response = await fetch('/lovable-uploads/370f98c1-2ee4-4413-a13c-2403c77f32ed.png');
    if (!response.ok) {
      throw new Error('Failed to fetch image');
    }
    
    const imageBlob = await response.blob();
    const fileName = 'example-driving-license.png';
    
    // Upload to the library bucket
    const { data, error } = await supabase.storage
      .from('library')
      .upload(fileName, imageBlob, {
        cacheControl: '3600',
        upsert: true
      });
    
    if (error) {
      console.error('Error uploading to library bucket:', error);
      toast.error('Failed to upload image to library');
      return false;
    }
    
    console.log('Successfully uploaded to library bucket:', data);
    
    // Get the public URL
    const { data: urlData } = supabase.storage
      .from('library')
      .getPublicUrl(fileName);
    
    // Check what columns exist in the table
    const { data: existingData, error: checkError } = await supabase
      .from('library_elements')
      .select('*')
      .limit(1);
    
    console.log('Checking existing table structure...');
    
    // Prepare the basic insert data with only the guaranteed columns
    const insertData: any = {
      name: 'Example Driving License',
      image_path: urlData.publicUrl
    };
    
    // Try to add optional columns if they exist
    try {
      // Add file_name if column exists
      insertData.file_name = fileName;
      
      // Add description if column exists  
      insertData.description = 'Example image uploaded to demonstrate library functionality';
      
      // Add category if column exists
      insertData.category = 'examples';
      
    } catch (e) {
      console.log('Some optional columns may not exist yet:', e);
    }
    
    console.log('Attempting to insert with data:', insertData);
    
    // Add entry to library_elements table
    const { error: dbError } = await supabase
      .from('library_elements')
      .insert(insertData);
    
    if (dbError) {
      console.error('Error adding to library_elements:', dbError);
      
      // If the error is about missing columns, try with just basic fields
      if (dbError.message.includes('column') && dbError.message.includes('does not exist')) {
        console.log('Retrying with basic fields only...');
        const basicInsertData = {
          name: 'Example Driving License',
          image_path: urlData.publicUrl
        };
        
        const { error: retryError } = await supabase
          .from('library_elements')
          .insert(basicInsertData);
          
        if (retryError) {
          console.error('Error with basic insert:', retryError);
          toast.error('Image uploaded but failed to add to library database');
          return false;
        }
      } else {
        toast.error('Image uploaded but failed to add to library database');
        return false;
      }
    }
    
    toast.success('Image successfully uploaded to library!');
    console.log('Example image uploaded successfully to library bucket');
    return true;
    
  } catch (error) {
    console.error('Error uploading example image:', error);
    toast.error('Failed to upload example image');
    return false;
  }
};
