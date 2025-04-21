
interface ViewportToCanvasOptions {
  canvasScale: number;
  canvasRect: DOMRect;
}

interface Coordinates {
  clientX: number;
  clientY: number;
}

export const getEventCoordinates = (event: MouseEvent | TouchEvent): Coordinates => {
  if ('touches' in event) {
    const touch = event.touches[0];
    return {
      clientX: touch.clientX,
      clientY: touch.clientY
    };
  }
  return {
    clientX: (event as MouseEvent).clientX,
    clientY: (event as MouseEvent).clientY
  };
};

export const viewportToCanvasCoordinates = (
  clientX: number, 
  clientY: number,
  options: ViewportToCanvasOptions
) => {
  const { canvasScale, canvasRect } = options;
  
  // Convert viewport coordinates to canvas-relative coordinates
  const canvasX = (clientX - canvasRect.left) / canvasScale;
  const canvasY = (clientY - canvasRect.top) / canvasScale;
  
  return { x: canvasX, y: canvasY };
};

export const getCanvasScale = (container: HTMLElement | null): number => {
  if (!container) return 1;
  
  const transform = window.getComputedStyle(container).transform;
  const matrix = new DOMMatrix(transform);
  return matrix.m11; // Get the horizontal scale factor
};

