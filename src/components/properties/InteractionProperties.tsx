
import React, { useState } from "react";
import { DesignElement, useDesignState } from "@/context/DesignContext";
import { InteractionType, PuzzleType } from "@/types/designTypes";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { AlertCircle, MessageSquare, Music, Puzzle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PuzzleProperties from "./PuzzleProperties";
import SequencePuzzleProperties from "./SequencePuzzleProperties";
import ClickSequencePuzzleProperties from "./ClickSequencePuzzleProperties";
import SliderPuzzleProperties from "./SliderPuzzleProperties";

interface InteractionPropertiesProps {
  element: DesignElement;
}

const InteractionProperties: React.FC<InteractionPropertiesProps> = ({ element }) => {
  const { updateElement } = useDesignState();
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState<string>("config");
  
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

  // Creates an element object that resembles a real puzzle element for the puzzle property components
  const createPuzzleElementProxy = () => {
    const baseElement = { ...element };
    
    if (interactionConfig.puzzleType === 'puzzle' && interactionConfig.puzzleConfig) {
      baseElement.puzzleConfig = interactionConfig.puzzleConfig;
    } 
    else if (interactionConfig.puzzleType === 'sequencePuzzle' && interactionConfig.sequencePuzzleConfig) {
      baseElement.sequencePuzzleConfig = interactionConfig.sequencePuzzleConfig;
    }
    else if (interactionConfig.puzzleType === 'clickSequencePuzzle' && interactionConfig.clickSequencePuzzleConfig) {
      baseElement.clickSequencePuzzleConfig = interactionConfig.clickSequencePuzzleConfig;
    }
    else if (interactionConfig.puzzleType === 'sliderPuzzle' && interactionConfig.sliderPuzzleConfig) {
      baseElement.sliderPuzzleConfig = interactionConfig.sliderPuzzleConfig;
    }
    
    return baseElement;
  };

  // Function to handle updates from child puzzle components
  const handlePuzzleConfigUpdate = (configType: string, config: any) => {
    let updatedInteraction = { ...interactionConfig };
    
    if (configType === 'puzzleConfig') {
      updatedInteraction.puzzleConfig = config;
    } 
    else if (configType === 'sequencePuzzleConfig') {
      updatedInteraction.sequencePuzzleConfig = config;
    }
    else if (configType === 'clickSequencePuzzleConfig') {
      updatedInteraction.clickSequencePuzzleConfig = config;
    }
    else if (configType === 'sliderPuzzleConfig') {
      updatedInteraction.sliderPuzzleConfig = config;
    }
    
    updateElement(element.id, {
      interaction: updatedInteraction
    });
  };

  // Get the appropriate puzzle component based on the puzzle type
  const getPuzzleConfigComponent = () => {
    const puzzleType = interactionConfig.puzzleType || 'puzzle';
    const proxyElement = createPuzzleElementProxy();
    
    switch (puzzleType) {
      case 'puzzle':
        return (
          <PuzzleProperties 
            element={proxyElement} 
            onUpdateConfig={(config) => handlePuzzleConfigUpdate('puzzleConfig', config)} 
          />
        );
      case 'sequencePuzzle':
        return (
          <SequencePuzzleProperties 
            element={proxyElement} 
            onUpdateConfig={(config) => handlePuzzleConfigUpdate('sequencePuzzleConfig', config)} 
          />
        );
      case 'clickSequencePuzzle':
        return (
          <ClickSequencePuzzleProperties 
            element={proxyElement} 
            onUpdateConfig={(config) => handlePuzzleConfigUpdate('clickSequencePuzzleConfig', config)} 
          />
        );
      case 'sliderPuzzle':
        return (
          <SliderPuzzleProperties 
            element={proxyElement} 
            onUpdateConfig={(config) => handlePuzzleConfigUpdate('sliderPuzzleConfig', config)} 
          />
        );
      default:
        return <div>Select a puzzle type to configure</div>;
    }
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
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full">
            <TabsTrigger value="config">Basic Config</TabsTrigger>
            <TabsTrigger value="advanced">Puzzle Setup</TabsTrigger>
          </TabsList>
          
          <TabsContent value="config" className="space-y-4">
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
                Select the puzzle type, then go to the "Puzzle Setup" tab to configure it.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="advanced">
            {getPuzzleConfigComponent()}
          </TabsContent>
        </Tabs>
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
