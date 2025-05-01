import React from "react";

export type ElementType =
  | "text"
  | "image"
  | "rectangle"
  | "circle"
  | "triangle"
  | "line"
  | "arrow"
  | "pencil"
  | "selector"
  | "background";

export type InteractionType = {
  canCombineWith?: string[];
  message?: string;
  combinationResult?: CombinationResultType;
};

export type CombinationResultType = {
  type: "message" | "sound" | "canvasNavigation" | "puzzle";
  message?: string;
  soundUrl?: string;
  targetCanvasId?: string;
};

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface CloudStorage {
  path: string;
  thumbnailPath: string;
  url: string;
  thumbnailUrl: string;
  userId?: string;
  storageId?: number;
}

export interface DesignElement {
  id: string;
  type: ElementType;
  name?: string;
  position: Position;
  size: Size;
  layer: number;
  style?: React.CSSProperties;
  isHidden?: boolean;
  isLocked?: boolean;
  inInventory?: boolean;
  isLoading?: boolean; // Add loading state for images during processing
  dataUrl?: string;
  src?: string;
  file?: File;
  fileMetadata?: {
    name: string;
    type: string;
    size: number;
    lastModified: number;
  };
  originalSize?: Size;
  cacheKey?: string;
  thumbnailDataUrl?: string;
  storageType?: "local" | "cloud";
  cloudStorage?: CloudStorage;
  interaction?: InteractionType;
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
  toggleGameMode: () => void;
  toggleInventory: () => void;
  setCanvasRef: (ref: HTMLDivElement) => void;
  addElement: (type: ElementType, props?: any) => DesignElement;
  updateElement: (id: string, updates: Partial<DesignElement>) => void;
  updateElementWithoutHistory: (
    id: string,
    updates: Partial<DesignElement>
  ) => void;
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
  setDraggedInventoryItem: (item: DesignElement | null) => void;
  handleItemCombination: (
    inventoryItemId: string,
    targetElementId: string
  ) => void;
  setCanvases: (canvases: Canvas[]) => void;
}

export const generateId = (): string => {
  return crypto.randomUUID();
};
