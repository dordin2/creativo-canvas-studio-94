
import { PuzzleConfig, SequencePuzzleConfig, ClickSequencePuzzleConfig, SliderPuzzleConfig } from './puzzleTypes';
import { Interaction } from './interactionTypes';

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

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface FileMetadata {
  name: string;
  type: string;
  size: number;
  lastModified: number;
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
  name: string; // Added this as required property
  
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
