import { ElementType, DesignElement, generateId, PuzzleType } from "@/types/designTypes";

// Default positions for new elements
export const getDefaultPosition = (canvasRef: HTMLDivElement | null) => {
  if (!canvasRef) return { x: 100, y: 100 };
  
  return {
    x: canvasRef.clientWidth / 2 - 50,
    y: canvasRef.clientHeight / 2 - 50
  };
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
      return {
        id: generateId(),
        type,
        position,
        size: { width: 200, height: 150 }, // Default size until image is loaded
        originalSize: { width: 200, height: 150 }, // Default original size
        style: { transform: 'rotate(0deg)' },
        layer
      };
      
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
        style: { backgroundColor: '#F0FDF4', borderRadius: '8px', transform: 'rotate(0deg)' },
        layer,
        clickSequencePuzzleConfig: props?.clickSequencePuzzleConfig || {
          name: props?.name || 'Click Sequence Puzzle',
          images: [],
          solution: [],
          currentStep: 0
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
