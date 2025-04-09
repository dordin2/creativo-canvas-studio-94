
import { CSSProperties } from "react";
import { DesignElement } from "@/context/DesignContext";

export const getRotation = (element: DesignElement): number => {
  if (!element.style?.transform) return 0;
  const match = element.style.transform.toString().match(/rotate\((-?\d+)deg\)/);
  return match ? parseInt(match[1], 10) : 0;
};

export const getFontSize = (element: DesignElement): string => {
  if (element.style?.fontSize) {
    return element.style.fontSize as string;
  }
  
  if (element.type === 'heading') return '24px';
  if (element.type === 'subheading') return '18px';
  return '16px';
};

export const getTextStyle = (element: DesignElement): CSSProperties => {
  const fontSize = getFontSize(element);
  
  const fontWeight = element.style?.fontWeight || (
    element.type === 'heading' ? 'bold' : 
    element.type === 'subheading' ? '600' : 'normal'
  );
  
  const fontStyle = (element.style?.fontStyle as string) || 'normal';
  
  const textDecoration = (element.style?.textDecoration as string) || 'none';
  
  return {
    fontSize,
    fontWeight,
    color: element.style?.color as string || '#1F2937',
    fontStyle,
    textDecoration,
    padding: '0',
    margin: '0',
    fontFamily: 'inherit',
    lineHeight: 'inherit',
    overflow: 'hidden'
  };
};

export const getElementStyle = (element: DesignElement, isDragging: boolean): CSSProperties => {
  // Special styles for puzzle elements
  const isPuzzleElement = element.type === 'sequencePuzzle' || element.type === 'puzzle';
  const isImageElement = element.type === 'image';
  
  // Extract rotation from transform to apply it directly at the top level
  const rotation = getRotation(element);
  
  // Use Math.round to ensure consistent positioning
  const left = Math.round(element.position.x);
  const top = Math.round(element.position.y);
  const width = element.size?.width ? Math.round(element.size.width) : undefined;
  const height = element.size?.height ? Math.round(element.size.height) : undefined;
  
  // Create a clean object for the style to avoid reference issues
  const style: CSSProperties & { userDrag?: string } = {
    ...element.style,
    position: 'absolute',
    left,
    top,
    width,
    height,
    cursor: isDragging ? 'move' : 'grab',
    border: 'none',
    zIndex: element.layer,
    touchAction: 'none',
    userSelect: 'none',
    // Use clean transform with direct rotation to avoid compounding transforms
    transform: `rotate(${rotation}deg)`,
    // Apply hardware acceleration for smoother rendering
    willChange: isDragging ? 'transform' : 'auto',
    transition: isDragging ? 'none' : 'transform 0.05s ease-out',
    boxSizing: 'border-box',
  };

  // Prevent browser's default drag behavior for image elements
  if (isImageElement) {
    style.userDrag = 'none' as any;
  }

  return style;
};
