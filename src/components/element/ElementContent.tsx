
import React from 'react';
import { DesignElement } from "@/types/designTypes";
import PuzzleElement from "./puzzle/PuzzleElement";
import SequencePuzzleElement from "./puzzle/SequencePuzzleElement";
import ClickSequencePuzzleElement from "./puzzle/ClickSequencePuzzleElement";
import SliderPuzzleElement from "./puzzle/SliderPuzzleElement";
import EditableText from "./EditableText";

interface ElementContentProps {
  element: DesignElement;
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  textInputRef: React.RefObject<HTMLInputElement | HTMLTextAreaElement>;
  onPuzzleClick: (e: React.MouseEvent) => void;
}

const ElementContent: React.FC<ElementContentProps> = ({
  element,
  isEditing,
  setIsEditing,
  textInputRef,
  onPuzzleClick
}) => {
  const textElementTypes = ['heading', 'subheading', 'paragraph'];
  
  if (textElementTypes.includes(element.type)) {
    return (
      <EditableText
        element={element}
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        textInputRef={textInputRef}
      />
    );
  } 
  
  if (element.type === 'puzzle') {
    return (
      <PuzzleElement 
        element={element} 
        onClick={onPuzzleClick} 
      />
    );
  } 
  
  if (element.type === 'sequencePuzzle') {
    return (
      <SequencePuzzleElement
        element={element}
        onClick={onPuzzleClick}
      />
    );
  } 
  
  if (element.type === 'clickSequencePuzzle') {
    return (
      <ClickSequencePuzzleElement
        element={element}
        onClick={onPuzzleClick}
      />
    );
  } 
  
  if (element.type === 'sliderPuzzle') {
    return (
      <SliderPuzzleElement
        element={element}
        onClick={onPuzzleClick}
      />
    );
  }
  
  // For other element types like rectangle, circle, etc.
  switch (element.type) {
    case 'rectangle':
      return (
        <div
          className="h-full w-full"
          style={{
            backgroundColor: element.style?.backgroundColor as string || '#8B5CF6',
            borderRadius: element.style?.borderRadius || '4px'
          }}
        />
      );
      
    case 'circle':
      return (
        <div
          className="h-full w-full rounded-full"
          style={{
            backgroundColor: element.style?.backgroundColor as string || '#8B5CF6'
          }}
        />
      );
      
    case 'triangle':
      return (
        <div
          className="absolute"
          style={{
            width: 0,
            height: 0,
            borderLeft: `${(element.size?.width || 50)}px solid transparent`,
            borderRight: `${(element.size?.width || 50)}px solid transparent`,
            borderBottom: `${(element.size?.height || 100)}px solid ${element.style?.backgroundColor as string || '#8B5CF6'}`,
            backgroundColor: 'transparent'
          }}
        />
      );
      
    case 'line':
      return (
        <div
          className="h-full w-full"
          style={{
            backgroundColor: element.style?.backgroundColor as string || '#8B5CF6'
          }}
        />
      );
      
    case 'image':
      return (
        <div className="h-full w-full flex items-center justify-center overflow-hidden">
          {element.dataUrl ? (
            <img 
              src={element.dataUrl} 
              alt="Uploaded content" 
              className="w-full h-full" 
              draggable={false}
              style={{ objectFit: 'contain', width: '100%', height: '100%' }}
            />
          ) : element.src ? (
            <img 
              src={element.src} 
              alt="Uploaded content" 
              className="w-full h-full" 
              draggable={false}
              style={{ objectFit: 'contain', width: '100%', height: '100%' }}
            />
          ) : (
            <div className="text-sm upload-placeholder-text text-gray-400 select-none w-full h-full flex items-center justify-center">
              Click to upload image
            </div>
          )}
        </div>
      );
      
    default:
      return null;
  }
};

export default ElementContent;
