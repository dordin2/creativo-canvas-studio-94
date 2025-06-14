
import { useState, useEffect, useRef } from "react";
import { DesignElement, useDesignState } from "@/context/DesignContext";
import { getRotation } from "@/utils/elementStyles";

export const useElementRotation = (element: DesignElement, elementRef: React.RefObject<HTMLDivElement>) => {
  const { updateElement, updateElementWithoutHistory, commitToHistory, startTemporaryOperation } = useDesignState();
  const [isRotating, setIsRotating] = useState(false);
  const [centerPos, setCenterPos] = useState({ x: 0, y: 0 });
  const [startAngle, setStartAngle] = useState(0);
  const lastRotation = useRef(getRotation(element));
  const lastMouseAngle = useRef(0);
  const rotationStarted = useRef(false);

  const handleRotateStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    setIsRotating(true);
    rotationStarted.current = false;
    
    if (elementRef.current) {
      const rect = elementRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const initialAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
      
      setCenterPos({ x: centerX, y: centerY });
      setStartAngle(initialAngle);
      lastMouseAngle.current = initialAngle;
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
      if (!isRotating) return;
      
      if (!rotationStarted.current) {
        rotationStarted.current = true;
        startTemporaryOperation();
      }
      
      const currentAngle = Math.atan2(e.clientY - centerPos.y, e.clientX - centerPos.x) * (180 / Math.PI);
      
      let angleDiff = currentAngle - lastMouseAngle.current;
      
      if (angleDiff > 180) angleDiff -= 360;
      if (angleDiff < -180) angleDiff += 360;
      
      if (Math.abs(angleDiff) < 1) return;
      
      let newRotation = lastRotation.current + angleDiff;
      newRotation = Math.round(newRotation);
      
      updateElementWithoutHistory(element.id, { 
        style: { 
          ...element.style, 
          transform: `rotate(${newRotation}deg)` 
        } 
      });
      
      lastMouseAngle.current = currentAngle;
      lastRotation.current = newRotation;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isRotating || e.touches.length === 0) return;
      
      if (!rotationStarted.current) {
        rotationStarted.current = true;
        startTemporaryOperation();
      }
      
      const touch = e.touches[0];
      const currentAngle = Math.atan2(touch.clientY - centerPos.y, touch.clientX - centerPos.x) * (180 / Math.PI);
      
      let angleDiff = currentAngle - lastMouseAngle.current;
      
      if (angleDiff > 180) angleDiff -= 360;
      if (angleDiff < -180) angleDiff += 360;
      
      if (Math.abs(angleDiff) < 1) return;
      
      let newRotation = lastRotation.current + angleDiff;
      newRotation = Math.round(newRotation);
      
      updateElementWithoutHistory(element.id, { 
        style: { 
          ...element.style, 
          transform: `rotate(${newRotation}deg)` 
        } 
      });
      
      lastMouseAngle.current = currentAngle;
      lastRotation.current = newRotation;
    };

    const handleEnd = () => {
      if (isRotating) {
        setIsRotating(false);
        if (rotationStarted.current) {
          // Commit rotation to history
          setTimeout(() => {
            commitToHistory();
          }, 0);
        }
        rotationStarted.current = false;
      }
    };

    if (isRotating) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleEnd);
      document.addEventListener("touchmove", handleTouchMove);
      document.addEventListener("touchend", handleEnd);
      document.addEventListener("touchcancel", handleEnd);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleEnd);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleEnd);
      document.removeEventListener("touchcancel", handleEnd);
    };
  }, [
    isRotating,
    centerPos,
    element,
    updateElementWithoutHistory,
    commitToHistory,
    startTemporaryOperation
  ]);

  return {
    isRotating,
    handleRotateStart
  };
};
