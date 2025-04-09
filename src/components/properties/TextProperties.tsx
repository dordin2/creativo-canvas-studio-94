import React, { useState, useEffect } from "react";
import { DesignElement } from "@/types/designTypes";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { HexColorPicker } from "react-colorful";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useDesignState } from "@/context/DesignContext";
import { getRotation } from "@/utils/elementStyles";

// Font options available in the editor
const fontOptions = [
  { value: "Arial, sans-serif", label: "Arial" },
  { value: "Verdana, sans-serif", label: "Verdana" },
  { value: "Helvetica, sans-serif", label: "Helvetica" },
  { value: "'Times New Roman', serif", label: "Times New Roman" },
  { value: "Georgia, serif", label: "Georgia" },
  { value: "'Courier New', monospace", label: "Courier New" },
  { value: "'Comic Sans MS', cursive", label: "Comic Sans" },
  { value: "'Impact', sans-serif", label: "Impact" },
  { value: "'Tahoma', sans-serif", label: "Tahoma" },
];

// Text alignment options
const alignmentOptions = [
  { value: "left", label: "Left" },
  { value: "center", label: "Center" },
  { value: "right", label: "Right" },
  { value: "justify", label: "Justify" },
];

interface TextPropertiesProps {
  element: DesignElement;
}

const TextProperties = ({ element }: TextPropertiesProps) => {
  const { updateElement, isGameMode } = useDesignState();
  const [text, setText] = useState(element.text || "");
  const [textColor, setTextColor] = useState(element.style?.color || "#000000");
  const [fontSize, setFontSize] = useState(
    parseInt(element.style?.fontSize || "16")
  );
  const [fontFamily, setFontFamily] = useState(
    element.style?.fontFamily || fontOptions[0].value
  );
  const [textAlign, setTextAlign] = useState(
    element.style?.textAlign || "left"
  );
  const [rotation, setRotation] = useState(getRotation(element));

  // Initialize state values when element changes
  useEffect(() => {
    setText(element.text || "");
    setTextColor(element.style?.color || "#000000");
    setFontSize(parseInt(element.style?.fontSize || "16"));
    setFontFamily(element.style?.fontFamily || fontOptions[0].value);
    setTextAlign(element.style?.textAlign || "left");
    setRotation(getRotation(element));
  }, [element]);

  // Event handlers for property changes
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newText = e.target.value;
    setText(newText);
    updateElement(element.id, { text: newText });
  };

  const handleColorChange = (color: string) => {
    setTextColor(color);
    updateElement(element.id, {
      style: { ...element.style, color }
    });
  };

  const handleFontSizeChange = (value: number[]) => {
    const newSize = value[0];
    setFontSize(newSize);
    updateElement(element.id, {
      style: { ...element.style, fontSize: `${newSize}px` }
    });
  };

  const handleFontFamilyChange = (value: string) => {
    setFontFamily(value);
    updateElement(element.id, {
      style: { ...element.style, fontFamily: value }
    });
  };

  const handleTextAlignChange = (value: string) => {
    setTextAlign(value);
    updateElement(element.id, {
      style: { ...element.style, textAlign: value }
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
    <div className="space-y-4">
      <div>
        <Label htmlFor="text-content">Text Content</Label>
        <Input
          id="text-content"
          value={text}
          onChange={handleTextChange}
          className="mt-1"
          placeholder="Enter text"
        />
      </div>

      <div>
        <Label>Text Color</Label>
        <div className="flex items-center gap-2 mt-1">
          <Popover>
            <PopoverTrigger asChild>
              <button
                className="w-8 h-8 rounded border"
                style={{ backgroundColor: textColor }}
                aria-label="Pick text color"
              />
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 border-none">
              <HexColorPicker color={textColor} onChange={handleColorChange} />
            </PopoverContent>
          </Popover>
          <Input
            value={textColor}
            onChange={(e) => handleColorChange(e.target.value)}
            className="flex-1 font-mono"
          />
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center">
          <Label>Font Size</Label>
          <span className="text-sm">{fontSize}px</span>
        </div>
        <Slider
          value={[fontSize]}
          min={8}
          max={72}
          step={1}
          onValueChange={handleFontSizeChange}
          className="my-2"
        />
      </div>

      <div>
        <Label htmlFor="font-family">Font Family</Label>
        <Select value={fontFamily} onValueChange={handleFontFamilyChange}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select font" />
          </SelectTrigger>
          <SelectContent>
            {fontOptions.map((font) => (
              <SelectItem key={font.value} value={font.value}>
                {font.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="text-align">Text Alignment</Label>
        <Select value={textAlign} onValueChange={handleTextAlignChange}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select alignment" />
          </SelectTrigger>
          <SelectContent>
            {alignmentOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

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

export default TextProperties;
