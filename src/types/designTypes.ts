import { CSSProperties } from "react";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

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
export type InteractionType = 'none' | 'puzzle' | 'message' | 'sound' | 'canvasNavigation' | 'addToInventory' | 'combinable';
export type MessagePosition = 'bottom' | 'top';
export type CombinationResultType = 'message' | 'sound' | 'puzzle' | 'canvasNavigation';

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

export interface CombinationResult {
  type: CombinationResultType;
  message?: string;
  messagePosition?: MessagePosition;
  sound?: string;
  soundUrl?: string;
  targetCanvasId?: string;
  puzzleType?: ElementType;
  puzzleConfig?: PuzzleConfig;
  sequencePuzzleConfig?: SequencePuzzleConfig;
  clickSequencePuzzleConfig?: ClickSequencePuzzleConfig;
  sliderPuzzleConfig?: SliderPuzzleConfig;
}

export interface InteractionConfig {
  type: InteractionType;
  puzzleType?: ElementType;
  puzzleConfig?: PuzzleConfig;
  sequencePuzzleConfig?: SequencePuzzleConfig;
  clickSequencePuzzleConfig?: ClickSequencePuzzleConfig;
  sliderPuzzleConfig?: SliderPuzzleConfig;
  message?: string;
  messagePosition?: MessagePosition;
  sound?: string;
  soundUrl?: string;
  targetCanvasId?: string;
  canCombineWith?: string[]; // IDs of items that can be combined with this element
  combinationResult?: CombinationResult;
}

export interface FileMetadata {
  name: string;
  type: string;
  size: number;
  lastModified: number;
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
  thumbnailDataUrl?: string; // Added for optimized image previews
  file?: File;
  cacheKey?: string;
  fileMetadata?: FileMetadata;
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
  inInventory?: boolean;
}

export interface Canvas {
  id: string;
  name: string;
  elements: DesignElement[];
}

export interface InventoryItem {
  elementId: string;
  canvasId: string;
}

export interface DesignContextType {
  canvases: Canvas[];
  activeCanvasIndex: number;
  elements: DesignElement[];
  activeElement: DesignElement | null;
  canvasRef: HTMLDivElement | null;
  isGameMode: boolean;
  inventoryItems: InventoryItem[];
  showInventory: boolean;
  draggedInventoryItem: DesignElement | null;
  showInteractionPanel: boolean;
  toggleGameMode: () => void;
  toggleInventory: () => void;
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
  duplicateCanvas: (index: number) => void;
  reorderCanvases: (sourceIndex: number, targetIndex: number) => void;
  moveElementToCanvas: (elementId: string, targetCanvasIndex: number) => void;
  addToInventory: (elementId: string) => void;
  removeFromInventory: (elementId: string) => void;
  setDraggedInventoryItem: (element: DesignElement | null) => void;
  handleItemCombination: (inventoryItemId: string, targetElementId: string) => void;
  setCanvases: (canvases: Canvas[]) => void;
  setShowInteractionPanel: (show: boolean) => void;
}

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 11);
};
