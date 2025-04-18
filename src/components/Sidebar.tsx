
import { useLanguage } from "@/context/LanguageContext";
import { ElementsModal } from "./elements/ElementsModal";

const Sidebar = () => {
  const { language } = useLanguage();
  
  return (
    <div className={`sidebar-panel border-r ${language === 'he' ? 'rtl' : 'ltr'}`}>
      <div className="p-2">
        <ElementsModal />
      </div>
    </div>
  );
};

export default Sidebar;
