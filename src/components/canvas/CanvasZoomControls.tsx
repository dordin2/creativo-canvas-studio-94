
import { Minus, Plus, RotateCcw } from "lucide-react";

interface CanvasZoomControlsProps {
  zoomLevel: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
}

export const CanvasZoomControls = ({
  zoomLevel,
  onZoomIn,
  onZoomOut,
  onResetZoom
}: CanvasZoomControlsProps) => {
  return (
    <div className="zoom-controls">
      <button onClick={onZoomOut} title="Zoom Out">
        <Minus size={16} />
      </button>
      <span>{Math.round(zoomLevel * 100)}%</span>
      <button onClick={onZoomIn} title="Zoom In">
        <Plus size={16} />
      </button>
      <button onClick={onResetZoom} title="Reset Zoom">
        <RotateCcw size={16} />
      </button>
    </div>
  );
};
