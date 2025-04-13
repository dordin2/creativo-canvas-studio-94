
import { useDesignState } from "@/context/DesignContext";
import { useLanguage } from "@/context/LanguageContext";
import NoElementSelected from "./NoElementSelected";
import ElementProperties from "./properties/ElementProperties";
import LayerProperties from "./properties/LayerProperties";
import { Separator } from "@/components/ui/separator";

const MobileProperties = () => {
  const { selectedId, elements } = useDesignState();
  const { language } = useLanguage();
  
  const selectedElement = selectedId 
    ? elements.find(el => el.id === selectedId) 
    : null;
  
  if (!selectedElement) {
    return <NoElementSelected />;
  }

  return (
    <div className={`p-4 space-y-4 ${language === 'he' ? 'rtl' : 'ltr'}`}>
      <div className="pb-2">
        <h2 className="text-lg font-medium">
          {language === 'he' ? 'מאפיינים' : 'Properties'}
        </h2>
        <p className="text-sm text-muted-foreground">
          {language === 'he' 
            ? `סוג: ${selectedElement.type}` 
            : `Type: ${selectedElement.type}`}
        </p>
      </div>
      
      <Separator />
      
      <div className="pb-16">
        <ElementProperties element={selectedElement} />
      </div>
    </div>
  );
};

export default MobileProperties;
