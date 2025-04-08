
import React, { useState } from "react";
import InteractionNotification from "./InteractionNotification";

interface InteractionMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  duration?: number;
}

const InteractionMessageModal: React.FC<InteractionMessageModalProps> = ({ 
  isOpen, 
  onClose, 
  message,
  duration = 5000 // Default 5 seconds
}) => {
  return (
    <InteractionNotification
      message={message}
      isVisible={isOpen}
      onClose={onClose}
      duration={duration}
    />
  );
};

export default InteractionMessageModal;
