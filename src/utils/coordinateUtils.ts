
interface ViewportToCanvasOptions {
  canvasScale: number;
  canvasRect: DOMRect;
}

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
  return matrix.m11; // Get horizontal scale factor (for uniform scale, m11 == m22)
};

export const getClientCoordinates = (event: TouchEvent | MouseEvent): { clientX: number, clientY: number } => {
  if ('touches' in event && event.touches.length > 0) {
    return {
      clientX: event.touches[0].clientX,
      clientY: event.touches[0].clientY
    };
  } else if ('clientX' in event) {
    return {
      clientX: event.clientX,
      clientY: event.clientY
    };
  }
  
  return { clientX: 0, clientY: 0 };
};

// Add function to prevent default scrolling during drag operations
export const preventDefaultTouchAction = (event: TouchEvent): void => {
  if (event.cancelable) {
    event.preventDefault();
  }
};
