import React, { useState, useRef } from "react";
import { DesignElement } from "@/types/designTypes";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDesignState } from "@/context/DesignContext";
import { useLanguage } from "@/context/LanguageContext";
import { Upload, Plus, Trash2, FileCheck, ArrowUp, ArrowDown } from "lucide-react";
import { toast } from "@/hooks/use-sonner-toast";

const PLACEHOLDER_IMAGES = [
  "/placeholder.svg",
  "https://source.unsplash.com/random/300x200?sig=1",
  "https://source.unsplash.com/random/300x200?sig=2",
  "https://source.unsplash.com/random/300x200?sig=3",
  "https://source.unsplash.com/random/300x200?sig=4",
  "https://source.unsplash.com/random/300x200?sig=5"
];

interface ClickSequencePuzzlePropertiesProps {
  element: DesignElement;
  onUpdateConfig?: (config: any) => void;
}

const ClickSequencePuzzleProperties: React.FC<ClickSequencePuzzlePropertiesProps> = ({ element, onUpdateConfig }) => {
  const { updateElement, addElement } = useDesignState();
  const { t, language } = useLanguage();
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [localPuzzleConfig, setLocalPuzzleConfig] = useState(() => {
    return element.clickSequencePuzzleConfig || {
      name: language === 'en' ? 'Click Sequence Puzzle' : 'פאזל רצף לחיצות',
      images: [],
      solution: [],
      clickedIndices: []
    };
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalPuzzleConfig(prev => ({
      ...prev,
      name: e.target.value
    }));
  };
  
  const handleAddImage = () => {
    if (selectedImage && !localPuzzleConfig.images.includes(selectedImage)) {
      const newImages = [...localPuzzleConfig.images, selectedImage];
      const newSolution = [...localPuzzleConfig.solution];
      newSolution.push(newImages.length - 1);
      
      setLocalPuzzleConfig(prev => ({
        ...prev,
        images: newImages,
        solution: newSolution
      }));
      setSelectedImage("");
    }
  };
  
  const handleRemoveImage = (index: number) => {
    const newImages = [...localPuzzleConfig.images];
    newImages.splice(index, 1);
    
    const newSolution = localPuzzleConfig.solution
      .filter(solutionValue => solutionValue !== index)
      .map(solutionValue => solutionValue > index ? solutionValue - 1 : solutionValue);
    
    setLocalPuzzleConfig(prev => ({
      ...prev,
      images: newImages,
      solution: newSolution,
      clickedIndices: prev.clickedIndices.filter(idx => 
        idx !== index).map(idx => idx > index ? idx - 1 : idx)
    }));
  };
  
  const handleMoveImageUp = (index: number) => {
    if (index === 0) return;
    
    const newSolution = [...localPuzzleConfig.solution];
    
    [newSolution[index], newSolution[index - 1]] = [newSolution[index - 1], newSolution[index]];
    
    setLocalPuzzleConfig(prev => ({
      ...prev,
      solution: newSolution
    }));
  };
  
  const handleMoveImageDown = (index: number) => {
    if (index === localPuzzleConfig.solution.length - 1) return;
    
    const newSolution = [...localPuzzleConfig.solution];
    
    [newSolution[index], newSolution[index + 1]] = [newSolution[index + 1], newSolution[index]];
    
    setLocalPuzzleConfig(prev => ({
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
        const newImages = [...localPuzzleConfig.images, imageDataUrl];
        const newSolution = [...localPuzzleConfig.solution, newImages.length - 1];
        
        setLocalPuzzleConfig(prev => ({
          ...prev,
          images: newImages,
          solution: newSolution
        }));
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
    if (localPuzzleConfig.name.trim() === '') {
      toast.error(t('toast.error.name'));
      return;
    }
    
    if (localPuzzleConfig.images.length < 2) {
      toast.error(t('toast.error.images'));
      return;
    }
    
    updateElement(element.id, {
      clickSequencePuzzleConfig: localPuzzleConfig
    });
    
    if (onUpdateConfig) {
      onUpdateConfig(localPuzzleConfig);
    }
  };
  
  const createPuzzleElement = () => {
    if (localPuzzleConfig.name.trim() === '') {
      toast.error(t('toast.error.name'));
      return;
    }
    
    if (localPuzzleConfig.images.length < 2) {
      toast.error(t('toast.error.images'));
      return;
    }
    
    addElement('clickSequencePuzzle', { clickSequencePuzzleConfig: localPuzzleConfig });
  };
  
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="puzzle-name">{t('puzzle.name')}</Label>
        <Input 
          id="puzzle-name" 
          value={localPuzzleConfig.name} 
          onChange={handleNameChange}
          className="mt-1"
        />
      </div>
      
      <div>
        <Label>{t('puzzle.image.collection')}</Label>
        <div className="mt-2 space-y-3">
          <div className="flex items-center gap-2">
            <Input
              type="text"
              placeholder={t('puzzle.image.url')}
              value={selectedImage}
              onChange={(e) => setSelectedImage(e.target.value)}
            />
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
              {t('puzzle.upload.image')}
            </Button>
          </div>
        </div>
        
        <div className="mt-4">
          <Label className="mb-2 block">
            {language === 'en' ? 'Click Sequence Order (correct solution)' : 'סדר הלחיצות (פתרון נכון)'}
          </Label>
          <div className="space-y-2">
            {localPuzzleConfig.solution.map((imageIndex, solutionPosition) => (
              <div key={solutionPosition} className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                <div className="flex-shrink-0 w-10 h-10 bg-white border rounded overflow-hidden">
                  {localPuzzleConfig.images[imageIndex] && (
                    <img 
                      src={localPuzzleConfig.images[imageIndex]} 
                      alt={`Image ${imageIndex + 1}`} 
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
                    disabled={solutionPosition === localPuzzleConfig.solution.length - 1}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-2 mt-3">
          {localPuzzleConfig.images.map((img, idx) => (
            <div key={idx} className="relative group">
              <img 
                src={img} 
                alt={`Image ${idx}`} 
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
        
        {localPuzzleConfig.images.length === 0 && (
          <div className="text-sm text-gray-500 text-center py-4">
            {t('puzzle.add.images')}
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
          {t('puzzle.apply.changes')}
        </Button>
        
        <Button
          variant="default"
          className="w-full"
          onClick={createPuzzleElement}
        >
          {t('puzzle.add.to.canvas')}
        </Button>
      </div>
    </div>
  );
};

export default ClickSequencePuzzleProperties;
