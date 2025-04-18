import { ElementType, DesignElement, generateId, PuzzleType, SliderOrientation } from "@/types/designTypes";

// Default positions for new elements
export const getDefaultPosition = (canvasRef: HTMLDivElement | null) => {
  if (!canvasRef) return { x: 100, y: 100 };
  
  // Use fixed canvas dimensions for consistent centering
  const CANVAS_WIDTH = 1600;
  const CANVAS_HEIGHT = 900;
  
  return {
    x: (CANVAS_WIDTH / 2) - 100, // Offset by half the default element width
    y: (CANVAS_HEIGHT / 2) - 75  // Offset by half the default element height
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
      const initialSize = props?.size || { width: 200, height: 150 };
      
      // Calculate centered position
      let centerX = position.x;
      let centerY = position.y;
      
      if (props?.originalSize) {
        // If we have original size, use it to center the image
        centerX = position.x - (props.originalSize.width * 0.5);
        centerY = position.y - (props.originalSize.height * 0.5);
      } else {
        // Use initial size for centering
        centerX = position.x - (initialSize.width * 0.5);
        centerY = position.y - (initialSize.height * 0.5);
      }
      
      return {
        id: generateId(),
        type,
        position: { x: centerX, y: centerY },
        size: initialSize,
        originalSize: props?.originalSize || initialSize,
        src: props?.src,
        style: { transform: 'rotate(0deg)' },
        layer,
        dataUrl: props?.dataUrl,
        thumbnailDataUrl: props?.thumbnailDataUrl
      };
      
    case 'background':
      return {
        id: generateId(),
        type,
        position: { x: 0, y: 0 },
        style: props?.gradient 
          ? { background: props.gradient } 
          : { backgroundColor: props?.color || '#FFFFFF' },
        layer: 0
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
        style: { backgroundColor: '#E8F5E9', borderRadius: '8px', transform: 'rotate(0deg)' },
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
          backgroundColor: '#F0F9FF',
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
