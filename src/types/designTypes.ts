
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
  | 'clickSequencePuzzle'; // Add the new click sequence puzzle type

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

// New configuration type for Click Sequence Puzzle
export interface ClickSequencePuzzleConfiguration {
  name: string;
  images: string[];
  // The solution is the correct order of clicks (array of indices)
  solution: number[];
  // The current state of clicks (array tracking which indices have been clicked)
  clickedIndices: number[];
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

// Helper function to generate new unique IDs
export const generateId = (): string => uuidv4();
