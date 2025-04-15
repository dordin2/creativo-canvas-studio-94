
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useDesignState } from "@/context/DesignContext";
import { useLanguage } from "@/context/LanguageContext";
import { FileImage, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface LibraryElement {
  id: string;
  name: string;
  image_path: string;
  imageUrl?: string;
}

export function LibraryElementsList() {
  const [elements, setElements] = useState<LibraryElement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addElement } = useDesignState();
  const { language } = useLanguage();
  
  // Fetch library elements on component mount
  useEffect(() => {
    const fetchLibraryElements = async () => {
      try {
        setIsLoading(true);
        
        // Get elements from the library_elements table
        const { data, error } = await supabase
          .from('library_elements')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) {
          console.error("Supabase error:", error);
          throw error;
        }
        
        console.log("Fetched library elements:", data);
        
        // Get image URLs for all elements
        const elementsWithUrls = await Promise.all(
          (data || []).map(async (element) => {
            try {
              const { data: urlData } = await supabase.storage
                .from('library')
                .getPublicUrl(element.image_path);
                
              return { 
                ...element, 
                imageUrl: urlData.publicUrl 
              };
            } catch (urlError) {
              console.error(`Error getting URL for element ${element.id}:`, urlError);
              return {
                ...element,
                imageUrl: undefined
              };
            }
          })
        );
        
        setElements(elementsWithUrls);
      } catch (error) {
        console.error("Error loading library elements:", error);
        toast.error(language === 'en' 
          ? "Failed to load public elements" 
          : "טעינת אלמנטים ציבוריים נכשלה");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLibraryElements();
  }, [language]);
  
  // Add library element to canvas
  const handleAddElementToCanvas = (element: LibraryElement) => {
    // If there's no image URL, don't proceed
    if (!element.imageUrl) {
      toast.error(language === 'en' 
        ? "Image not available" 
        : "התמונה אינה זמינה");
      return;
    }
    
    // Create a unique ID for the added element
    try {
      // Add the image element to the canvas with the library image
      addElement('image', {
        imageUrl: element.imageUrl,
        imageName: element.name,
        aspectRatio: 1 // Default aspect ratio, will adjust based on actual image
      });
      
      toast.success(language === 'en' 
        ? `Added ${element.name} to canvas` 
        : `${element.name} נוסף לקנבס`);
    } catch (error) {
      console.error("Error adding element to canvas:", error);
      toast.error(language === 'en' 
        ? "Failed to add element to canvas" 
        : "הוספת האלמנט לקנבס נכשלה");
    }
  };
  
  // If loading, show spinner
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-6">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }
  
  // If no elements, show message
  if (elements.length === 0) {
    return (
      <div className="text-center py-6">
        <FileImage className="h-8 w-8 mx-auto text-gray-400 mb-2" />
        <p className="text-sm text-gray-500">
          {language === 'en' 
            ? "No public elements available" 
            : "אין אלמנטים ציבוריים זמינים"}
        </p>
      </div>
    );
  }
  
  // Display the elements in a grid
  return (
    <div className="grid grid-cols-2 gap-2 p-2">
      {elements.map((element) => (
        <button
          key={element.id}
          className="bg-white border rounded-md overflow-hidden hover:shadow-md transition-shadow p-1"
          onClick={() => handleAddElementToCanvas(element)}
        >
          <div className="aspect-square flex items-center justify-center overflow-hidden bg-slate-50">
            {element.imageUrl ? (
              <img 
                src={element.imageUrl} 
                alt={element.name}
                className="w-full h-full object-contain p-1"
              />
            ) : (
              <FileImage className="h-8 w-8 text-gray-300" />
            )}
          </div>
          <div className="mt-1 text-xs font-medium truncate text-center">
            {element.name}
          </div>
        </button>
      ))}
    </div>
  );
}
