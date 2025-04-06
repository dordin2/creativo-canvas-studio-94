
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
  
  const style: CSSProperties & { userDrag?: string } = {
    ...element.style,
    position: 'absolute',
    left: element.position.x,
    top: element.position.y,
    width: element.size?.width,
    height: element.size?.height,
    cursor: isDragging ? 'move' : 'grab',
    border: 'none',
    zIndex: element.layer,
    touchAction: 'none',
    userSelect: 'none',
    // Apply hardware acceleration for smoother dragging
    transform: `translate3d(0, 0, 0) ${element.style?.transform || ''}`.trim(),
  };

  // Prevent browser's default drag behavior for image elements
  if (isImageElement) {
    style.userDrag = 'none' as any;
  }

  return style;
};
