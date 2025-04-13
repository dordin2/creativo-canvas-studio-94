
import { useDesignState } from "@/context/DesignContext";
import { useLanguage } from "@/context/LanguageContext";
import NoElementSelected from "./NoElementSelected";
import ElementProperties from "./properties/ElementProperties";
import { Separator } from "@/components/ui/separator";

const MobileProperties = () => {
  const { activeElement, elements } = useDesignState();
  const { language } = useLanguage();
  
  if (!activeElement) {
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
