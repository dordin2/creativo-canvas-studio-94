
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useDesignState } from "@/context/DesignContext";
import { useLanguage } from "@/context/LanguageContext";
import { FileImage, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { processImageUpload } from "@/utils/imageUploader";

interface LibraryElement {
  id: string;
  name: string;
  image_path: string;
  imageUrl?: string;
}

export function LibraryElementsList() {
  const [elements, setElements] = useState<LibraryElement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingElement, setProcessingElement] = useState<string | null>(null);
  const { addElement, canvasRef, handleImageUpload, updateElement } = useDesignState();
  const { language } = useLanguage();
  
  useEffect(() => {
    const fetchLibraryElements = async () => {
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('library_elements')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) {
          console.error("Supabase error:", error);
          throw error;
        }
        
        console.log("Fetched library elements:", data);
        
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
  
  // Helper function to preload image and get dimensions
  const preloadImage = (url: string): Promise<{ width: number; height: number; dataUrl: string }> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = async () => {
        try {
          // Get image as blob
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.statusText}`);
          }
          
          const blob = await response.blob();
          
          // Create a dataURL
          const reader = new FileReader();
          reader.readAsDataURL(blob);
          
          reader.onload = (e) => {
            if (!e.target?.result) {
              reject(new Error("Failed to create dataURL"));
              return;
            }
            
            resolve({
              width: img.naturalWidth, 
              height: img.naturalHeight,
              dataUrl: e.target.result as string
            });
          };
          
          reader.onerror = () => {
            reject(new Error("Failed to read image data"));
          };
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = () => {
        reject(new Error(`Failed to load image from ${url}`));
      };
      
      img.src = url;
    });
  };
  
  const handleAddElementToCanvas = async (element: LibraryElement) => {
    if (!element.imageUrl) {
      toast.error(language === 'en' 
        ? "Image not available" 
        : "התמונה אינה זמינה");
      return;
    }
    
    try {
      setProcessingElement(element.id);
      
      // Preload image to get dimensions and dataUrl
      const { width, height, dataUrl } = await preloadImage(element.imageUrl);
      
      // Create a File object (needed for processing)
      const response = await fetch(element.imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      const file = new File([blob], element.name || "library-image.png", { 
        type: blob.type || "image/png" 
      });
      
      // Calculate appropriate size for display
      const maxDimension = 300; // Reasonable size for initial display
      let displayWidth = width;
      let displayHeight = height;
      
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          displayWidth = maxDimension;
          displayHeight = Math.round(height * (maxDimension / width));
        } else {
          displayHeight = maxDimension;
          displayWidth = Math.round(width * (maxDimension / height));
        }
      }
      
      // Add the element with all information already available
      const newElement = addElement('image', {
        imageName: element.name,
        alt: element.name,
        dataUrl: dataUrl,
        file: file,
        size: {
          width: displayWidth,
          height: displayHeight
        },
        originalSize: {
          width: width,
          height: height
        }
      });
      
      // Process the image in the background for optimization
      handleImageUpload(newElement.id, file);
      
      toast.success(language === 'en' 
        ? `Added ${element.name} to canvas` 
        : `${element.name} נוסף לקנבס`);
      
    } catch (error) {
      console.error("Error adding element to canvas:", error);
      toast.error(language === 'en' 
        ? "Failed to add element to canvas" 
        : "הוספת האלמנט לקנבס נכשלה");
    } finally {
      setProcessingElement(null);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-6">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }
  
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
  
  return (
    <div className="grid grid-cols-2 gap-2 p-2">
      {elements.map((element) => (
        <button
          key={element.id}
          className="bg-white border rounded-md overflow-hidden hover:shadow-md transition-shadow p-1"
          onClick={() => handleAddElementToCanvas(element)}
          disabled={processingElement === element.id}
        >
          <div className="aspect-square flex items-center justify-center overflow-hidden bg-slate-50">
            {processingElement === element.id ? (
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            ) : element.imageUrl ? (
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
