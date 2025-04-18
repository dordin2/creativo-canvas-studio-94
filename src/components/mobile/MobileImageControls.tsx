
import { useState, useEffect } from 'react';
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
  const [scaleValue, setScaleValue] = useState<number>(100);
  const [rotation, setRotation] = useState(getRotation(element));

  useEffect(() => {
    if (element.originalSize && element.size && canvasSize.width && canvasSize.height) {
      const widthRatio = element.size.width / canvasSize.width;
      const heightRatio = element.size.height / canvasSize.height;
      const currentRatio = Math.max(widthRatio, heightRatio);
      const scale = Math.round(currentRatio * 100);
      setScaleValue(scale);
    }
  }, [element.originalSize, element.size, canvasSize]);

  useEffect(() => {
    setRotation(getRotation(element));
  }, [element]);

  const handleImageResize = (value: number[]) => {
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
    
    const scaleFactor = scalePercentage / 100;
    const newWidth = Math.round(targetWidth * scaleFactor);
    const newHeight = Math.round(targetHeight * scaleFactor);
    
    updateElement(element.id, {
      size: {
        width: newWidth,
        height: newHeight
      }
    });
  };

  const handleRotationChange = (value: number[]) => {
    if (isGameMode) return;
    
    const newRotation = Math.round(value[0]);
    setRotation(newRotation);
    updateElement(element.id, {
      style: { ...element.style, transform: `rotate(${newRotation}deg)` }
    });
  };

  return (
    <div className="fixed bottom-0 left-0 right-0">
      <ImageControlTabs
        scaleValue={scaleValue}
        rotation={rotation}
        onScaleChange={handleImageResize}
        onRotationChange={handleRotationChange}
        disabled={isGameMode}
      />
    </div>
  );
};

export default MobileImageControls;
