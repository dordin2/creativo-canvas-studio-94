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
import { Upload, Plus, Trash2, FileCheck, Lock, Hash, ABC } from "lucide-react";
import { toast } from "sonner";

const PLACEHOLDER_IMAGES = [
  "/placeholder.svg",
  "https://source.unsplash.com/random/300x200?sig=1",
  "https://source.unsplash.com/random/300x200?sig=2",
  "https://source.unsplash.com/random/300x200?sig=3",
  "https://source.unsplash.com/random/300x200?sig=4",
  "https://source.unsplash.com/random/300x200?sig=5"
];

const ENGLISH_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const HEBREW_LETTERS = "אבגדהוזחטיכלמנסעפצקרשת".split("");

const PuzzleProperties: React.FC<{ element: DesignElement }> = ({ element }) => {
  const { updateElement, addElement } = useDesignState();
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [localPuzzleConfig, setLocalPuzzleConfig] = useState(() => {
    return element.puzzleConfig || {
      name: 'Puzzle',
      type: 'image' as PuzzleType,
      placeholders: 3,
      images: [],
      solution: [],
      maxNumber: 9
    };
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const getLettersForType = (type: PuzzleType): string[] => {
    switch(type) {
      case 'english': return ENGLISH_LETTERS;
      case 'hebrew': return HEBREW_LETTERS;
      default: return [];
    }
  };
  
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
      toast.error("Please select a valid image file");
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
        toast.success("Image uploaded successfully");
      }
    };
    reader.onerror = () => {
      toast.error("Failed to read image file");
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
      toast.error("Puzzle name cannot be empty");
      return;
    }
    
    if (localPuzzleConfig.type === 'image' && localPuzzleConfig.images.length < 2) {
      toast.error("Add at least 2 images to create an image puzzle");
      return;
    }
    
    if (localPuzzleConfig.type === 'image' && localPuzzleConfig.images.length <= 0) {
      toast.error("Please add images to your puzzle");
      return;
    }
    
    updateElement(element.id, {
      puzzleConfig: localPuzzleConfig
    });
    
    toast.success("Puzzle configuration saved");
  };
  
  const createPuzzleElement = () => {
    if (localPuzzleConfig.name.trim() === '') {
      toast.error("Puzzle name cannot be empty");
      return;
    }
    
    if (localPuzzleConfig.type === 'image' && localPuzzleConfig.images.length < 2) {
      toast.error("Add at least 2 images to create an image puzzle");
      return;
    }
    
    addElement('puzzle', { puzzleConfig: localPuzzleConfig });
    toast.success("Puzzle added to canvas");
  };
  
  const getPuzzleTypeLabel = (type: PuzzleType): string => {
    switch(type) {
      case 'image': return 'Image Puzzle';
      case 'number': return 'Number Lock';
      case 'english': return 'English Letters';
      case 'hebrew': return 'Hebrew Letters';
      default: return 'Puzzle';
    }
  };
  
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="puzzle-name">Puzzle Name</Label>
        <Input 
          id="puzzle-name" 
          value={localPuzzleConfig.name} 
          onChange={handleNameChange}
          className="mt-1"
        />
      </div>
      
      <div>
        <Label htmlFor="puzzle-type" className="mb-2 block">Puzzle Type</Label>
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
              Image Puzzle
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="number" id="number-puzzle" />
            <Label htmlFor="number-puzzle" className="flex items-center">
              <Hash className="h-4 w-4 mr-1" />
              Number Lock
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="english" id="english-puzzle" />
            <Label htmlFor="english-puzzle" className="flex items-center">
              <ABC className="h-4 w-4 mr-1" />
              English Letters
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="hebrew" id="hebrew-puzzle" />
            <Label htmlFor="hebrew-puzzle" className="flex items-center">
              <ABC className="h-4 w-4 mr-1" />
              Hebrew Letters
            </Label>
          </div>
        </RadioGroup>
      </div>
      
      <div>
        <Label htmlFor="placeholders">
          {localPuzzleConfig.type === 'image' ? 'Number of Placeholders' : 'Number of Characters'}
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
                {num} {localPuzzleConfig.type === 'image' ? 'placeholders' : 'characters'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {localPuzzleConfig.type === 'number' && (
        <div>
          <Label htmlFor="max-number">Maximum Number</Label>
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
      
      {localPuzzleConfig.type === 'image' && (
        <div>
          <Label>Image Collection</Label>
          <div className="mt-2 space-y-3">
            <div className="flex items-center gap-2">
              <Select value={selectedImage} onValueChange={setSelectedImage}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select an image" />
                </SelectTrigger>
                <SelectContent>
                  {PLACEHOLDER_IMAGES.map((img, idx) => (
                    <SelectItem key={idx} value={img}>
                      Image {idx + 1}
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
                Upload Image
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
                <div className="text-xs text-center mt-1">Image {idx + 1}</div>
              </div>
            ))}
          </div>
          
          {localPuzzleConfig.images.length === 0 && (
            <div className="text-sm text-gray-500 text-center py-4">
              Add images to your puzzle collection
            </div>
          )}
        </div>
      )}
      
      <div>
        <Label>Solution Configuration</Label>
        <div className="space-y-2 mt-2">
          {Array.from({ length: localPuzzleConfig.placeholders }).map((_, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="text-sm font-medium w-24">
                {localPuzzleConfig.type === 'image' ? `Placeholder ${idx + 1}:` : `Character ${idx + 1}:`}
              </span>
              <Select 
                value={localPuzzleConfig.solution[idx]?.toString() || "0"} 
                onValueChange={(val) => handleSolutionChange(idx, val)}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder={`Select correct ${localPuzzleConfig.type === 'image' ? 'image' : 
                    localPuzzleConfig.type === 'number' ? 'number' : 'letter'}`} />
                </SelectTrigger>
                <SelectContent>
                  {localPuzzleConfig.type === 'image'
                    ? localPuzzleConfig.images.map((_, imgIdx) => (
                        <SelectItem key={imgIdx} value={imgIdx.toString()}>
                          Image {imgIdx + 1}
                        </SelectItem>
                      ))
                    : localPuzzleConfig.type === 'number'
                      ? Array.from({ length: (localPuzzleConfig.maxNumber || 9) + 1 }).map((_, numIdx) => (
                          <SelectItem key={numIdx} value={numIdx.toString()}>
                            {numIdx}
                          </SelectItem>
                        ))
                      : getLettersForType(localPuzzleConfig.type).map((letter, letterIdx) => (
                          <SelectItem key={letterIdx} value={letterIdx.toString()}>
                            {letter}
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
          Apply Changes
        </Button>
        
        <Button
          variant="default"
          className="w-full"
          onClick={createPuzzleElement}
        >
          Add to Canvas
        </Button>
      </div>
    </div>
  );
};

export default PuzzleProperties;
