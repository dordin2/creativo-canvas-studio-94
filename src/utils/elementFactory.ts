
import { DesignElement, ElementType, generateId } from "@/types/designTypes";

export const getDefaultPosition = (canvasRef: HTMLDivElement | null) => {
  if (!canvasRef) {
    return { x: 100, y: 100 };
  }
  
  const { width, height } = canvasRef.getBoundingClientRect();
  
  return {
    x: width / 2 - 75,
    y: height / 2 - 75
  };
};

// Creates a new element with default properties based on type
export const createNewElement = (
  type: ElementType, 
  position: { x: number; y: number },
  layer: number,
  props?: any
): DesignElement => {
  const id = generateId();
  const defaultProps = {};
  
  switch (type) {
    case 'rectangle':
      return {
        id,
        type,
        position,
        size: { width: 150, height: 100 },
        style: { backgroundColor: '#4299e1', borderRadius: '0px' },
        layer,
        ...defaultProps,
        ...props
      };
    
    case 'circle':
      return {
        id,
        type,
        position,
        size: { width: 100, height: 100 },
        style: { backgroundColor: '#ed64a6' },
        layer,
        ...defaultProps,
        ...props
      };
    
    case 'triangle':
      return {
        id,
        type,
        position,
        size: { width: 100, height: 100 },
        style: { backgroundColor: '#48bb78' },
        layer,
        ...defaultProps,
        ...props
      };
    
    case 'line':
      return {
        id,
        type,
        position,
        size: { width: 150, height: 2 },
        style: { backgroundColor: '#000000' },
        layer,
        ...defaultProps,
        ...props
      };
    
    case 'heading':
      return {
        id,
        type,
        position,
        content: 'Heading Text',
        style: { 
          color: '#1a202c', 
          fontSize: '24px', 
          fontWeight: 'bold',
          textAlign: 'left'
        },
        layer,
        ...defaultProps,
        ...props
      };
    
    case 'subheading':
      return {
        id,
        type,
        position,
        content: 'Subheading Text',
        style: { 
          color: '#4a5568', 
          fontSize: '18px', 
          fontWeight: 'semibold',
          textAlign: 'left'
        },
        layer,
        ...defaultProps,
        ...props
      };
    
    case 'paragraph':
      return {
        id,
        type,
        position,
        content: 'Paragraph text. Click to edit.',
        style: { 
          color: '#4a5568', 
          fontSize: '16px',
          textAlign: 'left'
        },
        layer,
        ...defaultProps,
        ...props
      };
    
    case 'image':
      return {
        id,
        type,
        position,
        size: { width: 150, height: 150 },
        src: '',
        layer,
        ...defaultProps,
        ...props
      };
      
    case 'video':
      return {
        id,
        type,
        position,
        size: { width: 320, height: 240 },
        src: '',
        style: { 
          controls: 'true', 
          autoplay: 'false', 
          loop: 'false', 
          muted: 'false' 
        },
        layer,
        ...defaultProps,
        ...props
      };
    
    case 'background':
      return {
        id,
        type,
        position: { x: 0, y: 0 },
        size: { width: '100%', height: '100%' },
        style: props?.gradient 
          ? { backgroundImage: props.gradient } 
          : { backgroundColor: props?.color || '#ffffff' },
        layer: 0,
        ...defaultProps,
        ...props
      };
    
    case 'puzzle':
      return {
        id,
        type,
        position,
        size: { width: 300, height: 150 },
        puzzleConfig: props?.puzzleConfig || {
          name: 'Puzzle',
          type: 'image',
          placeholders: 3,
          images: [],
          solution: [0, 0, 0]
        },
        layer,
        ...defaultProps,
        ...props
      };
    
    case 'sequencePuzzle':
      return {
        id,
        type,
        position,
        size: { width: 350, height: 150 },
        sequencePuzzleConfig: props?.sequencePuzzleConfig || {
          name: 'Sequence Puzzle',
          images: [],
          solution: [],
          currentOrder: []
        },
        layer,
        ...defaultProps,
        ...props
      };
      
    case 'clickSequencePuzzle':
      return {
        id,
        type,
        position,
        size: { width: 350, height: 150 },
        clickSequencePuzzleConfig: props?.clickSequencePuzzleConfig || {
          name: 'Click Sequence Puzzle',
          images: [],
          solution: [],
          clickedIndices: []
        },
        layer,
        ...defaultProps,
        ...props
      };
      
    case 'sliderPuzzle':
      return {
        id,
        type,
        position,
        size: { width: 350, height: 200 },
        sliderPuzzleConfig: props?.sliderPuzzleConfig || {
          name: 'Slider Puzzle',
          orientation: 'horizontal',
          sliderCount: 3,
          solution: [5, 7, 3],
          currentValues: [0, 0, 0],
          maxValue: 10
        },
        layer,
        ...defaultProps,
        ...props
      };
    
    default:
      return {
        id,
        type,
        position,
        layer,
        ...defaultProps,
        ...props
      };
  }
};
