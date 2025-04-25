
import { ReactNode } from "react";
import { DesignElement, ElementType } from "./elementTypes";
import { Canvas } from "./canvasTypes";
import { InventoryItem } from "./gameTypes";

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
  
  // Canvas methods
  setCanvasRef: (ref: HTMLDivElement) => void;
  addCanvas: () => void;
  removeCanvas: (index: number) => void;
  setActiveCanvas: (index: number) => void;
  updateCanvasName: (id: string, newName: string) => void;
  duplicateCanvas: (index: number) => void;
  reorderCanvases: (sourceIndex: number, targetIndex: number) => void;
  
  // Element methods
  addElement: (type: ElementType, props?: any) => DesignElement;
  updateElement: (id: string, updates: Partial<DesignElement>) => void;
  updateElementWithoutHistory: (id: string, updates: Partial<DesignElement>) => void;
  commitToHistory: () => void;
  removeElement: (id: string) => void;
  setActiveElement: (element: DesignElement | null) => void;
  updateElementLayer: (id: string, newLayer: number) => void;
  getHighestLayer: () => number;
  handleImageUpload: (id: string, file: File) => void;
  moveElementToCanvas: (elementId: string, targetCanvasIndex: number) => void;
  
  // History methods
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  
  // Game mode methods
  toggleGameMode: () => void;
  toggleInventory: () => void;
  addToInventory: (elementId: string) => void;
  removeFromInventory: (elementId: string) => void;
  setDraggedInventoryItem: (element: DesignElement | null) => void;
  handleItemCombination: (inventoryItemId: string, targetElementId: string) => void;
  setCanvases: React.Dispatch<React.SetStateAction<Canvas[]>>;
}

export interface DesignProviderProps {
  children: ReactNode;
  initialState?: {
    canvases?: Canvas[];
    activeCanvasIndex?: number;
    isGameMode?: boolean;
  };
}
