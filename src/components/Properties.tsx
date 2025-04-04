
import { useDesignState } from "@/context/DesignContext";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const Properties = () => {
  const { activeElement, updateElement, removeElement } = useDesignState();

  if (!activeElement) {
    return (
      <div className="w-64 border-l p-4 bg-white">
        <p className="text-muted-foreground text-sm text-center">
          Select an element to edit its properties
        </p>
      </div>
    );
  }

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateElement(activeElement.id, { content: e.target.value });
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStyle = { ...activeElement.style, backgroundColor: e.target.value };
    updateElement(activeElement.id, { style: newStyle });
  };

  const handleTextColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStyle = { ...activeElement.style, color: e.target.value };
    updateElement(activeElement.id, { style: newStyle });
  };

  const handleSizeChange = (value: number[], dimension: 'width' | 'height') => {
    const newSize = { ...activeElement.size, [dimension]: value[0] };
    updateElement(activeElement.id, { size: newSize });
  };

  const handleOpacityChange = (value: number[]) => {
    const opacity = value[0] / 100;
    const newStyle = { ...activeElement.style, opacity };
    updateElement(activeElement.id, { style: newStyle });
  };

  const handleBorderRadiusChange = (value: number[]) => {
    const borderRadius = `${value[0]}px`;
    const newStyle = { ...activeElement.style, borderRadius };
    updateElement(activeElement.id, { style: newStyle });
  };

  const handleDeleteElement = () => {
    removeElement(activeElement.id);
    toast.success("Element deleted");
  };

  // Helper function to parse borderRadius value to number
  const parseBorderRadius = (borderRadiusValue: string | number | undefined): number => {
    if (typeof borderRadiusValue === 'number') return borderRadiusValue;
    if (!borderRadiusValue) return 4; // Default value
    
    // Extract number from string like "4px"
    const match = String(borderRadiusValue).match(/^(\d+)/);
    return match ? parseInt(match[1], 10) : 4;
  };

  // Helper to get opacity as a number
  const getOpacityValue = (opacity: string | number | undefined): number => {
    if (typeof opacity === 'number') return opacity * 100;
    return 100; // Default value
  };

  // Determine what properties to show based on element type
  const renderProperties = () => {
    switch (activeElement.type) {
      case 'rectangle':
      case 'circle':
      case 'line':
        return (
          <>
            <div className="mb-4">
              <Label htmlFor="color">Color</Label>
              <Input 
                id="color" 
                type="color" 
                value={activeElement.style?.backgroundColor as string || '#8B5CF6'} 
                onChange={handleColorChange}
                className="h-10"
              />
            </div>
            
            <div className="mb-4">
              <Label htmlFor="opacity">Opacity</Label>
              <Slider 
                id="opacity"
                defaultValue={[getOpacityValue(activeElement.style?.opacity)]} 
                max={100} 
                step={1}
                onValueChange={(value) => handleOpacityChange(value)}
                className="my-2"
              />
            </div>
            
            {activeElement.type === 'rectangle' && (
              <div className="mb-4">
                <Label htmlFor="borderRadius">Corner Radius</Label>
                <Slider 
                  id="borderRadius"
                  defaultValue={[parseBorderRadius(activeElement.style?.borderRadius)]} 
                  max={50} 
                  step={1}
                  onValueChange={(value) => handleBorderRadiusChange(value)}
                  className="my-2"
                />
              </div>
            )}
            
            <div className="mb-4">
              <Label htmlFor="width">Width</Label>
              <Slider 
                id="width"
                defaultValue={[activeElement.size?.width || 100]} 
                min={10}
                max={500} 
                step={1}
                onValueChange={(value) => handleSizeChange(value, 'width')}
                className="my-2"
              />
            </div>
            
            {activeElement.type !== 'line' && (
              <div className="mb-4">
                <Label htmlFor="height">Height</Label>
                <Slider 
                  id="height"
                  defaultValue={[activeElement.size?.height || 100]} 
                  min={10}
                  max={500} 
                  step={1}
                  onValueChange={(value) => handleSizeChange(value, 'height')}
                  className="my-2"
                />
              </div>
            )}
          </>
        );
        
      case 'triangle':
        return (
          <>
            <div className="mb-4">
              <Label htmlFor="color">Color</Label>
              <Input 
                id="color" 
                type="color" 
                value={activeElement.style?.backgroundColor as string || '#8B5CF6'} 
                onChange={handleColorChange}
                className="h-10"
              />
            </div>
            
            <div className="mb-4">
              <Label htmlFor="opacity">Opacity</Label>
              <Slider 
                id="opacity"
                defaultValue={[getOpacityValue(activeElement.style?.opacity)]} 
                max={100} 
                step={1}
                onValueChange={(value) => handleOpacityChange(value)}
                className="my-2"
              />
            </div>
            
            <div className="mb-4">
              <Label htmlFor="width">Size</Label>
              <Slider 
                id="width"
                defaultValue={[activeElement.size?.width || 50]} 
                min={10}
                max={200} 
                step={1}
                onValueChange={(value) => {
                  handleSizeChange(value, 'width');
                  handleSizeChange([value[0] * 2], 'height');
                }}
                className="my-2"
              />
            </div>
          </>
        );
        
      case 'heading':
      case 'subheading':
      case 'paragraph':
        return (
          <>
            <div className="mb-4">
              <Label htmlFor="text">Text</Label>
              <Input 
                id="text" 
                value={activeElement.content || ''} 
                onChange={handleTextChange} 
                className="mt-1"
              />
            </div>
            
            <div className="mb-4">
              <Label htmlFor="textColor">Text Color</Label>
              <Input 
                id="textColor" 
                type="color" 
                value={activeElement.style?.color as string || '#1F2937'} 
                onChange={handleTextColorChange}
                className="h-10 mt-1"
              />
            </div>
            
            <div className="mb-4">
              <Label htmlFor="opacity">Opacity</Label>
              <Slider 
                id="opacity"
                defaultValue={[getOpacityValue(activeElement.style?.opacity)]} 
                max={100} 
                step={1}
                onValueChange={(value) => handleOpacityChange(value)}
                className="my-2"
              />
            </div>
          </>
        );
        
      case 'image':
        return (
          <>
            <div className="mb-4">
              <Label htmlFor="opacity">Opacity</Label>
              <Slider 
                id="opacity"
                defaultValue={[getOpacityValue(activeElement.style?.opacity)]} 
                max={100} 
                step={1}
                onValueChange={(value) => handleOpacityChange(value)}
                className="my-2"
              />
            </div>
            
            <div className="mb-4">
              <Label htmlFor="width">Width</Label>
              <Slider 
                id="width"
                defaultValue={[activeElement.size?.width || 200]} 
                min={50}
                max={600} 
                step={1}
                onValueChange={(value) => handleSizeChange(value, 'width')}
                className="my-2"
              />
            </div>
            
            <div className="mb-4">
              <Label htmlFor="height">Height</Label>
              <Slider 
                id="height"
                defaultValue={[activeElement.size?.height || 150]} 
                min={50}
                max={600} 
                step={1}
                onValueChange={(value) => handleSizeChange(value, 'height')}
                className="my-2"
              />
            </div>
            
            <div className="mb-4">
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input 
                id="imageUrl" 
                value={activeElement.src || ''} 
                onChange={(e) => updateElement(activeElement.id, { src: e.target.value })} 
                placeholder="Enter image URL"
                className="mt-1"
              />
            </div>
          </>
        );
        
      case 'background':
        return (
          <>
            <div className="mb-4">
              <Label htmlFor="backgroundColor">Background Color</Label>
              <Input 
                id="backgroundColor" 
                type="color" 
                value={activeElement.style?.backgroundColor as string || '#FFFFFF'} 
                onChange={handleColorChange}
                className="h-10 mt-1"
              />
            </div>
          </>
        );
        
      default:
        return (
          <p className="text-muted-foreground text-sm">
            No properties available for this element type
          </p>
        );
    }
  };

  return (
    <div className="w-64 border-l p-4 bg-white overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium">{activeElement.type.charAt(0).toUpperCase() + activeElement.type.slice(1)} Properties</h3>
        <Button variant="ghost" size="icon" onClick={handleDeleteElement} className="text-destructive">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      
      {renderProperties()}
    </div>
  );
};

export default Properties;
