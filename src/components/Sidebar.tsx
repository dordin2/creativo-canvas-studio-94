
import { useLanguage } from "@/context/LanguageContext";

const Sidebar = () => {
  const { language } = useLanguage();
  
  return (
    <div className={`sidebar-panel border-r ${language === 'he' ? 'rtl' : 'ltr'}`}>
      <div className="p-2">
      </div>
    </div>
  );
};

export default Sidebar;
