
import { useState, useEffect, useRef } from "react";
import { DesignElement, useDesignState } from "@/context/DesignContext";
import { getRotation } from "@/utils/elementStyles";
import { useIsMobile } from "@/hooks/use-mobile";

export const useElementRotation = (element: DesignElement, elementRef: React.RefObject<HTMLDivElement>) => {
  const { updateElement } = useDesignState();
  const [isRotating, setIsRotating] = useState(false);
  const [centerPos, setCenterPos] = useState({ x: 0, y: 0 });
  const [startAngle, setStartAngle] = useState(0);
  const lastRotation = useRef(getRotation(element));
  const lastMouseAngle = useRef(0);
  const animationFrame = useRef<number | null>(null);
  const isMobile = useIsMobile();

  const handleRotateStart = (e: React.MouseEvent | React.TouchEvent) => {
    if ('stopPropagation' in e) e.stopPropagation();
    if ('preventDefault' in e) e.preventDefault();
    
    setIsRotating(true);
    
    if (elementRef.current) {
      const rect = elementRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      // Calculate initial angle between center and pointer (mouse or touch)
      let clientX, clientY;
      
      if ('touches' in e && e.touches.length > 0) {
        // Touch event
        const touch = e.touches[0];
        clientX = touch.clientX;
        clientY = touch.clientY;
      } else if ('clientX' in e) {
        // Mouse event
        clientX = e.clientX;
        clientY = e.clientY;
      } else {
        return; // Unexpected event type
      }
      
      // Calculate initial angle between center and pointer
      const initialAngle = Math.atan2(clientY - centerY, clientX - centerX) * (180 / Math.PI);
      
      setCenterPos({ x: centerX, y: centerY });
      setStartAngle(initialAngle);
      lastMouseAngle.current = initialAngle;
      lastRotation.current = getRotation(element);
    }
  };

  useEffect(() => {
    // Ensure element has a transform property
    if (element.style && typeof element.style.transform === 'undefined') {
      updateElement(element.id, {
        style: { ...element.style, transform: "rotate(0deg)" }
      });
    }
  }, [element.id, element.style, updateElement]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isRotating) return;
      handleRotation(e.clientX, e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isRotating || e.touches.length === 0) return;
      e.preventDefault();
      
      // Get the first touch
      const touch = e.touches[0];
      handleRotation(touch.clientX, touch.clientY);
    };
    
    const handleRotation = (clientX: number, clientY: number) => {
      // Cancel any existing animation frame to prevent queuing updates
      if (animationFrame.current !== null) {
        cancelAnimationFrame(animationFrame.current);
      }
      
      // Use requestAnimationFrame for smooth updates
      animationFrame.current = requestAnimationFrame(() => {
        // Calculate current angle between center and pointer position
        const currentAngle = Math.atan2(clientY - centerPos.y, clientX - centerPos.x) * (180 / Math.PI);
        
        // Calculate the angle change
        let angleDiff = currentAngle - lastMouseAngle.current;
        
        // Handle the case when the angle crosses the ±180° boundary
        if (angleDiff > 180) angleDiff -= 360;
        if (angleDiff < -180) angleDiff += 360;
        
        // Apply a threshold to avoid tiny movements that cause jitter
        if (Math.abs(angleDiff) < 1) return;
        
        // Update the rotation by adding the incremental change
        let newRotation = lastRotation.current + angleDiff;
        
        // Round to nearest degree
        newRotation = Math.round(newRotation);
        
        // Update the element's rotation
        updateElement(element.id, { 
          style: { 
            ...element.style, 
            transform: `rotate(${newRotation}deg)` 
          } 
        });
        
        // Store the current mouse angle for the next movement
        lastMouseAngle.current = currentAngle;
        lastRotation.current = newRotation;
      });
    };

    const handleEnd = () => {
      if (isRotating) {
        setIsRotating(false);
        
        // Clean up any pending animation
        if (animationFrame.current !== null) {
          cancelAnimationFrame(animationFrame.current);
          animationFrame.current = null;
        }
      }
    };

    if (isRotating) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleEnd);
      document.addEventListener("touchmove", handleTouchMove, { passive: false });
      document.addEventListener("touchend", handleEnd);
      document.addEventListener("touchcancel", handleEnd);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleEnd);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleEnd);
      document.removeEventListener("touchcancel", handleEnd);
      
      // Clean up any pending animation
      if (animationFrame.current !== null) {
        cancelAnimationFrame(animationFrame.current);
        animationFrame.current = null;
      }
    };
  }, [
    isRotating,
    centerPos,
    element,
    updateElement
  ]);

  return {
    isRotating,
    handleRotateStart
  };
};
