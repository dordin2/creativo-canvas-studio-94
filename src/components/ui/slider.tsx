
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
      orientation === "vertical" && "h-full flex-col justify-center py-4",
      className
    )}
    {...props}
  >
    <SliderPrimitive.Track 
      className={cn(
        "relative h-3 w-full grow overflow-hidden rounded-full bg-secondary",
        orientation === "vertical" && "h-full w-3"
      )}
    >
      <SliderPrimitive.Range 
        className={cn(
          "absolute h-full bg-gradient-to-r from-canvas-purple to-canvas-indigo",
          orientation === "vertical" && "h-full w-full"
        )} 
      />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="block h-6 w-6 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:scale-110 active:scale-125 transition-transform touch-none" />
  </SliderPrimitive.Root>
))
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
