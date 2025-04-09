import React, { useState } from "react";
import { DesignElement, useDesignState } from "@/context/DesignContext";
import { 
  InteractionType, 
  PuzzleType, 
  MessagePosition, 
  CombinationResultType,
  ElementType,
  InteractionAction
} from "@/types/designTypes";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { 
  AlertCircle, 
  MessageSquare, 
  Music, 
  Puzzle, 
  Navigation, 
  ShoppingBasket,
  Plus,
  X,
  ArrowDown,
  ArrowUp,
  Clock
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PuzzleProperties from "./PuzzleProperties";
import SequencePuzzleProperties from "./SequencePuzzleProperties";
import ClickSequencePuzzleProperties from "./ClickSequencePuzzleProperties";
import SliderPuzzleProperties from "./SliderPuzzleProperties";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { generateId } from "@/types/designTypes";

interface InteractionPropertiesProps {
  element: DesignElement;
}

const InteractionProperties: React.FC<InteractionPropertiesProps> = ({ element }) => {
  const { updateElement, canvases, activeCanvasIndex, elements } = useDesignState();
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState<string>("config");
  const [combinationTab, setCombinationTab] = useState<string>("setup");
  const [sequenceTab, setSequenceTab] = useState<string>("basic");
  const [editingActionIndex, setEditingActionIndex] = useState<number | null>(null);
  
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
    canCombineWith: [],
    combinationResult: {
      type: 'message' as CombinationResultType,
      message: ''
    },
    actions: []
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

  const addAction = () => {
    const actions = interactionConfig.actions || [];
    const newAction: InteractionAction = {
      type: 'message',
      message: 'New action message',
      condition: 'always',
      delay: 0
    };
    
    updateElement(element.id, {
      interaction: {
        ...interactionConfig,
        actions: [...actions, newAction]
      }
    });
    
    setEditingActionIndex(actions.length);
    setSequenceTab("editor");
  };
  
  const removeAction = (index: number) => {
    const actions = [...(interactionConfig.actions || [])];
    actions.splice(index, 1);
    
    updateElement(element.id, {
      interaction: {
        ...interactionConfig,
        actions
      }
    });
    
    if (editingActionIndex === index) {
      setEditingActionIndex(null);
    } else if (editingActionIndex !== null && editingActionIndex > index) {
      setEditingActionIndex(editingActionIndex - 1);
    }
  };
  
  const moveActionUp = (index: number) => {
    if (index <= 0) return;
    
    const actions = [...(interactionConfig.actions || [])];
    const temp = actions[index];
    actions[index] = actions[index-1];
    actions[index-1] = temp;
    
    updateElement(element.id, {
      interaction: {
        ...interactionConfig,
        actions
      }
    });
    
    if (editingActionIndex === index) {
      setEditingActionIndex(index - 1);
    } else if (editingActionIndex === index - 1) {
      setEditingActionIndex(index);
    }
  };
  
  const moveActionDown = (index: number) => {
    const actions = [...(interactionConfig.actions || [])];
    if (index >= actions.length - 1) return;
    
    const temp = actions[index];
    actions[index] = actions[index+1];
    actions[index+1] = temp;
    
    updateElement(element.id, {
      interaction: {
        ...interactionConfig,
        actions
      }
    });
    
    if (editingActionIndex === index) {
      setEditingActionIndex(index + 1);
    } else if (editingActionIndex === index + 1) {
      setEditingActionIndex(index);
    }
  };
  
  const handleEditAction = (index: number) => {
    setEditingActionIndex(index);
    setSequenceTab("editor");
  };
  
  const handleUpdateAction = (action: InteractionAction) => {
    if (editingActionIndex === null) return;
    
    const actions = [...(interactionConfig.actions || [])];
    actions[editingActionIndex] = action;
    
    updateElement(element.id, {
      interaction: {
        ...interactionConfig,
        actions
      }
    });
  };

  const handleActionTypeChange = (value: string) => {
    if (editingActionIndex === null) return;
    
    const action = { ...(interactionConfig.actions || [])[editingActionIndex] };
    action.type = value as InteractionType;
    
    handleUpdateAction(action);
  };
  
  const handleActionMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (editingActionIndex === null) return;
    
    const action = { ...(interactionConfig.actions || [])[editingActionIndex] };
    action.message = e.target.value;
    
    handleUpdateAction(action);
  };
  
  const handleActionTargetCanvasChange = (value: string) => {
    if (editingActionIndex === null) return;
    
    const action = { ...(interactionConfig.actions || [])[editingActionIndex] };
    action.targetCanvasId = value;
    
    handleUpdateAction(action);
  };
  
  const handleActionSoundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editingActionIndex === null) return;
    
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
        const action = { ...(interactionConfig.actions || [])[editingActionIndex] };
        action.sound = file.name;
        action.soundUrl = event.target.result as string;
        
        handleUpdateAction(action);
        toast.success('Sound uploaded successfully');
      }
    };
    reader.readAsDataURL(file);
  };
  
  const handleActionPuzzleTypeChange = (value: string) => {
    if (editingActionIndex === null) return;
    
    const action = { ...(interactionConfig.actions || [])[editingActionIndex] };
    action.puzzleType = value as ElementType;
    
    if (value === 'puzzle') {
      if (!action.puzzleConfig) {
        action.puzzleConfig = {
          name: 'Puzzle',
          type: 'image',
          placeholders: 3,
          images: [],
          solution: []
        };
      }
    } 
    else if (value === 'sequencePuzzle') {
      if (!action.sequencePuzzleConfig) {
        action.sequencePuzzleConfig = {
          name: 'Sequence Puzzle',
          images: [],
          solution: [],
          currentOrder: []
        };
      }
    } 
    else if (value === 'clickSequencePuzzle') {
      if (!action.clickSequencePuzzleConfig) {
        action.clickSequencePuzzleConfig = {
          name: 'Click Sequence Puzzle',
          images: [],
          solution: [],
          clickedIndices: []
        };
      }
    } 
    else if (value === 'sliderPuzzle') {
      if (!action.sliderPuzzleConfig) {
        action.sliderPuzzleConfig = {
          name: 'Slider Puzzle',
          orientation: 'horizontal',
          sliderCount: 3,
          solution: [5, 2, 8],
          currentValues: [0, 0, 0],
          maxValue: 10
        };
      }
    }
    
    handleUpdateAction(action);
  };
  
  const handleActionDelayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editingActionIndex === null) return;
    
    const action = { ...(interactionConfig.actions || [])[editingActionIndex] };
    action.delay = parseInt(e.target.value) || 0;
    
    handleUpdateAction(action);
  };
  
  const handleActionConditionChange = (value: string) => {
    if (editingActionIndex === null) return;
    
    const action = { ...(interactionConfig.actions || [])[editingActionIndex] };
    action.condition = value as 'always' | 'puzzleSolved' | 'none';
    
    handleUpdateAction(action);
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

  const getCombinationResultPuzzleElementProxy = () => {
    const baseElement = { ...element };
    const combinationResult = interactionConfig.combinationResult;
    
    if (!combinationResult) return baseElement;
    
    if (combinationResult.puzzleType === 'puzzle' && combinationResult.puzzleConfig) {
      baseElement.puzzleConfig = combinationResult.puzzleConfig;
    } 
    else if (combinationResult.puzzleType === 'sequencePuzzle' && combinationResult.sequencePuzzleConfig) {
      baseElement.sequencePuzzleConfig = combinationResult.sequencePuzzleConfig;
    }
    else if (combinationResult.puzzleType === 'clickSequencePuzzle' && combinationResult.clickSequencePuzzleConfig) {
      baseElement.clickSequencePuzzleConfig = combinationResult.clickSequencePuzzleConfig;
    }
    else if (combinationResult.puzzleType === 'sliderPuzzle' && combinationResult.sliderPuzzleConfig) {
      baseElement.sliderPuzzleConfig = combinationResult.sliderPuzzleConfig;
    }
    
    return baseElement;
  };

  const getCombinationResultPuzzleConfigComponent = () => {
    const combinationResult = interactionConfig.combinationResult;
    if (!combinationResult) return null;
    
    const puzzleType = combinationResult.puzzleType || 'puzzle';
    const proxyElement = getCombinationResultPuzzleElementProxy();
    
    switch (puzzleType) {
      case 'puzzle':
        return (
          <PuzzleProperties 
            element={proxyElement} 
            onUpdateConfig={(config) => handleCombinationResultPuzzleConfigUpdate('puzzleConfig', config)} 
          />
        );
      case 'sequencePuzzle':
        return (
          <SequencePuzzleProperties 
            element={proxyElement} 
            onUpdateConfig={(config) => handleCombinationResultPuzzleConfigUpdate('sequencePuzzleConfig', config)} 
          />
        );
      case 'clickSequencePuzzle':
        return (
          <ClickSequencePuzzleProperties 
            element={proxyElement} 
            onUpdateConfig={(config) => handleCombinationResultPuzzleConfigUpdate('clickSequencePuzzleConfig', config)} 
          />
        );
      case 'sliderPuzzle':
        return (
          <SliderPuzzleProperties 
            element={proxyElement} 
            onUpdateConfig={(config) => handleCombinationResultPuzzleConfigUpdate('sliderPuzzleConfig', config)} 
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

  const handleCombinationResultTypeChange = (value: string) => {
    const combinationResult = interactionConfig.combinationResult || {
      type: 'message' as CombinationResultType,
      message: ''
    };
    
    updateElement(element.id, {
      interaction: {
        ...interactionConfig,
        combinationResult: {
          ...combinationResult,
          type: value as CombinationResultType
        }
      }
    });
  };

  const handleCombinationResultMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const combinationResult = interactionConfig.combinationResult || {
      type: 'message' as CombinationResultType
    };
    
    updateElement(element.id, {
      interaction: {
        ...interactionConfig,
        combinationResult: {
          ...combinationResult,
          message: e.target.value
        }
      }
    });
  };

  const handleCombinationResultTargetCanvasChange = (value: string) => {
    const combinationResult = interactionConfig.combinationResult || {
      type: 'canvasNavigation' as CombinationResultType
    };
    
    updateElement(element.id, {
      interaction: {
        ...interactionConfig,
        combinationResult: {
          ...combinationResult,
          targetCanvasId: value
        }
      }
    });
  };

  const handleCombinationResultSoundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        const combinationResult = interactionConfig.combinationResult || {
          type: 'sound' as CombinationResultType
        };
        
        updateElement(element.id, {
          interaction: {
            ...interactionConfig,
            combinationResult: {
              ...combinationResult,
              sound: file.name,
              soundUrl: event.target.result as string
            }
          }
        });
        toast.success('Sound uploaded successfully');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCombinationResultPuzzleTypeChange = (value: string) => {
    const combinationResult = interactionConfig.combinationResult || {
      type: 'puzzle' as CombinationResultType
    };
    
    let newCombinationResult = { ...combinationResult, puzzleType: value as ElementType };
    
    if (value === 'puzzle') {
      if (!combinationResult.puzzleConfig) {
        newCombinationResult.puzzleConfig = {
          name: 'Puzzle',
          type: 'image',
          placeholders: 3,
          images: [],
          solution: []
        };
      }
    } 
    else if (value === 'sequencePuzzle') {
      if (!combinationResult.sequencePuzzleConfig) {
        newCombinationResult.sequencePuzzleConfig = {
          name: 'Sequence Puzzle',
          images: [],
          solution: [],
          currentOrder: []
        };
      }
    } 
    else if (value === 'clickSequencePuzzle') {
      if (!combinationResult.clickSequencePuzzleConfig) {
        newCombinationResult.clickSequencePuzzleConfig = {
          name: 'Click Sequence Puzzle',
          images: [],
          solution: [],
          clickedIndices: []
        };
      }
    } 
    else if (value === 'sliderPuzzle') {
      if (!combinationResult.sliderPuzzleConfig) {
        newCombinationResult.sliderPuzzleConfig = {
          name: 'Slider Puzzle',
          orientation: 'horizontal',
          sliderCount: 3,
          solution: [5, 2, 8],
          currentValues: [0, 0, 0],
          maxValue: 10
        };
      }
    }
    
    updateElement(element.id, {
      interaction: {
        ...interactionConfig,
        combinationResult: newCombinationResult
      }
    });
  };

  const handleCombinationResultPuzzleConfigUpdate = (configType: string, config: any) => {
    const combinationResult = interactionConfig.combinationResult || {
      type: 'puzzle' as CombinationResultType
    };
    
    let updatedCombinationResult = { ...combinationResult };
    
    if (configType === 'puzzleConfig') {
      updatedCombinationResult.puzzleConfig = config;
    } 
    else if (configType === 'sequencePuzzleConfig') {
      updatedCombinationResult.sequencePuzzleConfig = config;
    }
    else if (configType === 'clickSequencePuzzleConfig') {
      updatedCombinationResult.clickSequencePuzzleConfig = config;
    }
    else if (configType === 'sliderPuzzleConfig') {
      updatedCombinationResult.sliderPuzzleConfig = config;
    }
    
    updateElement(element.id, {
      interaction: {
        ...interactionConfig,
        combinationResult: updatedCombinationResult
      }
    });
  };

  const renderActionEditor = () => {
    if (editingActionIndex === null) return null;
    
    const actions = interactionConfig.actions || [];
    if (editingActionIndex >= actions.length) return null;
    
    const action = actions[editingActionIndex];
    
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Editing Action {editingActionIndex + 1}</h3>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => {
              setEditingActionIndex(null);
              setSequenceTab("list");
            }}
          >
            Back to List
          </Button>
        </div>
        
        <div>
          <Label>Action Type</Label>
          <Select 
            value={action.type} 
            onValueChange={handleActionTypeChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select action type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="message" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                <span>Show Message</span>
              </SelectItem>
              <SelectItem value="sound" className="flex items-center gap-2">
                <Music className="h-4 w-4" />
                <span>Play Sound</span>
              </SelectItem>
              <SelectItem value="puzzle" className="flex items-center gap-2">
                <Puzzle className="h-4 w-4" />
                <span>Show Puzzle</span>
              </SelectItem>
              <SelectItem value="canvasNavigation" className="flex items-center gap-2">
                <Navigation className="h-4 w-4" />
                <span>Navigate to Canvas</span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label>Execution Condition</Label>
          <Select 
            value={action.condition || 'always'} 
            onValueChange={handleActionConditionChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select condition" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="always">Always execute</SelectItem>
              <SelectItem value="puzzleSolved">Only if puzzle is solved</SelectItem>
              <SelectItem value="none">Manual trigger only</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500 mt-1">
            When should this action be executed?
          </p>
        </div>
        
        <div>
          <Label>Delay (milliseconds)</Label>
          <div className="flex items-center gap-2">
            <Input 
              type="number" 
              value={action.delay || 0} 
              onChange={handleActionDelayChange}
              min={0}
              step={100}
            />
            <Clock className="h-4 w-4 text-gray-500" />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Delay before this action is executed (in milliseconds)
          </p>
        </div>
        
        {action.type === 'message' && (
          <div>
            <Label>Message Text</Label>
            <Textarea
              value={action.message || ''}
              onChange={handleActionMessageChange}
              placeholder="Enter message text..."
              className="min-h-[100px]"
            />
          </div>
        )}
        
        {action.type === 'sound' && (
          <div className="space-y-2">
            <Label>Upload Sound</Label>
            <Input 
              type="file" 
              accept="audio/*" 
              onChange={handleActionSoundUpload}
            />
            {action.sound && (
              <div className="mt-2">
                <p className="text-sm">Current sound: {action.sound}</p>
                {action.soundUrl && (
                  <audio 
                    controls 
                    src={action.soundUrl} 
                    className="mt-2 w-full" 
                  />
                )}
              </div>
            )}
          </div>
        )}
        
        {action.type === 'canvasNavigation' && (
          <div>
            <Label>Target Canvas</Label>
            <Select
              value={action.targetCanvasId || ''}
              onValueChange={handleActionTargetCanvasChange}
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
          </div>
        )}
        
        {action.type === 'puzzle' && (
          <div className="space-y-4">
            <div>
              <Label>Puzzle Type</Label>
              <Select
                value={action.puzzleType || 'puzzle'}
                onValueChange={handleActionPuzzleTypeChange}
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
            </div>
            
            {/* Additional puzzle configuration would go here */}
            {/* This would be similar to the existing puzzle configuration code */}
          </div>
        )}
      </div>
    );
  };
  
  const renderActionsList = () => {
    const actions = interactionConfig.actions || [];
    
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Interaction Sequence</h3>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={addAction}
            className="flex items-center gap-1"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Action
          </Button>
        </div>
        
        {actions.length === 0 ? (
          <div className="p-8 text-center border rounded-md bg-muted/20">
            <p className="text-sm text-gray-500">No actions defined yet.</p>
            <p className="text-xs mt-1 text-gray-400">
              Add actions to create an interaction sequence.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {actions.map((action, index) => (
              <Card key={index} className="relative">
                <div className="absolute top-2 right-2 flex gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => removeAction(index)}
                    className="h-6 w-6 text-destructive hover:text-destructive/80"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
                
                <CardHeader className="py-3 px-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {action.type === 'message' && <MessageSquare className="h-4 w-4" />}
                      {action.type === 'sound' && <Music className="h-4 w-4" />}
                      {action.type === 'puzzle' && <Puzzle className="h-4 w-4" />}
                      {action.type === 'canvasNavigation' && <Navigation className="h-4 w-4" />}
                      <span className="font-medium">
                        Action {index + 1}: {action.type.charAt(0).toUpperCase() + action.type.slice(1)}
                      </span>
                    </div>
                    
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => moveActionUp(index)}
                        disabled={index === 0}
                        className="h-6 w-6"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => moveActionDown(index)}
                        disabled={index === actions.length - 1}
                        className="h-6 w-6"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="py-2 px-4">
                  <div className="text-sm grid gap-1">
                    {action.delay !== undefined && action.delay > 0 && (
                      <div className="flex items-center gap-1.5 text-gray-500">
                        <Clock className="h-3.5 w-3.5" />
                        <span>Delay: {action.delay}ms</span>
                      </div>
                    )}
                    
                    {action.condition && action.condition !== 'always' && (
                      <div className="text-gray-500">
                        Condition: {action.condition === 'puzzleSolved' ? 'Puzzle must be solved' : 'Manual trigger only'}
                      </div>
                    )}
                    
                    {action.type === 'message' && (
                      <div className="text-gray-600 line-clamp-1">{action.message || '(No message)'}</div>
                    )}
                    
                    {action.type === 'sound' && (
                      <div className="text-gray-600">{action.sound || '(No sound selected)'}</div>
                    )}
                    
                    {action.type === 'canvasNavigation' && action.targetCanvasId && (
                      <div className="text-gray-600">
                        Navigate to: {canvases.find(c => c.id === action.targetCanvasId)?.name || 'Unknown canvas'}
                      </div>
                    )}
                  </div>
                </CardContent>
                
                <CardFooter className="py-2 px-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleEditAction(index)}
                    className="w-full"
                  >
                    Edit Details
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full">
          <TabsTrigger value="config" className="flex-1">Basic Settings</TabsTrigger>
          <TabsTrigger value="sequence" className="flex-1">Action Sequence</TabsTrigger>
        </TabsList>
        
        <TabsContent value="config" className="space-y-6 pt-4">
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
              <Tabs value={combinationTab} onValueChange={setCombinationTab}>
                <TabsList className="w-full">
                  <TabsTrigger value="setup">Item Setup</TabsTrigger>
                  <TabsTrigger value="result">Combination Result</TabsTrigger>
                </TabsList>
                
                <TabsContent value="setup" className="space-y-4">
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
                      and the selected combination result will occur.
                    </p>
                  </div>
                </TabsContent>
                
                <TabsContent value="result" className="space-y-4">
                  <div>
                    <Label>Result Type</Label>
                    <Select
                      value={interactionConfig.combinationResult?.type || 'message'}
                      onValueChange={handleCombinationResultTypeChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select result type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="message" className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4" />
                          <span>Show Message</span>
                        </SelectItem>
                        <SelectItem value="sound" className="flex items-center gap-2">
                          <Music className="h-4 w-4" />
                          <span>Play Sound</span>
                        </SelectItem>
                        <SelectItem value="canvasNavigation" className="flex items-center gap-2">
                          <Navigation className="h-4 w-4" />
                          <span>Navigate to Canvas</span>
                        </SelectItem>
                        <SelectItem value="puzzle" className="flex items-center gap-2">
                          <Puzzle className="h-4 w-4" />
                          <span>Show Puzzle</span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {interactionConfig.combinationResult?.type === 'message' && (
                    <div>
                      <Label>Message Text</Label>
                      <Textarea
                        value={interactionConfig.combinationResult?.message || ''}
                        onChange={handleCombinationResultMessageChange}
                        placeholder="Enter message to show when items are combined..."
                        className="min-h-[80px]"
                      />
                    </div>
                  )}
                  
                  {interactionConfig.combinationResult?.type === 'sound' && (
                    <div className="space-y-2">
                      <Label>Upload Sound</Label>
                      <Input 
                        type="file" 
                        accept="audio/*" 
                        onChange={handleCombinationResultSoundUpload}
                      />
                      {interactionConfig.combinationResult?.sound && (
                        <div className="mt-2">
                          <p className="text-sm">Current sound: {interactionConfig.combinationResult.sound}</p>
                          {interactionConfig.combinationResult?.soundUrl && (
                            <audio 
                              controls 
                              src={interactionConfig.combinationResult.soundUrl} 
                              className="mt-2 w-full" 
                            />
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {interactionConfig.combinationResult?.type === 'canvasNavigation' && (
                    <div>
                      <Label>Target Canvas</Label>
                      <Select
                        value={interactionConfig.combinationResult?.targetCanvasId || ''}
                        onValueChange={handleCombinationResultTargetCanvasChange}
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
                    </div>
                  )}
                  
                  {interactionConfig.combinationResult?.type === 'puzzle' && (
                    <Tabs defaultValue="puzzleType">
                      <TabsList className="w-full">
                        <TabsTrigger value="puzzleType">Puzzle Type</TabsTrigger>
                        <TabsTrigger value="puzzleConfig">Puzzle Config</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="puzzleType" className="space-y-4">
                        <div>
                          <Label>Puzzle Type</Label>
                          <Select
                            value={interactionConfig.combinationResult?.puzzleType || 'puzzle'}
                            onValueChange={handleCombinationResultPuzzleTypeChange}
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
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="puzzleConfig">
                        {getCombinationResultPuzzleConfigComponent()}
                      </TabsContent>
                    </Tabs>
                  )}
                </TabsContent>
              </Tabs>
            </div>
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

          {interactionConfig.type === 'puzzle' && (
            <div className="space-y-4">
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
              </div>
              
              {getPuzzleConfigComponent()}
            </div>
          )}

          {interactionConfig.type === 'addToInventory' && (
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-600">
                When this element is clicked in game mode, it will be added to the player's inventory and removed from the canvas.
              </p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="sequence" className="pt-4">
          <Tabs value={sequenceTab} onValueChange={setSequenceTab}>
            <TabsList className="w-full">
              <TabsTrigger value="list">Action List</TabsTrigger>
              <TabsTrigger value="editor" disabled={editingActionIndex === null}>Action Editor</TabsTrigger>
            </TabsList>
            
            <TabsContent value="list">
              {renderActionsList()}
            </TabsContent>
            
            <TabsContent value="editor">
              {renderActionEditor()}
            </TabsContent>
          </Tabs>
          
          <div className="mt-4 p-3 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-600">
              Create a sequence of actions that will be executed when this element is interacted with.
              Actions are executed in order, with optional delays and conditions.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InteractionProperties;
