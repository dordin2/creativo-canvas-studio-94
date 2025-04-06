
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
  return {
    ...element.style,
    position: 'absolute',
    left: element.position.x,
    top: element.position.y,
    width: element.size?.width,
    height: element.size?.height,
    cursor: isDragging ? 'grabbing' : 'grab',
    border: 'none',
    zIndex: element.layer,
    userSelect: 'none', // Prevent selection
    WebkitUserDrag: 'none', // Prevent default drag in WebKit browsers
  };
};
