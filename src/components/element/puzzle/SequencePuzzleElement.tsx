
import { DesignElement } from "@/types/designTypes";

interface SequencePuzzleElementProps {
  element: DesignElement;
  onClick: (e: React.MouseEvent) => void;
}

const SequencePuzzleElement = ({ element, onClick }: SequencePuzzleElementProps) => {
  if (!element.sequencePuzzleConfig) return null;
  
  const { name, images = [], currentOrder = [] } = element.sequencePuzzleConfig;
  
  return (
    <div 
      className="h-full w-full p-2"
      onClick={onClick}
      style={{
        backgroundColor: element.style?.backgroundColor as string || '#EFF6FF',
        borderRadius: element.style?.borderRadius as string || '8px',
        overflow: 'hidden'
      }}
    >
      <div className="font-semibold mb-1 text-sm">{name || "Sequence Puzzle"}</div>
      <div className="flex flex-wrap justify-around gap-2 h-[calc(100%-1.5rem)] overflow-hidden">
        {images.map((image, index) => {
          const order = currentOrder.indexOf(index);
          return (
            <div 
              key={index}
              className="relative border-2 border-blue-200 rounded bg-white flex-1 min-w-[60px] h-full flex items-center justify-center"
              style={{ maxWidth: `calc(100% / ${images.length} - 8px)` }}
            >
              <img 
                src={image} 
                alt={`Sequence item ${index}`}
                className="max-w-full max-h-full object-contain"
              />
              {order !== -1 && (
                <div className="absolute top-0 right-0 bg-blue-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold">
                  {order + 1}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SequencePuzzleElement;
