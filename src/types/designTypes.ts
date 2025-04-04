import { v4 as uuidv4 } from "uuid";

// Define the types for our design elements
export type ElementType = 
  | 'rectangle' 
  | 'circle' 
  | 'triangle' 
  | 'line' 
  | 'heading' 
  | 'subheading' 
  | 'paragraph' 
  | 'image'
  | 'background'
  | 'puzzle'
  | 'sequencePuzzle'
  | 'clickSequencePuzzle';

export type PuzzleType = 'image' | 'number' | 'alphabet';

export interface PuzzleConfiguration {
  name: string;
  type: PuzzleType;
  placeholders: number;
  images: string[];
  solution: number[];
  // For number puzzle
  maxNumber?: number;
  // For alphabet puzzle
  maxLetter?: string;
}

export interface SequencePuzzleConfiguration {
  name: string;
  images: string[];
  // The solution is the correct order of images (array of indices)
  solution: number[];
  // The current order of images (array of indices)
  currentOrder: number[];
}

export interface ClickSequencePuzzleConfiguration {
  name: string;
  images: string[];
  // The correct sequence to click the images
  solution: number[];
  // Current progress in the sequence (internal state, not shown to user)
  currentStep: number;
}

export interface DesignElement {
  id: string;
  type: ElementType;
  position: {
    x: number;
    y: number;
  };
  size?: {
    width: number;
    height: number;
  };
  originalSize?: {  // Added for maintaining aspect ratio during resizing
    width: number;
    height: number;
  };
  style?: {
    [key: string]: string | number;
    transform?: string; // Added for rotation
  };
  content?: string;
  src?: string;
  file?: File; // Added for local file reference
  dataUrl?: string; // Added for local image preview
  layer: number; // Added for layer ordering
  puzzleConfig?: PuzzleConfiguration; // Added for puzzle configuration
  sequencePuzzleConfig?: SequencePuzzleConfiguration; // Added for sequence puzzle
  clickSequencePuzzleConfig?: ClickSequencePuzzleConfiguration; // Added for click sequence puzzle
}

export interface DesignContextType {
  elements: DesignElement[];
  activeElement: DesignElement | null;
  canvasRef: HTMLDivElement | null;
  setCanvasRef: (ref: HTMLDivElement) => void;
  addElement: (type: ElementType, props?: any) => DesignElement;
  updateElement: (id: string, updates: Partial<DesignElement>) => void;
  updateElementWithoutHistory: (id: string, updates: Partial<DesignElement>) => void; // Added for drag operations
  commitToHistory: () => void; // Added to record final position after drag
  removeElement: (id: string) => void;
  setActiveElement: (element: DesignElement | null) => void;
  updateElementLayer: (id: string, newLayer: number) => void; // Added for layer management
  getHighestLayer: () => number; // Helper to get highest layer
  handleImageUpload: (id: string, file: File) => void; // Added for file uploads
  undo: () => void; // Added for history management
  redo: () => void; // Added for history management
  canUndo: boolean; // Added to check if undo is available
  canRedo: boolean; // Added to check if redo is available
}

// Helper function to generate new unique IDs
export const generateId = (): string => uuidv4();
