
import { useState } from "react";
import { useDesignState } from "@/context/DesignContext";
import { HexColorPicker } from "react-colorful";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Trash2 } from "lucide-react";
import LayersList from "./LayersList"; // Import the new component

const Properties = () => {
  const { activeElement, updateElement, removeElement } = useDesignState();
  const [activeTab, setActiveTab] = useState("style");
  
  const handleColorChange = (newColor: string) => {
    if (!activeElement) return;
    
    if (activeElement.type === 'rectangle' || activeElement.type === 'circle' || 
        activeElement.type === 'triangle' || activeElement.type === 'line') {
      updateElement(activeElement.id, {
        style: { ...activeElement.style, backgroundColor: newColor }
      });
    } else if (['heading', 'subheading', 'paragraph'].includes(activeElement.type)) {
      updateElement(activeElement.id, {
        style: { ...activeElement.style, color: newColor }
      });
    }
  };
  
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!activeElement) return;
    updateElement(activeElement.id, { content: e.target.value });
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!activeElement || activeElement.type !== 'image') return;
    updateElement(activeElement.id, { src: e.target.value });
  };
  
  const handleDelete = () => {
    if (!activeElement) return;
    removeElement(activeElement.id);
  };
  
  const getRotation = (): number => {
    if (!activeElement?.style?.transform) return 0;
    const match = activeElement.style.transform.toString().match(/rotate\((-?\d+)deg\)/);
    return match ? parseInt(match[1], 10) : 0;
  };
  
  const handleRotationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!activeElement) return;
    const rotation = parseInt(e.target.value) || 0;
    updateElement(activeElement.id, {
      style: { ...activeElement.style, transform: `rotate(${rotation}deg)` }
    });
  };
  
  if (!activeElement) {
    return (
      <div className="properties-panel border-l p-6 flex flex-col">
        <h3 className="text-lg font-medium mb-4">Properties</h3>
        <p className="text-sm text-muted-foreground">
          Select an element to edit its properties
        </p>
        
        {/* Display layers list even when no element is selected */}
        <LayersList />
      </div>
    );
  }
  
  return (
    <div className="properties-panel border-l p-6 flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium">Properties</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-destructive hover:text-destructive"
          onClick={handleDelete}
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Delete
        </Button>
      </div>
      
      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="flex-1 flex flex-col"
      >
        <TabsList className="mb-6">
          <TabsTrigger value="style">Style</TabsTrigger>
          <TabsTrigger value="position">Position</TabsTrigger>
        </TabsList>
        
        <TabsContent value="style" className="flex-1 flex flex-col space-y-6">
          {/* Shape Properties */}
          {['rectangle', 'circle', 'triangle', 'line'].includes(activeElement.type) && (
            <div className="space-y-4">
              <Label>Fill Color</Label>
              <HexColorPicker 
                color={activeElement.style?.backgroundColor as string || '#8B5CF6'} 
                onChange={handleColorChange}
                className="w-full mb-2"
              />
              <Input 
                value={activeElement.style?.backgroundColor as string || '#8B5CF6'} 
                onChange={(e) => handleColorChange(e.target.value)}
              />
            </div>
          )}
          
          {/* Text Properties */}
          {['heading', 'subheading', 'paragraph'].includes(activeElement.type) && (
            <div className="space-y-4">
              <div>
                <Label>Text Content</Label>
                <Textarea 
                  value={activeElement.content || ''}
                  onChange={handleTextChange}
                  className="mt-2"
                />
              </div>
              
              <div>
                <Label>Text Color</Label>
                <HexColorPicker 
                  color={activeElement.style?.color as string || '#1F2937'} 
                  onChange={handleColorChange}
                  className="w-full mb-2 mt-2"
                />
                <Input 
                  value={activeElement.style?.color as string || '#1F2937'} 
                  onChange={(e) => handleColorChange(e.target.value)}
                />
              </div>
            </div>
          )}
          
          {/* Image Properties */}
          {activeElement.type === 'image' && (
            <div className="space-y-4">
              <Label>Image URL</Label>
              <Input 
                value={activeElement.src || ''} 
                onChange={handleImageChange}
                placeholder="Enter image URL"
              />
              {activeElement.src && (
                <div className="mt-4 border rounded-md p-2 bg-background">
                  <img 
                    src={activeElement.src} 
                    alt="Preview" 
                    className="w-full h-32 object-contain"
                  />
                </div>
              )}
            </div>
          )}
          
          {/* Rotation for all except background */}
          {activeElement.type !== 'background' && (
            <div className="space-y-2">
              <Label>Rotation</Label>
              <div className="flex gap-4 items-center">
                <Input 
                  type="number" 
                  value={getRotation()} 
                  onChange={handleRotationChange}
                  min={-360}
                  max={360}
                  className="w-24"
                />
                <span className="text-sm">degrees</span>
              </div>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="position" className="flex-1 flex flex-col space-y-6">
          {/* Position Properties */}
          {activeElement.type !== 'background' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Position X</Label>
                  <Input 
                    type="number" 
                    value={activeElement.position.x} 
                    onChange={(e) => updateElement(activeElement.id, { 
                      position: { ...activeElement.position, x: Number(e.target.value) } 
                    })}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Position Y</Label>
                  <Input 
                    type="number" 
                    value={activeElement.position.y} 
                    onChange={(e) => updateElement(activeElement.id, { 
                      position: { ...activeElement.position, y: Number(e.target.value) } 
                    })}
                    className="mt-2"
                  />
                </div>
              </div>
              
              {/* Size Properties */}
              {activeElement.size && (
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <Label>Width</Label>
                    <Input 
                      type="number" 
                      value={activeElement.size.width} 
                      onChange={(e) => updateElement(activeElement.id, { 
                        size: { ...activeElement.size, width: Number(e.target.value) } 
                      })}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label>Height</Label>
                    <Input 
                      type="number" 
                      value={activeElement.size.height} 
                      onChange={(e) => updateElement(activeElement.id, { 
                        size: { ...activeElement.size, height: Number(e.target.value) } 
                      })}
                      className="mt-2"
                    />
                  </div>
                </div>
              )}
              
              {/* Layer Information */}
              <div className="mt-4">
                <Label>Layer Number</Label>
                <div className="flex items-center gap-2 mt-2">
                  <Input 
                    type="number" 
                    value={activeElement.layer} 
                    onChange={(e) => updateElement(activeElement.id, { 
                      layer: Number(e.target.value) 
                    })}
                    min="1"
                    className="w-24"
                  />
                  <span className="text-sm text-muted-foreground">
                    Higher = on top
                  </span>
                </div>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      <Separator className="my-6" />
      
      {/* Display layer list at the bottom of properties panel */}
      <LayersList />
    </div>
  );
};

export default Properties;
