
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
