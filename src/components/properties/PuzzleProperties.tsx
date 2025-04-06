
import React, { useState, useRef } from "react";
import { DesignElement, PuzzleType } from "@/types/designTypes";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useDesignState } from "@/context/DesignContext";
import { useLanguage } from "@/context/LanguageContext";
import { Upload, Plus, Trash2, FileCheck, Lock, Hash, Languages } from "lucide-react";
import { toast } from "sonner";

const PLACEHOLDER_IMAGES = [
  "/placeholder.svg",
  "https://source.unsplash.com/random/300x200?sig=1",
  "https://source.unsplash.com/random/300x200?sig=2",
  "https://source.unsplash.com/random/300x200?sig=3",
  "https://source.unsplash.com/random/300x200?sig=4",
  "https://source.unsplash.com/random/300x200?sig=5"
];

interface PuzzlePropertiesProps {
  element: DesignElement;
  onUpdateConfig?: (config: any) => void;
}

const PuzzleProperties: React.FC<PuzzlePropertiesProps> = ({ element, onUpdateConfig }) => {
  const { updateElement, addElement } = useDesignState();
  const { t, language } = useLanguage();
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [localPuzzleConfig, setLocalPuzzleConfig] = useState(() => {
    return element.puzzleConfig || {
      name: language === 'en' ? 'Puzzle' : 'פאזל',
      type: 'image' as PuzzleType,
      placeholders: 3,
      images: [],
      solution: [],
      maxNumber: 9,
      maxLetter: 'Z'
    };
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalPuzzleConfig(prev => ({
      ...prev,
      name: e.target.value
    }));
  };
  
  const handleTypeChange = (type: PuzzleType) => {
    setLocalPuzzleConfig(prev => ({
      ...prev,
      type,
      solution: Array(prev.placeholders).fill(0)
    }));
  };
  
  const handlePlaceholdersChange = (value: string) => {
    const numPlaceholders = parseInt(value);
    let newSolution = [...localPuzzleConfig.solution];
    
    if (numPlaceholders > localPuzzleConfig.solution.length) {
      for (let i = localPuzzleConfig.solution.length; i < numPlaceholders; i++) {
        newSolution.push(0);
      }
    } else if (numPlaceholders < localPuzzleConfig.solution.length) {
      newSolution = newSolution.slice(0, numPlaceholders);
    }
    
    setLocalPuzzleConfig(prev => ({
      ...prev,
      placeholders: numPlaceholders,
      solution: newSolution
    }));
  };
  
  const handleMaxNumberChange = (value: string) => {
    const maxNumber = parseInt(value);
    
    const newSolution = localPuzzleConfig.solution.map(val => 
      val > maxNumber ? 0 : val
    );
    
    setLocalPuzzleConfig(prev => ({
      ...prev,
      maxNumber,
      solution: newSolution
    }));
  };
  
  const handleMaxLetterChange = (value: string) => {
    const maxLetter = value;
    const maxLetterCode = maxLetter.charCodeAt(0) - 65;
    
    const newSolution = localPuzzleConfig.solution.map(val => 
      val > maxLetterCode ? 0 : val
    );
    
    setLocalPuzzleConfig(prev => ({
      ...prev,
      maxLetter,
      solution: newSolution
    }));
  };
  
  const handleAddImage = () => {
    if (selectedImage && !localPuzzleConfig.images.includes(selectedImage)) {
      setLocalPuzzleConfig(prev => ({
        ...prev,
        images: [...prev.images, selectedImage]
      }));
      setSelectedImage("");
    }
  };
  
  const handleRemoveImage = (index: number) => {
    const newImages = [...localPuzzleConfig.images];
    newImages.splice(index, 1);
    
    const newSolution = localPuzzleConfig.solution.map(solIndex => {
      if (solIndex === index) return 0;
      if (solIndex > index) return solIndex - 1;
      return solIndex;
    });
    
    setLocalPuzzleConfig(prev => ({
      ...prev,
      images: newImages,
      solution: newSolution
    }));
  };
  
  const handleSolutionChange = (placeholderIndex: number, value: string) => {
    const newSolution = [...localPuzzleConfig.solution];
    newSolution[placeholderIndex] = parseInt(value);
    
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
        setLocalPuzzleConfig(prev => ({
          ...prev,
          images: [...prev.images, imageDataUrl]
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
    if (localPuzzleConfig.name.trim() === '') {
      toast.error(t('toast.error.name'));
      return;
    }
    
    if (localPuzzleConfig.type === 'image' && localPuzzleConfig.images.length < 2) {
      toast.error(t('toast.error.images'));
      return;
    }
    
    if (localPuzzleConfig.type === 'image' && localPuzzleConfig.images.length <= 0) {
      toast.error(t('toast.error.add.images'));
      return;
    }
    
    updateElement(element.id, {
      puzzleConfig: localPuzzleConfig
    });
    
    if (onUpdateConfig) {
      onUpdateConfig(localPuzzleConfig);
    }
    
    toast.success(t('toast.success.config'));
  };
  
  const createPuzzleElement = () => {
    if (localPuzzleConfig.name.trim() === '') {
      toast.error(t('toast.error.name'));
      return;
    }
    
    if (localPuzzleConfig.type === 'image' && localPuzzleConfig.images.length < 2) {
      toast.error(t('toast.error.images'));
      return;
    }
    
    addElement('puzzle', { puzzleConfig: localPuzzleConfig });
    toast.success(t('toast.success.added'));
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
        <Label htmlFor="puzzle-type" className="mb-2 block">{t('puzzle.type')}</Label>
        <RadioGroup 
          id="puzzle-type"
          value={localPuzzleConfig.type}
          onValueChange={(value) => handleTypeChange(value as PuzzleType)}
          className="flex flex-wrap gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="image" id="image-puzzle" />
            <Label htmlFor="image-puzzle" className="flex items-center">
              <Lock className="h-4 w-4 mr-1" />
              {t('sidebar.image.puzzle')}
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="number" id="number-puzzle" />
            <Label htmlFor="number-puzzle" className="flex items-center">
              <Hash className="h-4 w-4 mr-1" />
              {t('sidebar.number.lock')}
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="alphabet" id="alphabet-puzzle" />
            <Label htmlFor="alphabet-puzzle" className="flex items-center">
              <Languages className="h-4 w-4 mr-1" />
              {t('sidebar.alphabet.lock')}
            </Label>
          </div>
        </RadioGroup>
      </div>
      
      <div>
        <Label htmlFor="placeholders">
          {localPuzzleConfig.type === 'image' ? t('puzzle.placeholders') : 
           localPuzzleConfig.type === 'number' ? t('puzzle.digits') :
           t('puzzle.letters')}
        </Label>
        <Select 
          value={localPuzzleConfig.placeholders.toString()} 
          onValueChange={handlePlaceholdersChange}
        >
          <SelectTrigger id="placeholders" className="mt-1">
            <SelectValue placeholder="Select number" />
          </SelectTrigger>
          <SelectContent>
            {[2, 3, 4, 5, 6].map(num => (
              <SelectItem key={num} value={num.toString()}>
                {num} {localPuzzleConfig.type === 'image' ? 
                       language === 'en' ? 'placeholders' : 'מיקומים' : 
                       localPuzzleConfig.type === 'number' ? 
                       language === 'en' ? 'digits' : 'ספרות' : 
                       language === 'en' ? 'letters' : 'אותיות'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {localPuzzleConfig.type === 'number' && (
        <div>
          <Label htmlFor="max-number">{t('puzzle.max.number')}</Label>
          <Select 
            value={localPuzzleConfig.maxNumber?.toString() || "9"} 
            onValueChange={handleMaxNumberChange}
          >
            <SelectTrigger id="max-number" className="mt-1">
              <SelectValue placeholder="Select max number" />
            </SelectTrigger>
            <SelectContent>
              {[5, 6, 7, 8, 9].map(num => (
                <SelectItem key={num} value={num.toString()}>
                  {num}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      
      {localPuzzleConfig.type === 'alphabet' && (
        <div>
          <Label htmlFor="max-letter">{t('puzzle.max.letter')}</Label>
          <Select 
            value={localPuzzleConfig.maxLetter?.toString() || "Z"} 
            onValueChange={handleMaxLetterChange}
          >
            <SelectTrigger id="max-letter" className="mt-1">
              <SelectValue placeholder="Select max letter" />
            </SelectTrigger>
            <SelectContent>
              {['E', 'J', 'O', 'T', 'Z'].map(letter => (
                <SelectItem key={letter} value={letter}>
                  {letter}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      
      {localPuzzleConfig.type === 'image' && (
        <div>
          <Label>{t('puzzle.image.collection')}</Label>
          <div className="mt-2 space-y-3">
            <div className="flex items-center gap-2">
              <Select value={selectedImage} onValueChange={setSelectedImage}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder={t('puzzle.select.image')} />
                </SelectTrigger>
                <SelectContent>
                  {PLACEHOLDER_IMAGES.map((img, idx) => (
                    <SelectItem key={idx} value={img}>
                      {language === 'en' ? `Image ${idx + 1}` : `תמונה ${idx + 1}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
      )}
      
      <div>
        <Label>{t('puzzle.solution')}</Label>
        <div className="space-y-2 mt-2">
          {Array.from({ length: localPuzzleConfig.placeholders }).map((_, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="text-sm font-medium w-24">
                {localPuzzleConfig.type === 'image' ? 
                  `${t('puzzle.placeholder')} ${idx + 1}:` : 
                 localPuzzleConfig.type === 'number' ? 
                  `${t('puzzle.digit')} ${idx + 1}:` :
                  `${t('puzzle.letter')} ${idx + 1}:`}
              </span>
              <Select 
                value={localPuzzleConfig.solution[idx]?.toString() || "0"} 
                onValueChange={(val) => handleSolutionChange(idx, val)}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder={
                    localPuzzleConfig.type === 'image' ? 
                    t('puzzle.select.correct.image') : 
                    localPuzzleConfig.type === 'number' ? 
                    t('puzzle.select.correct.number') : 
                    t('puzzle.select.correct.letter')
                  } />
                </SelectTrigger>
                <SelectContent>
                  {localPuzzleConfig.type === 'image'
                    ? localPuzzleConfig.images.map((_, imgIdx) => (
                        <SelectItem key={imgIdx} value={imgIdx.toString()}>
                          {language === 'en' ? `Image ${imgIdx + 1}` : `תמונה ${imgIdx + 1}`}
                        </SelectItem>
                      ))
                    : localPuzzleConfig.type === 'number'
                      ? Array.from({ length: (localPuzzleConfig.maxNumber || 9) + 1 }).map((_, numIdx) => (
                          <SelectItem key={numIdx} value={numIdx.toString()}>
                            {numIdx}
                          </SelectItem>
                        ))
                      : Array.from({ 
                          length: (localPuzzleConfig.maxLetter?.charCodeAt(0) || 90) - 64
                        }).map((_, letterIdx) => (
                          <SelectItem key={letterIdx} value={letterIdx.toString()}>
                            {String.fromCharCode(65 + letterIdx)}
                          </SelectItem>
                        ))
                  }
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
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

export default PuzzleProperties;
