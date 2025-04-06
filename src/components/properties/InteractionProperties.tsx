
import React, { useState } from "react";
import { DesignElement, InteractionType, useDesignState } from "@/context/DesignContext";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PuzzleType } from "@/types/designTypes";
import { toast } from "sonner";
import { AlertCircle, MessageSquare, Music, Puzzle } from "lucide-react";

interface InteractionPropertiesProps {
  element: DesignElement;
}

const InteractionProperties: React.FC<InteractionPropertiesProps> = ({ element }) => {
  const { updateElement } = useDesignState();
  const [audioFile, setAudioFile] = useState<File | null>(null);
  
  const interactionConfig = element.interaction || { 
    type: 'none',
    message: '',
    sound: '',
    puzzleType: 'puzzle',
    puzzleConfig: {
      name: 'Puzzle',
      type: 'image' as PuzzleType,
      placeholders: 3,
      images: [],
      solution: []
    }
  };

  const handleTypeChange = (value: string) => {
    updateElement(element.id, {
      interaction: {
        ...interactionConfig,
        type: value as InteractionType
      }
    });
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateElement(element.id, {
      interaction: {
        ...interactionConfig,
        message: e.target.value
      }
    });
  };

  const handlePuzzleTypeChange = (value: string) => {
    // Here we're copying the existing puzzle configs from the element types
    let newConfig = { ...interactionConfig };
    
    if (value === 'puzzle') {
      newConfig.puzzleType = 'puzzle';
      if (!element.puzzleConfig) {
        newConfig.puzzleConfig = {
          name: 'Puzzle',
          type: 'image',
          placeholders: 3,
          images: [],
          solution: []
        };
      } else {
        newConfig.puzzleConfig = { ...element.puzzleConfig };
      }
    } 
    else if (value === 'sequencePuzzle') {
      newConfig.puzzleType = 'sequencePuzzle';
      if (!element.sequencePuzzleConfig) {
        newConfig.sequencePuzzleConfig = {
          name: 'Sequence Puzzle',
          images: [],
          solution: [],
          currentOrder: []
        };
      } else {
        newConfig.sequencePuzzleConfig = { ...element.sequencePuzzleConfig };
      }
    } 
    else if (value === 'clickSequencePuzzle') {
      newConfig.puzzleType = 'clickSequencePuzzle';
      if (!element.clickSequencePuzzleConfig) {
        newConfig.clickSequencePuzzleConfig = {
          name: 'Click Sequence Puzzle',
          images: [],
          solution: [],
          clickedIndices: []
        };
      } else {
        newConfig.clickSequencePuzzleConfig = { ...element.clickSequencePuzzleConfig };
      }
    } 
    else if (value === 'sliderPuzzle') {
      newConfig.puzzleType = 'sliderPuzzle';
      if (!element.sliderPuzzleConfig) {
        newConfig.sliderPuzzleConfig = {
          name: 'Slider Puzzle',
          orientation: 'horizontal',
          sliderCount: 3,
          solution: [5, 2, 8],
          currentValues: [0, 0, 0],
          maxValue: 10
        };
      } else {
        newConfig.sliderPuzzleConfig = { ...element.sliderPuzzleConfig };
      }
    }

    updateElement(element.id, {
      interaction: newConfig
    });
  };

  const handleSoundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('audio/')) {
      toast.error('Please upload a valid audio file');
      return;
    }
    
    setAudioFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        updateElement(element.id, {
          interaction: {
            ...interactionConfig,
            sound: file.name,
            soundUrl: event.target.result as string
          }
        });
        toast.success('Sound uploaded successfully');
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Interaction Type</Label>
        <Select 
          value={interactionConfig.type} 
          onValueChange={handleTypeChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select interaction type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none" className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <span>None</span>
            </SelectItem>
            <SelectItem value="puzzle" className="flex items-center gap-2">
              <Puzzle className="h-4 w-4" />
              <span>Puzzle</span>
            </SelectItem>
            <SelectItem value="message" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span>Message</span>
            </SelectItem>
            <SelectItem value="sound" className="flex items-center gap-2">
              <Music className="h-4 w-4" />
              <span>Sound</span>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {interactionConfig.type === 'puzzle' && (
        <div>
          <Label>Puzzle Type</Label>
          <Select
            value={interactionConfig.puzzleType || 'puzzle'}
            onValueChange={handlePuzzleTypeChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select puzzle type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="puzzle">Regular Puzzle</SelectItem>
              <SelectItem value="sequencePuzzle">Sequence Puzzle</SelectItem>
              <SelectItem value="clickSequencePuzzle">Click Sequence Puzzle</SelectItem>
              <SelectItem value="sliderPuzzle">Slider Puzzle</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500 mt-1">
            Configure the puzzle in the Canvas using the regular puzzle properties.
          </p>
        </div>
      )}

      {interactionConfig.type === 'message' && (
        <div>
          <Label>Message Text</Label>
          <Textarea
            value={interactionConfig.message || ''}
            onChange={handleMessageChange}
            placeholder="Enter your message here..."
            className="min-h-[100px]"
          />
        </div>
      )}

      {interactionConfig.type === 'sound' && (
        <div className="space-y-2">
          <Label>Upload Sound</Label>
          <Input 
            type="file" 
            accept="audio/*" 
            onChange={handleSoundUpload}
          />
          {interactionConfig.sound && (
            <div className="mt-2">
              <p className="text-sm">Current sound: {interactionConfig.sound}</p>
              {interactionConfig.soundUrl && (
                <audio 
                  controls 
                  src={interactionConfig.soundUrl} 
                  className="mt-2 w-full" 
                />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InteractionProperties;
