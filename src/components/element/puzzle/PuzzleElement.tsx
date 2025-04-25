
import { DesignElement } from "@/types/designTypes";

interface PuzzleElementProps {
  element: DesignElement;
  onClick: (e: React.MouseEvent) => void;
}

const PuzzleElement = ({ element, onClick }: PuzzleElementProps) => {
  if (!element.puzzleConfig) return null;

  const { name, type, placeholders = 3, images = [], solution = [] } = element.puzzleConfig;

  return (
    <div 
      className="h-full w-full p-2"
      onClick={onClick}
      style={{
        backgroundColor: element.style?.backgroundColor as string || '#F3F4F6',
        borderRadius: element.style?.borderRadius as string || '8px',
        overflow: 'hidden'
      }}
    >
      <div className="font-semibold mb-1 text-sm">{name || "Puzzle"}</div>
      <div className="flex flex-wrap justify-around gap-2">
        {Array.from({ length: placeholders }).map((_, index) => {
          const image = images[index];
          return (
            <div 
              key={index} 
              className="w-10 h-10 border-2 border-dashed border-gray-300 rounded flex items-center justify-center bg-white"
            >
              {type === 'image' && image ? (
                <img 
                  src={image} 
                  alt={`Puzzle piece ${index}`}
                  className="max-w-full max-h-full object-contain"
                />
              ) : type === 'number' ? (
                <span className="font-medium">{index + 1}</span>
              ) : type === 'alphabet' ? (
                <span className="font-medium">{String.fromCharCode(65 + index)}</span>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PuzzleElement;
