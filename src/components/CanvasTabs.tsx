
import { useDesignState } from "@/context/DesignContext";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";

const CanvasTabs = () => {
  const { 
    canvases, 
    activeCanvasIndex, 
    setActiveCanvas, 
    addCanvas,
    removeCanvas
  } = useDesignState();
  const { language } = useLanguage();
  
  return (
    <div className={`flex items-center gap-1 p-2 overflow-x-auto ${language === 'he' ? 'rtl' : 'ltr'}`}>
      {canvases.map((canvas, index) => (
        <div 
          key={canvas.id} 
          className="flex-shrink-0 flex items-center"
        >
          <button
            className={cn(
              "flex items-center py-1 px-3 text-sm rounded-t-md border border-gray-300 transition-colors",
              activeCanvasIndex === index 
                ? "bg-white border-b-white font-medium text-canvas-purple" 
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            )}
            onClick={() => setActiveCanvas(index)}
          >
            <span>{canvas.name}</span>
          </button>
          {canvases.length > 1 && (
            <button
              className="ml-1 p-1 text-gray-500 hover:text-red-500 rounded-full hover:bg-gray-100"
              onClick={(e) => {
                e.stopPropagation();
                removeCanvas(index);
              }}
              title="Remove Canvas"
            >
              <X size={14} />
            </button>
          )}
        </div>
      ))}
      
      <Button
        variant="ghost"
        size="sm"
        className="flex-shrink-0 ml-2 gap-1"
        onClick={addCanvas}
      >
        <Plus size={16} />
        <span>{language === 'he' ? 'הוסף קאנבס' : 'Add Canvas'}</span>
      </Button>
    </div>
  );
};

export default CanvasTabs;
