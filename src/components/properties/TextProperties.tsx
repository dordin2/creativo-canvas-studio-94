
import { DesignElement } from "@/types/designTypes";
import { HexColorPicker } from "react-colorful";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Bold, Italic, Underline } from "lucide-react";
import { useDesignState } from "@/context/DesignContext";
import RotationProperty from "./RotationProperty";

const TextProperties = ({ element }: { element: DesignElement }) => {
  const { updateElement } = useDesignState();

  const handleColorChange = (newColor: string) => {
    updateElement(element.id, {
      style: { ...element.style, color: newColor }
    });
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateElement(element.id, { content: e.target.value });
  };

  const handleFontSizeChange = (value: string) => {
    updateElement(element.id, {
      style: { ...element.style, fontSize: `${value}px` }
    });
  };

  const toggleTextStyle = (style: 'fontWeight' | 'textDecoration' | 'fontStyle', value: string) => {
    const currentStyle = element.style?.[style];
    const newValue = currentStyle === value ? 'normal' : value;
    
    updateElement(element.id, {
      style: { ...element.style, [style]: newValue }
    });
  };

  const isStyleActive = (style: 'fontWeight' | 'textDecoration' | 'fontStyle', value: string): boolean => {
    if (!element.style) return false;
    return element.style[style] === value;
  };

  const getCurrentFontSize = (): string => {
    if (!element.style?.fontSize) {
      if (element.type === 'heading') return '24';
      if (element.type === 'subheading') return '18';
      return '16';
    }
    
    const fontSize = element.style.fontSize.toString();
    const match = fontSize.match(/(\d+)px/);
    return match ? match[1] : '16';
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Text Content</Label>
        <Textarea 
          value={element.content || ''}
          onChange={handleTextChange}
          className="mt-2"
        />
      </div>
      
      <div>
        <Label>Text Color</Label>
        <HexColorPicker 
          color={element.style?.color as string || '#1F2937'} 
          onChange={handleColorChange}
          className="w-full mb-2 mt-2"
        />
        <Input 
          value={element.style?.color as string || '#1F2937'} 
          onChange={(e) => handleColorChange(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Font Size</Label>
        <Select 
          value={getCurrentFontSize()} 
          onValueChange={handleFontSizeChange}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select font size" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="8">8</SelectItem>
            <SelectItem value="9">9</SelectItem>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="11">11</SelectItem>
            <SelectItem value="12">12</SelectItem>
            <SelectItem value="14">14</SelectItem>
            <SelectItem value="16">16</SelectItem>
            <SelectItem value="18">18</SelectItem>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="22">22</SelectItem>
            <SelectItem value="24">24</SelectItem>
            <SelectItem value="28">28</SelectItem>
            <SelectItem value="32">32</SelectItem>
            <SelectItem value="36">36</SelectItem>
            <SelectItem value="42">42</SelectItem>
            <SelectItem value="48">48</SelectItem>
            <SelectItem value="56">56</SelectItem>
            <SelectItem value="64">64</SelectItem>
            <SelectItem value="72">72</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Text Style</Label>
        <ToggleGroup type="multiple" className="mt-2 justify-start">
          <ToggleGroupItem 
            value="bold" 
            aria-label="Toggle bold"
            data-state={isStyleActive('fontWeight', 'bold') ? 'on' : 'off'}
            onClick={() => toggleTextStyle('fontWeight', 'bold')}
          >
            <Bold className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem 
            value="italic" 
            aria-label="Toggle italic"
            data-state={isStyleActive('fontStyle', 'italic') ? 'on' : 'off'}
            onClick={() => toggleTextStyle('fontStyle', 'italic')}
          >
            <Italic className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem 
            value="underline" 
            aria-label="Toggle underline"
            data-state={isStyleActive('textDecoration', 'underline') ? 'on' : 'off'}
            onClick={() => toggleTextStyle('textDecoration', 'underline')}
          >
            <Underline className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
      
      <RotationProperty element={element} />
    </div>
  );
};

export default TextProperties;
