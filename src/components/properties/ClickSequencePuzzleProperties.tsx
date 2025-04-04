
import React, { useState, useRef } from "react";
import { DesignElement } from "@/types/designTypes";
import { useDesignState } from "@/context/DesignContext";
import { useLanguage } from "@/context/LanguageContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { X, Upload } from "lucide-react";
import { processImageUpload } from "@/utils/imageUploader";

const ClickSequencePuzzleProperties = ({ element }: { element: DesignElement }) => {
  const { updateElement } = useDesignState();
  const { t, language } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const config = element.clickSequencePuzzleConfig || {
    name: language === 'en' ? 'Click Sequence Puzzle' : 'פאזל לחיצה לפי סדר',
    images: [],
    solution: [],
    currentStep: 0
  };
  
  const [name, setName] = useState(config.name);
  const [images, setImages] = useState<string[]>(config.images);
  const [solution, setSolution] = useState<number[]>(config.solution);
  const [imageUrl, setImageUrl] = useState("");
  
  // Handle image upload via URL
  const handleAddImage = () => {
    if (!imageUrl.trim()) return;
    
    const newImages = [...images, imageUrl];
    setImages(newImages);
    setImageUrl("");
    
    // Automatically add this image to the solution if it's the first one
    if (solution.length === 0) {
      setSolution([newImages.length - 1]);
    }
  };
  
  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    processImageUpload(file, (data) => {
      if (data.dataUrl) {
        const newImages = [...images, data.dataUrl];
        setImages(newImages);
        
        // Automatically add this image to the solution if it's the first one
        if (solution.length === 0) {
          setSolution([newImages.length - 1]);
        }
        
        toast.success(language === 'en' ? 'Image uploaded successfully' : 'התמונה הועלתה בהצלחה');
      }
    });
    
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Handle trigger file input click
  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };
  
  // Handle image removal
  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    
    // Update solution to remove references to the deleted image
    const newSolution = solution.filter(solIndex => solIndex !== index).map(solIndex => 
      solIndex > index ? solIndex - 1 : solIndex
    );
    setSolution(newSolution);
  };
  
  // Add image to solution sequence
  const handleAddToSolution = (imageIndex: number) => {
    setSolution([...solution, imageIndex]);
  };
  
  // Remove from solution sequence
  const handleRemoveFromSolution = (solutionIndex: number) => {
    setSolution(solution.filter((_, i) => i !== solutionIndex));
  };
  
  // Apply changes to the element
  const handleApplyChanges = () => {
    if (!name.trim()) {
      toast.error(t('toast.error.name'));
      return;
    }
    
    if (images.length === 0) {
      toast.error(t('toast.error.add.images'));
      return;
    }
    
    updateElement(element.id, {
      clickSequencePuzzleConfig: {
        name,
        images,
        solution,
        currentStep: 0
      }
    });
    
    toast.success(t('toast.success.config'));
  };
  
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="puzzle-name">{language === 'en' ? 'Puzzle Name' : 'שם הפאזל'}</Label>
        <Input
          id="puzzle-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={language === 'en' ? 'Enter puzzle name' : 'הכנס שם לפאזל'}
        />
      </div>
      
      <div className="space-y-2">
        <Label>{language === 'en' ? 'Image Collection' : 'אוסף תמונות'}</Label>
        <div className="flex gap-2">
          <Input
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder={language === 'en' ? 'Image URL' : 'כתובת תמונה'}
          />
          <Button type="button" onClick={handleAddImage}>
            {language === 'en' ? 'Add' : 'הוסף'}
          </Button>
        </div>
        
        <div className="flex items-center gap-2 mt-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />
          <Button 
            variant="outline" 
            className="w-full"
            onClick={handleBrowseClick}
          >
            <Upload className="h-4 w-4 mr-2" />
            {language === 'en' ? 'Upload Image' : 'העלה תמונה'}
          </Button>
        </div>
        
        <div className="grid grid-cols-3 gap-2 mt-2">
          {images.map((img, index) => (
            <div key={index} className="relative group">
              <img 
                src={img} 
                alt={`Image ${index + 1}`}
                className="w-full h-16 object-cover rounded border"
              />
              <button
                type="button"
                className="absolute top-1 right-1 bg-black bg-opacity-70 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleRemoveImage(index)}
              >
                <X className="w-3 h-3 text-white" />
              </button>
              <span className="absolute bottom-1 left-1 text-xs bg-black bg-opacity-70 text-white px-1 rounded">
                {index + 1}
              </span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="space-y-2">
        <Label>{language === 'en' ? 'Click Sequence' : 'סדר לחיצות'}</Label>
        
        <div className="flex flex-wrap gap-2 mb-2">
          {solution.map((imageIndex, solIndex) => (
            <div key={solIndex} className="relative group bg-gray-100 rounded p-1 flex items-center">
              <span className="text-xs text-gray-600 mr-1">{solIndex + 1}:</span>
              <img 
                src={images[imageIndex]} 
                alt={`Solution step ${solIndex + 1}`}
                className="w-6 h-6 object-cover rounded"
              />
              <button
                type="button"
                className="ml-1 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleRemoveFromSolution(solIndex)}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
        
        {images.length > 0 && (
          <div className="mt-2">
            <p className="text-sm mb-1">{language === 'en' ? 'Add to sequence:' : 'הוסף לרצף:'}</p>
            <div className="flex flex-wrap gap-2">
              {images.map((img, index) => (
                <img 
                  key={index}
                  src={img}
                  alt={`Add image ${index + 1}`}
                  className="w-10 h-10 object-cover rounded border cursor-pointer hover:border-primary"
                  onClick={() => handleAddToSolution(index)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
      
      <Button type="button" onClick={handleApplyChanges} className="w-full">
        {language === 'en' ? 'Apply Changes' : 'החל שינויים'}
      </Button>
    </div>
  );
};

export default ClickSequencePuzzleProperties;
