import { createContext, useContext, useState, useRef, ReactNode } from "react";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";

// Define the types for our design elements
export type ElementType = 
  | 'rectangle' 
  | 'circle' 
  | 'triangle' 
  | 'line' 
  | 'heading' 
  | 'subheading' 
  | 'paragraph' 
  | 'image'
  | 'background';

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
  style?: {
    [key: string]: string | number;
    transform?: string; // Added for rotation
  };
  content?: string;
  src?: string;
}

interface DesignContextType {
  elements: DesignElement[];
  activeElement: DesignElement | null;
  canvasRef: HTMLDivElement | null;
  setCanvasRef: (ref: HTMLDivElement) => void;
  addElement: (type: ElementType, props?: any) => void;
  updateElement: (id: string, updates: Partial<DesignElement>) => void;
  removeElement: (id: string) => void;
  setActiveElement: (element: DesignElement | null) => void;
}

const DesignContext = createContext<DesignContextType | undefined>(undefined);

// Default positions for new elements
const getDefaultPosition = (canvasRef: HTMLDivElement | null) => {
  if (!canvasRef) return { x: 100, y: 100 };
  
  return {
    x: canvasRef.clientWidth / 2 - 50,
    y: canvasRef.clientHeight / 2 - 50
  };
};

export const DesignProvider = ({ children }: { children: ReactNode }) => {
  const [elements, setElements] = useState<DesignElement[]>([]);
  const [activeElement, setActiveElement] = useState<DesignElement | null>(null);
  const [canvasRef, setCanvasRefState] = useState<HTMLDivElement | null>(null);
  
  // Function to set canvas reference
  const setCanvasRef = (ref: HTMLDivElement) => {
    setCanvasRefState(ref);
  };
  
  // Add a new element to the canvas
  const addElement = (type: ElementType, props?: any) => {
    const position = getDefaultPosition(canvasRef);
    
    let newElement: DesignElement;
    
    switch (type) {
      case 'rectangle':
        newElement = {
          id: uuidv4(),
          type,
          position,
          size: { width: 100, height: 80 },
          style: { backgroundColor: '#8B5CF6', borderRadius: '4px', transform: 'rotate(0deg)' }
        };
        break;
        
      case 'circle':
        newElement = {
          id: uuidv4(),
          type,
          position,
          size: { width: 100, height: 100 },
          style: { backgroundColor: '#8B5CF6', transform: 'rotate(0deg)' }
        };
        break;
        
      case 'triangle':
        newElement = {
          id: uuidv4(),
          type,
          position,
          size: { width: 50, height: 100 },
          style: { backgroundColor: '#8B5CF6', transform: 'rotate(0deg)' }
        };
        break;
        
      case 'line':
        newElement = {
          id: uuidv4(),
          type,
          position,
          size: { width: 100, height: 2 },
          style: { backgroundColor: '#8B5CF6', transform: 'rotate(0deg)' }
        };
        break;
        
      case 'heading':
        newElement = {
          id: uuidv4(),
          type,
          position,
          content: 'Add a heading',
          style: { color: '#1F2937', transform: 'rotate(0deg)' }
        };
        break;
        
      case 'subheading':
        newElement = {
          id: uuidv4(),
          type,
          position,
          content: 'Add a subheading',
          style: { color: '#1F2937', transform: 'rotate(0deg)' }
        };
        break;
        
      case 'paragraph':
        newElement = {
          id: uuidv4(),
          type,
          position,
          content: 'Add your text here. Click to edit this text.',
          style: { color: '#1F2937', transform: 'rotate(0deg)' }
        };
        break;
        
      case 'image':
        newElement = {
          id: uuidv4(),
          type,
          position,
          size: { width: 200, height: 150 },
          style: { transform: 'rotate(0deg)' },
          src: 'https://source.unsplash.com/random/800x600?nature'
        };
        break;
        
      case 'background':
        // Check if background already exists
        const bgExists = elements.some(el => el.type === 'background');
        
        if (bgExists) {
          // Update existing background
          const updatedElements = elements.map(el => {
            if (el.type === 'background') {
              return {
                ...el,
                style: props?.gradient 
                  ? { background: props.gradient } 
                  : { backgroundColor: props?.color || '#FFFFFF' }
              };
            }
            return el;
          });
          
          setElements(updatedElements);
          toast.success("Background updated");
          return;
        }
        
        // Create new background
        newElement = {
          id: uuidv4(),
          type,
          position: { x: 0, y: 0 },
          style: props?.gradient 
            ? { background: props.gradient } 
            : { backgroundColor: props?.color || '#FFFFFF' }
        };
        break;
        
      default:
        newElement = {
          id: uuidv4(),
          type: 'rectangle',
          position,
          size: { width: 100, height: 80 },
          style: { backgroundColor: '#8B5CF6', transform: 'rotate(0deg)' }
        };
    }
    
    setElements([...elements, newElement]);
    setActiveElement(newElement);
    
    toast.success(`Added new ${type}`);
  };
  
  // Update an existing element
  const updateElement = (id: string, updates: Partial<DesignElement>) => {
    const updatedElements = elements.map(element => {
      if (element.id === id) {
        return { ...element, ...updates };
      }
      return element;
    });
    
    setElements(updatedElements);
    
    // Also update active element if it's the one being updated
    if (activeElement && activeElement.id === id) {
      setActiveElement({ ...activeElement, ...updates });
    }
  };
  
  // Remove an element
  const removeElement = (id: string) => {
    setElements(elements.filter(element => element.id !== id));
    
    if (activeElement && activeElement.id === id) {
      setActiveElement(null);
    }
  };
  
  const value = {
    elements,
    activeElement,
    canvasRef,
    setCanvasRef,
    addElement,
    updateElement,
    removeElement,
    setActiveElement
  };
  
  return (
    <DesignContext.Provider value={value}>
      {children}
    </DesignContext.Provider>
  );
};

export const useDesignState = () => {
  const context = useContext(DesignContext);
  
  if (context === undefined) {
    throw new Error('useDesignState must be used within a DesignProvider');
  }
  
  return context;
};
