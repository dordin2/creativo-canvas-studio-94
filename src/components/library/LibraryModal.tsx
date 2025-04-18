
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from '@/components/ui/button';
import { Database } from '@/images/placeholder.svg';
import { toast } from 'sonner';
import { Library } from 'lucide-react';

interface LibraryElement {
  id: string;
  name: string;
  image_path: string;
  created_at: string;
}

export const LibraryModal = () => {
  const [elements, setElements] = useState<LibraryElement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

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
                  className="border rounded-lg p-2 hover:bg-gray-50 transition-colors"
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
                </div>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
