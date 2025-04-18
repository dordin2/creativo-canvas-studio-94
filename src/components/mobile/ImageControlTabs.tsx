
import { useState } from 'react';
import { RotateCw, Maximize2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";

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

  return (
    <div className="space-y-4 p-4 bg-white border-t border-gray-200">
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "size" | "rotation")} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="size" className="flex items-center gap-2">
            <Maximize2 className="h-4 w-4" />
            Size
          </TabsTrigger>
          <TabsTrigger value="rotation" className="flex items-center gap-2">
            <RotateCw className="h-4 w-4" />
            Rotation
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="space-y-2">
        {activeTab === "size" ? (
          <>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Size</span>
              <span className="text-sm text-muted-foreground">{scaleValue}%</span>
            </div>
            <Slider
              value={[scaleValue]}
              min={1}
              max={100}
              step={1}
              onValueChange={onScaleChange}
              disabled={disabled}
              className="w-full"
            />
          </>
        ) : (
          <>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Rotation</span>
              <span className="text-sm text-muted-foreground">{rotation}°</span>
            </div>
            <Slider
              value={[rotation]}
              min={-180}
              max={180}
              step={1}
              onValueChange={onRotationChange}
              disabled={disabled}
              className="w-full"
            />
          </>
        )}
      </div>
    </div>
  );
};

export default ImageControlTabs;
