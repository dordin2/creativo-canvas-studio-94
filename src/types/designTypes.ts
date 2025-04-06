import { PuzzleConfig } from "@/components/element/PuzzleElement";

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
  puzzle?: PuzzleConfig;
  layer: number;
  isHidden?: boolean;
}

export interface DesignContextType {
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
}
