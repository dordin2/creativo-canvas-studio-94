
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
          value={activeTab === "size" ? [scaleValue] : [rotation]}
          min={activeTab === "size" ? 1 : -180}
          max={activeTab === "size" ? 100 : 180}
          step={1}
          onValueChange={activeTab === "size" ? onScaleChange : onRotationChange}
          disabled={disabled}
          className="w-full"
        />
      </div>
    </div>
  );
};

export default ImageControlTabs;
