
import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, orientation, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex w-full touch-none select-none items-center",
      orientation === "vertical" && "h-full flex-col justify-end", // Vertical container
      className
    )}
    {...props}
  >
    <SliderPrimitive.Track 
      className={cn(
        "relative h-2 w-full grow overflow-hidden rounded-full bg-secondary",
        orientation === "vertical" && "h-full w-2" // Vertical track dimensions
      )}
    >
      <SliderPrimitive.Range 
        className={cn(
          "absolute h-full bg-gradient-to-r from-canvas-purple to-canvas-indigo",
          orientation === "vertical" && "w-full bg-gradient-to-t from-canvas-purple to-canvas-indigo" // Vertical gradient
        )} 
      />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb 
      className={cn(
        "block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:scale-110 transition-transform",
        // For vertical sliders, properly center the thumb horizontally and allow it to move only vertically
        orientation === "vertical" && "absolute left-1/2 -translate-x-1/2"
      )}
    />
  </SliderPrimitive.Root>
))
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
