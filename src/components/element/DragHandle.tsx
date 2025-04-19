
import { MoveVertical } from 'lucide-react';

interface DragHandleProps {
  isDragging: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onTouchStart: (e: React.TouchEvent) => void;
}

const DragHandle = ({ isDragging, onMouseDown, onTouchStart }: DragHandleProps) => {
  return (
    <div 
      className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-200 ${isDragging ? 'opacity-70' : 'opacity-0 group-hover:opacity-40'}`}
    >
      <div 
        className="w-12 h-12 rounded-full bg-black/50 flex items-center justify-center cursor-move pointer-events-auto"
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
      >
        <MoveVertical className="w-8 h-8 text-white" />
      </div>
    </div>
  );
};

export default DragHandle;
