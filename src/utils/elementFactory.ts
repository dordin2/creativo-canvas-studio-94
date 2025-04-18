import { ElementType, DesignElement, generateId, PuzzleType, SliderOrientation } from "@/types/designTypes";

// Get canvas center point and account for element size
export const getDefaultPosition = (canvasRef: HTMLDivElement | null, elementSize = { width: 0, height: 0 }) => {
  if (!canvasRef) return { x: 100, y: 100 };
  
  return {
    x: Math.max(0, (canvasRef.clientWidth / 2) - (elementSize.width / 2)),
    y: Math.max(0, (canvasRef.clientHeight / 2) - (elementSize.height / 2))
  };
};

// Get default placeholder size for images
export const getDefaultImageSize = (canvasRef: HTMLDivElement | null) => {
  if (!canvasRef) return { width: 200, height: 150 };
  
  // Use the actual canvas dimensions, not the scaled dimensions
  const canvasWidth = 1600; // Fixed canvas width
  const canvasHeight = 900; // Fixed canvas height
  
  const MAX_CANVAS_IMAGE_SIZE_PERCENT = 0.5;
  // Calculate a size that's 50% of the original canvas dimensions
  const width = Math.min(canvasWidth * MAX_CANVAS_IMAGE_SIZE_PERCENT, canvasWidth * 0.3);
  const height = Math.min(canvasHeight * MAX_CANVAS_IMAGE_SIZE_PERCENT, canvasHeight * 0.3);
  
  return { width, height };
};

// Factory function to create new elements
export const createNewElement = (
  type: ElementType, 
  canvasRef: HTMLDivElement | null,
  layer: number,
  props?: any
): DesignElement => {
  let size = { width: 100, height: 100 }; // Default size
  
  // Define size based on element type
  switch (type) {
    case 'rectangle':
      size = { width: 100, height: 80 };
      break;
    case 'circle':
      size = { width: 100, height: 100 };
      break;
    case 'triangle':
      size = { width: 50, height: 100 };
      break;
    case 'line':
      size = { width: 100, height: 2 };
      break;
    case 'heading':
      size = { width: 300, height: 50 };
      break;
    case 'subheading':
      size = { width: 250, height: 40 };
      break;
    case 'paragraph':
      size = { width: 300, height: 100 };
      break;
    case 'image':
      size = props?.size || getDefaultImageSize(canvasRef);
      break;
    case 'puzzle':
      size = { width: 150, height: 150 };
      break;
    case 'sequencePuzzle':
    case 'clickSequencePuzzle':
      size = { width: 350, height: 150 };
      break;
    case 'sliderPuzzle':
      const orientation = props?.sliderPuzzleConfig?.orientation || 'horizontal';
      size = {
        width: orientation === 'horizontal' ? 300 : 150,
        height: orientation === 'horizontal' ? 150 : 300
      };
      break;
  }
  
  // Get centered position based on element size
  const position = getDefaultPosition(canvasRef, size);
  
  switch (type) {
    case 'rectangle':
      return {
        id: generateId(),
        type,
        position,
        size,
        style: { backgroundColor: '#8B5CF6', borderRadius: '4px', transform: 'rotate(0deg)' },
        layer
      };
      
    case 'circle':
      return {
        id: generateId(),
        type,
        position,
        size,
        style: { backgroundColor: '#8B5CF6', transform: 'rotate(0deg)' },
        layer
      };
      
    case 'triangle':
      return {
        id: generateId(),
        type,
        position,
        size,
        style: { backgroundColor: '#8B5CF6', transform: 'rotate(0deg)' },
        layer
      };
      
    case 'line':
      return {
        id: generateId(),
        type,
        position,
        size,
        style: { backgroundColor: '#8B5CF6', transform: 'rotate(0deg)' },
        layer
      };
      
    case 'heading':
      return {
        id: generateId(),
        type,
        position,
        content: 'Add a heading',
        size,
        style: { color: '#1F2937', transform: 'rotate(0deg)' },
        layer
      };
      
    case 'subheading':
      return {
        id: generateId(),
        type,
        position,
        content: 'Add a subheading',
        size,
        style: { color: '#1F2937', transform: 'rotate(0deg)' },
        layer
      };
      
    case 'paragraph':
      return {
        id: generateId(),
        type,
        position,
        content: 'Add your text here. Click to edit this text.',
        size,
        style: { color: '#1F2937', transform: 'rotate(0deg)' },
        layer
      };
      
    case 'image':
      return {
        id: generateId(),
        type,
        position,
        size,
        originalSize: props?.originalSize || size,
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
        size,
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
        size,
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
        size,
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
        size,
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
