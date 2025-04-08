
import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";

interface InteractionNotificationProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  duration?: number; // Duration in milliseconds before auto-dismiss
}

const InteractionNotification: React.FC<InteractionNotificationProps> = ({
  message,
  isVisible,
  onClose,
  duration = 5000, // Default 5 seconds
}) => {
  const { language } = useLanguage();
  const [shouldRender, setShouldRender] = useState(false);
  
  // Handle automatic dismissal
  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      
      // Set timeout for auto-dismissal
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      
      // Clear timeout if component unmounts or visibility changes
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);
  
  // Handle animation complete event
  const handleAnimationComplete = () => {
    if (!isVisible) {
      setShouldRender(false);
    }
  };
  
  if (!shouldRender && !isVisible) return null;
  
  return (
    <AnimatePresence onExitComplete={handleAnimationComplete}>
      {isVisible && (
        <motion.div
          className="fixed bottom-4 left-0 right-0 z-50 mx-auto w-full max-w-md px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
        >
          <div className={`relative rounded-lg border border-gray-200 bg-white p-4 shadow-lg ${language === 'he' ? 'rtl' : 'ltr'}`}>
            <div className="pr-8">
              <div className="whitespace-pre-wrap break-words text-sm">
                {message}
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InteractionNotification;
