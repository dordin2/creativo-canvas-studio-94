
import React, { useState, useRef } from "react";
import { DesignElement } from "@/types/designTypes";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDesignState } from "@/context/DesignContext";
import { useLanguage } from "@/context/LanguageContext";
import { Upload, Plus, Trash2, FileCheck, ArrowUpDown, MoveHorizontal, ArrowUp, ArrowDown } from "lucide-react";
import { toast } from "sonner";

const PLACEHOLDER_IMAGES = [
  "/placeholder.svg",
  "https://source.unsplash.com/random/300x200?sig=1",
  "https://source.unsplash.com/random/300x200?sig=2",
  "https://source.unsplash.com/random/300x200?sig=3",
  "https://source.unsplash.com/random/300x200?sig=4",
  "https://source.unsplash.com/random/300x200?sig=5"
];

const SequencePuzzleProperties: React.FC<{ element: DesignElement }> = ({ element }) => {
  const { updateElement, addElement } = useDesignState();
  const { t, language } = useLanguage();
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [localConfig, setLocalConfig] = useState(() => {
    return element.sequencePuzzleConfig || {
      name: language === 'en' ? 'Sequence Puzzle' : 'פאזל רצף',
      images: [],
      solution: [],
      currentOrder: []
    };
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalConfig(prev => ({
      ...prev,
      name: e.target.value
    }));
  };
  
  const handleAddImage = () => {
    if (selectedImage && !localConfig.images.includes(selectedImage)) {
      const newImages = [...localConfig.images, selectedImage];
      const newSolution = [...Array(newImages.length).keys()]; // Default solution is sequential
      
      setLocalConfig(prev => ({
        ...prev,
        images: newImages,
        solution: newSolution,
        currentOrder: newSolution.slice() // Copy the solution as current order
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
    
    const newCurrentOrder = localConfig.currentOrder
      .filter(orderIndex => orderIndex !== index) // Remove the deleted image from current order
      .map(orderIndex => orderIndex > index ? orderIndex - 1 : orderIndex); // Adjust indices
    
    setLocalConfig(prev => ({
      ...prev,
      images: newImages,
      solution: newSolution,
      currentOrder: newCurrentOrder
    }));
  };
  
  const handleMoveImageUp = (index: number) => {
    if (index === 0) return; // Already at the top
    
    const newImages = [...localConfig.images];
    const newSolution = [...localConfig.solution];
    
    // Swap the images in the solution array
    [newSolution[index], newSolution[index - 1]] = [newSolution[index - 1], newSolution[index]];
    
    setLocalConfig(prev => ({
      ...prev,
      solution: newSolution
    }));
  };
  
  const handleMoveImageDown = (index: number) => {
    if (index === localConfig.solution.length - 1) return; // Already at the bottom
    
    const newSolution = [...localConfig.solution];
    
    // Swap the images in the solution array
    [newSolution[index], newSolution[index + 1]] = [newSolution[index + 1], newSolution[index]];
    
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
      toast.error(t('toast.error.file'));
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const imageDataUrl = event.target.result.toString();
        const newImages = [...localConfig.images, imageDataUrl];
        const newSolution = [...Array(newImages.length).keys()]; // Default solution is sequential
        
        setLocalConfig(prev => ({
          ...prev,
          images: newImages,
          solution: newSolution,
          currentOrder: newSolution.slice() // Copy the solution as current order
        }));
        toast.success(t('toast.success.upload'));
      }
    };
    reader.onerror = () => {
      toast.error(t('toast.error.upload'));
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
      toast.error(t('toast.error.name'));
      return;
    }
    
    if (localConfig.images.length < 2) {
      toast.error(language === 'en' ? 'Add at least 2 images to create a sequence puzzle' : 'הוסף לפחות 2 תמונות ליצירת פאזל רצף');
      return;
    }
    
    updateElement(element.id, {
      sequencePuzzleConfig: localConfig
    });
    
    toast.success(t('toast.success.config'));
  };
  
  const createSequencePuzzleElement = () => {
    if (localConfig.name.trim() === '') {
      toast.error(t('toast.error.name'));
      return;
    }
    
    if (localConfig.images.length < 2) {
      toast.error(language === 'en' ? 'Add at least 2 images to create a sequence puzzle' : 'הוסף לפחות 2 תמונות ליצירת פאזל רצף');
      return;
    }
    
    addElement('sequencePuzzle', { sequencePuzzleConfig: localConfig });
    toast.success(language === 'en' ? 'Sequence puzzle added to canvas' : 'פאזל רצף נוסף לקנבס');
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
        <Label>{language === 'en' ? 'Image Collection' : 'אוסף תמונות'}</Label>
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
        
        <div className="mt-4">
          <Label className="mb-2 block">
            {language === 'en' ? 'Sequence Order (correct solution)' : 'סדר הרצף (פתרון נכון)'}
          </Label>
          <div className="space-y-2">
            {localConfig.solution.map((imageIndex, solutionPosition) => (
              <div key={solutionPosition} className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                <div className="flex-shrink-0 w-10 h-10 bg-white border rounded overflow-hidden">
                  {localConfig.images[imageIndex] && (
                    <img 
                      src={localConfig.images[imageIndex]} 
                      alt={`Image ${imageIndex + 1}`} 
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-grow">
                  <div className="text-sm font-medium">
                    {language === 'en' ? `Position ${solutionPosition + 1}` : `מיקום ${solutionPosition + 1}`}
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
                    onClick={() => handleMoveImageUp(solutionPosition)}
                    disabled={solutionPosition === 0}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => handleMoveImageDown(solutionPosition)}
                    disabled={solutionPosition === localConfig.solution.length - 1}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-2 mt-4">
          {localConfig.images.map((img, idx) => (
            <div key={idx} className="relative group">
              <img 
                src={img} 
                alt={`Image ${idx + 1}`} 
                className="h-16 w-full object-cover rounded border"
              />
              <button
                onClick={() => handleRemoveImage(idx)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="h-3 w-3" />
              </button>
              <div className="text-xs text-center mt-1">
                {language === 'en' ? `Image ${idx + 1}` : `תמונה ${idx + 1}`}
              </div>
            </div>
          ))}
        </div>
        
        {localConfig.images.length === 0 && (
          <div className="text-sm text-gray-500 text-center py-4">
            {language === 'en' ? 'Add images to your sequence puzzle' : 'הוסף תמונות לפאזל הרצף שלך'}
          </div>
        )}
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
          onClick={createSequencePuzzleElement}
        >
          <MoveHorizontal className="h-4 w-4 mr-2" />
          {language === 'en' ? 'Add to Canvas' : 'הוסף לקנבס'}
        </Button>
      </div>
    </div>
  );
};

export default SequencePuzzleProperties;
