
import { useState, useEffect, useCallback } from 'react';
import { DesignElement } from "@/types/designTypes";
import { useDesignState } from "@/context/DesignContext";
import { getRotation } from "@/utils/elementStyles";
import ImageControlTabs from './ImageControlTabs';

interface MobileImageControlsProps {
  element: DesignElement;
  canvasSize: {
    width: number;
    height: number;
  };
}

const MobileImageControls = ({ element, canvasSize }: MobileImageControlsProps) => {
  const { updateElement, isGameMode } = useDesignState();
  const [scaleValue, setScaleValue] = useState<number>(50); // Start at middle of range
  const [rotation, setRotation] = useState(getRotation(element));
  
  // Calculate scale value when element or canvas size changes
  useEffect(() => {
    if (element.originalSize && element.size && canvasSize.width && canvasSize.height) {
      // Calculate the ratio based on how the image fills the canvas
      const widthRatio = element.size.width / canvasSize.width;
      const heightRatio = element.size.height / canvasSize.height;
      const currentRatio = Math.max(widthRatio, heightRatio);
      
      // Map the ratio to our slider range (1-100)
      // If ratio is 1.0, the image fills the canvas perfectly, so set to 50%
      // This gives room to both increase and decrease size
      let scale = Math.round(currentRatio * 50);
      
      // Ensure scale is within bounds and not at extremes
      scale = Math.min(Math.max(scale, 10), 90);
      
      setScaleValue(scale);
    }
  }, [element.originalSize, element.size, canvasSize]);

  // Update rotation when element changes
  useEffect(() => {
    setRotation(getRotation(element));
  }, [element]);

  const handleImageResize = useCallback((value: number[]) => {
    if (!element.originalSize || !canvasSize.width || !canvasSize.height) return;
    
    const scalePercentage = value[0];
    setScaleValue(scalePercentage);
    
    const maxWidth = canvasSize.width;
    const maxHeight = canvasSize.height;
    
    const imageAspectRatio = element.originalSize.width / element.originalSize.height;
    const canvasAspectRatio = maxWidth / maxHeight;
    
    let targetWidth, targetHeight;
    if (imageAspectRatio > canvasAspectRatio) {
      targetWidth = maxWidth;
      targetHeight = maxWidth / imageAspectRatio;
    } else {
      targetHeight = maxHeight;
      targetWidth = maxHeight * imageAspectRatio;
    }
    
    // Adjust scaling factor to give more range
    // At 50%, the image is at a reasonable default size (about half of canvas)
    // At 100%, the image is 2x that size
    // At 1%, the image is very small
    const scaleFactor = (scalePercentage / 50) * 1.0;
    
    const newWidth = Math.round(targetWidth * scaleFactor);
    const newHeight = Math.round(targetHeight * scaleFactor);
    
    updateElement(element.id, {
      size: {
        width: newWidth,
        height: newHeight
      }
    });
  }, [element, canvasSize, updateElement]);

  const handleRotationChange = useCallback((value: number[]) => {
    if (isGameMode) return;
    
    const newRotation = Math.round(value[0]);
    setRotation(newRotation);
    updateElement(element.id, {
      style: { ...element.style, transform: `rotate(${newRotation}deg)` }
    });
  }, [isGameMode, element, updateElement]);

  return (
    <ImageControlTabs
      scaleValue={scaleValue}
      rotation={rotation}
      onScaleChange={handleImageResize}
      onRotationChange={handleRotationChange}
      disabled={isGameMode}
    />
  );
};

export default MobileImageControls;
