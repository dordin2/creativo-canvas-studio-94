import React, { useState } from "react";
import { DesignElement, useDesignState } from "@/context/DesignContext";
import { InteractionType, PuzzleType, MessagePosition } from "@/types/designTypes";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { AlertCircle, MessageSquare, Music, Puzzle, Navigation, ShoppingBasket, Combine } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PuzzleProperties from "./PuzzleProperties";
import SequencePuzzleProperties from "./SequencePuzzleProperties";
import ClickSequencePuzzleProperties from "./ClickSequencePuzzleProperties";
import SliderPuzzleProperties from "./SliderPuzzleProperties";

interface InteractionPropertiesProps {
  element: DesignElement;
}

const InteractionProperties: React.FC<InteractionPropertiesProps> = ({ element }) => {
  const { updateElement, canvases, activeCanvasIndex, elements } = useDesignState();
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState<string>("config");
  
  const interactionConfig = element.interaction || { 
    type: 'none',
    message: '',
    sound: '',
    puzzleType: 'puzzle',
    messagePosition: 'top' as MessagePosition,
    puzzleConfig: {
      name: 'Puzzle',
      type: 'image' as PuzzleType,
      placeholders: 3,
      images: [],
      solution: []
    },
    canCombineWith: []
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

  const handleTargetCanvasChange = (value: string) => {
    updateElement(element.id, {
      interaction: {
        ...interactionConfig,
        targetCanvasId: value
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

  const handleToggleCombinableItem = (itemId: string) => {
    const currentItems = interactionConfig.canCombineWith || [];
    const newItems = currentItems.includes(itemId)
      ? currentItems.filter(id => id !== itemId)
      : [...currentItems, itemId];
    
    updateElement(element.id, {
      interaction: {
        ...interactionConfig,
        canCombineWith: newItems
      }
    });
  };

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

  const getCombinableElements = () => {
    const currentCanvasElements = elements.filter(el => 
      el.id !== element.id && 
      (el.interaction?.type === 'addToInventory' || el.inInventory)
    );
    
    const otherCanvasElements = canvases.flatMap((canvas, index) => {
      if (index === activeCanvasIndex) return [];
      return canvas.elements.filter(el => 
        el.interaction?.type === 'addToInventory' || el.inInventory
      );
    });
    
    return [...currentCanvasElements, ...otherCanvasElements];
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
            <SelectItem value="canvasNavigation" className="flex items-center gap-2">
              <Navigation className="h-4 w-4" />
              <span>Canvas Navigation</span>
            </SelectItem>
            <SelectItem value="addToInventory" className="flex items-center gap-2">
              <ShoppingBasket className="h-4 w-4" />
              <span>Add to Inventory</span>
            </SelectItem>
            <SelectItem value="combinable" className="flex items-center gap-2">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 10l-2-2m0 0l-2 2m2-2v4M8 18l-2 2m0 0l-2-2m2 2v-4M20 9h-2.5a1.5 1.5 0 0 1 0-3h1a1.5 1.5 0 0 0 0-3H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M4 9h2.5a1.5 1.5 0 0 0 0-3h-1a1.5 1.5 0 0 1 0-3H8M16 18h1a1.5 1.5 0 0 0 0-3h-1a1.5 1.5 0 0 1 0-3H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Combinable</span>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {interactionConfig.type === 'canvasNavigation' && (
        <div>
          <Label>Target Canvas</Label>
          <Select
            value={interactionConfig.targetCanvasId || ''}
            onValueChange={handleTargetCanvasChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select target canvas" />
            </SelectTrigger>
            <SelectContent>
              {canvases.map((canvas, index) => (
                index !== activeCanvasIndex && (
                  <SelectItem key={canvas.id} value={canvas.id}>
                    {canvas.name}
                  </SelectItem>
                )
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500 mt-1">
            Select the canvas to navigate to when this element is interacted with.
          </p>
        </div>
      )}

      {interactionConfig.type === 'combinable' && (
        <div className="space-y-4">
          <Label>Combinable with these items:</Label>
          <div className="space-y-2 max-h-64 overflow-y-auto p-2 border rounded-md">
            {getCombinableElements().length > 0 ? (
              getCombinableElements().map(item => (
                <div key={item.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`item-${item.id}`}
                    checked={(interactionConfig.canCombineWith || []).includes(item.id)}
                    onCheckedChange={() => handleToggleCombinableItem(item.id)}
                  />
                  <Label htmlFor={`item-${item.id}`} className="cursor-pointer">
                    {item.name || `${item.type} (${item.id.slice(0, 4)})`}
                  </Label>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 py-2">
                No items available. Create items with "Add to Inventory" interaction first.
              </p>
            )}
          </div>
          <div className="p-3 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-600">
              When an inventory item is dragged and dropped onto this element, the item will be removed from the inventory
              and a success message will be shown.
            </p>
          </div>
          <div>
            <Label>Success Message</Label>
            <Textarea
              value={interactionConfig.message || ''}
              onChange={handleMessageChange}
              placeholder="Enter message to show when items are combined..."
              className="min-h-[80px]"
            />
          </div>
        </div>
      )}

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
        <div className="space-y-4">
          <div>
            <Label>Message Text</Label>
            <Textarea
              value={interactionConfig.message || ''}
              onChange={handleMessageChange}
              placeholder="Enter your message here..."
              className="min-h-[100px]"
            />
          </div>
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

      {interactionConfig.type === 'addToInventory' && (
        <div className="p-3 bg-gray-50 rounded-md">
          <p className="text-sm text-gray-600">
            When this element is clicked in game mode, it will be added to the player's inventory and removed from the canvas.
          </p>
        </div>
      )}
    </div>
  );
};

export default InteractionProperties;
