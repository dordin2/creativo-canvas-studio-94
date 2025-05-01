
import { useState, useEffect, useRef } from "react";
import { DesignElement } from "@/context/DesignContext";
import { useDesignState } from "@/context/DesignContext";
import { Slider } from "@/components/ui/slider";
import { ZoomIn, RotateCw } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import { getRotation } from "@/utils/elementStyles";

interface FloatingSmartSliderProps {
  element: DesignElement;
}

const FloatingSmartSlider = ({ element }: FloatingSmartSliderProps) => {
  const { updateElement, updateElementWithoutHistory, commitToHistory } = useDesignState();
  const [isRotationMode, setIsRotationMode] = useState(false);
  const [scaleValue, setScaleValue] = useState(() => calculateScale());
  const [isResizing, setIsResizing] = useState(false);
  const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    setScaleValue(calculateScale());
  }, [element.size, element.originalSize]);
  
  function calculateScale() {
    if (element.originalSize && element.size) {
      return Math.round((element.size.width / element.originalSize.width) * 100);
    }
    return 100;
  };
  
  const handleScaleChange = (value: number[]) => {
    if (!element.originalSize) return;
    
    const scalePercentage = value[0];
    setScaleValue(scalePercentage);
    setIsResizing(true);
    
    // Clear any existing timeout
    if (resizeTimeoutRef.current) {
      clearTimeout(resizeTimeoutRef.current);
    }
    
    const scaleFactor = scalePercentage / 100;
    const newWidth = Math.round(element.originalSize.width * scaleFactor);
    const newHeight = Math.round(element.originalSize.height * scaleFactor);
    
    // Update without history while dragging the slider
    updateElementWithoutHistory(element.id, {
      size: {
        width: newWidth,
        height: newHeight
      },
      style: {
        ...element.style,
        willChange: 'transform, width, height'
      }
    });
    
    // Set a timeout to commit the change to history and update the final size
    resizeTimeoutRef.current = setTimeout(() => {
      updateElement(element.id, {
        size: {
          width: newWidth,
          height: newHeight
        },
        style: {
          ...element.style,
          willChange: 'auto'
        }
      });
      setIsResizing(false);
      commitToHistory();
      
      // Add a small delay to allow the image to fully update before final resize
      setTimeout(() => {
        if (element.type === 'image') {
          const imageElement = document.querySelector(`#element-${element.id} img`) as HTMLImageElement;
          if (imageElement && !imageElement.complete) {
            // If image is not loaded yet, add a load event listener
            imageElement.addEventListener('load', function onLoad() {
              updateElementWithoutHistory(element.id, {});  // Trigger a rerender
              imageElement.removeEventListener('load', onLoad);
            });
          }
        }
      }, 50);
    }, 300);
  };
  
  const handleRotationChange = (value: number[]) => {
    const newRotation = Math.round(value[0]);
    updateElement(element.id, {
      style: { ...element.style, transform: `rotate(${newRotation}deg)` }
    });
  };
  
  useEffect(() => {
    // Cleanup function to clear timeouts when component unmounts
    return () => {
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, []);
  
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 min-w-[300px] animate-fade-in">
      <div className="flex items-center gap-4 p-3 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg">
        <div className="flex-1">
          <Slider 
            value={[isRotationMode ? getRotation(element) : scaleValue]}
            min={isRotationMode ? -180 : 10}
            max={isRotationMode ? 180 : 200}
            step={1}
            onValueChange={isRotationMode ? handleRotationChange : handleScaleChange}
            className="w-full"
          />
        </div>
        
        <Toggle 
          pressed={isRotationMode}
          onPressedChange={setIsRotationMode}
          className="ml-2"
        >
          {isRotationMode ? (
            <RotateCw className="h-4 w-4" />
          ) : (
            <ZoomIn className="h-4 w-4" />
          )}
        </Toggle>
        
        <div className="w-12 text-sm font-medium text-gray-600">
          {isRotationMode ? `${getRotation(element)}°` : `${scaleValue}%`}
        </div>
      </div>
    </div>
  );
};

export default FloatingSmartSlider;
