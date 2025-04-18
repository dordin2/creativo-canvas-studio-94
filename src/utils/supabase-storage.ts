import { supabase } from '@/integrations/supabase/client';

export const createLibraryElementsBucket = async () => {
  const { data, error } = await supabase.storage.createBucket('library_elements', {
    public: true,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    fileSizeLimit: 10 * 1024 * 1024 // 10 MB
  });

  if (error) {
    console.error('Error creating library_elements bucket:', error);
    return false;
  }

  return true;
};

// Initialize the library_elements bucket if it doesn't exist
export const initializeLibraryElementsStorage = async () => {
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === 'library_elements');
    
    if (!bucketExists) {
      const { error } = await supabase.storage.createBucket('library_elements', {
        public: true
      });
      
      if (error) throw error;
      console.log('Created library_elements bucket');
    }
  } catch (error) {
    console.error('Error initializing storage:', error);
  }
};

// Call initialization when the app starts
initializeLibraryElementsStorage();
