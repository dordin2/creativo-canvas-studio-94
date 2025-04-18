
import { useState } from 'react';
import { RotateCw, Maximize2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
    <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "size" | "rotation")}>
      <div className="flex items-center gap-4 px-4">
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

        <div className="flex-1">
          <TabsContent value="size" forceMount>
            {activeTab === "size" && (
              <Slider
                value={[scaleValue]}
                min={1}
                max={100}
                step={1}
                onValueChange={onScaleChange}
                disabled={disabled}
                className="w-full"
              />
            )}
          </TabsContent>
          <TabsContent value="rotation" forceMount>
            {activeTab === "rotation" && (
              <Slider
                value={[rotation]}
                min={-180}
                max={180}
                step={1}
                onValueChange={onRotationChange}
                disabled={disabled}
                className="w-full"
              />
            )}
          </TabsContent>
        </div>
      </div>
    </Tabs>
  );
};

export default ImageControlTabs;
