
import { PuzzleConfig, SequencePuzzleConfig, ClickSequencePuzzleConfig, SliderPuzzleConfig } from './puzzleTypes';

export type InteractionType = 
  | 'none' 
  | 'message' 
  | 'sound' 
  | 'puzzle' 
  | 'canvasNavigation' 
  | 'addToInventory'
  | 'combinable';

export type CombinationResultType = 
  | 'message' 
  | 'sound' 
  | 'canvasNavigation' 
  | 'puzzle';

export type MessagePosition = 'top' | 'bottom' | 'left' | 'right' | 'center';

// Result of combining two elements
export interface CombinationResult {
  type: CombinationResultType;
  message?: string;
  soundUrl?: string;
  targetCanvasId?: string;
  puzzleType?: 'puzzle' | 'sequencePuzzle' | 'clickSequencePuzzle' | 'sliderPuzzle';
  
  // For unlocking puzzles
  puzzleConfig?: PuzzleConfig;
  sequencePuzzleConfig?: SequencePuzzleConfig;
  clickSequencePuzzleConfig?: ClickSequencePuzzleConfig;
  sliderPuzzleConfig?: SliderPuzzleConfig;
}

// Interaction configuration
export interface Interaction {
  type: InteractionType;
  message?: string;
  soundUrl?: string;
  targetCanvasId?: string;
  puzzleType?: 'puzzle' | 'sequencePuzzle' | 'clickSequencePuzzle' | 'sliderPuzzle';
  messagePosition?: MessagePosition;
  
  // For combinable items
  canCombineWith?: string[];
  combinationResult?: CombinationResult;
  
  // For puzzle interaction
  puzzleConfig?: PuzzleConfig;
  sequencePuzzleConfig?: SequencePuzzleConfig;
  clickSequencePuzzleConfig?: ClickSequencePuzzleConfig;
  sliderPuzzleConfig?: SliderPuzzleConfig;
}
