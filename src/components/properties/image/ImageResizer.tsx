
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { DesignElement } from "@/types/designTypes";
import { useImageResize } from "@/hooks/useImageResize";

interface ImageResizerProps {
  element: DesignElement;
}

const ImageResizer = ({ element }: ImageResizerProps) => {
  const { isDragging, currentScale, handleResizeStart, handleResize, handleResizeEnd } = 
    useImageResize(element);

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-2">
        <Label>Resize Image</Label>
        <span className="text-sm font-medium">{currentScale}%</span>
      </div>
      <Slider
        defaultValue={[100]}
        value={[currentScale]}
        min={10}
        max={200}
        step={1}
        className="mb-2"
        onValueChange={handleResize}
        onValueCommit={handleResizeEnd}
        onPointerDown={() => handleResizeStart()}
      />
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>10%</span>
        <span>200%</span>
      </div>
      <div className="text-sm mt-2">
        {element.size?.width} × {element.size?.height} px
      </div>
    </div>
  );
};

export default ImageResizer;
