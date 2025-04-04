
import React, { useState } from "react";
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
import { Upload, Plus, Trash2 } from "lucide-react";

const PLACEHOLDER_IMAGES = [
  "/placeholder.svg",
  "https://source.unsplash.com/random/300x200?sig=1",
  "https://source.unsplash.com/random/300x200?sig=2",
  "https://source.unsplash.com/random/300x200?sig=3",
  "https://source.unsplash.com/random/300x200?sig=4",
  "https://source.unsplash.com/random/300x200?sig=5"
];

const PuzzleProperties: React.FC<{ element: DesignElement }> = ({ element }) => {
  const { updateElement } = useDesignState();
  const [selectedImage, setSelectedImage] = useState<string>("");
  
  const puzzleConfig = element.puzzleConfig || {
    name: 'Puzzle',
    placeholders: 3,
    images: [],
    solution: []
  };
  
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateElement(element.id, {
      puzzleConfig: {
        ...puzzleConfig,
        name: e.target.value
      }
    });
  };
  
  const handlePlaceholdersChange = (value: string) => {
    const numPlaceholders = parseInt(value);
    let newSolution = [...puzzleConfig.solution];
    
    // Adjust solution array to match new placeholder count
    if (numPlaceholders > puzzleConfig.solution.length) {
      // Add default values for new placeholders
      for (let i = puzzleConfig.solution.length; i < numPlaceholders; i++) {
        newSolution.push(0);
      }
    } else if (numPlaceholders < puzzleConfig.solution.length) {
      // Trim solution array if reducing placeholders
      newSolution = newSolution.slice(0, numPlaceholders);
    }
    
    updateElement(element.id, {
      puzzleConfig: {
        ...puzzleConfig,
        placeholders: numPlaceholders,
        solution: newSolution
      }
    });
  };
  
  const handleAddImage = () => {
    if (selectedImage && !puzzleConfig.images.includes(selectedImage)) {
      const newImages = [...puzzleConfig.images, selectedImage];
      updateElement(element.id, {
        puzzleConfig: {
          ...puzzleConfig,
          images: newImages
        }
      });
      setSelectedImage("");
    }
  };
  
  const handleRemoveImage = (index: number) => {
    const newImages = [...puzzleConfig.images];
    newImages.splice(index, 1);
    
    // Update solution indices if necessary
    const newSolution = puzzleConfig.solution.map(solIndex => {
      if (solIndex === index) return 0; // Reset to first image if removed
      if (solIndex > index) return solIndex - 1; // Adjust higher indices
      return solIndex;
    });
    
    updateElement(element.id, {
      puzzleConfig: {
        ...puzzleConfig,
        images: newImages,
        solution: newSolution
      }
    });
  };
  
  const handleSolutionChange = (placeholderIndex: number, imageIndex: string) => {
    const newSolution = [...puzzleConfig.solution];
    newSolution[placeholderIndex] = parseInt(imageIndex);
    
    updateElement(element.id, {
      puzzleConfig: {
        ...puzzleConfig,
        solution: newSolution
      }
    });
  };
  
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="puzzle-name">Puzzle Name</Label>
        <Input 
          id="puzzle-name" 
          value={puzzleConfig.name} 
          onChange={handleNameChange}
          className="mt-1"
        />
      </div>
      
      <div>
        <Label htmlFor="placeholders">Number of Placeholders</Label>
        <Select 
          value={puzzleConfig.placeholders.toString()} 
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
        <div className="flex items-center gap-2 mt-1">
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
        
        <div className="grid grid-cols-3 gap-2 mt-3">
          {puzzleConfig.images.map((img, idx) => (
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
        
        {puzzleConfig.images.length === 0 && (
          <div className="text-sm text-gray-500 text-center py-4">
            Add images to your puzzle collection
          </div>
        )}
      </div>
      
      {puzzleConfig.images.length > 0 && (
        <div>
          <Label>Solution Configuration</Label>
          <div className="space-y-2 mt-2">
            {Array.from({ length: puzzleConfig.placeholders }).map((_, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-sm font-medium w-24">Placeholder {idx + 1}:</span>
                <Select 
                  value={puzzleConfig.solution[idx]?.toString() || "0"} 
                  onValueChange={(val) => handleSolutionChange(idx, val)}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select correct image" />
                  </SelectTrigger>
                  <SelectContent>
                    {puzzleConfig.images.map((_, imgIdx) => (
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
    </div>
  );
};

export default PuzzleProperties;
