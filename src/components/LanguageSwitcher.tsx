
import React from 'react';
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'he' : 'en');
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={toggleLanguage}
      className="text-xs"
    >
      {language === 'en' ? 'עברית' : 'English'}
    </Button>
  );
};

export default LanguageSwitcher;
