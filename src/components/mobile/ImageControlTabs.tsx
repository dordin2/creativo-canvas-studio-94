
import { useState, useCallback, useRef, useEffect } from 'react';
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
  const sliderTouchActive = useRef(false);

  // Create more responsive debounced update functions
  const debouncedScaleChange = useCallback(
    debounce((value: number[]) => {
      onScaleChange(value);
    }, 16), // Keep the short 16ms debounce for smooth updates
    [onScaleChange]
  );

  const debouncedRotationChange = useCallback(
    debounce((value: number[]) => {
      onRotationChange(value);
    }, 16),
    [onRotationChange]
  );

  // Handle touch events for more responsive slider
  useEffect(() => {
    const handleTouchEnd = () => {
      if (sliderTouchActive.current) {
        sliderTouchActive.current = false;
      }
    };

    document.addEventListener('touchend', handleTouchEnd);
    return () => {
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  // Update local state immediately while debouncing the callbacks
  const handleScaleChange = (value: number[]) => {
    sliderTouchActive.current = true;
    setLocalScale(value[0]); 
    debouncedScaleChange(value);
  };

  const handleRotationChange = (value: number[]) => {
    sliderTouchActive.current = true;
    setLocalRotation(value[0]); 
    debouncedRotationChange(value);
  };

  // Reset local state when props change (if not during active touch)
  useEffect(() => {
    if (!sliderTouchActive.current && scaleValue !== localScale) {
      setLocalScale(scaleValue);
    }
  }, [scaleValue, localScale]);

  useEffect(() => {
    if (!sliderTouchActive.current && rotation !== localRotation) {
      setLocalRotation(rotation);
    }
  }, [rotation, localRotation]);

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
