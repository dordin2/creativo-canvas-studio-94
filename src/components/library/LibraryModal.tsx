import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Library, Trash2, Upload } from 'lucide-react';
import { Database } from '@/types/database';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface LibraryElement {
  id: string;
  name: string;
  image_path: string;
  created_at: string;
}

export const LibraryModal = () => {
  const [elements, setElements] = useState<LibraryElement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageName, setImageName] = useState('');
  const { user, profile } = useAuth();
  const isAdmin = profile?.roles?.includes('admin');

  console.log("Current profile:", profile);
  console.log("Is admin:", isAdmin);

  const fetchLibraryElements = async () => {
    try {
      const { data, error } = await supabase
        .from('library_elements')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setElements(data || []);
    } catch (error) {
      console.error('Error fetching library elements:', error);
      toast.error('Failed to load library elements');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteElement = async (elementId: string) => {
    try {
      const element = elements.find(e => e.id === elementId);
      if (!element) return;

      // Get the file path from the URL
      const filePath = element.image_path.split('/').pop();
      if (!filePath) throw new Error('Invalid file path');

      // First delete the file from storage
      const { error: storageError } = await supabase.storage
        .from('library_elements')
        .remove([filePath]);

      if (storageError) throw storageError;

      // Then delete the database record
      const { error: dbError } = await supabase
        .from('library_elements')
        .delete()
        .eq('id', elementId);

      if (dbError) throw dbError;
      
      toast.success('Element deleted successfully');
      fetchLibraryElements();
    } catch (error) {
      console.error('Error deleting element:', error);
      toast.error('Failed to delete element');
    }
  };

  const handleFileUpload = async () => {
    if (!imageFile || !imageName) {
      toast.error('Please select an image and provide a name');
      return;
    }

    try {
      // Upload image to storage
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('library_elements')
        .upload(fileName, imageFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('library_elements')
        .getPublicUrl(fileName);

      // Insert metadata into library_elements
      const { error: insertError } = await supabase
        .from('library_elements')
        .insert({
          name: imageName,
          image_path: urlData.publicUrl,
          created_by: user?.id
        });

      if (insertError) throw insertError;

      toast.success('Element uploaded successfully');
      fetchLibraryElements();
      setImageFile(null);
      setImageName('');
    } catch (error) {
      console.error('Error uploading element:', error);
      toast.error('Failed to upload element');
    }
  };

  useEffect(() => {
    fetchLibraryElements();
  }, []);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="gap-2">
          <Library className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Element Library</SheetTitle>
          <SheetDescription>
            View and manage your uploaded elements
          </SheetDescription>
        </SheetHeader>
        
        {isAdmin && (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="mt-4 w-full">
                <Upload className="mr-2 h-4 w-4" /> Upload New Element
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Element</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input 
                  type="file" 
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  accept="image/*"
                />
                <Input 
                  placeholder="Element Name" 
                  value={imageName}
                  onChange={(e) => setImageName(e.target.value)}
                />
                <Button 
                  onClick={handleFileUpload} 
                  disabled={!imageFile || !imageName}
                >
                  Upload
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
        
        <div className="mt-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : elements.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No elements found
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {elements.map((element) => (
                <div 
                  key={element.id} 
                  className="border rounded-lg p-2 hover:bg-gray-50 transition-colors relative"
                >
                  <img 
                    src={element.image_path} 
                    alt={element.name}
                    className="w-full h-32 object-contain bg-gray-50 rounded-md"
                  />
                  <p className="mt-2 text-sm font-medium truncate">{element.name}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(element.created_at).toLocaleDateString()}
                  </p>
                  {isAdmin && (
                    <Button 
                      variant="destructive" 
                      size="icon" 
                      className="absolute top-2 right-2"
                      onClick={() => handleDeleteElement(element.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
