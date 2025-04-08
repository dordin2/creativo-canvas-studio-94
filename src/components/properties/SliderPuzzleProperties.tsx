
import React, { useState, useEffect } from "react";
import { DesignElement, SliderOrientation } from "@/types/designTypes";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useDesignState } from "@/context/DesignContext";
import { useLanguage } from "@/context/LanguageContext";
import { FileCheck, AlignHorizontalJustifyCenter, AlignVerticalJustifyCenter } from "lucide-react";
import { toast } from "sonner";

interface SliderPuzzlePropertiesProps {
  element: DesignElement;
  onUpdateConfig?: (config: any) => void;
}

const SliderPuzzleProperties: React.FC<SliderPuzzlePropertiesProps> = ({ element, onUpdateConfig }) => {
  const { updateElement } = useDesignState();
  const { t, language } = useLanguage();
  const [localPuzzleConfig, setLocalPuzzleConfig] = useState(() => {
    return element.sliderPuzzleConfig || {
      name: language === 'en' ? 'Slider Puzzle' : 'פאזל גלילה',
      orientation: 'horizontal' as SliderOrientation,
      sliderCount: 3,
      solution: [5, 2, 8],
      currentValues: [0, 0, 0],
      maxValue: 10
    };
  });

  useEffect(() => {
    setLocalPuzzleConfig(element.sliderPuzzleConfig || {
      name: language === 'en' ? 'Slider Puzzle' : 'פאזל גלילה',
      orientation: 'horizontal' as SliderOrientation,
      sliderCount: 3,
      solution: [5, 2, 8],
      currentValues: [0, 0, 0],
      maxValue: 10
    });
  }, [element.sliderPuzzleConfig, language]);
  
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalPuzzleConfig(prev => ({
      ...prev,
      name: e.target.value
    }));
  };
  
  const handleOrientationChange = (orientation: SliderOrientation) => {
    setLocalPuzzleConfig(prev => ({
      ...prev,
      orientation
    }));
  };
  
  const handleSliderCountChange = (value: string) => {
    const sliderCount = parseInt(value);
    let newSolution = [...localPuzzleConfig.solution];
    let newCurrentValues = [...localPuzzleConfig.currentValues];
    
    if (sliderCount > localPuzzleConfig.solution.length) {
      for (let i = localPuzzleConfig.solution.length; i < sliderCount; i++) {
        newSolution.push(0);
        newCurrentValues.push(0);
      }
    } else if (sliderCount < localPuzzleConfig.solution.length) {
      newSolution = newSolution.slice(0, sliderCount);
      newCurrentValues = newCurrentValues.slice(0, sliderCount);
    }
    
    setLocalPuzzleConfig(prev => ({
      ...prev,
      sliderCount: sliderCount,
      solution: newSolution,
      currentValues: newCurrentValues
    }));
  };
  
  const handleMaxValueChange = (value: string) => {
    const maxValue = parseInt(value);
    
    const newSolution = localPuzzleConfig.solution.map(val => 
      val > maxValue ? maxValue : val
    );
    
    const newCurrentValues = localPuzzleConfig.currentValues.map(val =>
      val > maxValue ? maxValue : val
    );
    
    setLocalPuzzleConfig(prev => ({
      ...prev,
      maxValue,
      solution: newSolution,
      currentValues: newCurrentValues
    }));
  };
  
  const handleSolutionChange = (sliderIndex: number, value: string) => {
    const newValue = parseInt(value);
    const newSolution = [...localPuzzleConfig.solution];
    newSolution[sliderIndex] = newValue > localPuzzleConfig.maxValue ? localPuzzleConfig.maxValue : newValue;
    
    setLocalPuzzleConfig(prev => ({
      ...prev,
      solution: newSolution
    }));
  };
  
  const handleCurrentValueChange = (sliderIndex: number, value: string) => {
    const newValue = parseInt(value);
    const newCurrentValues = [...localPuzzleConfig.currentValues];
    newCurrentValues[sliderIndex] = newValue > localPuzzleConfig.maxValue ? localPuzzleConfig.maxValue : newValue;
    
    setLocalPuzzleConfig(prev => ({
      ...prev,
      currentValues: newCurrentValues
    }));
  };
  
  const handleApplyChanges = () => {
    if (localPuzzleConfig.name.trim() === '') {
      toast.error(t('toast.error.name'));
      return;
    }
    
    updateElement(element.id, {
      sliderPuzzleConfig: localPuzzleConfig
    });
    
    if (onUpdateConfig) {
      onUpdateConfig(localPuzzleConfig);
    }
    
    toast.success(t('toast.success.config'));
  };
  
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="puzzle-name">{t('puzzle.name')}</Label>
        <Input 
          id="puzzle-name" 
          value={localPuzzleConfig.name} 
          onChange={handleNameChange}
          className="mt-1"
        />
      </div>
      
      <div>
        <Label htmlFor="slider-orientation" className="mb-2 block">{t('slider.orientation')}</Label>
        <RadioGroup 
          id="slider-orientation"
          value={localPuzzleConfig.orientation}
          onValueChange={(value) => handleOrientationChange(value as SliderOrientation)}
          className="flex flex-wrap gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="horizontal" id="horizontal-slider" />
            <Label htmlFor="horizontal-slider" className="flex items-center">
              <AlignHorizontalJustifyCenter className="h-4 w-4 mr-1" />
              {t('slider.horizontal')}
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="vertical" id="vertical-slider" />
            <Label htmlFor="vertical-slider" className="flex items-center">
              <AlignVerticalJustifyCenter className="h-4 w-4 mr-1" />
              {t('slider.vertical')}
            </Label>
          </div>
        </RadioGroup>
      </div>
      
      <div>
        <Label htmlFor="slider-count">{t('slider.count')}</Label>
        <Select 
          value={localPuzzleConfig.sliderCount.toString()} 
          onValueChange={handleSliderCountChange}
        >
          <SelectTrigger id="slider-count" className="mt-1">
            <SelectValue placeholder="Select number" />
          </SelectTrigger>
          <SelectContent>
            {[2, 3, 4, 5, 6].map(num => (
              <SelectItem key={num} value={num.toString()}>
                {num} {language === 'en' ? 'sliders' : 'מחוונים'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="max-value">{t('slider.max.value')}</Label>
        <Select 
          value={localPuzzleConfig.maxValue?.toString() || "10"} 
          onValueChange={handleMaxValueChange}
        >
          <SelectTrigger id="max-value" className="mt-1">
            <SelectValue placeholder="Select max value" />
          </SelectTrigger>
          <SelectContent>
            {[5, 10, 15, 20, 25].map(num => (
              <SelectItem key={num} value={num.toString()}>
                {num}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label>{t('slider.solution')}</Label>
        <div className="space-y-2 mt-2">
          {Array.from({ length: localPuzzleConfig.sliderCount }).map((_, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="text-sm font-medium w-24">
                {`${t('slider.slider')} ${idx + 1}:`}
              </span>
              <Select 
                value={localPuzzleConfig.solution[idx]?.toString() || "0"} 
                onValueChange={(val) => handleSolutionChange(idx, val)}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder={t('slider.select.correct.value')} />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: localPuzzleConfig.maxValue + 1 }).map((_, numIdx) => (
                    <SelectItem key={numIdx} value={numIdx.toString()}>
                      {numIdx}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label>{t('slider.initial.values')}</Label>
        <div className="space-y-2 mt-2">
          {Array.from({ length: localPuzzleConfig.sliderCount }).map((_, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="text-sm font-medium w-24">
                {`${t('slider.slider')} ${idx + 1}:`}
              </span>
              <Select 
                value={localPuzzleConfig.currentValues[idx]?.toString() || "0"} 
                onValueChange={(val) => handleCurrentValueChange(idx, val)}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder={t('slider.select.initial.value')} />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: localPuzzleConfig.maxValue + 1 }).map((_, numIdx) => (
                    <SelectItem key={numIdx} value={numIdx.toString()}>
                      {numIdx}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex gap-2 pt-3">
        <Button 
          variant="secondary" 
          className="w-full"
          onClick={handleApplyChanges}
        >
          <FileCheck className="h-4 w-4 mr-2" />
          {t('puzzle.apply.changes')}
        </Button>
      </div>
    </div>
  );
};

export default SliderPuzzleProperties;
