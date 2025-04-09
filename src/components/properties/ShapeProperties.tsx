import React, { useState, useEffect } from "react";
import { DesignElement } from "@/types/designTypes";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { HexColorPicker } from "react-colorful";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useDesignState } from "@/context/DesignContext";
import { Slider } from "@/components/ui/slider";
import { getRotation } from "@/utils/elementStyles";

interface ShapePropertiesProps {
  element: DesignElement;
}

const ShapeProperties = ({ element }: ShapePropertiesProps) => {
  const { updateElement, isGameMode } = useDesignState();
  const [fillColor, setFillColor] = useState(element.style?.backgroundColor || "#000000");
  const [borderColor, setBorderColor] = useState(element.style?.borderColor || "#000000");
  const [borderWidth, setBorderWidth] = useState(parseInt(element.style?.borderWidth || "0"));
  const [borderRadius, setBorderRadius] = useState(parseInt(element.style?.borderRadius || "0"));
  const [rotation, setRotation] = useState(getRotation(element));

  useEffect(() => {
    setFillColor(element.style?.backgroundColor || "#000000");
    setBorderColor(element.style?.borderColor || "#000000");
    setBorderWidth(parseInt(element.style?.borderWidth || "0"));
    setBorderRadius(parseInt(element.style?.borderRadius || "0"));
    setRotation(getRotation(element));
  }, [element]);

  const handleFillColorChange = (color: string) => {
    setFillColor(color);
    updateElement(element.id, {
      style: { ...element.style, backgroundColor: color }
    });
  };

  const handleBorderColorChange = (color: string) => {
    setBorderColor(color);
    updateElement(element.id, {
      style: { ...element.style, borderColor: color }
    });
  };

  const handleBorderWidthChange = (value: number[]) => {
    const width = value[0];
    setBorderWidth(width);
    updateElement(element.id, {
      style: { ...element.style, borderWidth: `${width}px` }
    });
  };

  const handleBorderRadiusChange = (value: number[]) => {
    const radius = value[0];
    setBorderRadius(radius);
    updateElement(element.id, {
      style: { ...element.style, borderRadius: `${radius}px` }
    });
  };

  const handleRotationChange = (value: number[]) => {
    if (isGameMode) return; // No rotation in game mode
    
    const newRotation = Math.round(value[0]);
    setRotation(newRotation);
    updateElement(element.id, {
      style: { ...element.style, transform: `rotate(${newRotation}deg)` }
    });
  };

  const handleRotationInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isGameMode) return;
    
    // Parse input and handle non-numeric input
    const inputValue = e.target.value;
    const newRotation = parseInt(inputValue) || 0;
    
    // Keep rotation between -360 and 360 degrees
    const boundedRotation = Math.max(-360, Math.min(360, newRotation));
    
    setRotation(boundedRotation);
    updateElement(element.id, {
      style: { ...element.style, transform: `rotate(${boundedRotation}deg)` }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <Label>Fill Color</Label>
        <div className="flex items-center gap-2 mt-2">
          <Popover>
            <PopoverTrigger asChild>
              <button
                className="w-8 h-8 rounded border"
                style={{ backgroundColor: fillColor }}
                aria-label="Pick fill color"
              />
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 border-none">
              <HexColorPicker color={fillColor} onChange={handleFillColorChange} />
            </PopoverContent>
          </Popover>
          <Input
            value={fillColor}
            onChange={(e) => handleFillColorChange(e.target.value)}
            className="flex-1 font-mono"
          />
        </div>
      </div>

      <div>
        <Label>Border Color</Label>
        <div className="flex items-center gap-2 mt-2">
          <Popover>
            <PopoverTrigger asChild>
              <button
                className="w-8 h-8 rounded border"
                style={{ backgroundColor: borderColor }}
                aria-label="Pick border color"
              />
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 border-none">
              <HexColorPicker color={borderColor} onChange={handleBorderColorChange} />
            </PopoverContent>
          </Popover>
          <Input
            value={borderColor}
            onChange={(e) => handleBorderColorChange(e.target.value)}
            className="flex-1 font-mono"
          />
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center">
          <Label>Border Width</Label>
          <span className="text-sm">{borderWidth}px</span>
        </div>
        <Slider
          value={[borderWidth]}
          min={0}
          max={20}
          step={1}
          onValueChange={handleBorderWidthChange}
          className="my-4"
        />
      </div>

      {element.type !== "line" && (
        <div>
          <div className="flex justify-between items-center">
            <Label>Border Radius</Label>
            <span className="text-sm">{borderRadius}px</span>
          </div>
          <Slider
            value={[borderRadius]}
            min={0}
            max={50}
            step={1}
            onValueChange={handleBorderRadiusChange}
            className="my-4"
          />
        </div>
      )}

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
              onChange={handleRotationInputChange}
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

export default ShapeProperties;
