
import React, { createContext, useContext, useState } from 'react';

export interface NotificationSettings {
  position: 'top' | 'bottom' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  width: string;
  backgroundColor: string;
  textColor: string;
  fontSize: string;
  padding: string;
  borderRadius: string;
}

const defaultNotificationSettings: NotificationSettings = {
  position: 'bottom',
  width: 'md',
  backgroundColor: 'white',
  textColor: 'black',
  fontSize: 'md',
  padding: 'md',
  borderRadius: 'md',
};

interface NotificationContextType {
  settings: NotificationSettings;
  updateSettings: (settings: Partial<NotificationSettings>) => void;
}

const NotificationContext = createContext<NotificationContextType>({
  settings: defaultNotificationSettings,
  updateSettings: () => {},
});

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<NotificationSettings>(defaultNotificationSettings);

  const updateSettings = (newSettings: Partial<NotificationSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  return (
    <NotificationContext.Provider value={{ settings, updateSettings }}>
      {children}
    </NotificationContext.Provider>
  );
};
