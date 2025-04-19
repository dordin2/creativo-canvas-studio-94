
import { useState, useCallback, useRef } from 'react';
import { RotateCw, Maximize2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import debounce from 'lodash/debounce';

interface ImageControlTabsProps {
  scaleValue: number;
  rotation: number;
  onScaleChange: (value: number[]) => void;
  onRotationChange: (value: number[]) => void;
  disabled?: boolean;
}

const ImageControlTabs = ({
  scaleValue,
  rotation,
  onScaleChange,
  onRotationChange,
  disabled = false
}: ImageControlTabsProps) => {
  const [activeTab, setActiveTab] = useState<"size" | "rotation">("size");
  const [localScale, setLocalScale] = useState(scaleValue);
  const [localRotation, setLocalRotation] = useState(rotation);
  const frameRef = useRef<number>();

  // Debounced update functions with shorter delay
  const debouncedScaleChange = useCallback(
    debounce((value: number[]) => {
      onScaleChange(value);
    }, 50),
    [onScaleChange]
  );

  const debouncedRotationChange = useCallback(
    debounce((value: number[]) => {
      onRotationChange(value);
    }, 50),
    [onRotationChange]
  );

  const handleScaleChange = (value: number[]) => {
    // Cancel any pending animation frame
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
    }
    
    // Update local state immediately for smooth UI
    setLocalScale(value[0]);
    
    // Schedule the update on the next animation frame
    frameRef.current = requestAnimationFrame(() => {
      debouncedScaleChange(value);
    });
  };

  const handleRotationChange = (value: number[]) => {
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
    }
    
    setLocalRotation(value[0]);
    
    frameRef.current = requestAnimationFrame(() => {
      debouncedRotationChange(value);
    });
  };

  // Reset local state when props change
  if (scaleValue !== localScale) {
    setLocalScale(scaleValue);
  }
  if (rotation !== localRotation) {
    setLocalRotation(rotation);
  }

  return (
    <div className="flex items-center gap-4 px-4">
      <Tabs value={activeTab} onValueChange={(value: "size" | "rotation") => setActiveTab(value)}>
        <TabsList className="h-8">
          <TabsTrigger
            value="size"
            className={`px-2 py-1 ${activeTab === "size" ? "bg-gray-100" : ""}`}
          >
            <Maximize2 className="h-4 w-4" />
          </TabsTrigger>
          <TabsTrigger
            value="rotation"
            className={`px-2 py-1 ${activeTab === "rotation" ? "bg-gray-100" : ""}`}
          >
            <RotateCw className="h-4 w-4" />
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex-1">
        <Slider
          value={activeTab === "size" ? [localScale] : [localRotation]}
          min={activeTab === "size" ? 1 : -180}
          max={activeTab === "size" ? 100 : 180}
          step={1}
          onValueChange={activeTab === "size" ? handleScaleChange : handleRotationChange}
          disabled={disabled}
          className="w-full"
        />
      </div>
    </div>
  );
};

export default ImageControlTabs;
