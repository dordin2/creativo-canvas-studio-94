
import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { useNotification } from "@/context/NotificationContext";

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
  const { settings } = useNotification();
  const [shouldRender, setShouldRender] = useState(false);
  
  // Helper functions to convert size values
  const getBorderRadiusValue = (size: string): string => {
    switch (size) {
      case 'none': return '0';
      case 'sm': return '0.25rem';
      case 'md': return '0.5rem';
      case 'lg': return '0.75rem';
      case 'full': return '9999px';
      default: return '0.5rem';
    }
  };

  const getPaddingValue = (size: string): string => {
    switch (size) {
      case 'sm': return '0.5rem';
      case 'md': return '1rem';
      case 'lg': return '1.5rem';
      default: return '1rem';
    }
  };

  const getFontSizeValue = (size: string): string => {
    switch (size) {
      case 'xs': return '0.75rem';
      case 'sm': return '0.875rem';
      case 'md': return '1rem';
      case 'lg': return '1.125rem';
      case 'xl': return '1.25rem';
      default: return '1rem';
    }
  };

  const getWidthValue = (size: string): string => {
    switch (size) {
      case 'sm': return '16rem';
      case 'md': return '24rem';
      case 'lg': return '32rem';
      case 'full': return '100%';
      default: return '24rem';
    }
  };

  const getPositionStyles = (): React.CSSProperties => {
    switch (settings.position) {
      case 'top':
        return { top: '1rem', left: '50%', transform: 'translateX(-50%)' };
      case 'bottom':
        return { bottom: '1rem', left: '50%', transform: 'translateX(-50%)' };
      case 'top-left':
        return { top: '1rem', left: '1rem' };
      case 'top-right':
        return { top: '1rem', right: '1rem' };
      case 'bottom-left':
        return { bottom: '1rem', left: '1rem' };
      case 'bottom-right':
        return { bottom: '1rem', right: '1rem' };
      default:
        return { bottom: '1rem', left: '50%', transform: 'translateX(-50%)' };
    }
  };
  
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
          className="fixed z-50"
          style={{
            ...getPositionStyles(),
            width: getWidthValue(settings.width)
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
        >
          <div 
            className={`relative border border-gray-200 shadow-lg ${language === 'he' ? 'rtl' : 'ltr'}`}
            style={{
              backgroundColor: settings.backgroundColor,
              color: settings.textColor,
              borderRadius: getBorderRadiusValue(settings.borderRadius),
              padding: getPaddingValue(settings.padding),
              fontSize: getFontSizeValue(settings.fontSize),
            }}
          >
            <div className="pr-8">
              <div className="whitespace-pre-wrap break-words">
                {message}
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2"
              onClick={onClose}
              style={{
                color: settings.textColor,
                opacity: 0.7
              }}
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
