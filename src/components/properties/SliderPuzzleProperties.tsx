import { useState, useEffect } from "react";
import { DesignElement, useDesignState } from "@/context/DesignContext";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SliderPuzzlePropertiesProps {
  element: DesignElement;
}

const SliderPuzzleProperties: React.FC<SliderPuzzlePropertiesProps> = ({ element }) => {
  const { updateElement } = useDesignState();
  const config = element.sliderPuzzleConfig;
  
  const [name, setName] = useState(config?.name || "Slider Puzzle");
  const [orientation, setOrientation] = useState(config?.orientation || "horizontal");
  const [sliderCount, setSliderCount] = useState(config?.sliderCount || 3);
  const [maxValue, setMaxValue] = useState(config?.maxValue || 10);
  const [solution, setSolution] = useState<number[]>(config?.solution || []);
  
  useEffect(() => {
    if (config) {
      setSolution([...config.solution]);
    }
  }, [config]);
  
  if (!config) return null;
  
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };
  
  const handleOrientationChange = (value: string) => {
    setOrientation(value as "horizontal" | "vertical");
  };
  
  const handleSliderCountChange = (value: number[]) => {
    const newCount = value[0];
    setSliderCount(newCount);
    
    // Adjust solution array if slider count changes
    if (newCount !== solution.length) {
      let newSolution = [...solution];
      if (newCount > solution.length) {
        // Add new random values for additional sliders
        const additionalValues = Array(newCount - solution.length)
          .fill(0)
          .map(() => Math.floor(Math.random() * maxValue));
        newSolution = [...newSolution, ...additionalValues];
      } else {
        // Remove excess values if slider count is reduced
        newSolution = newSolution.slice(0, newCount);
      }
      setSolution(newSolution);
    }
  };
  
  const handleMaxValueChange = (value: number[]) => {
    const newMax = value[0];
    setMaxValue(newMax);
    
    // Adjust solution if max value changes
    const newSolution = solution.map(val => Math.min(val, newMax));
    setSolution(newSolution);
  };
  
  const handleSolutionChange = (index: number, value: number[]) => {
    const newSolution = [...solution];
    newSolution[index] = value[0];
    setSolution(newSolution);
  };
  
  const handleSave = () => {
    // Ensure solution and currentValues arrays are correct length
    let updatedSolution = [...solution];
    if (updatedSolution.length !== sliderCount) {
      if (updatedSolution.length < sliderCount) {
        // Add new values
        updatedSolution = [
          ...updatedSolution,
          ...Array(sliderCount - updatedSolution.length)
            .fill(0)
            .map(() => Math.floor(Math.random() * maxValue))
        ];
      } else {
        // Trim excess values
        updatedSolution = updatedSolution.slice(0, sliderCount);
      }
    }
    
    // Update size based on orientation
    const size = {
      width: orientation === 'horizontal' ? 300 : 150,
      height: orientation === 'horizontal' ? 150 : 300
    };
    
    // Keep current values from existing config or initialize new ones
    const currentValues = 
      config.currentValues.length === sliderCount 
        ? [...config.currentValues] 
        : Array(sliderCount).fill(0);
    
    updateElement(element.id, {
      size,
      sliderPuzzleConfig: {
        name,
        orientation: orientation as "horizontal" | "vertical",
        sliderCount,
        solution: updatedSolution,
        currentValues,
        maxValue
      }
    });
  };
  
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="puzzleName">Puzzle Name</Label>
        <Input 
          id="puzzleName" 
          value={name} 
          onChange={handleNameChange} 
          onBlur={handleSave}
        />
      </div>
      
      <div className="space-y-2">
        <Label>Orientation</Label>
        <RadioGroup 
          value={orientation} 
          onValueChange={handleOrientationChange} 
          className="flex gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="horizontal" id="horizontal" />
            <Label htmlFor="horizontal">Horizontal</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="vertical" id="vertical" />
            <Label htmlFor="vertical">Vertical</Label>
          </div>
        </RadioGroup>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between">
          <Label>Number of Sliders: {sliderCount}</Label>
        </div>
        <Slider 
          value={[sliderCount]} 
          min={1} 
          max={10} 
          step={1} 
          onValueChange={handleSliderCountChange}
          className="py-2"
        />
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between">
          <Label>Max Value: {maxValue}</Label>
        </div>
        <Slider 
          value={[maxValue]} 
          min={5} 
          max={100} 
          step={5} 
          onValueChange={handleMaxValueChange}
          className="py-2"
        />
      </div>
      
      <Tabs defaultValue="settings" className="w-full">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="solution">Solution</TabsTrigger>
        </TabsList>
        
        <TabsContent value="settings">
          <div className="pt-2">
            <Button onClick={handleSave} className="w-full">Apply Settings</Button>
          </div>
        </TabsContent>
        
        <TabsContent value="solution" className="space-y-4">
          <div className="space-y-4 max-h-[200px] overflow-y-auto p-1">
            <Label className="block mb-2">Set Solution Values</Label>
            {solution.map((value, index) => (
              <div key={index} className="space-y-1">
                <div className="flex justify-between">
                  <Label>Slider {index + 1}: {value}</Label>
                </div>
                <Slider
                  value={[value]}
                  min={0}
                  max={maxValue}
                  step={1}
                  onValueChange={(val) => handleSolutionChange(index, val)}
                  className="py-2"
                />
              </div>
            ))}
          </div>
          <Button onClick={handleSave} className="w-full">Apply Solution</Button>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SliderPuzzleProperties;
