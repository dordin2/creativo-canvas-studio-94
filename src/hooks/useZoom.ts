
import { useState, useCallback, RefObject } from 'react';

interface UseZoomProps {
  minZoom?: number;
  maxZoom?: number;
  initialZoom?: number;
}

export const useZoom = ({ 
  minZoom = 0.2, 
  maxZoom = 2, 
  initialZoom = 1 
}: UseZoomProps = {}) => {
  const [zoomLevel, setZoomLevel] = useState(initialZoom);
  const [zoomOrigin, setZoomOrigin] = useState({ x: 50, y: 50 });

  const handleZoom = useCallback((e: WheelEvent, containerRef: RefObject<HTMLDivElement>) => {
    if (!e.ctrlKey || !containerRef.current) return;
    e.preventDefault();

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    
    // Calculate relative mouse position as percentages
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    // Update zoom origin to mouse position
    setZoomOrigin({ x, y });

    // Calculate new zoom level
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoomLevel(prev => {
      const newZoom = Math.max(minZoom, Math.min(maxZoom, prev + delta));
      return newZoom;
    });
  }, [minZoom, maxZoom]);

  return {
    zoomLevel,
    setZoomLevel,
    zoomOrigin,
    setZoomOrigin,
    handleZoom
  };
};
