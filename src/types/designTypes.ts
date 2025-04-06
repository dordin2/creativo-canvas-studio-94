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

export type PuzzleType = 'image' | 'number' | 'alphabet';
export type SliderOrientation = 'horizontal' | 'vertical';
export type InteractionType = 'none' | 'puzzle' | 'message' | 'sound';

export interface PuzzleConfig {
  name: string;
  type: PuzzleType;
  placeholders: number;
  images: string[];
  solution: number[];
  maxNumber?: number;
  maxLetter?: string;
}

export interface SequencePuzzleConfig {
  name: string;
  images: string[];
  solution: number[];
  currentOrder: number[];
}

export interface ClickSequencePuzzleConfig {
  name: string;
  images: string[];
  solution: number[];
  clickedIndices: number[];
}

export interface SliderPuzzleConfig {
  name: string;
  orientation: SliderOrientation;
  sliderCount: number;
  solution: number[];
  currentValues: number[];
  maxValue: number;
}

export interface InteractionConfig {
  type: InteractionType;
  puzzleType?: ElementType;
  puzzleConfig?: PuzzleConfig;
  sequencePuzzleConfig?: SequencePuzzleConfig;
  clickSequencePuzzleConfig?: ClickSequencePuzzleConfig;
  sliderPuzzleConfig?: SliderPuzzleConfig;
  message?: string;
  sound?: string;
  soundUrl?: string;
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
  style?: Record<string, string | number>;
  content?: string;
  src?: string;
  dataUrl?: string;
  file?: File;
  originalSize?: {
    width: number;
    height: number;
  };
  puzzle?: PuzzleConfig;
  puzzleConfig?: PuzzleConfig;
  sequencePuzzleConfig?: SequencePuzzleConfig;
  clickSequencePuzzleConfig?: ClickSequencePuzzleConfig;
  sliderPuzzleConfig?: SliderPuzzleConfig;
  layer: number;
  isHidden?: boolean;
  name?: string;
  interaction?: InteractionConfig;
}

export interface Canvas {
  id: string;
  name: string;
  elements: DesignElement[];
}

export interface DesignContextType {
  canvases: Canvas[];
  activeCanvasIndex: number;
  elements: DesignElement[];
  activeElement: DesignElement | null;
  canvasRef: HTMLDivElement | null;
  setCanvasRef: (ref: HTMLDivElement) => void;
  addElement: (type: ElementType, props?: any) => DesignElement;
  updateElement: (id: string, updates: Partial<DesignElement>) => void;
  updateElementWithoutHistory: (id: string, updates: Partial<DesignElement>) => void;
  commitToHistory: () => void;
  removeElement: (id: string) => void;
  setActiveElement: (element: DesignElement | null) => void;
  updateElementLayer: (id: string, newLayer: number) => void;
  getHighestLayer: () => number;
  handleImageUpload: (id: string, file: File) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  addCanvas: () => void;
  removeCanvas: (index: number) => void;
  setActiveCanvas: (index: number) => void;
  updateCanvasName: (id: string, newName: string) => void;
}

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 11);
};
