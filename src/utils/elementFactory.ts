import { ElementType, DesignElement, generateId, PuzzleType, SliderOrientation } from "@/types/designTypes";

// Get canvas center point and account for element size
export const getDefaultPosition = (canvasRef: HTMLDivElement | null, elementSize = { width: 0, height: 0 }) => {
  // Use fixed canvas dimensions to ensure consistent placement
  const FIXED_CANVAS_WIDTH = 1600;
  const FIXED_CANVAS_HEIGHT = 900;
  
  // Calculate the center position, accounting for element size
  return {
    x: Math.max(0, (FIXED_CANVAS_WIDTH / 2) - (elementSize.width / 2)),
    y: Math.max(0, (FIXED_CANVAS_HEIGHT / 2) - (elementSize.height / 2))
  };
};

// Get default size as 50% of canvas dimensions
export const getDefaultImageSize = (canvasRef: HTMLDivElement | null) => {
  // Use fixed canvas dimensions for consistent sizing
  const FIXED_CANVAS_WIDTH = 1600;
  const FIXED_CANVAS_HEIGHT = 900;
  const CANVAS_SIZE_PERCENT = 0.5; // 50% of canvas size
  
  const width = Math.round(FIXED_CANVAS_WIDTH * CANVAS_SIZE_PERCENT);
  const height = Math.round(FIXED_CANVAS_HEIGHT * CANVAS_SIZE_PERCENT);
  
  return { width, height };
};

// Factory function to create new elements
export const createNewElement = (
  type: ElementType, 
  canvasRef: HTMLDivElement | null,
  layer: number,
  props?: any
): DesignElement => {
  // Get default size as 50% of canvas
  const defaultSize = getDefaultImageSize(canvasRef);
  
  // Define size based on element type, maintaining aspect ratios but at 50% canvas size
  let size = { ...defaultSize }; // Default to 50% canvas size
  
  switch (type) {
    case 'rectangle':
      size = { width: defaultSize.width / 2, height: defaultSize.height / 2 };
      break;
    case 'circle':
      const diameter = Math.min(defaultSize.width, defaultSize.height) / 2;
      size = { width: diameter, height: diameter };
      break;
    case 'triangle':
      size = { width: defaultSize.width / 2, height: defaultSize.height / 2 };
      break;
    case 'line':
      size = { width: defaultSize.width / 2, height: 4 };
      break;
    case 'heading':
      size = { width: defaultSize.width / 2, height: defaultSize.height / 8 };
      break;
    case 'subheading':
      size = { width: defaultSize.width / 2.5, height: defaultSize.height / 10 };
      break;
    case 'paragraph':
      size = { width: defaultSize.width / 2, height: defaultSize.height / 4 };
      break;
    case 'image':
      size = props?.size || defaultSize;
      break;
    case 'puzzle':
      size = { width: defaultSize.width / 3, height: defaultSize.height / 3 };
      break;
    case 'sequencePuzzle':
    case 'clickSequencePuzzle':
      size = { width: defaultSize.width / 2, height: defaultSize.height / 3 };
      break;
    case 'sliderPuzzle':
      const orientation = props?.sliderPuzzleConfig?.orientation || 'horizontal';
      size = {
        width: orientation === 'horizontal' ? defaultSize.width / 2 : defaultSize.width / 4,
        height: orientation === 'horizontal' ? defaultSize.height / 3 : defaultSize.height / 2
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
