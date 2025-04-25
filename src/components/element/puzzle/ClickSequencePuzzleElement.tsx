
import { DesignElement } from "@/types/designTypes";

interface ClickSequencePuzzleElementProps {
  element: DesignElement;
  onClick: (e: React.MouseEvent) => void;
}

const ClickSequencePuzzleElement = ({ element, onClick }: ClickSequencePuzzleElementProps) => {
  if (!element.clickSequencePuzzleConfig) return null;
  
  const { name, images = [], clickedIndices = [] } = element.clickSequencePuzzleConfig;
  
  return (
    <div 
      className="h-full w-full p-2"
      onClick={onClick}
      style={{
        backgroundColor: element.style?.backgroundColor as string || '#E8F5E9',
        borderRadius: element.style?.borderRadius as string || '8px',
        overflow: 'hidden'
      }}
    >
      <div className="font-semibold mb-1 text-sm">{name || "Click Sequence Puzzle"}</div>
      <div className="flex flex-wrap justify-around gap-2 h-[calc(100%-1.5rem)] overflow-hidden">
        {images.map((image, index) => {
          const clickOrder = clickedIndices.indexOf(index);
          return (
            <div 
              key={index}
              className="relative border-2 border-green-200 rounded bg-white flex-1 min-w-[60px] h-full flex items-center justify-center"
              style={{ maxWidth: `calc(100% / ${images.length} - 8px)` }}
            >
              <img 
                src={image} 
                alt={`Click item ${index}`}
                className="max-w-full max-h-full object-contain"
              />
              {clickOrder !== -1 && (
                <div className="absolute top-0 right-0 bg-green-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold">
                  {clickOrder + 1}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ClickSequencePuzzleElement;
