
import React, { useState, useRef } from "react";
import { DesignElement } from "@/types/designTypes";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDesignState } from "@/context/DesignContext";
import { useLanguage } from "@/context/LanguageContext";
import { Upload, Plus, Trash2, FileCheck, CircleCheck, ArrowUp, ArrowDown } from "lucide-react";
import { toast } from "sonner";

const PLACEHOLDER_IMAGES = [
  "/placeholder.svg",
  "https://source.unsplash.com/random/300x200?sig=1",
  "https://source.unsplash.com/random/300x200?sig=2",
  "https://source.unsplash.com/random/300x200?sig=3",
  "https://source.unsplash.com/random/300x200?sig=4",
  "https://source.unsplash.com/random/300x200?sig=5"
];

const ClickSequencePuzzleProperties: React.FC<{ element: DesignElement }> = ({ element }) => {
  const { updateElement, addElement } = useDesignState();
  const { language } = useLanguage();
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [localConfig, setLocalConfig] = useState(() => {
    return element.clickSequencePuzzleConfig || {
      name: language === 'en' ? 'Click Sequence Puzzle' : 'פאזל לחיצה לפי סדר',
      images: [],
      solution: [],
      maxAttempts: 3,
      currentProgress: 0,
      attempts: 0
    };
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalConfig(prev => ({
      ...prev,
      name: e.target.value
    }));
  };
  
  const handleMaxAttemptsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setLocalConfig(prev => ({
        ...prev,
        maxAttempts: value
      }));
    }
  };
  
  const handleAddImage = () => {
    if (selectedImage && !localConfig.images.includes(selectedImage)) {
      const newImages = [...localConfig.images, selectedImage];
      
      // If this is the first image, automatically add it to the solution
      let newSolution = [...localConfig.solution];
      if (newSolution.length === 0) {
        newSolution.push(newImages.length - 1);
      }
      
      setLocalConfig(prev => ({
        ...prev,
        images: newImages,
        solution: newSolution
      }));
      setSelectedImage("");
    }
  };
  
  const handleRemoveImage = (index: number) => {
    const newImages = [...localConfig.images];
    newImages.splice(index, 1);
    
    // Update solution indices to maintain valid references
    const newSolution = localConfig.solution
      .filter(solutionIndex => solutionIndex !== index) // Remove the deleted image from solution
      .map(solutionIndex => solutionIndex > index ? solutionIndex - 1 : solutionIndex); // Adjust indices
    
    setLocalConfig(prev => ({
      ...prev,
      images: newImages,
      solution: newSolution
    }));
  };
  
  const handleAddToSolution = (imageIndex: number) => {
    // Check if this image is already in the solution
    if (localConfig.solution.includes(imageIndex)) {
      toast.error(language === 'en' 
        ? 'This image is already in the solution sequence' 
        : 'תמונה זו כבר נמצאת ברצף הפתרון');
      return;
    }
    
    // Add the image to the solution
    setLocalConfig(prev => ({
      ...prev,
      solution: [...prev.solution, imageIndex]
    }));
  };
  
  const handleRemoveFromSolution = (solutionIndex: number) => {
    const newSolution = [...localConfig.solution];
    newSolution.splice(solutionIndex, 1);
    
    setLocalConfig(prev => ({
      ...prev,
      solution: newSolution
    }));
  };
  
  const handleMoveInSolution = (solutionIndex: number, direction: 'up' | 'down') => {
    if (direction === 'up' && solutionIndex === 0) return;
    if (direction === 'down' && solutionIndex === localConfig.solution.length - 1) return;
    
    const newSolution = [...localConfig.solution];
    const targetIndex = direction === 'up' ? solutionIndex - 1 : solutionIndex + 1;
    
    // Swap the items
    [newSolution[solutionIndex], newSolution[targetIndex]] = 
    [newSolution[targetIndex], newSolution[solutionIndex]];
    
    setLocalConfig(prev => ({
      ...prev,
      solution: newSolution
    }));
  };
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    if (!file.type.startsWith('image/')) {
      toast.error(language === 'en' ? 'Please select an image file' : 'אנא בחר קובץ תמונה');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const imageDataUrl = event.target.result.toString();
        const newImages = [...localConfig.images, imageDataUrl];
        
        // If this is the first image, automatically add it to the solution
        let newSolution = [...localConfig.solution];
        if (newSolution.length === 0) {
          newSolution.push(newImages.length - 1);
        }
        
        setLocalConfig(prev => ({
          ...prev,
          images: newImages,
          solution: newSolution
        }));
        toast.success(language === 'en' ? 'Image uploaded successfully' : 'התמונה הועלתה בהצלחה');
      }
    };
    reader.onerror = () => {
      toast.error(language === 'en' ? 'Failed to upload image' : 'העלאת התמונה נכשלה');
    };
    reader.readAsDataURL(file);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleApplyChanges = () => {
    if (localConfig.name.trim() === '') {
      toast.error(language === 'en' ? 'Please enter a name for the puzzle' : 'אנא הזן שם לפאזל');
      return;
    }
    
    if (localConfig.images.length === 0) {
      toast.error(language === 'en' ? 'Please add at least one image' : 'אנא הוסף לפחות תמונה אחת');
      return;
    }
    
    if (localConfig.solution.length === 0) {
      toast.error(language === 'en' ? 'Please create a solution sequence' : 'אנא צור רצף פתרון');
      return;
    }
    
    updateElement(element.id, {
      clickSequencePuzzleConfig: {
        ...localConfig,
        currentProgress: 0,
        attempts: 0
      }
    });
    
    toast.success(language === 'en' ? 'Changes applied successfully' : 'השינויים הוחלו בהצלחה');
  };
  
  const createNewClickSequencePuzzle = () => {
    if (localConfig.name.trim() === '') {
      toast.error(language === 'en' ? 'Please enter a name for the puzzle' : 'אנא הזן שם לפאזל');
      return;
    }
    
    if (localConfig.images.length === 0) {
      toast.error(language === 'en' ? 'Please add at least one image' : 'אנא הוסף לפחות תמונה אחת');
      return;
    }
    
    if (localConfig.solution.length === 0) {
      toast.error(language === 'en' ? 'Please create a solution sequence' : 'אנא צור רצף פתרון');
      return;
    }
    
    addElement('clickSequencePuzzle', {
      clickSequencePuzzleConfig: {
        ...localConfig,
        currentProgress: 0,
        attempts: 0
      }
    });
    
    toast.success(language === 'en' ? 'New puzzle added to canvas' : 'פאזל חדש נוסף לקנבס');
  };
  
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="puzzle-name">{language === 'en' ? 'Puzzle Name' : 'שם הפאזל'}</Label>
        <Input 
          id="puzzle-name" 
          value={localConfig.name} 
          onChange={handleNameChange}
          className="mt-1"
        />
      </div>
      
      <div>
        <Label htmlFor="max-attempts">{language === 'en' ? 'Maximum Attempts' : 'מספר ניסיונות מקסימלי'}</Label>
        <Input 
          id="max-attempts" 
          type="number" 
          min="1" 
          value={localConfig.maxAttempts || 3} 
          onChange={handleMaxAttemptsChange}
          className="mt-1"
        />
      </div>
      
      <div>
        <Label>{language === 'en' ? 'Images Collection' : 'אוסף תמונות'}</Label>
        <div className="mt-2 space-y-3">
          <div className="flex items-center gap-2">
            <select 
              value={selectedImage} 
              onChange={(e) => setSelectedImage(e.target.value)}
              className="flex-1 border rounded-md px-3 py-2"
            >
              <option value="">{language === 'en' ? 'Select an image' : 'בחר תמונה'}</option>
              {PLACEHOLDER_IMAGES.map((img, idx) => (
                <option key={idx} value={img}>
                  {language === 'en' ? `Image ${idx + 1}` : `תמונה ${idx + 1}`}
                </option>
              ))}
            </select>
            <Button 
              size="sm" 
              variant="outline"
              onClick={handleAddImage}
              disabled={!selectedImage}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
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
        </div>
        
        {/* Image grid */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          {localConfig.images.map((img, idx) => (
            <div key={idx} className="relative group">
              <img 
                src={img} 
                alt={`Image ${idx + 1}`} 
                className="h-16 w-full object-cover rounded border"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 bg-white bg-opacity-80 hover:bg-opacity-100"
                  onClick={() => handleAddToSolution(idx)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 bg-white bg-opacity-80 hover:bg-opacity-100"
                  onClick={() => handleRemoveImage(idx)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
              <div className="text-xs text-center mt-1">
                {language === 'en' ? `Image ${idx + 1}` : `תמונה ${idx + 1}`}
              </div>
            </div>
          ))}
        </div>
        
        {localConfig.images.length === 0 && (
          <div className="text-sm text-gray-500 text-center py-4">
            {language === 'en' ? 'Add images to your puzzle' : 'הוסף תמונות לפאזל שלך'}
          </div>
        )}
      </div>
      
      {/* Solution sequence */}
      <div>
        <Label className="block mb-2">
          {language === 'en' ? 'Solution Sequence' : 'רצף הפתרון'}
        </Label>
        
        <div className="space-y-2 max-h-60 overflow-y-auto p-2 bg-gray-50 rounded-md">
          {localConfig.solution.length > 0 ? (
            localConfig.solution.map((imageIndex, solutionPosition) => (
              <div key={solutionPosition} className="flex items-center gap-2 bg-white p-2 rounded border">
                <div className="flex-shrink-0 w-10 h-10 border rounded overflow-hidden">
                  {localConfig.images[imageIndex] && (
                    <img 
                      src={localConfig.images[imageIndex]} 
                      alt={`Solution step ${solutionPosition + 1}`} 
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-grow">
                  <div className="text-sm font-medium">
                    {language === 'en' ? `Step ${solutionPosition + 1}` : `שלב ${solutionPosition + 1}`}
                  </div>
                  <div className="text-xs text-gray-500">
                    {language === 'en' ? `Image ${imageIndex + 1}` : `תמונה ${imageIndex + 1}`}
                  </div>
                </div>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => handleMoveInSolution(solutionPosition, 'up')}
                    disabled={solutionPosition === 0}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => handleMoveInSolution(solutionPosition, 'down')}
                    disabled={solutionPosition === localConfig.solution.length - 1}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-red-500"
                    onClick={() => handleRemoveFromSolution(solutionPosition)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-sm text-gray-500">
              {language === 'en' 
                ? 'Add images to the solution sequence by clicking the + button on an image' 
                : 'הוסף תמונות לרצף הפתרון על ידי לחיצה על כפתור + על תמונה'}
            </div>
          )}
        </div>
      </div>
      
      <div className="flex gap-2 pt-3">
        <Button 
          variant="secondary" 
          className="w-full"
          onClick={handleApplyChanges}
        >
          <FileCheck className="h-4 w-4 mr-2" />
          {language === 'en' ? 'Apply Changes' : 'החל שינויים'}
        </Button>
        
        <Button
          variant="default"
          className="w-full"
          onClick={createNewClickSequencePuzzle}
        >
          <CircleCheck className="h-4 w-4 mr-2" />
          {language === 'en' ? 'Add to Canvas' : 'הוסף לקנבס'}
        </Button>
      </div>
    </div>
  );
};

export default ClickSequencePuzzleProperties;
