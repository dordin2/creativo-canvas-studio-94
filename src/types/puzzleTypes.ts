
// Puzzle types
export type PuzzleType = 'image' | 'number' | 'alphabet';
export type SliderOrientation = 'horizontal' | 'vertical';

// Puzzle configurations
export interface PuzzleConfig {
  name?: string;
  type: PuzzleType;
  placeholders: number;
  images: string[];
  solution: number[];
  maxNumber?: number;
  maxLetter?: string;
}

export interface SequencePuzzleConfig {
  name?: string;
  images: string[];
  solution: number[];
  currentOrder: number[];
}

export interface ClickSequencePuzzleConfig {
  name?: string;
  images: string[];
  solution: number[];
  clickedIndices: number[];
}

export interface SliderPuzzleConfig {
  name?: string;
  orientation: SliderOrientation;
  sliderCount: number;
  solution: number[];
  currentValues: number[];
  maxValue: number;
}
