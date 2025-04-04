
import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the available languages
export type Language = 'en' | 'he';

// Define the language context type
type LanguageContextType = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
};

// Create the context with default values
const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key: string) => key,
});

// Translations object
const translations: Record<Language, Record<string, string>> = {
  en: {
    // Header
    'app.title': 'CreativoCanvas',
    'app.share': 'Share',
    'app.download': 'Download',
    
    // Sidebar
    'sidebar.elements': 'Elements',
    'sidebar.text': 'Text',
    'sidebar.background': 'Background',
    'sidebar.shapes': 'Shapes',
    'sidebar.rectangle': 'Rectangle',
    'sidebar.circle': 'Circle',
    'sidebar.triangle': 'Triangle',
    'sidebar.line': 'Line',
    'sidebar.media': 'Media',
    'sidebar.image': 'Image',
    'sidebar.puzzle': 'Puzzle',
    'sidebar.image.puzzle': 'Image Puzzle',
    'sidebar.number.lock': 'Number Lock',
    'sidebar.alphabet.lock': 'Alphabet Lock',
    'sidebar.text.styles': 'Text Styles',
    'sidebar.heading': 'Heading',
    'sidebar.subheading': 'Subheading',
    'sidebar.paragraph': 'Paragraph text',
    'sidebar.solid.colors': 'Solid Colors',
    'sidebar.gradients': 'Gradients',
    
    // Properties
    'properties.element': 'Element Properties',
    'properties.style': 'Style',
    'properties.position': 'Position',
    'properties.layer': 'Layer',
    
    // Puzzle Properties
    'puzzle.name': 'Puzzle Name',
    'puzzle.type': 'Puzzle Type',
    'puzzle.placeholders': 'Number of Placeholders',
    'puzzle.digits': 'Number of Digits',
    'puzzle.letters': 'Number of Letters',
    'puzzle.max.number': 'Maximum Number',
    'puzzle.max.letter': 'Maximum Letter',
    'puzzle.image.collection': 'Image Collection',
    'puzzle.select.image': 'Select an image',
    'puzzle.upload.image': 'Upload Image',
    'puzzle.solution': 'Solution Configuration',
    'puzzle.placeholder': 'Placeholder',
    'puzzle.digit': 'Digit',
    'puzzle.letter': 'Letter',
    'puzzle.select.correct.image': 'Select correct image',
    'puzzle.select.correct.number': 'Select correct number',
    'puzzle.select.correct.letter': 'Select correct letter',
    'puzzle.add.images': 'Add images to your puzzle collection',
    'puzzle.apply.changes': 'Apply Changes',
    'puzzle.add.to.canvas': 'Add to Canvas',
    
    // Puzzle Modal
    'puzzle.modal.close': 'Close',
    'puzzle.modal.solved': 'Puzzle solved! Great job!',
    
    // Notifications
    'toast.success.download': 'Design downloaded successfully!',
    'toast.info.share': 'Share functionality coming soon!',
    'toast.info.undo': 'Undo functionality coming soon!',
    'toast.info.redo': 'Redo functionality coming soon!',
    'toast.error.name': 'Puzzle name cannot be empty',
    'toast.error.images': 'Add at least 2 images to create an image puzzle',
    'toast.error.add.images': 'Please add images to your puzzle',
    'toast.success.config': 'Puzzle configuration saved',
    'toast.success.added': 'Puzzle added to canvas',
    'toast.error.file': 'Please select a valid image file',
    'toast.success.upload': 'Image uploaded successfully',
    'toast.error.upload': 'Failed to read image file',
    'toast.success.puzzle': 'Great job! Puzzle solved correctly!',
  },
  he: {
    // Header
    'app.title': 'קנבס יצירתי',
    'app.share': 'שיתוף',
    'app.download': 'הורדה',
    
    // Sidebar
    'sidebar.elements': 'אלמנטים',
    'sidebar.text': 'טקסט',
    'sidebar.background': 'רקע',
    'sidebar.shapes': 'צורות',
    'sidebar.rectangle': 'מלבן',
    'sidebar.circle': 'עיגול',
    'sidebar.triangle': 'משולש',
    'sidebar.line': 'קו',
    'sidebar.media': 'מדיה',
    'sidebar.image': 'תמונה',
    'sidebar.puzzle': 'פאזל',
    'sidebar.image.puzzle': 'פאזל תמונה',
    'sidebar.number.lock': 'מנעול מספרים',
    'sidebar.alphabet.lock': 'מנעול אותיות',
    'sidebar.text.styles': 'סגנונות טקסט',
    'sidebar.heading': 'כותרת',
    'sidebar.subheading': 'כותרת משנה',
    'sidebar.paragraph': 'טקסט פסקה',
    'sidebar.solid.colors': 'צבעים מלאים',
    'sidebar.gradients': 'גרדיאנטים',
    
    // Properties
    'properties.element': 'מאפייני אלמנט',
    'properties.style': 'סגנון',
    'properties.position': 'מיקום',
    'properties.layer': 'שכבה',
    
    // Puzzle Properties
    'puzzle.name': 'שם הפאזל',
    'puzzle.type': 'סוג הפאזל',
    'puzzle.placeholders': 'מספר מיקומים',
    'puzzle.digits': 'מספר ספרות',
    'puzzle.letters': 'מספר אותיות',
    'puzzle.max.number': 'מספר מקסימלי',
    'puzzle.max.letter': 'אות מקסימלית',
    'puzzle.image.collection': 'אוסף תמונות',
    'puzzle.select.image': 'בחר תמונה',
    'puzzle.upload.image': 'העלה תמונה',
    'puzzle.solution': 'הגדרת פתרון',
    'puzzle.placeholder': 'מיקום',
    'puzzle.digit': 'ספרה',
    'puzzle.letter': 'אות',
    'puzzle.select.correct.image': 'בחר תמונה נכונה',
    'puzzle.select.correct.number': 'בחר מספר נכון',
    'puzzle.select.correct.letter': 'בחר אות נכונה',
    'puzzle.add.images': 'הוסף תמונות לאוסף הפאזל שלך',
    'puzzle.apply.changes': 'החל שינויים',
    'puzzle.add.to.canvas': 'הוסף לקנבס',
    
    // Puzzle Modal
    'puzzle.modal.close': 'סגור',
    'puzzle.modal.solved': 'הפאזל נפתר! כל הכבוד!',
    
    // Notifications
    'toast.success.download': 'העיצוב הורד בהצלחה!',
    'toast.info.share': 'פונקציית השיתוף תגיע בקרוב!',
    'toast.info.undo': 'פונקציית הביטול תגיע בקרוב!',
    'toast.info.redo': 'פונקציית הביצוע מחדש תגיע בקרוב!',
    'toast.error.name': 'שם הפאזל לא יכול להיות ריק',
    'toast.error.images': 'הוסף לפחות 2 תמונות כדי ליצור פאזל תמונה',
    'toast.error.add.images': 'אנא הוסף תמונות לפאזל שלך',
    'toast.success.config': 'תצורת הפאזל נשמרה',
    'toast.success.added': 'הפאזל נוסף לקנבס',
    'toast.error.file': 'אנא בחר קובץ תמונה תקין',
    'toast.success.upload': 'התמונה הועלתה בהצלחה',
    'toast.error.upload': 'כשלון בקריאת קובץ התמונה',
    'toast.success.puzzle': 'עבודה מצוינת! הפאזל נפתר בהצלחה!',
  }
};

// Provider component
export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  // Translation function
  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook for using the language context
export const useLanguage = () => useContext(LanguageContext);
