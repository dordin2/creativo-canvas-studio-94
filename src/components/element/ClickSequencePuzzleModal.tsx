
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DesignElement } from '@/types/designTypes';
import { useLanguage } from '@/context/LanguageContext';

interface ClickSequencePuzzleModalProps {
  isOpen: boolean;
  onClose: () => void;
  element: DesignElement;
}

const ClickSequencePuzzleModal: React.FC<ClickSequencePuzzleModalProps> = ({
  isOpen,
  onClose,
  element
}) => {
  const { language } = useLanguage();
  const config = element.clickSequencePuzzleConfig;

  if (!config) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{config.name}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col space-y-4 p-4">
          <p className="text-sm text-gray-500">
            {language === 'en' 
              ? 'Click on the items in the correct sequence to solve the puzzle.' 
              : 'לחץ על הפריטים ברצף הנכון כדי לפתור את החידה.'}
          </p>
          
          <div className="grid grid-cols-2 gap-4">
            {config.items?.map((item, index) => (
              <div 
                key={index}
                className="p-3 bg-gray-100 rounded-md text-center cursor-pointer hover:bg-gray-200 transition-colors"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ClickSequencePuzzleModal;
