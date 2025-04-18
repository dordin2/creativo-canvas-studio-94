
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
