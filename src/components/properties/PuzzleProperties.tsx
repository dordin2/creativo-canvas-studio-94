
import React, { useState, useRef } from "react";
import { DesignElement } from "@/types/designTypes";
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
import { useDesignState } from "@/context/DesignContext";
import { Upload, Plus, Trash2, FileCheck, XCircle } from "lucide-react";
import { toast } from "sonner";

const PLACEHOLDER_IMAGES = [
  "/placeholder.svg",
  "https://source.unsplash.com/random/300x200?sig=1",
  "https://source.unsplash.com/random/300x200?sig=2",
  "https://source.unsplash.com/random/300x200?sig=3",
  "https://source.unsplash.com/random/300x200?sig=4",
  "https://source.unsplash.com/random/300x200?sig=5"
];

const PuzzleProperties: React.FC<{ element: DesignElement }> = ({ element }) => {
  const { updateElement, addElement } = useDesignState();
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [localPuzzleConfig, setLocalPuzzleConfig] = useState(() => {
    return element.puzzleConfig || {
      name: 'Puzzle',
      placeholders: 3,
      images: [],
      solution: []
    };
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalPuzzleConfig(prev => ({
      ...prev,
      name: e.target.value
    }));
  };
  
  const handlePlaceholdersChange = (value: string) => {
    const numPlaceholders = parseInt(value);
    let newSolution = [...localPuzzleConfig.solution];
    
    // Adjust solution array to match new placeholder count
    if (numPlaceholders > localPuzzleConfig.solution.length) {
      // Add default values for new placeholders
      for (let i = localPuzzleConfig.solution.length; i < numPlaceholders; i++) {
        newSolution.push(0);
      }
    } else if (numPlaceholders < localPuzzleConfig.solution.length) {
      // Trim solution array if reducing placeholders
      newSolution = newSolution.slice(0, numPlaceholders);
    }
    
    setLocalPuzzleConfig(prev => ({
      ...prev,
      placeholders: numPlaceholders,
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
    
    // Update solution indices if necessary
    const newSolution = localPuzzleConfig.solution.map(solIndex => {
      if (solIndex === index) return 0; // Reset to first image if removed
      if (solIndex > index) return solIndex - 1; // Adjust higher indices
      return solIndex;
    });
    
    setLocalPuzzleConfig(prev => ({
      ...prev,
      images: newImages,
      solution: newSolution
    }));
  };
  
  const handleSolutionChange = (placeholderIndex: number, imageIndex: string) => {
    const newSolution = [...localPuzzleConfig.solution];
    newSolution[placeholderIndex] = parseInt(imageIndex);
    
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
    
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleApplyChanges = () => {
    // Validate the puzzle configuration
    if (localPuzzleConfig.name.trim() === '') {
      toast.error("Puzzle name cannot be empty");
      return;
    }
    
    if (localPuzzleConfig.images.length < 2) {
      toast.error("Add at least 2 images to create a puzzle");
      return;
    }
    
    if (localPuzzleConfig.images.length <= 0) {
      toast.error("Please add images to your puzzle");
      return;
    }
    
    if (new Set(localPuzzleConfig.solution).size !== localPuzzleConfig.solution.length) {
      toast.warning("Your solution has duplicate image assignments. Each placeholder should use a different image for the best puzzle experience.");
    }
    
    // Apply changes to the element
    updateElement(element.id, {
      puzzleConfig: localPuzzleConfig
    });
    
    toast.success("Puzzle configuration saved");
  };
  
  const createPuzzleElement = () => {
    // Final validation before creating the element
    if (localPuzzleConfig.name.trim() === '') {
      toast.error("Puzzle name cannot be empty");
      return;
    }
    
    if (localPuzzleConfig.images.length < 2) {
      toast.error("Add at least 2 images to create a puzzle");
      return;
    }
    
    // Create the puzzle element
    addElement('puzzle', { puzzleConfig: localPuzzleConfig });
    toast.success("Puzzle added to canvas");
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
        <Label htmlFor="placeholders">Number of Placeholders</Label>
        <Select 
          value={localPuzzleConfig.placeholders.toString()} 
          onValueChange={handlePlaceholdersChange}
        >
          <SelectTrigger id="placeholders" className="mt-1">
            <SelectValue placeholder="Select placeholders" />
          </SelectTrigger>
          <SelectContent>
            {[2, 3, 4, 5, 6].map(num => (
              <SelectItem key={num} value={num.toString()}>
                {num} placeholders
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
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
      
      {localPuzzleConfig.images.length > 0 && (
        <div>
          <Label>Solution Configuration</Label>
          <div className="space-y-2 mt-2">
            {Array.from({ length: localPuzzleConfig.placeholders }).map((_, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-sm font-medium w-24">Placeholder {idx + 1}:</span>
                <Select 
                  value={localPuzzleConfig.solution[idx]?.toString() || "0"} 
                  onValueChange={(val) => handleSolutionChange(idx, val)}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select correct image" />
                  </SelectTrigger>
                  <SelectContent>
                    {localPuzzleConfig.images.map((_, imgIdx) => (
                      <SelectItem key={imgIdx} value={imgIdx.toString()}>
                        Image {imgIdx + 1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        </div>
      )}
      
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
