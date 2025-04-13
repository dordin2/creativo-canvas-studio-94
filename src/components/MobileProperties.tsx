
import { useDesignState } from "@/context/DesignContext";
import { useLanguage } from "@/context/LanguageContext";
import NoElementSelected from "./NoElementSelected";
import ElementProperties from "./properties/ElementProperties";
import { Separator } from "@/components/ui/separator";
import { useRef, useEffect } from "react";

const MobileProperties = () => {
  const { activeElement, elements } = useDesignState();
  const { language } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  
  // This effect prevents touch events from propagating outside the container
  // which would close the drawer when scrolling
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const handleTouchMove = (e: TouchEvent) => {
      // Don't prevent default here, just stop propagation
      // This allows scrolling within the container but prevents
      // the drawer from detecting the touch events
      e.stopPropagation();
    };
    
    container.addEventListener('touchmove', handleTouchMove, { passive: true });
    
    return () => {
      container.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);
  
  if (!activeElement) {
    return <NoElementSelected />;
  }

  return (
    <div 
      ref={containerRef}
      className={`p-4 space-y-4 overflow-y-auto max-h-[80vh] ${language === 'he' ? 'rtl' : 'ltr'}`}
    >
      <div className="pb-2">
        <h2 className="text-lg font-medium">
          {language === 'he' ? 'מאפיינים' : 'Properties'}
        </h2>
        <p className="text-sm text-muted-foreground">
          {language === 'he' 
            ? `סוג: ${activeElement.type}` 
            : `Type: ${activeElement.type}`}
        </p>
      </div>
      
      <Separator />
      
      <div className="pb-16">
        <ElementProperties element={activeElement} />
      </div>
    </div>
  );
};

export default MobileProperties;
