
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
  const [localCanvasSize, setLocalCanvasSize] = useState(canvasSize);
  const [observer, setObserver] = useState<ResizeObserver | null>(null);

  useEffect(() => {
    const container = document.querySelector('.canvas-container');
    if (!container) return;

    // Initialize with current dimensions
    setLocalCanvasSize({
      width: container.clientWidth || 1600,
      height: container.clientHeight || 900
    });

    // Set up ResizeObserver
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        setLocalCanvasSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height
        });
      }
    });

    resizeObserver.observe(container);
    setObserver(resizeObserver);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    if (element.originalSize && element.size && localCanvasSize.width && localCanvasSize.height) {
      const widthRatio = element.size.width / localCanvasSize.width;
      const heightRatio = element.size.height / localCanvasSize.height;
      const currentRatio = Math.max(widthRatio, heightRatio);
      
      let scale = Math.round(currentRatio * 50);
      scale = Math.min(Math.max(scale, 10), 90);
      
      setScaleValue(scale);
    }
  }, [element.originalSize, element.size, localCanvasSize]);

  useEffect(() => {
    setRotation(getRotation(element));
  }, [element]);

  const handleImageResize = useCallback((value: number[]) => {
    if (!element.originalSize || !localCanvasSize.width || !localCanvasSize.height) return;
    
    const scalePercentage = value[0];
    setScaleValue(scalePercentage);
    
    const maxWidth = localCanvasSize.width;
    const maxHeight = localCanvasSize.height;
    
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
    
    const scaleFactor = (scalePercentage / 50) * 1.0;
    
    const newWidth = Math.round(targetWidth * scaleFactor);
    const newHeight = Math.round(targetHeight * scaleFactor);
    
    updateElement(element.id, {
      size: {
        width: newWidth,
        height: newHeight
      }
    });
  }, [element, localCanvasSize, updateElement]);

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
