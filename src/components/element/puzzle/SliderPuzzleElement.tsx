
import { DesignElement } from "@/types/designTypes";

interface SliderPuzzleElementProps {
  element: DesignElement;
  onClick: (e: React.MouseEvent) => void;
}

const SliderPuzzleElement = ({ element, onClick }: SliderPuzzleElementProps) => {
  if (!element.sliderPuzzleConfig) return null;
  
  const { name, orientation = 'horizontal', sliderCount = 3, currentValues = [], maxValue = 10 } = element.sliderPuzzleConfig;
  
  return (
    <div 
      className="h-full w-full p-2"
      onClick={onClick}
      style={{
        backgroundColor: element.style?.backgroundColor as string || '#F0F9FF',
        borderRadius: element.style?.borderRadius as string || '8px',
        overflow: 'hidden'
      }}
    >
      <div className="font-semibold mb-1 text-sm">{name || "Slider Puzzle"}</div>
      <div 
        className={`flex ${orientation === 'horizontal' ? 'flex-col' : 'flex-row'} gap-2 justify-center items-center h-[calc(100%-1.5rem)]`}
      >
        {Array.from({ length: sliderCount }).map((_, index) => {
          const value = currentValues[index] || 0;
          const percentage = (value / maxValue) * 100;
          
          return (
            <div 
              key={index}
              className={`relative ${orientation === 'horizontal' ? 'w-full h-4' : 'h-full w-4'} bg-gray-200 rounded-full overflow-hidden`}
            >
              <div 
                className="absolute bg-blue-400 rounded-full"
                style={{
                  [orientation === 'horizontal' ? 'width' : 'height']: `${percentage}%`,
                  [orientation === 'horizontal' ? 'height' : 'width']: '100%',
                  [orientation === 'horizontal' ? 'left' : 'bottom']: '0'
                }}
              />
              <div className={`absolute ${orientation === 'horizontal' ? 'right-0 transform -translate-y-1/2 top-1/2' : 'top-0 transform -translate-x-1/2 left-1/2'} text-xs font-medium`}>
                {value}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SliderPuzzleElement;
