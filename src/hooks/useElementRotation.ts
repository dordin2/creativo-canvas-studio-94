
import { useState, useEffect, useRef } from "react";
import { DesignElement, useDesignState } from "@/context/DesignContext";
import { getRotation } from "@/utils/elementStyles";

export const useElementRotation = (element: DesignElement, elementRef: React.RefObject<HTMLDivElement>) => {
  const { updateElement } = useDesignState();
  const [isRotating, setIsRotating] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [startRotation, setStartRotation] = useState(0);

  const handleRotateStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    setIsRotating(true);
    setStartRotation(getRotation(element));
    
    if (elementRef.current) {
      const rect = elementRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      setStartPos({ x: centerX, y: centerY });
    }
  };

  useEffect(() => {
    if (element.style && typeof element.style.transform === 'undefined') {
      updateElement(element.id, {
        style: { ...element.style, transform: "rotate(0deg)" }
      });
    }
  }, [element.id, element.style, updateElement]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isRotating) {
        const centerX = startPos.x;
        const centerY = startPos.y;
        
        const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
        const rotation = angle + 90;
        
        const newStyle = { 
          ...element.style, 
          transform: `rotate(${rotation}deg)` 
        };
        
        updateElement(element.id, { style: newStyle });
      }
    };

    const handleMouseUp = () => {
      setIsRotating(false);
    };

    if (isRotating) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [
    isRotating,
    startPos,
    startRotation,
    element,
    updateElement
  ]);

  return {
    isRotating,
    handleRotateStart
  };
};
