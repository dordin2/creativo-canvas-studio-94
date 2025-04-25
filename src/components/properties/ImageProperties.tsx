
import { useState, useEffect } from "react";
import { DesignElement } from "@/types/designTypes";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { useDesignState } from "@/context/DesignContext";
import { getRotation } from "@/utils/elementStyles";
import ImageUploader from "./image/ImageUploader";
import ImagePreview from "./image/ImagePreview";
import ImageStats from "./image/ImageStats";
import ImageResizer from "./image/ImageResizer";

const ImageProperties = ({ element }: { element: DesignElement }) => {
  const { updateElement, isGameMode } = useDesignState();
  const [rotation, setRotation] = useState(getRotation(element));
  const [imageSrc, setImageSrc] = useState<string | undefined>(
    element.dataUrl || element.src
  );

  useEffect(() => {
    setRotation(getRotation(element));
  }, [element]);

  const handleRotationChange = (value: number[]) => {
    if (isGameMode) return;

    const newRotation = Math.round(value[0]);
    setRotation(newRotation);
    updateElement(element.id, {
      style: { ...element.style, transform: `rotate(${newRotation}deg)` },
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isGameMode) return;

    const inputValue = e.target.value;
    const newRotation = parseInt(inputValue) || 0;
    const boundedRotation = Math.max(-360, Math.min(360, newRotation));

    handleRotationChange([boundedRotation]);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Image</Label>
        <ImageUploader element={element} />
        <ImageStats element={element} imageSrc={imageSrc} />
      </div>

      <ImageResizer element={element} />
      <ImagePreview element={element} />

      <div className="space-y-4">
        <Label>Rotation</Label>
        <div className="space-y-2">
          <Slider
            value={[rotation]}
            min={-180}
            max={180}
            step={1}
            onValueChange={handleRotationChange}
            disabled={isGameMode}
            className="my-4"
          />
          <div className="flex gap-4 items-center">
            <Input
              type="number"
              value={rotation}
              onChange={handleInputChange}
              min={-360}
              max={360}
              className="w-24"
              disabled={isGameMode}
            />
            <span className="text-sm">degrees</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageProperties;
