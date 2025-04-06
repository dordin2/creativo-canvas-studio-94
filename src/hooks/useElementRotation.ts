
import { useState, useEffect, useRef } from "react";
import { DesignElement, useDesignState } from "@/context/DesignContext";
import { getRotation } from "@/utils/elementStyles";

export const useElementRotation = (element: DesignElement, elementRef: React.RefObject<HTMLDivElement>) => {
  const { updateElement } = useDesignState();
  const [isRotating, setIsRotating] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [startAngle, setStartAngle] = useState(0);
  const [centerPos, setCenterPos] = useState({ x: 0, y: 0 });
  const lastRotation = useRef(getRotation(element));

  const handleRotateStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    setIsRotating(true);
    
    if (elementRef.current) {
      const rect = elementRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      // Calculate initial angle between center and mouse
      const initialAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
      
      setCenterPos({ x: centerX, y: centerY });
      setStartPos({ x: e.clientX, y: e.clientY });
      setStartAngle(initialAngle);
      lastRotation.current = getRotation(element);
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
        // Calculate current angle between center and mouse position
        const currentAngle = Math.atan2(e.clientY - centerPos.y, e.clientX - centerPos.x) * (180 / Math.PI);
        
        // Calculate the angle change
        let angleDiff = currentAngle - startAngle;
        
        // Calculate the new absolute rotation by adding the angle change to the starting rotation
        let newRotation = lastRotation.current + angleDiff;
        
        // Round to the nearest degree to reduce jitter
        newRotation = Math.round(newRotation);
        
        // Apply a threshold to avoid tiny movements
        if (Math.abs(newRotation - lastRotation.current) < 1) {
          return;
        }
        
        // Update the rotation
        const newStyle = { 
          ...element.style, 
          transform: `rotate(${newRotation}deg)` 
        };
        
        updateElement(element.id, { style: newStyle });
      }
    };

    const handleMouseUp = () => {
      if (isRotating) {
        // Update the last rotation value before ending
        lastRotation.current = getRotation(element);
        setIsRotating(false);
      }
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
    startAngle,
    centerPos,
    element,
    updateElement
  ]);

  return {
    isRotating,
    handleRotateStart
  };
};
