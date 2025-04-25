
// Basic types
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
  | 'clickSequencePuzzle'
  | 'sliderPuzzle';

export interface Canvas {
  id: string;
  name: string;
  elements: DesignElement[];
}

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

// Element structure
export interface DesignElement {
  id: string;
  type: ElementType;
  position: Position;
  layer: number;
  size?: Size;
  content?: string;
  style?: React.CSSProperties;
  isHidden?: boolean;
  inInventory?: boolean;
  
  // Image specific properties
  dataUrl?: string;
  thumbnailDataUrl?: string;
  src?: string;
  cacheKey?: string;
  file?: File;
  originalSize?: Size;
  fileMetadata?: FileMetadata;
  
  // Puzzle specific properties
  puzzleConfig?: PuzzleConfig;
  sequencePuzzleConfig?: SequencePuzzleConfig;
  clickSequencePuzzleConfig?: ClickSequencePuzzleConfig;
  sliderPuzzleConfig?: SliderPuzzleConfig;
  
  // Interaction
  interaction?: Interaction;
}

// File metadata
export interface FileMetadata {
  name: string;
  type: string;
  size: number;
  lastModified: number;
}

// Helper for generating unique IDs
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 10);
};

// Re-export interaction and puzzle types
export * from './interactionTypes';
export * from './puzzleTypes';
