
import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"
import { cn } from "@/lib/utils"

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, orientation, ...props }, ref) => {
  const handleTouchMove = React.useCallback((e: TouchEvent) => {
    // Only prevent default if this is a slider interaction
    if ((e.target as HTMLElement)?.closest('[role="slider"]')) {
      e.preventDefault();
    }
  }, []);

  React.useEffect(() => {
    return () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchMove]);

  const handleTouchStart = React.useCallback(() => {
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
  }, [handleTouchMove]);

  const handleTouchEnd = React.useCallback(() => {
    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('touchend', handleTouchEnd);
  }, [handleTouchMove]);

  return (
    <SliderPrimitive.Root
      ref={ref}
      className={cn(
        "relative flex w-full touch-none select-none items-center",
        orientation === "vertical" && "h-full flex-col justify-center py-4",
        className
      )}
      onTouchStart={handleTouchStart}
      {...props}
    >
      <SliderPrimitive.Track 
        className={cn(
          "relative h-2 w-full grow overflow-hidden rounded-full bg-secondary",
          orientation === "vertical" && "h-full w-2"
        )}
      >
        <SliderPrimitive.Range 
          className={cn(
            "absolute h-full bg-gradient-to-r from-canvas-purple to-canvas-indigo",
            orientation === "vertical" && "h-full w-full"
          )} 
        />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:scale-110 transition-transform" />
    </SliderPrimitive.Root>
  );
});

Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
