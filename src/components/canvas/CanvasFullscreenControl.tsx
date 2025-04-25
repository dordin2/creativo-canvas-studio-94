
import { Maximize, Minimize } from "lucide-react";

interface CanvasFullscreenControlProps {
  isFullscreenActive: boolean;
  onToggleFullscreen: () => void;
}

export const CanvasFullscreenControl = ({
  isFullscreenActive,
  onToggleFullscreen
}: CanvasFullscreenControlProps) => {
  return (
    <div className="fullscreen-controls">
      <button 
        onClick={onToggleFullscreen} 
        title={isFullscreenActive ? "Exit Fullscreen" : "Enter Fullscreen"}
        className="fullscreen-button"
      >
        {isFullscreenActive ? <Minimize size={18} /> : <Maximize size={18} />}
      </button>
    </div>
  );
};
