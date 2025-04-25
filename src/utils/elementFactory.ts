
import { ElementType, DesignElement, generateId, PuzzleType, SliderOrientation } from "@/types/designTypes";

// Default positions for new elements
export const getDefaultPosition = (canvasRef: HTMLDivElement | null) => {
  if (!canvasRef) return { x: 100, y: 100 };
  
  return {
    x: canvasRef.clientWidth / 2 - 50,
    y: canvasRef.clientHeight / 2 - 50
  };
};

// Get default placeholder size for images
export const getDefaultImageSize = (canvasRef: HTMLDivElement | null) => {
  if (!canvasRef) return { width: 200, height: 150 };
  
  // Calculate a reasonable default size based on canvas size
  const width = Math.min(200, canvasRef.clientWidth * 0.3);
  const height = Math.min(150, canvasRef.clientHeight * 0.3);
  
  return { width, height };
};

// Factory function to create new elements
export const createNewElement = (
  type: ElementType, 
  position: { x: number; y: number }, 
  layer: number,
  props?: any
): DesignElement => {
  switch (type) {
    case 'rectangle':
      return {
        id: generateId(),
        type,
        position,
        size: { width: 100, height: 80 },
        style: { backgroundColor: '#8B5CF6', borderRadius: '4px', transform: 'rotate(0deg)' },
        layer
      };
      
    case 'circle':
      return {
        id: generateId(),
        type,
        position,
        size: { width: 100, height: 100 },
        style: { backgroundColor: '#8B5CF6', transform: 'rotate(0deg)' },
        layer
      };
      
    case 'triangle':
      return {
        id: generateId(),
        type,
        position,
        size: { width: 50, height: 100 },
        style: { backgroundColor: '#8B5CF6', transform: 'rotate(0deg)' },
        layer
      };
      
    case 'line':
      return {
        id: generateId(),
        type,
        position,
        size: { width: 100, height: 2 },
        style: { backgroundColor: '#8B5CF6', transform: 'rotate(0deg)' },
        layer
      };
      
    case 'heading':
      return {
        id: generateId(),
        type,
        position,
        content: 'Add a heading',
        size: { width: 300, height: 50 },
        style: { color: '#1F2937', transform: 'rotate(0deg)' },
        layer
      };
      
    case 'subheading':
      return {
        id: generateId(),
        type,
        position,
        content: 'Add a subheading',
        size: { width: 250, height: 40 },
        style: { color: '#1F2937', transform: 'rotate(0deg)' },
        layer
      };
      
    case 'paragraph':
      return {
        id: generateId(),
        type,
        position,
        content: 'Add your text here. Click to edit this text.',
        size: { width: 300, height: 100 },
        style: { color: '#1F2937', transform: 'rotate(0deg)' },
        layer
      };
      
    case 'image':
      // If props includes size, use that; otherwise, use default
      const initialSize = props?.size || { width: 200, height: 150 };
      
      // Create a base image element with the required fields
      const baseImageElement = {
        id: generateId(),
        type,
        position,
        size: initialSize,
        originalSize: props?.originalSize || initialSize,
        style: { transform: 'rotate(0deg)' },
        layer
      };
      
      // Create a complete image element by casting to DesignElement
      // This allows us to add the optional image-specific properties
      const imageElement = baseImageElement as DesignElement;

      // Copy all image-specific properties if they exist in props
      if (props?.dataUrl) imageElement.dataUrl = props.dataUrl;
      if (props?.thumbnailDataUrl) imageElement.thumbnailDataUrl = props.thumbnailDataUrl;
      if (props?.src) imageElement.src = props.src;
      if (props?.cacheKey) imageElement.cacheKey = props.cacheKey;
      if (props?.fileMetadata) imageElement.fileMetadata = props.fileMetadata;
      if (props?.file) imageElement.file = props.file;
      
      console.log("ElementFactory - Creating new image element with properties:", {
        hasDataUrl: !!props?.dataUrl,
        hasThumbnail: !!props?.thumbnailDataUrl,
        hasSrc: !!props?.src,
        hasCacheKey: !!props?.cacheKey,
        hasFileMetadata: !!props?.fileMetadata,
        hasFile: !!props?.file
      });
      
      return imageElement;
      
    case 'background':
      return {
        id: generateId(),
        type,
        position: { x: 0, y: 0 },
        style: props?.gradient 
          ? { background: props.gradient } 
          : { backgroundColor: props?.color || '#FFFFFF' },
        layer: 0 // Background is always at layer 0
      };

    case 'puzzle':
      const puzzleType = props?.puzzleConfig?.type || 'image';
      return {
        id: generateId(),
        type,
        position,
        size: { width: 150, height: 150 },
        style: { backgroundColor: '#F3F4F6', borderRadius: '8px', transform: 'rotate(0deg)' },
        layer,
        puzzleConfig: props?.puzzleConfig || {
          name: 'Puzzle',
          type: puzzleType as PuzzleType,
          placeholders: 3,
          images: [],
          solution: [],
          maxNumber: puzzleType === 'number' ? 9 : undefined,
          maxLetter: puzzleType === 'alphabet' ? 'Z' : undefined
        }
      };

    case 'sequencePuzzle':
      return {
        id: generateId(),
        type,
        position,
        size: { width: 350, height: 150 },
        style: { backgroundColor: '#EFF6FF', borderRadius: '8px', transform: 'rotate(0deg)' },
        layer,
        sequencePuzzleConfig: props?.sequencePuzzleConfig || {
          name: props?.name || 'Sequence Puzzle',
          images: [],
          solution: [],
          currentOrder: []
        }
      };
      
    case 'clickSequencePuzzle':
      return {
        id: generateId(),
        type,
        position,
        size: { width: 350, height: 150 },
        style: { backgroundColor: '#E8F5E9', borderRadius: '8px', transform: 'rotate(0deg)' }, // Green background to differentiate
        layer,
        clickSequencePuzzleConfig: props?.clickSequencePuzzleConfig || {
          name: props?.name || 'Click Sequence Puzzle',
          images: [],
          solution: [],
          clickedIndices: []
        }
      };
      
    case 'sliderPuzzle':
      const orientation = props?.sliderPuzzleConfig?.orientation || 'horizontal';
      const sliderCount = props?.sliderPuzzleConfig?.sliderCount || 3;
      const maxValue = props?.sliderPuzzleConfig?.maxValue || 10;
      
      // Generate initial values and solution
      const initialValues = Array(sliderCount).fill(0);
      const solution = Array(sliderCount).fill(0).map(() => Math.floor(Math.random() * maxValue));
      
      return {
        id: generateId(),
        type,
        position,
        size: { 
          width: orientation === 'horizontal' ? 300 : 150, 
          height: orientation === 'horizontal' ? 150 : 300 
        },
        style: { 
          backgroundColor: '#F0F9FF', // Light blue background
          borderRadius: '8px', 
          transform: 'rotate(0deg)' 
        },
        layer,
        sliderPuzzleConfig: props?.sliderPuzzleConfig || {
          name: props?.name || 'Slider Puzzle',
          orientation: orientation as SliderOrientation,
          sliderCount,
          solution,
          currentValues: initialValues,
          maxValue
        }
      };
      
    default:
      return {
        id: generateId(),
        type: 'rectangle',
        position,
        size: { width: 100, height: 80 },
        style: { backgroundColor: '#8B5CF6', transform: 'rotate(0deg)' },
        layer
      };
  }
};
