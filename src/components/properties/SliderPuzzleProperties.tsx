
import { useState } from "react";
import { DesignElement, useDesignState } from "@/context/DesignContext";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";

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
  
  if (!config) return null;
  
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };
  
  const handleOrientationChange = (value: string) => {
    setOrientation(value as "horizontal" | "vertical");
  };
  
  const handleSliderCountChange = (value: number[]) => {
    setSliderCount(value[0]);
  };
  
  const handleMaxValueChange = (value: number[]) => {
    setMaxValue(value[0]);
  };
  
  const handleSave = () => {
    // Generate new solution and initial values if slider count changes
    let solution = [...config.solution];
    let currentValues = [...config.currentValues];
    
    if (sliderCount !== config.sliderCount) {
      solution = Array(sliderCount).fill(0).map(() => Math.floor(Math.random() * maxValue));
      currentValues = Array(sliderCount).fill(0);
    }
    
    // Adjust solution if max value changes
    if (maxValue !== config.maxValue) {
      solution = solution.map(val => Math.min(val, maxValue));
      currentValues = currentValues.map(val => Math.min(val, maxValue));
    }
    
    // Update size based on orientation
    const size = {
      width: orientation === 'horizontal' ? 300 : 150,
      height: orientation === 'horizontal' ? 150 : 300
    };
    
    updateElement(element.id, {
      size,
      sliderPuzzleConfig: {
        name,
        orientation: orientation as "horizontal" | "vertical",
        sliderCount,
        solution,
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
      
      <Button onClick={handleSave} className="w-full">Apply Changes</Button>
    </div>
  );
};

export default SliderPuzzleProperties;
