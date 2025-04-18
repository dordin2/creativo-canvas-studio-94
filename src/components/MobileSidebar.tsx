
import { useLanguage } from "@/context/LanguageContext";
import { ElementsModal } from "./elements/ElementsModal";

const MobileSidebar = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { language } = useLanguage();
  
  return (
    <div className={`mobile-sidebar ${language === 'he' ? 'rtl' : 'ltr'} w-full`}>
      <div className="p-2">
        <ElementsModal />
      </div>
    </div>
  );
};

export default MobileSidebar;
