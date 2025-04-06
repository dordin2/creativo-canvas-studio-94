
import React, { useEffect } from 'react';
import Header from '@/components/Header';
import Canvas from '@/components/Canvas';
import Sidebar from '@/components/Sidebar';
import Properties from '@/components/Properties';
import { useDesignState } from '@/context/DesignContext';
import { useMultiSelectionKeyboardShortcuts } from '@/hooks/useMultiSelectionKeyboardShortcuts';

const Index = () => {
  const { isGameMode } = useDesignState();
  
  // Use our multi-selection keyboard shortcuts
  useMultiSelectionKeyboardShortcuts();
  
  return (
    <div className="h-screen w-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        {!isGameMode && (
          <Sidebar />
        )}
        <Canvas />
        {!isGameMode && (
          <Properties />
        )}
      </div>
    </div>
  );
};

export default Index;
