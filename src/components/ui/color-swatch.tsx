
import * as React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { HexColorPicker } from "react-colorful";

interface ColorSwatchProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  onChange: (value: string) => void;
}

export function ColorSwatch({ value, onChange, className, ...props }: ColorSwatchProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <div
          className={`h-8 w-full rounded-md border border-input cursor-pointer flex items-center px-3 ${className}`}
          {...props}
        >
          <div className="h-4 w-4 rounded-sm mr-2" style={{ backgroundColor: value }} />
          <span className="text-sm">{value}</span>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3">
        <HexColorPicker color={value} onChange={onChange} />
        <div className="flex gap-2 mt-3">
          <div 
            className="h-6 w-6 rounded cursor-pointer border" 
            style={{ backgroundColor: '#000000' }}
            onClick={() => onChange('#000000')}
          />
          <div 
            className="h-6 w-6 rounded cursor-pointer border" 
            style={{ backgroundColor: '#ffffff' }}
            onClick={() => onChange('#ffffff')}
          />
          <div 
            className="h-6 w-6 rounded cursor-pointer border" 
            style={{ backgroundColor: '#ff0000' }}
            onClick={() => onChange('#ff0000')}
          />
          <div 
            className="h-6 w-6 rounded cursor-pointer border" 
            style={{ backgroundColor: '#00ff00' }}
            onClick={() => onChange('#00ff00')}
          />
          <div 
            className="h-6 w-6 rounded cursor-pointer border" 
            style={{ backgroundColor: '#0000ff' }}
            onClick={() => onChange('#0000ff')}
          />
          <div 
            className="h-6 w-6 rounded cursor-pointer border" 
            style={{ backgroundColor: '#ffff00' }}
            onClick={() => onChange('#ffff00')}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
