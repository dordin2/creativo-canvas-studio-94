
import { DesignElement, useDesignState } from "@/context/DesignContext";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { HexColorPicker } from "react-colorful";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

interface BackgroundPropertiesProps {
  element: DesignElement;
}

const BackgroundProperties = ({ element }: BackgroundPropertiesProps) => {
  const { updateElement } = useDesignState();
  const [showColorPicker, setShowColorPicker] = useState(false);
  const { t } = useLanguage();
  
  // Extract background properties from element
  const color = element.style?.backgroundColor || element.style?.background || "#FFFFFF";
  const gradient = element.style?.background?.toString().includes("gradient") 
    ? element.style.background 
    : "";
  
  const handleColorChange = (newColor: string) => {
    const updatedStyle = {
      ...element.style,
      background: newColor,
      backgroundColor: newColor
    };
    updateElement(element.id, { style: updatedStyle });
  };
  
  const handleGradientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const updatedStyle = {
      ...element.style,
      background: e.target.value
    };
    updateElement(element.id, { style: updatedStyle });
  };
  
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">{t('properties.background.title') || "Background Properties"}</h3>
      
      <div className="space-y-2">
        <Label>{t('properties.background.color') || "Background Color"}</Label>
        <div className="flex items-center gap-2">
          <Popover open={showColorPicker} onOpenChange={setShowColorPicker}>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                className="w-10 h-10 p-0"
                style={{ backgroundColor: color as string }}
              />
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <HexColorPicker 
                color={color as string} 
                onChange={handleColorChange} 
              />
            </PopoverContent>
          </Popover>
          <Input 
            value={color as string} 
            onChange={(e) => handleColorChange(e.target.value)}
            placeholder="#FFFFFF"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label>{t('properties.background.gradient') || "Gradient (CSS)"}</Label>
        <Input 
          value={gradient as string} 
          onChange={handleGradientChange}
          placeholder="linear-gradient(to right, #ff0000, #0000ff)"
        />
        <p className="text-xs text-muted-foreground">
          {t('properties.background.gradient.help') || "Example: linear-gradient(to right, #ff0000, #0000ff)"}
        </p>
      </div>
    </div>
  );
};

export default BackgroundProperties;
