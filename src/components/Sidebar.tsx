
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Text, Image, Square, Circle, Triangle } from "lucide-react";
import { useDesignState } from "@/context/DesignContext";

const Sidebar = () => {
  const { addElement } = useDesignState();

  // Color swatches for backgrounds
  const colorSwatches = [
    "#FFFFFF", "#F3F4F6", "#E5E7EB", "#D1D5DB",
    "#FEE2E2", "#FEE7AA", "#D1FAE5", "#DBEAFE",
    "#8B5CF6", "#EC4899", "#F59E0B", "#10B981"
  ];

  // Pre-defined gradient backgrounds
  const gradients = [
    "linear-gradient(to right, #fc466b, #3f5efb)",
    "linear-gradient(to right, #8a2387, #e94057, #f27121)",
    "linear-gradient(to right, #00b09b, #96c93d)",
    "linear-gradient(to right, #ff9966, #ff5e62)",
    "linear-gradient(to right, #7f7fd5, #86a8e7, #91eae4)"
  ];

  return (
    <div className="sidebar-panel border-r flex flex-col">
      <Tabs defaultValue="elements" className="flex-1 flex flex-col">
        <TabsList className="grid grid-cols-3 mx-2 mt-2">
          <TabsTrigger value="elements">Elements</TabsTrigger>
          <TabsTrigger value="text">Text</TabsTrigger>
          <TabsTrigger value="background">Background</TabsTrigger>
        </TabsList>
        
        <TabsContent value="elements" className="flex-1 overflow-auto p-4">
          <h3 className="text-sm font-medium mb-3">Shapes</h3>
          <div className="grid grid-cols-2 gap-2 mb-6">
            <Button variant="outline" className="h-14 flex flex-col gap-1 items-center justify-center" 
                    onClick={() => addElement('rectangle')}>
              <Square className="h-5 w-5" />
              <span className="text-xs">Rectangle</span>
            </Button>
            <Button variant="outline" className="h-14 flex flex-col gap-1 items-center justify-center"
                    onClick={() => addElement('circle')}>
              <Circle className="h-5 w-5" />
              <span className="text-xs">Circle</span>
            </Button>
            <Button variant="outline" className="h-14 flex flex-col gap-1 items-center justify-center"
                    onClick={() => addElement('triangle')}>
              <Triangle className="h-5 w-5" />
              <span className="text-xs">Triangle</span>
            </Button>
            <Button variant="outline" className="h-14 flex flex-col gap-1 items-center justify-center"
                    onClick={() => addElement('line')}>
              <div className="w-5 h-0.5 bg-current"></div>
              <span className="text-xs">Line</span>
            </Button>
          </div>
          
          <h3 className="text-sm font-medium mb-3">Media</h3>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" className="h-14 flex flex-col gap-1 items-center justify-center"
                    onClick={() => addElement('image')}>
              <Image className="h-5 w-5" />
              <span className="text-xs">Image</span>
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="text" className="flex-1 overflow-auto p-4">
          <h3 className="text-sm font-medium mb-3">Text Styles</h3>
          <div className="flex flex-col gap-2">
            <Button variant="outline" className="justify-start h-12" onClick={() => addElement('heading')}>
              <Text className="h-4 w-4 mr-2" />
              <span className="text-lg font-bold">Heading</span>
            </Button>
            <Button variant="outline" className="justify-start h-12" onClick={() => addElement('subheading')}>
              <Text className="h-4 w-4 mr-2" />
              <span className="text-base font-semibold">Subheading</span>
            </Button>
            <Button variant="outline" className="justify-start h-12" onClick={() => addElement('paragraph')}>
              <Text className="h-4 w-4 mr-2" />
              <span className="text-sm">Paragraph text</span>
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="background" className="flex-1 overflow-auto p-4">
          <h3 className="text-sm font-medium mb-3">Solid Colors</h3>
          <div className="grid grid-cols-4 gap-2 mb-6">
            {colorSwatches.map((color, index) => (
              <button
                key={index}
                className="w-12 h-12 rounded border hover:scale-105 transition-transform"
                style={{ backgroundColor: color }}
                onClick={() => addElement('background', { color })}
                aria-label={`Background color ${color}`}
              />
            ))}
          </div>
          
          <h3 className="text-sm font-medium mb-3">Gradients</h3>
          <div className="grid grid-cols-2 gap-2">
            {gradients.map((gradient, index) => (
              <button
                key={index}
                className="w-full h-12 rounded border hover:scale-105 transition-transform"
                style={{ background: gradient }}
                onClick={() => addElement('background', { gradient })}
                aria-label={`Gradient background ${index + 1}`}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Sidebar;
