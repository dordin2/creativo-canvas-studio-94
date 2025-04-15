
import { CSSProperties } from 'react';
import { DesignElement } from '@/types/designTypes';

// Extracts rotation value from an element's style object
export const getRotation = (element: DesignElement): number => {
  const transform = (element.style?.transform as string) || '';
  const match = transform.match(/rotate\(([^)]+)deg\)/);
  return match ? parseFloat(match[1]) : 0;
};

// Applies rotation to an element without affecting other transforms
export const applyRotation = (element: DesignElement, rotation: number): void => {
  // Get current transform string
  const transform = (element.style?.transform as string) || '';
  
  // Replace existing rotation or add new rotation
  const newTransform = transform.includes('rotate(')
    ? transform.replace(/rotate\([^)]+\)/, `rotate(${rotation}deg)`)
    : transform + ` rotate(${rotation}deg)`;
  
  // Return the updated style object
  if (!element.style) {
    element.style = {};
  }
  
  element.style.transform = newTransform.trim();
};

// Extract text style properties from an element 
export const getTextStyle = (element: DesignElement): CSSProperties => {
  return {
    color: element.style?.color as string,
    fontFamily: element.style?.fontFamily as string,
    fontSize: element.style?.fontSize as string,
    fontWeight: element.style?.fontWeight as string,
    textAlign: element.style?.textAlign as "left" | "center" | "right" | "justify" | undefined,
    lineHeight: element.style?.lineHeight as string,
    letterSpacing: element.style?.letterSpacing as string,
    fontStyle: element.style?.fontStyle as string,
    textDecoration: element.style?.textDecoration as string,
  };
};

// Gets the appropriate style object for an element
export const getElementStyle = (element: DesignElement, isDragging: boolean): CSSProperties => {
  const common: CSSProperties = {
    position: 'absolute',
    left: element.position.x,
    top: element.position.y,
    zIndex: element.layer,
    transform: element.style?.transform as string,
    cursor: isDragging ? 'grabbing' : 'grab',
    borderRadius: (element.style?.borderRadius as string) || undefined,
  };
  
  const width = element.size?.width;
  const height = element.size?.height;
  
  if (width) {
    common.width = typeof width === 'string' ? width : `${width}px`;
  }
  
  if (height) {
    common.height = typeof height === 'string' ? height : `${height}px`;
  }
  
  if (element.isHidden) {
    common.opacity = 0;
  }
  
  switch (element.type) {
    case 'rectangle':
    case 'circle':
    case 'triangle':
    case 'line':
      return {
        ...common,
        backgroundColor: element.style?.backgroundColor as string,
        border: element.style?.border as string,
        boxShadow: element.style?.boxShadow as string,
        outline: element.style?.outline as string,
        ...(element.type === 'circle' ? { borderRadius: '50%' } : {}),
        ...(element.type === 'triangle' ? {
          clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'
        } : {})
      };
      
    case 'heading':
    case 'subheading':
    case 'paragraph':
      return {
        ...common,
        color: element.style?.color as string,
        fontFamily: element.style?.fontFamily as string,
        fontSize: element.style?.fontSize as string,
        fontWeight: element.style?.fontWeight as string,
        textAlign: element.style?.textAlign as "left" | "center" | "right" | "justify" | undefined,
        lineHeight: element.style?.lineHeight as string,
        letterSpacing: element.style?.letterSpacing as string,
        padding: element.style?.padding as string,
        backgroundColor: element.style?.backgroundColor as string,
        border: element.style?.border as string,
        boxShadow: element.style?.boxShadow as string,
        outline: element.style?.outline as string,
        minWidth: '50px',
        minHeight: '20px',
      };
      
    case 'image':
    case 'video':
      return {
        ...common,
        borderRadius: (element.style?.borderRadius as string) || undefined,
        border: element.style?.border as string,
        boxShadow: element.style?.boxShadow as string,
        outline: element.style?.outline as string,
        overflow: 'hidden',
        backgroundColor: element.style?.backgroundColor as string || 'transparent',
      };
      
    case 'background':
      return {
        ...common,
        zIndex: 0,
        backgroundColor: element.style?.backgroundColor as string,
        backgroundImage: element.style?.backgroundImage as string,
        opacity: element.style?.opacity as string || '1',
        cursor: 'default',
      };
      
    case 'puzzle':
    case 'sequencePuzzle':
    case 'clickSequencePuzzle':
    case 'sliderPuzzle':
      return {
        ...common,
        backgroundColor: element.style?.backgroundColor as string || '#f3f4f6',
        border: element.style?.border as string || '1px solid #e5e7eb',
        borderRadius: (element.style?.borderRadius as string) || '8px',
        boxShadow: element.style?.boxShadow as string || '0 1px 3px rgba(0,0,0,0.1)',
        outline: element.style?.outline as string,
        overflow: 'hidden',
        padding: '8px',
      };
      
    default:
      return common;
  }
};
