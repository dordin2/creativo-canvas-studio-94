import React, { useState, useEffect, useRef } from "react";
import { useDesignState } from "@/context/DesignContext";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  DesignElement, 
  InteractionType,
  MessagePosition,
  PuzzleType,
  ElementType,
  CombinationResultType,
  SliderOrientation,
  InteractionConfig
} from "@/types/designTypes";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { 
  Lock, 
  Hash, 
  Languages, 
  ArrowUpDown, 
  MousePointer, 
  Sliders, 
  Volume2, 
  MessageCircle, 
  Navigation, 
  FileUp, 
  Paperclip, 
  Upload, 
  Trash2,
  ArrowUp,
  ArrowDown,
  Plus
} from "lucide-react";
import { toast } from "sonner";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";

const PLACEHOLDER_IMAGES = [
  "/placeholder.svg",
  "https://source.unsplash.com/random/300x200?sig=1",
  "https://source.unsplash.com/random/300x200?sig=2",
  "https://source.unsplash.com/random/300x200?sig=3",
  "https://source.unsplash.com/random/300x200?sig=4",
  "https://source.unsplash.com/random/300x200?sig=5"
];

interface InteractionPropertiesProps {
  element: DesignElement;
}

const InteractionProperties = ({ element }: InteractionPropertiesProps) => {
  const { updateElement, canvases, elements } = useDesignState();
  const { t, language } = useLanguage();
  const [interactionType, setInteractionType] = useState<InteractionType>(
    element.interaction?.type || 'none'
  );

  // Puzzle specific states
  const [puzzleType, setPuzzleType] = useState<ElementType>(
    element.interaction?.puzzleType || 'puzzle'
  );
  const [puzzleConfig, setPuzzleConfig] = useState(() => 
    element.interaction?.puzzleConfig || {
      name: language === 'en' ? 'Puzzle' : 'פאזל',
      type: 'image' as PuzzleType,
      placeholders: 3,
      images: [],
      solution: [],
      maxNumber: 9,
      maxLetter: 'Z'
    }
  );
  const [sequencePuzzleConfig, setSequencePuzzleConfig] = useState(() => 
    element.interaction?.sequencePuzzleConfig || {
      name: language === 'en' ? 'Sequence Puzzle' : 'פאזל רצף',
      images: [],
      solution: [],
      currentOrder: []
    }
  );
  const [clickSequencePuzzleConfig, setClickSequencePuzzleConfig] = useState(() => 
    element.interaction?.clickSequencePuzzleConfig || {
      name: language === 'en' ? 'Click Sequence Puzzle' : 'פאזל לחיצות',
      images: [],
      solution: [],
      clickedIndices: []
    }
  );
  const [sliderPuzzleConfig, setSliderPuzzleConfig] = useState(() => 
    element.interaction?.sliderPuzzleConfig || {
      name: language === 'en' ? 'Slider Puzzle' : 'פאזל גלילה',
      orientation: 'horizontal' as SliderOrientation,
      sliderCount: 3,
      solution: [5, 2, 8],
      currentValues: [0, 0, 0],
      maxValue: 10
    }
  );

  // Message specific state
  const [messagePosition, setMessagePosition] = useState<MessagePosition>(
    element.interaction?.messagePosition || 'bottom'
  );

  // Sound specific state
  const [soundFile, setSoundFile] = useState<File | null>(null);

  // Canvas navigation state
  const [targetCanvasId, setTargetCanvasId] = useState<string>(
    element.interaction?.targetCanvasId || ''
  );

  // Combinable specific states
  const [canCombineWith, setCanCombineWith] = useState<string[]>(
    element.interaction?.canCombineWith || []
  );
  const [combinationResultType, setCombinationResultType] = useState<CombinationResultType>(
    element.interaction?.combinationResult?.type || 'message'
  );
  const [combinationResultMessage, setCombinationResultMessage] = useState<string>(
    element.interaction?.combinationResult?.message || ''
  );
  const [combinationResultSound, setCombinationResultSound] = useState<string>(
    element.interaction?.combinationResult?.soundUrl || ''
  );
  const [combinationResultTargetCanvasId, setCombinationResultTargetCanvasId] = useState<string>(
    element.interaction?.combinationResult?.targetCanvasId || ''
  );
  const [combinationResultPuzzleType, setCombinationResultPuzzleType] = useState<ElementType>(
    element.interaction?.combinationResult?.puzzleType || 'puzzle'
  );

  // State for image manipulation
  const [selectedImage, setSelectedImage] = useState<string>("");
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Update local states when the element changes
  useEffect(() => {
    setInteractionType(element.interaction?.type || 'none');
    setPuzzleType(element.interaction?.puzzleType || 'puzzle');
    setPuzzleConfig(element.interaction?.puzzleConfig || {
      name: language === 'en' ? 'Puzzle' : 'פאזל',
      type: 'image' as PuzzleType,
      placeholders: 3,
      images: [],
      solution: [],
      maxNumber: 9,
      maxLetter: 'Z'
    });
    setSequencePuzzleConfig(element.interaction?.sequencePuzzleConfig || {
      name: language === 'en' ? 'Sequence Puzzle' : 'פאזל רצף',
      images: [],
      solution: [],
      currentOrder: []
    });
    setClickSequencePuzzleConfig(element.interaction?.clickSequencePuzzleConfig || {
      name: language === 'en' ? 'Click Sequence Puzzle' : 'פאזל לחיצות',
      images: [],
      solution: [],
      clickedIndices: []
    });
    setSliderPuzzleConfig(element.interaction?.sliderPuzzleConfig || {
      name: language === 'en' ? 'Slider Puzzle' : 'פאזל גלילה',
      orientation: 'horizontal' as SliderOrientation,
      sliderCount: 3,
      solution: [5, 2, 8],
      currentValues: [0, 0, 0],
      maxValue: 10
    });
    setMessagePosition(element.interaction?.messagePosition || 'bottom');
    setTargetCanvasId(element.interaction?.targetCanvasId || '');
    setCanCombineWith(element.interaction?.canCombineWith || []);
    
    if (element.interaction?.combinationResult) {
      setCombinationResultType(element.interaction?.combinationResult?.type || 'message');
      setCombinationResultMessage(element.interaction?.combinationResult?.message || '');
      setCombinationResultSound(element.interaction?.combinationResult?.soundUrl || '');
      setCombinationResultTargetCanvasId(element.interaction?.combinationResult?.targetCanvasId || '');
      setCombinationResultPuzzleType(element.interaction?.combinationResult?.puzzleType || 'puzzle');
    }
  }, [element.id, element.interaction, language]);

  const handleInteractionChange = (value: string) => {
    // Cast the string value to InteractionType to satisfy TypeScript
    const interactionType = value as InteractionType;
    setInteractionType(interactionType);
    
    const newInteraction: InteractionConfig = {
      type: interactionType
    };

    if (interactionType === 'message' && element.interaction?.message) {
      newInteraction.message = element.interaction.message;
      newInteraction.messagePosition = messagePosition;
    }
    
    if (interactionType === 'sound' && element.interaction?.soundUrl) {
      newInteraction.sound = element.interaction.sound;
      newInteraction.soundUrl = element.interaction.soundUrl;
    }
    
    if (interactionType === 'canvasNavigation' && targetCanvasId) {
      newInteraction.targetCanvasId = targetCanvasId;
    }
    
    if (interactionType === 'puzzle') {
      newInteraction.puzzleType = puzzleType;
      
      if (puzzleType === 'puzzle') {
        newInteraction.puzzleConfig = puzzleConfig;
      } else if (puzzleType === 'sequencePuzzle') {
        newInteraction.sequencePuzzleConfig = sequencePuzzleConfig;
      } else if (puzzleType === 'clickSequencePuzzle') {
        newInteraction.clickSequencePuzzleConfig = clickSequencePuzzleConfig;
      } else if (puzzleType === 'sliderPuzzle') {
        newInteraction.sliderPuzzleConfig = sliderPuzzleConfig;
      }
    }
    
    if (interactionType === 'combinable') {
      newInteraction.canCombineWith = canCombineWith;
      if (element.interaction?.combinationResult) {
        newInteraction.combinationResult = element.interaction.combinationResult;
      }
    }
    
    updateElement(element.id, {
      interaction: newInteraction
    });
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const message = e.target.value;
    updateElement(element.id, {
      interaction: {
        ...element.interaction,
        type: 'message',
        message,
        messagePosition
      }
    });
  };

  const handleMessagePositionChange = (position: MessagePosition) => {
    setMessagePosition(position);
    updateElement(element.id, {
      interaction: {
        ...element.interaction,
        type: 'message',
        messagePosition: position
      }
    });
  };

  const handleSoundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    if (!file.type.startsWith('audio/')) {
      toast.error(t('toast.error.file') || 'Invalid file type. Please upload an audio file.');
      return;
    }
    
    setSoundFile(file);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const soundDataUrl = event.target.result.toString();
        
        updateElement(element.id, {
          interaction: {
            ...element.interaction,
            type: 'sound',
            sound: file.name,
            soundUrl: soundDataUrl
          }
        });
        
        toast.success(t('toast.success.upload') || 'Sound file uploaded successfully!');
      }
    };
    reader.onerror = () => {
      toast.error(t('toast.error.upload') || 'Error uploading sound file.');
    };
    reader.readAsDataURL(file);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCanvasChange = (canvasId: string) => {
    setTargetCanvasId(canvasId);
    updateElement(element.id, {
      interaction: {
        ...element.interaction,
        type: 'canvasNavigation',
        targetCanvasId: canvasId
      }
    });
  };

  const handlePuzzleTypeChange = (type: ElementType) => {
    setPuzzleType(type);
    
    let updatedInteraction = {
      ...element.interaction,
      type: 'puzzle' as InteractionType,
      puzzleType: type
    };
    
    // Set default configs based on puzzle type
    if (type === 'puzzle') {
      updatedInteraction = {
        ...updatedInteraction,
        puzzleConfig
      };
    } else if (type === 'sequencePuzzle') {
      updatedInteraction = {
        ...updatedInteraction,
        sequencePuzzleConfig
      };
    } else if (type === 'clickSequencePuzzle') {
      updatedInteraction = {
        ...updatedInteraction,
        clickSequencePuzzleConfig
      };
    } else if (type === 'sliderPuzzle') {
      updatedInteraction = {
        ...updatedInteraction,
        sliderPuzzleConfig
      };
    }
    
    updateElement(element.id, {
      interaction: updatedInteraction
    });
  };

  // Regular Puzzle Configuration Handlers
  const handlePuzzleConfigChange = (field: keyof typeof puzzleConfig, value: any) => {
    const newConfig = { ...puzzleConfig, [field]: value };
    setPuzzleConfig(newConfig);
    
    updateElement(element.id, {
      interaction: {
        ...element.interaction,
        type: 'puzzle',
        puzzleType: 'puzzle',
        puzzleConfig: newConfig
      }
    });
  };

  const handlePuzzleImageTypeChange = (type: PuzzleType) => {
    let newSolution: number[] = [];
    
    // Initialize solution based on type and placeholders
    if (type === 'image') {
      newSolution = Array(puzzleConfig.placeholders).fill(0);
    } else if (type === 'number') {
      newSolution = Array(puzzleConfig.placeholders).fill(0);
    } else if (type === 'alphabet') {
      newSolution = Array(puzzleConfig.placeholders).fill(0);
    }
    
    const newConfig = {
      ...puzzleConfig,
      type,
      solution: newSolution
    };
    
    setPuzzleConfig(newConfig);
    
    updateElement(element.id, {
      interaction: {
        ...element.interaction,
        type: 'puzzle',
        puzzleType: 'puzzle',
        puzzleConfig: newConfig
      }
    });
  };

  const handlePuzzlePlaceholdersChange = (value: string) => {
    const numPlaceholders = parseInt(value);
    let newSolution = [...puzzleConfig.solution];
    
    if (numPlaceholders > puzzleConfig.solution.length) {
      for (let i = puzzleConfig.solution.length; i < numPlaceholders; i++) {
        newSolution.push(0);
      }
    } else if (numPlaceholders < puzzleConfig.solution.length) {
      newSolution = newSolution.slice(0, numPlaceholders);
    }
    
    const newConfig = {
      ...puzzleConfig,
      placeholders: numPlaceholders,
      solution: newSolution
    };
    
    setPuzzleConfig(newConfig);
    
    updateElement(element.id, {
      interaction: {
        ...element.interaction,
        type: 'puzzle',
        puzzleType: 'puzzle',
        puzzleConfig: newConfig
      }
    });
  };

  const handlePuzzleMaxNumberChange = (value: string) => {
    const maxNumber = parseInt(value);
    
    const newSolution = puzzleConfig.solution.map(val => 
      val > maxNumber ? 0 : val
    );
    
    const newConfig = {
      ...puzzleConfig,
      maxNumber,
      solution: newSolution
    };
    
    setPuzzleConfig(newConfig);
    
    updateElement(element.id, {
      interaction: {
        ...element.interaction,
        type: 'puzzle',
        puzzleType: 'puzzle',
        puzzleConfig: newConfig
      }
    });
  };

  const handlePuzzleMaxLetterChange = (value: string) => {
    const maxLetter = value;
    const maxLetterCode = maxLetter.charCodeAt(0) - 65;
    
    const newSolution = puzzleConfig.solution.map(val => 
      val > maxLetterCode ? 0 : val
    );
    
    const newConfig = {
      ...puzzleConfig,
      maxLetter,
      solution: newSolution
    };
    
    setPuzzleConfig(newConfig);
    
    updateElement(element.id, {
      interaction: {
        ...element.interaction,
        type: 'puzzle',
        puzzleType: 'puzzle',
        puzzleConfig: newConfig
      }
    });
  };

  const handleAddImage = () => {
    if (selectedImage && !puzzleConfig.images.includes(selectedImage)) {
      const newImages = [...puzzleConfig.images, selectedImage];
      
      const newConfig = {
        ...puzzleConfig,
        images: newImages
      };
      
      setPuzzleConfig(newConfig);
      setSelectedImage("");
      
      updateElement(element.id, {
        interaction: {
          ...element.interaction,
          type: 'puzzle',
          puzzleType: 'puzzle',
          puzzleConfig: newConfig
        }
      });
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = [...puzzleConfig.images];
    newImages.splice(index, 1);
    
    const newSolution = puzzleConfig.solution.map(solIndex => {
      if (solIndex === index) return 0;
      if (solIndex > index) return solIndex - 1;
      return solIndex;
    });
    
    const newConfig = {
      ...puzzleConfig,
      images: newImages,
      solution: newSolution
    };
    
    setPuzzleConfig(newConfig);
    
    updateElement(element.id, {
      interaction: {
        ...element.interaction,
        type: 'puzzle',
        puzzleType: 'puzzle',
        puzzleConfig: newConfig
      }
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    if (!file.type.startsWith('image/')) {
      toast.error(t('toast.error.file') || 'Invalid file type. Please upload an image file.');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const imageDataUrl = event.target.result.toString();
        const newImages = [...puzzleConfig.images, imageDataUrl];
        
        const newConfig = {
          ...puzzleConfig,
          images: newImages
        };
        
        setPuzzleConfig(newConfig);
        
        updateElement(element.id, {
          interaction: {
            ...element.interaction,
            type: 'puzzle',
            puzzleType: 'puzzle',
            puzzleConfig: newConfig
          }
        });
        
        toast.success(t('toast.success.upload') || 'Image uploaded successfully!');
      }
    };
    reader.onerror = () => {
      toast.error(t('toast.error.upload') || 'Error uploading image.');
    };
    reader.readAsDataURL(file);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handlePuzzleSolutionChange = (placeholderIndex: number, value: string) => {
    const newSolution = [...puzzleConfig.solution];
    newSolution[placeholderIndex] = parseInt(value);
    
    const newConfig = {
      ...puzzleConfig,
      solution: newSolution
    };
    
    setPuzzleConfig(newConfig);
    
    updateElement(element.id, {
      interaction: {
        ...element.interaction,
        type: 'puzzle',
        puzzleType: 'puzzle',
        puzzleConfig: newConfig
      }
    });
  };

  // Sequence Puzzle Configuration Handlers
  const handleSequenceNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    
    const newConfig = {
      ...sequencePuzzleConfig,
      name
    };
    
    setSequencePuzzleConfig(newConfig);
    
    updateElement(element.id, {
      interaction: {
        ...element.interaction,
        type: 'puzzle',
        puzzleType: 'sequencePuzzle',
        sequencePuzzleConfig: newConfig
      }
    });
  };

  const handleSequenceAddImage = () => {
    if (selectedImage && !sequencePuzzleConfig.images.includes(selectedImage)) {
      const newImages = [...sequencePuzzleConfig.images, selectedImage];
      const newSolution = [...Array(newImages.length).keys()]; // Default solution is sequential
      
      const newConfig = {
        ...sequencePuzzleConfig,
        images: newImages,
        solution: newSolution,
        currentOrder: newSolution.slice() // Copy the solution as current order
      };
      
      setSequencePuzzleConfig(newConfig);
      setSelectedImage("");
      
      updateElement(element.id, {
        interaction: {
          ...element.interaction,
          type: 'puzzle',
          puzzleType: 'sequencePuzzle',
          sequencePuzzleConfig: newConfig
        }
      });
    }
  };

  const handleSequenceRemoveImage = (index: number) => {
    const newImages = [...sequencePuzzleConfig.images];
    newImages.splice(index, 1);
    
    // Update solution indices to maintain valid references
    const newSolution = sequencePuzzleConfig.solution
      .filter(solutionIndex => solutionIndex !== index) // Remove the deleted image from solution
      .map(solutionIndex => solutionIndex > index ? solutionIndex - 1 : solutionIndex); // Adjust indices
    
    const newCurrentOrder = sequencePuzzleConfig.currentOrder
      .filter(orderIndex => orderIndex !== index) // Remove the deleted image from current order
      .map(orderIndex => orderIndex > index ? orderIndex - 1 : orderIndex); // Adjust indices
    
    const newConfig = {
      ...sequencePuzzleConfig,
      images: newImages,
      solution: newSolution,
      currentOrder: newCurrentOrder
    };
    
    setSequencePuzzleConfig(newConfig);
    
    updateElement(element.id, {
      interaction: {
        ...element.interaction,
        type: 'puzzle',
        puzzleType: 'sequencePuzzle',
        sequencePuzzleConfig: newConfig
      }
    });
  };

  const handleSequenceMoveImageUp = (index: number) => {
    if (index === 0) return; // Already at the top
    
    const newSolution = [...sequencePuzzleConfig.solution];
    
    // Swap the images in the solution array
    [newSolution[index], newSolution[index - 1]] = [newSolution[index - 1], newSolution[index]];
    
    const newConfig = {
      ...sequencePuzzleConfig,
      solution: newSolution
    };
    
    setSequencePuzzleConfig(newConfig);
    
    updateElement(element.id, {
      interaction: {
        ...element.interaction,
        type: 'puzzle',
        puzzleType: 'sequencePuzzle',
        sequencePuzzleConfig: newConfig
      }
    });
  };

  const handleSequenceMoveImageDown = (index: number) => {
    if (index === sequencePuzzleConfig.solution.length - 1) return; // Already at the bottom
    
    const newSolution = [...sequencePuzzleConfig.solution];
    
    // Swap the images in the solution array
    [newSolution[index], newSolution[index + 1]] = [newSolution[index + 1], newSolution[index]];
    
    const newConfig = {
      ...sequencePuzzleConfig,
      solution: newSolution
    };
    
    setSequencePuzzleConfig(newConfig);
    
    updateElement(element.id, {
      interaction: {
        ...element.interaction,
        type: 'puzzle',
        puzzleType: 'sequencePuzzle',
        sequencePuzzleConfig: newConfig
      }
    });
  };

  const handleSequenceImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    if (!file.type.startsWith('image/')) {
      toast.error(t('toast.error.file') || 'Invalid file type. Please upload an image file.');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const imageDataUrl = event.target.result.toString();
        
        const newImages = [...sequencePuzzleConfig.images, imageDataUrl];
        const newSolution = [...Array(newImages.length).keys()]; // Default solution is sequential
        
        const newConfig = {
          ...sequencePuzzleConfig,
          images: newImages,
          solution: newSolution,
          currentOrder: newSolution.slice() // Copy the solution as current order
        };
        
        setSequencePuzzleConfig(newConfig);
        
        updateElement(element.id, {
          interaction: {
            ...element.interaction,
            type: 'puzzle',
            puzzleType: 'sequencePuzzle',
            sequencePuzzleConfig: newConfig
          }
        });
        
        toast.success(t('toast.success.upload') || 'Image uploaded successfully!');
      }
    };
    reader.onerror = () => {
      toast.error(t('toast.error.upload') || 'Error uploading image.');
    };
    reader.readAsDataURL(file);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Slider Puzzle Configuration Handlers
  const handleSliderNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    
    const newConfig = {
      ...sliderPuzzleConfig,
      name
    };
    
    setSliderPuzzleConfig(newConfig);
    
    updateElement(element.id, {
      interaction: {
        ...element.interaction,
        type: 'puzzle',
        puzzleType: 'sliderPuzzle',
        sliderPuzzleConfig: newConfig
      }
    });
  };

  const handleSliderOrientationChange = (orientation: SliderOrientation) => {
    const newConfig = {
      ...sliderPuzzleConfig,
      orientation
    };
    
    setSliderPuzzleConfig(newConfig);
    
    updateElement(element.id, {
      interaction: {
        ...element.interaction,
        type: 'puzzle',
        puzzleType: 'sliderPuzzle',
        sliderPuzzleConfig: newConfig
      }
    });
  };

  const handleSliderCountChange = (value: string) => {
    const sliderCount = parseInt(value);
    let newSolution = [...sliderPuzzleConfig.solution];
    let newCurrentValues = [...sliderPuzzleConfig.currentValues];
    
    if (sliderCount > sliderPuzzleConfig.solution.length) {
      for (let i = sliderPuzzleConfig.solution.length; i < sliderCount; i++) {
        newSolution.push(0);
        newCurrentValues.push(0);
      }
    } else if (sliderCount < sliderPuzzleConfig.solution.length) {
      newSolution = newSolution.slice(0, sliderCount);
      newCurrentValues = newCurrentValues.slice(0, sliderCount);
    }
    
    const newConfig = {
      ...sliderPuzzleConfig,
      sliderCount: sliderCount,
      solution: newSolution,
      currentValues: newCurrentValues
    };
    
    setSliderPuzzleConfig(newConfig);
    
    updateElement(element.id, {
      interaction: {
        ...element.interaction,
        type: 'puzzle',
        puzzleType: 'sliderPuzzle',
        sliderPuzzleConfig: newConfig
      }
    });
  };

  const handleSliderMaxValueChange = (value: string) => {
    const maxValue = parseInt(value);
    
    const newSolution = sliderPuzzleConfig.solution.map(val => 
      val > maxValue ? maxValue : val
    );
    
    const newCurrentValues = sliderPuzzleConfig.currentValues.map(val =>
      val > maxValue ? maxValue : val
    );
    
    const newConfig = {
      ...sliderPuzzleConfig,
      maxValue,
      solution: newSolution,
      currentValues: newCurrentValues
    };
    
    setSliderPuzzleConfig(newConfig);
    
    updateElement(element.id, {
      interaction: {
        ...element.interaction,
        type: 'puzzle',
        puzzleType: 'sliderPuzzle',
        sliderPuzzleConfig: newConfig
      }
    });
  };

  const handleSliderSolutionChange = (sliderIndex: number, value: string) => {
    const newValue = parseInt(value);
    const newSolution = [...sliderPuzzleConfig.solution];
    newSolution[sliderIndex] = newValue > sliderPuzzleConfig.maxValue ? 
      sliderPuzzleConfig.maxValue : newValue;
    
    const newConfig = {
      ...sliderPuzzleConfig,
      solution: newSolution
    };
    
    setSliderPuzzleConfig(newConfig);
    
    updateElement(element.id, {
      interaction: {
        ...element.interaction,
        type: 'puzzle',
        puzzleType: 'sliderPuzzle',
        sliderPuzzleConfig: newConfig
      }
    });
  };

  const handleSliderCurrentValueChange = (sliderIndex: number, value: string) => {
    const newValue = parseInt(value);
    const newCurrentValues = [...sliderPuzzleConfig.currentValues];
    newCurrentValues[sliderIndex] = newValue > sliderPuzzleConfig.maxValue ? 
      sliderPuzzleConfig.maxValue : newValue;
    
    const newConfig = {
      ...sliderPuzzleConfig,
      currentValues: newCurrentValues
    };
    
    setSliderPuzzleConfig(newConfig);
    
    updateElement(element.id, {
      interaction: {
        ...element.interaction,
        type: 'puzzle',
        puzzleType: 'sliderPuzzle',
        sliderPuzzleConfig: newConfig
      }
    });
  };

  // Combinable items handlers
  const handleItemCombinableToggle = (elementId: string) => {
    let newCanCombineWith: string[];
    
    if (canCombineWith.includes(elementId)) {
      newCanCombineWith = canCombineWith.filter(id => id !== elementId);
    } else {
      newCanCombineWith = [...canCombineWith, elementId];
    }
    
    setCanCombineWith(newCanCombineWith);
    
    updateElement(element.id, {
      interaction: {
        ...element.interaction,
        type: 'combinable',
        canCombineWith: newCanCombineWith
      }
    });
  };

  const handleCombinationResultTypeChange = (type: CombinationResultType) => {
    setCombinationResultType(type);
    
    const combinationResult = {
      type
    };
    
    // Add specific properties based on type
    if (type === 'message' && combinationResultMessage) {
      Object.assign(combinationResult, { 
        message: combinationResultMessage,
        messagePosition: messagePosition
      });
    } else if (type === 'sound' && combinationResultSound) {
      Object.assign(combinationResult, { soundUrl: combinationResultSound });
    } else if (type === 'canvasNavigation' && combinationResultTargetCanvasId) {
      Object.assign(combinationResult, { targetCanvasId: combinationResultTargetCanvasId });
    } else if (type === 'puzzle') {
      Object.assign(combinationResult, { puzzleType: combinationResultPuzzleType });
      
      // Add the appropriate puzzle config based on the puzzle type
      if (combinationResultPuzzleType === 'puzzle') {
        Object.assign(combinationResult, { puzzleConfig });
      } else if (combinationResultPuzzleType === 'sequencePuzzle') {
        Object.assign(combinationResult, { sequencePuzzleConfig });
      } else if (combinationResultPuzzleType === 'clickSequencePuzzle') {
        Object.assign(combinationResult, { clickSequencePuzzleConfig });
      } else if (combinationResultPuzzleType === 'sliderPuzzle') {
        Object.assign(combinationResult, { sliderPuzzleConfig });
      }
    }
    
    updateElement(element.id, {
      interaction: {
        ...element.interaction,
        type: 'combinable',
        canCombineWith,
        combinationResult
      }
    });
  };

  const handleCombinationResultMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const message = e.target.value;
    setCombinationResultMessage(message);
    
    if (combinationResultType === 'message') {
      updateElement(element.id, {
        interaction: {
          ...element.interaction,
          type: 'combinable',
          canCombineWith,
          combinationResult: {
            ...element.interaction?.combinationResult,
            type: 'message',
            message,
            messagePosition
          }
        }
      });
    }
  };

  const handleCombinationResultPuzzleTypeChange = (type: ElementType) => {
    setCombinationResultPuzzleType(type);
    
    if (combinationResultType === 'puzzle') {
      let updatedCombinationResult: any = {
        ...element.interaction?.combinationResult,
        type: 'puzzle',
        puzzleType: type
      };
      
      // Set appropriate puzzle config
      if (type === 'puzzle') {
        updatedCombinationResult.puzzleConfig = puzzleConfig;
      } else if (type === 'sequencePuzzle') {
        updatedCombinationResult.sequencePuzzleConfig = sequencePuzzleConfig;
      } else if (type === 'clickSequencePuzzle') {
        updatedCombinationResult.clickSequencePuzzleConfig = clickSequencePuzzleConfig;
      } else if (type === 'sliderPuzzle') {
        updatedCombinationResult.sliderPuzzleConfig = sliderPuzzleConfig;
      }
      
      updateElement(element.id, {
        interaction: {
          ...element.interaction,
          type: 'combinable',
          canCombineWith,
          combinationResult: updatedCombinationResult
        }
      });
    }
  };

  const handleCombinationResultCanvasChange = (canvasId: string) => {
    setCombinationResultTargetCanvasId(canvasId);
    
    if (combinationResultType === 'canvasNavigation') {
      updateElement(element.id, {
        interaction: {
          ...element.interaction,
          type: 'combinable',
          canCombineWith,
          combinationResult: {
            ...element.interaction?.combinationResult,
            type: 'canvasNavigation',
            targetCanvasId: canvasId
          }
        }
      });
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  // Helper function to get combinable items
  const getCombinableItems = () => {
    return elements.filter(el => 
      el.id !== element.id && 
      !['background', 'puzzle', 'sequencePuzzle', 'clickSequencePuzzle', 'sliderPuzzle'].includes(el.type)
    );
  };

  const renderInteractionContent = () => {
    switch (interactionType) {
      case 'message':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="message">Message Text</Label>
              <Input
                id="message"
                value={element.interaction?.message || ''}
                onChange={handleMessageChange}
                placeholder="Enter message to show"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Message Position</Label>
              <RadioGroup 
                value={messagePosition} 
                onValueChange={(val) => handleMessagePositionChange(val as MessagePosition)}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="bottom" id="position-bottom" />
                  <Label htmlFor="position-bottom">Bottom</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="top" id="position-top" />
                  <Label htmlFor="position-top">Top</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        );
      
      case 'sound':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Sound File</Label>
              <div className="flex items-center gap-2">
                <Input
                  readOnly
                  value={element.interaction?.sound || 'No sound selected'}
                />
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleSoundUpload}
                  accept="audio/*"
                  className="hidden"
                />
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={handleBrowseClick}
                >
                  <Upload className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {element.interaction?.soundUrl && (
              <div className="space-y-2">
                <Label>Sound Preview</Label>
                <audio 
                  controls 
                  src={element.interaction.soundUrl} 
                  className="w-full"
                />
              </div>
            )}
          </div>
        );
      
      case 'canvasNavigation':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="target-canvas">Target Canvas</Label>
              <Select
                value={targetCanvasId}
                onValueChange={handleCanvasChange}
              >
                <SelectTrigger id="target-canvas">
                  <SelectValue placeholder="Select target canvas" />
                </SelectTrigger>
                <SelectContent>
                  {canvases.map((canvas, index) => (
                    <SelectItem key={canvas.id} value={canvas.id}>
                      {canvas.name || `Canvas ${index + 1}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      
      case 'puzzle':
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="puzzle-type">Puzzle Type</Label>
              <Select
                value={puzzleType}
                onValueChange={handlePuzzleTypeChange}
              >
                <SelectTrigger id="puzzle-type">
                  <SelectValue placeholder="Select puzzle type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="puzzle" className="flex items-center">
                    <Lock className="h-4 w-4 mr-2" />
                    Image/Number/Alphabet Puzzle
                  </SelectItem>
                  <SelectItem value="sequencePuzzle">
                    <ArrowUpDown className="h-4 w-4 mr-2" />
                    Sequence Puzzle
                  </SelectItem>
                  <SelectItem value="clickSequencePuzzle">
                    <MousePointer className="h-4 w-4 mr-2" />
                    Click Sequence Puzzle
                  </SelectItem>
                  <SelectItem value="sliderPuzzle">
                    <Sliders className="h-4 w-4 mr-2" />
                    Slider Puzzle
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {puzzleType === 'puzzle' && (
              <div className="space-y-4 border p-4 rounded-md">
                <h3 className="font-medium text-sm">Standard Puzzle Configuration</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="puzzle-name">Puzzle Name</Label>
                  <Input 
                    id="puzzle-name" 
                    value={puzzleConfig.name} 
                    onChange={(e) => handlePuzzleConfigChange('name', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="puzzle-image-type">Puzzle Type</Label>
                  <RadioGroup 
                    value={puzzleConfig.type}
                    onValueChange={(value) => handlePuzzleImageTypeChange(value as PuzzleType)}
                    className="flex flex-wrap gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="image" id="image-puzzle" />
                      <Label htmlFor="image-puzzle" className="flex items-center">
                        <Lock className="h-4 w-4 mr-1" />
                        Image Lock
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
                      <RadioGroupItem value="alphabet" id="alphabet-puzzle" />
                      <Label htmlFor="alphabet-puzzle" className="flex items-center">
                        <Languages className="h-4 w-4 mr-1" />
                        Alphabet Lock
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="placeholders">
                    {puzzleConfig.type === 'image' ? 'Placeholders' : 
                     puzzleConfig.type === 'number' ? 'Digits' :
                     'Letters'}
                  </Label>
                  <Select 
                    value={puzzleConfig.placeholders.toString()} 
                    onValueChange={handlePuzzlePlaceholdersChange}
                  >
                    <SelectTrigger id="placeholders">
                      <SelectValue placeholder="Select number" />
                    </SelectTrigger>
                    <SelectContent>
                      {[2, 3, 4, 5, 6].map(num => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} {puzzleConfig.type === 'image' ? 
                                 language === 'en' ? 'placeholders' : 'מיקומים' : 
                                 puzzleConfig.type === 'number' ? 
                                 language === 'en' ? 'digits' : 'ספרות' : 
                                 language === 'en' ? 'letters' : 'אותיות'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {puzzleConfig.type === 'number' && (
                  <div className="space-y-2">
                    <Label htmlFor="max-number">Maximum Number</Label>
                    <Select 
                      value={puzzleConfig.maxNumber?.toString() || "9"} 
                      onValueChange={handlePuzzleMaxNumberChange}
                    >
                      <SelectTrigger id="max-number">
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
                
                {puzzleConfig.type === 'alphabet' && (
                  <div className="space-y-2">
                    <Label htmlFor="max-letter">Maximum Letter</Label>
                    <Select 
                      value={puzzleConfig.maxLetter?.toString() || "Z"} 
                      onValueChange={handlePuzzleMaxLetterChange}
                    >
                      <SelectTrigger id="max-letter">
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
                
                {puzzleConfig.type === 'image' && (
                  <div className="space-y-2">
                    <Label>Image Collection</Label>
                    <div className="mt-2 space-y-3">
                      <div className="flex items-center gap-2">
                        <Select value={selectedImage} onValueChange={setSelectedImage}>
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Select image" />
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
                          onChange={handleImageUpload}
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
                          <div className="text-xs text-center mt-1">
                            {language === 'en' ? `Image ${idx + 1}` : `תמונה ${idx + 1}`}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {puzzleConfig.images.length === 0 && (
                      <div className="text-sm text-gray-500 text-center py-4">
                        Add images to your puzzle
                      </div>
                    )}
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label>Solution</Label>
                  <div className="space-y-2 mt-2">
                    {Array.from({ length: puzzleConfig.placeholders }).map((_, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="text-sm font-medium w-24">
                          {puzzleConfig.type === 'image' ? 
                            `Placeholder ${idx + 1}:` : 
                           puzzleConfig.type === 'number' ? 
                            `Digit ${idx + 1}:` :
                            `Letter ${idx + 1}:`}
                        </span>
                        <Select 
                          value={puzzleConfig.solution[idx]?.toString() || "0"} 
                          onValueChange={(val) => handlePuzzleSolutionChange(idx, val)}
                        >
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder={
                              puzzleConfig.type === 'image' ? 
                              'Select correct image' : 
                              puzzleConfig.type === 'number' ? 
                              'Select correct number' : 
                              'Select correct letter'
                            } />
                          </SelectTrigger>
                          <SelectContent>
                            {puzzleConfig.type === 'image'
                              ? puzzleConfig.images.map((_, imgIdx) => (
                                  <SelectItem key={imgIdx} value={imgIdx.toString()}>
                                    {language === 'en' ? `Image ${imgIdx + 1}` : `תמונה ${imgIdx + 1}`}
                                  </SelectItem>
                                ))
                              : puzzleConfig.type === 'number'
                                ? Array.from({ length: (puzzleConfig.maxNumber || 9) + 1 }).map((_, numIdx) => (
                                    <SelectItem key={numIdx} value={numIdx.toString()}>
                                      {numIdx}
                                    </SelectItem>
                                  ))
                                : Array.from({ 
                                    length: (puzzleConfig.maxLetter?.charCodeAt(0) || 90) - 64
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
              </div>
            )}
            
            {puzzleType === 'sequencePuzzle' && (
              <div className="space-y-4 border p-4 rounded-md">
                <h3 className="font-medium text-sm">Sequence Puzzle Configuration</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="sequence-puzzle-name">Puzzle Name</Label>
                  <Input 
                    id="sequence-puzzle-name" 
                    value={sequencePuzzleConfig.name} 
                    onChange={handleSequenceNameChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Image Collection</Label>
                  <div className="mt-2 space-y-3">
                    <div className="flex items-center gap-2">
                      <Select value={selectedImage} onValueChange={setSelectedImage}>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Select image" />
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
                        onClick={handleSequenceAddImage}
                        disabled={!selectedImage}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleSequenceImageUpload}
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
                  
                  <div className="mt-4">
                    <Label className="mb-2 block">
                      Sequence Order (correct solution)
                    </Label>
                    <div className="space-y-2">
                      {sequencePuzzleConfig.solution.map((imageIndex, solutionPosition) => (
                        <div key={solutionPosition} className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                          <div className="flex-shrink-0 w-10 h-10 bg-white border rounded overflow-hidden">
                            {sequencePuzzleConfig.images[imageIndex] && (
                              <img 
                                src={sequencePuzzleConfig.images[imageIndex]} 
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
                              onClick={() => handleSequenceMoveImageUp(solutionPosition)}
                              disabled={solutionPosition === 0}
                            >
                              <ArrowUp className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => handleSequenceMoveImageDown(solutionPosition)}
                              disabled={solutionPosition === sequencePuzzleConfig.solution.length - 1}
                            >
                              <ArrowDown className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 mt-4">
                    {sequencePuzzleConfig.images.map((img, idx) => (
                      <div key={idx} className="relative group">
                        <img 
                          src={img} 
                          alt={`Image ${idx + 1}`} 
                          className="h-16 w-full object-cover rounded border"
                        />
                        <button
                          onClick={() => handleSequenceRemoveImage(idx)}
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
                  
                  {sequencePuzzleConfig.images.length === 0 && (
                    <div className="text-sm text-gray-500 text-center py-4">
                      Add images to your sequence puzzle
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {puzzleType === 'sliderPuzzle' && (
              <div className="space-y-4 border p-4 rounded-md">
                <h3 className="font-medium text-sm">Slider Puzzle Configuration</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="slider-puzzle-name">Puzzle Name</Label>
                  <Input 
                    id="slider-puzzle-name" 
                    value={sliderPuzzleConfig.name} 
                    onChange={handleSliderNameChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="slider-orientation" className="mb-2 block">Slider Orientation</Label>
                  <RadioGroup 
                    value={sliderPuzzleConfig.orientation}
                    onValueChange={(value) => handleSliderOrientationChange(value as SliderOrientation)}
                    className="flex flex-wrap gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="horizontal" id="horizontal-slider" />
                      <Label htmlFor="horizontal-slider" className="flex items-center">
                        <ArrowUp className="h-4 w-4 mr-1 rotate-90" />
                        Horizontal
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="vertical" id="vertical-slider" />
                      <Label htmlFor="vertical-slider" className="flex items-center">
                        <ArrowUp className="h-4 w-4 mr-1" />
                        Vertical
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="slider-count">Slider Count</Label>
                  <Select 
                    value={sliderPuzzleConfig.sliderCount.toString()} 
                    onValueChange={handleSliderCountChange}
                  >
                    <SelectTrigger id="slider-count">
                      <SelectValue placeholder="Select number" />
                    </SelectTrigger>
                    <SelectContent>
                      {[2, 3, 4, 5, 6].map(num => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} {language === 'en' ? 'sliders' : 'מחוונים'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="max-value">Maximum Value</Label>
                  <Select 
                    value={sliderPuzzleConfig.maxValue?.toString() || "10"} 
                    onValueChange={handleSliderMaxValueChange}
                  >
                    <SelectTrigger id="max-value">
                      <SelectValue placeholder="Select max value" />
                    </SelectTrigger>
                    <SelectContent>
                      {[5, 10, 15, 20, 25].map(num => (
                        <SelectItem key={num} value={num.toString()}>
                          {num}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Slider Solutions</Label>
                  <div className="space-y-2 mt-2">
                    {Array.from({ length: sliderPuzzleConfig.sliderCount }).map((_, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="text-sm font-medium w-24">
                          {`Slider ${idx + 1}:`}
                        </span>
                        <Select 
                          value={sliderPuzzleConfig.solution[idx]?.toString() || "0"} 
                          onValueChange={(val) => handleSliderSolutionChange(idx, val)}
                        >
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Select correct value" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: sliderPuzzleConfig.maxValue + 1 }).map((_, numIdx) => (
                              <SelectItem key={numIdx} value={numIdx.toString()}>
                                {numIdx}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
        
      case 'combinable':
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Select Items That Can Be Combined</Label>
              <div className="max-h-60 overflow-y-auto border rounded-md p-2">
                <div className="space-y-2">
                  {getCombinableItems().map(item => (
                    <div key={item.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`item-${item.id}`} 
                        checked={canCombineWith.includes(item.id)}
                        onCheckedChange={() => handleItemCombinableToggle(item.id)}
                      />
                      <Label htmlFor={`item-${item.id}`} className="cursor-pointer flex-1">
                        {item.name || (item.content ? item.content.substring(0, 20) : item.type)}
                      </Label>
                    </div>
                  ))}
                  
                  {getCombinableItems().length === 0 && (
                    <div className="text-sm text-gray-500 py-2 text-center">
                      No suitable items available for combination
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Combination Result</Label>
              <Select
                value={combinationResultType}
                onValueChange={(value) => handleCombinationResultTypeChange(value as CombinationResultType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select result type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="message">
                    <MessageCircle className="h-4 w-4 mr-2 inline-block" />
                    Show Message
                  </SelectItem>
                  <SelectItem value="sound">
                    <Volume2 className="h-4 w-4 mr-2 inline-block" />
                    Play Sound
                  </SelectItem>
                  <SelectItem value="canvasNavigation">
                    <Navigation className="h-4 w-4 mr-2 inline-block" />
                    Navigate to Canvas
                  </SelectItem>
                  <SelectItem value="puzzle">
                    <Lock className="h-4 w-4 mr-2 inline-block" />
                    Show Puzzle
                  </SelectItem>
                </SelectContent>
              </Select>
              
              {combinationResultType === 'message' && (
                <div className="space-y-2 mt-3">
                  <Label htmlFor="combination-message">Message Text</Label>
                  <Input
                    id="combination-message"
                    value={combinationResultMessage}
                    onChange={handleCombinationResultMessageChange}
                    placeholder="Enter message to show"
                  />
                  
                  <div className="space-y-2">
                    <Label>Message Position</Label>
                    <RadioGroup 
                      value={messagePosition} 
                      onValueChange={(val) => handleMessagePositionChange(val as MessagePosition)}
                      className="flex space-x-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="bottom" id="result-position-bottom" />
                        <Label htmlFor="result-position-bottom">Bottom</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="top" id="result-position-top" />
                        <Label htmlFor="result-position-top">Top</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              )}
              
              {combinationResultType === 'canvasNavigation' && (
                <div className="space-y-2 mt-3">
                  <Label htmlFor="combination-canvas">Target Canvas</Label>
                  <Select
                    value={combinationResultTargetCanvasId}
                    onValueChange={handleCombinationResultCanvasChange}
                  >
                    <SelectTrigger id="combination-canvas">
                      <SelectValue placeholder="Select target canvas" />
                    </SelectTrigger>
                    <SelectContent>
                      {canvases.map((canvas, index) => (
                        <SelectItem key={canvas.id} value={canvas.id}>
                          {canvas.name || `Canvas ${index + 1}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              {combinationResultType === 'puzzle' && (
                <div className="space-y-2 mt-3">
                  <Label htmlFor="combination-puzzle-type">Puzzle Type</Label>
                  <Select
                    value={combinationResultPuzzleType}
                    onValueChange={handleCombinationResultPuzzleTypeChange}
                  >
                    <SelectTrigger id="combination-puzzle-type">
                      <SelectValue placeholder="Select puzzle type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="puzzle" className="flex items-center">
                        <Lock className="h-4 w-4 mr-2" />
                        Image/Number/Alphabet Puzzle
                      </SelectItem>
                      <SelectItem value="sequencePuzzle">
                        <ArrowUpDown className="h-4 w-4 mr-2" />
                        Sequence Puzzle
                      </SelectItem>
                      <SelectItem value="clickSequencePuzzle">
                        <MousePointer className="h-4 w-4 mr-2" />
                        Click Sequence Puzzle
                      </SelectItem>
                      <SelectItem value="sliderPuzzle">
                        <Sliders className="h-4 w-4 mr-2" />
                        Slider Puzzle
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {/* Note: In a full implementation, you would include the full puzzle configuration here */}
                  <div className="text-sm text-gray-500 mt-2">
                    Configure the {combinationResultPuzzleType} properties in the interactive mode
                  </div>
                </div>
              )}
            </div>
          </div>
        );
        
      case 'addToInventory':
        return (
          <div className="flex flex-col items-center justify-center my-6 text-center">
            <Paperclip className="h-12 w-12 text-gray-400 mb-2" />
            <p className="text-sm text-gray-600">
              This element will be added to the player's inventory when clicked.
            </p>
          </div>
        );
      
      default:
        return (
          <div className="flex flex-col items-center justify-center my-6 text-center">
            <FileUp className="h-12 w-12 text-gray-400 mb-2" />
            <p className="text-sm text-gray-600">
              Select an interaction type to configure it.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Interaction Setup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="interaction-type">Interaction Type</Label>
            <Select
              value={interactionType}
              onValueChange={handleInteractionChange}
            >
              <SelectTrigger id="interaction-type">
                <SelectValue placeholder="Select interaction type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="message">
                  <MessageCircle className="h-4 w-4 mr-2 inline-block" />
                  Show Message
                </SelectItem>
                <SelectItem value="sound">
                  <Volume2 className="h-4 w-4 mr-2 inline-block" />
                  Play Sound
                </SelectItem>
                <SelectItem value="canvasNavigation">
                  <Navigation className="h-4 w-4 mr-2 inline-block" />
                  Navigate to Canvas
                </SelectItem>
                <SelectItem value="puzzle">
                  <Lock className="h-4 w-4 mr-2 inline-block" />
                  Show Puzzle
                </SelectItem>
                <SelectItem value="addToInventory">
                  <Paperclip className="h-4 w-4 mr-2 inline-block" />
                  Add to Inventory
                </SelectItem>
                <SelectItem value="combinable">
                  <Lock className="h-4 w-4 mr-2 inline-block" />
                  Combinable with Items
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {renderInteractionContent()}
        </CardContent>
      </Card>
    </div>
  );
};

export default InteractionProperties;
