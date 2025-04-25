
import { 
  PuzzleConfig, 
  SequencePuzzleConfig, 
  ClickSequencePuzzleConfig, 
  SliderPuzzleConfig, 
  PuzzleType 
} from './puzzleTypes';

// Interaction types
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

// Inventory item - reference to an element that is in the inventory
export interface InventoryItem {
  elementId: string; // ID of the element in the inventory
  canvasId: string;  // ID of the canvas the element belongs to
}

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
  
  // For combinable items
  canCombineWith?: string[]; // IDs of inventory items that can be combined with this element
  combinationResult?: CombinationResult;
  
  // For puzzle interaction
  puzzleConfig?: PuzzleConfig;
  sequencePuzzleConfig?: SequencePuzzleConfig;
  clickSequencePuzzleConfig?: ClickSequencePuzzleConfig;
  sliderPuzzleConfig?: SliderPuzzleConfig;
}
