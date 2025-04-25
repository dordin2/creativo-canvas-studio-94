
import { useState, useEffect, RefObject } from 'react';

interface UseCanvasScalingProps {
  containerRef: RefObject<HTMLDivElement>;
  parentRef: RefObject<HTMLDivElement>;
  isGameMode: boolean;
  isMobileView: boolean;
  isFullscreen: boolean;
  fixedWidth: number;
  fixedHeight: number;
}

export const useCanvasScaling = ({
  containerRef,
  parentRef,
  isGameMode,
  isMobileView,
  isFullscreen,
  fixedWidth,
  fixedHeight
}: UseCanvasScalingProps) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [canvasDimensions, setCanvasDimensions] = useState({ 
    width: fixedWidth, 
    height: fixedHeight 
  });

  // Handle zooming functions
  const handleZoomIn = () => {
    setZoomLevel(prevZoom => Math.min(prevZoom + 0.1, 3));
  };
  
  const handleZoomOut = () => {
    setZoomLevel(prevZoom => Math.max(prevZoom - 0.1, 0.5));
  };
  
  const handleResetZoom = () => {
    setZoomLevel(1);
  };

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && parentRef.current) {
        const parentWidth = parentRef.current.clientWidth;
        const parentHeight = parentRef.current.clientHeight;
        
        const canvasWidth = fixedWidth;
        const canvasHeight = fixedHeight;
        
        if (isMobileView && isGameMode) {
          const scaleX = parentWidth / canvasWidth;
          const scaleY = parentHeight / canvasHeight;
          const scale = Math.min(scaleX, scaleY);
          setZoomLevel(scale);
        } else {
          const scaleX = (parentWidth - 40) / canvasWidth;
          const scaleY = (parentHeight - 40) / canvasHeight;
          const scale = Math.min(scaleX, scaleY, 1);
          
          if (!isGameMode) {
            setZoomLevel(scale);
          }
        }
        
        setCanvasDimensions({ width: canvasWidth, height: canvasHeight });
      }
    };
    
    handleResize();
    
    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    
    if (parentRef.current) {
      resizeObserver.observe(parentRef.current);
    }
    
    window.addEventListener("resize", handleResize);
    
    return () => {
      if (parentRef.current) {
        resizeObserver.unobserve(parentRef.current);
      }
      window.removeEventListener("resize", handleResize);
    };
  }, [containerRef, parentRef, isGameMode, isMobileView, fixedWidth, fixedHeight]);

  const calculateFullscreenScale = () => {
    if (!isFullscreen && !isGameMode) return zoomLevel;
    
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    if (isMobileView) {
      const scaleX = viewportWidth / fixedWidth;
      const scaleY = viewportHeight / fixedHeight;
      return Math.min(scaleX, scaleY);
    }
    
    const scaleX = viewportWidth / fixedWidth;
    const scaleY = viewportHeight / fixedHeight;
    
    return Math.min(scaleX, scaleY);
  };
  
  const displayZoomLevel = (isFullscreen || isMobileView) && isGameMode 
    ? calculateFullscreenScale() 
    : zoomLevel;
  
  return {
    zoomLevel,
    setZoomLevel,
    canvasDimensions,
    handleZoomIn,
    handleZoomOut,
    handleResetZoom,
    displayZoomLevel
  };
};
