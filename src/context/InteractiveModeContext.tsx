
import { createContext, useContext, useState, ReactNode } from 'react';

interface InteractiveModeContextType {
  isInteractiveMode: boolean;
  toggleInteractiveMode: () => void;
}

const InteractiveModeContext = createContext<InteractiveModeContextType | undefined>(undefined);

export function InteractiveModeProvider({ children }: { children: ReactNode }) {
  const [isInteractiveMode, setIsInteractiveMode] = useState(false);

  const toggleInteractiveMode = () => {
    setIsInteractiveMode(prev => !prev);
  };

  return (
    <InteractiveModeContext.Provider value={{ isInteractiveMode, toggleInteractiveMode }}>
      {children}
    </InteractiveModeContext.Provider>
  );
}

export function useInteractiveMode() {
  const context = useContext(InteractiveModeContext);
  if (context === undefined) {
    throw new Error('useInteractiveMode must be used within an InteractiveModeProvider');
  }
  return context;
}
