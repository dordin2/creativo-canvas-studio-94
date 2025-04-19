
import React, { createContext, useContext, useEffect, useState } from 'react';

interface MobileContextType {
  isMobileDevice: boolean;
  isMobileView: boolean;
}

const MobileContext = createContext<MobileContextType>({
  isMobileDevice: false,
  isMobileView: false,
});

export const MobileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);

  useEffect(() => {
    const checkMobileDevice = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobile = /iphone|ipad|ipod|android|webos|windows phone/i.test(userAgent);
      setIsMobileDevice(isMobile);
    };

    const checkMobileView = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    checkMobileDevice();
    checkMobileView();

    window.addEventListener('resize', checkMobileView);
    return () => window.removeEventListener('resize', checkMobileView);
  }, []);

  return (
    <MobileContext.Provider value={{ isMobileDevice, isMobileView }}>
      {children}
    </MobileContext.Provider>
  );
};

export const useMobile = () => {
  const context = useContext(MobileContext);
  if (!context) {
    throw new Error('useMobile must be used within a MobileProvider');
  }
  return context;
};

