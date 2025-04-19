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
  const [scaleValue, setScaleValue] = useState<number>(50);
  const [rotation, setRotation] = useState(getRotation(element));
  
  useEffect(() => {
    if (element.originalSize && element.size && canvasSize.width && canvasSize.height) {
      const widthRatio = element.size.width / element.originalSize.width;
      const heightRatio = element.size.height / element.originalSize.height;
      const currentRatio = (widthRatio + heightRatio) / 2;
      let scale = Math.round(currentRatio * 50);
      scale = Math.min(Math.max(scale, 1), 100);
      setScaleValue(scale);
    }
  }, [element.originalSize, element.size, canvasSize, element.id]);

  useEffect(() => {
    setRotation(getRotation(element));
  }, [element]);

  const handleImageResize = useCallback((value: number[]) => {
    if (!element.originalSize || !canvasSize.width || !canvasSize.height) return;
    
    const scalePercentage = value[0];
    setScaleValue(scalePercentage);
    
    const scaleFactor = (scalePercentage / 50);
    
    const originalAspectRatio = element.originalSize.width / element.originalSize.height;
    
    const newWidth = Math.round(element.originalSize.width * scaleFactor);
    const newHeight = Math.round(element.originalSize.height * scaleFactor);
    
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
