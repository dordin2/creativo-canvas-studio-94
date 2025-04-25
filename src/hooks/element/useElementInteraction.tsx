
import { useState, useRef, useEffect } from 'react';
import { DesignElement } from "@/types/designTypes";
import { useDesignState } from '@/context/DesignContext';
import InteractionMessageModal from "@/components/interaction/InteractionMessageModal";
import PuzzleModal from "@/components/interaction/PuzzleModal";
import SequencePuzzleModal from "@/components/interaction/SequencePuzzleModal";
import { SliderPuzzleModal } from "@/components/interaction/SliderPuzzleModal";
import ClickSequencePuzzleModal from "@/components/interaction/ClickSequencePuzzleModal";
import { toast } from 'sonner';

export function useElementInteraction(element: DesignElement) {
  const { canvases, setActiveCanvas } = useDesignState();
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showPuzzleModal, setShowPuzzleModal] = useState(false);
  const [combinationPuzzleModal, setCombinationPuzzleModal] = useState(false);
  const [combinationMessage, setCombinationMessage] = useState('');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const hasInteraction = element.interaction?.type && element.interaction.type !== 'none';
  const interactionType = element.interaction?.type || 'none';
  const interactionPuzzleType = element.interaction?.puzzleType || 'puzzle';
  
  const showInteractionIndicator = hasInteraction && !element.isHidden;
  let indicatorStyles = "";
  
  if (showInteractionIndicator) {
    if (interactionType === 'canvasNavigation') {
      indicatorStyles = "absolute bottom-0 right-0 w-3 h-3 bg-blue-500 rounded-full animate-pulse";
    } else if (interactionType === 'addToInventory') {
      indicatorStyles = "absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full animate-pulse";
    } else if (interactionType === 'combinable') {
      indicatorStyles = "absolute bottom-0 right-0 w-3 h-3 bg-purple-500 rounded-full animate-pulse";
    }
  }
  
  const handleInteraction = () => {
    if (!hasInteraction) return;
    
    if (interactionType === 'message' && element.interaction?.message) {
      setShowMessageModal(true);
    } 
    else if (interactionType === 'sound' && element.interaction?.soundUrl) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(err => {
          toast.error('Could not play sound');
          console.error('Audio playback error:', err);
        });
      }
    }
    else if (interactionType === 'puzzle') {
      setShowPuzzleModal(true);
    }
    else if (interactionType === 'canvasNavigation' && element.interaction?.targetCanvasId) {
      const targetCanvasIndex = canvases.findIndex(
        canvas => canvas.id === element.interaction?.targetCanvasId
      );
      
      if (targetCanvasIndex !== -1) {
        setActiveCanvas(targetCanvasIndex);
        toast.success(`Navigated to ${canvases[targetCanvasIndex].name}`);
      } else {
        toast.error('Target canvas not found');
      }
    }
    else if (interactionType === 'addToInventory') {
      // This is handled by the parent component
    }
  };
  
  const renderPuzzleModal = () => {
    if (!showPuzzleModal) return null;
    
    switch (interactionPuzzleType) {
      case 'puzzle':
        return (
          <PuzzleModal 
            isOpen={showPuzzleModal} 
            onClose={() => setShowPuzzleModal(false)} 
            element={{...element, puzzleConfig: element.interaction?.puzzleConfig}} 
          />
        );
      case 'sequencePuzzle':
        return (
          <SequencePuzzleModal 
            isOpen={showPuzzleModal} 
            onClose={() => setShowPuzzleModal(false)} 
            element={{...element, sequencePuzzleConfig: element.interaction?.sequencePuzzleConfig}} 
          />
        );
      case 'clickSequencePuzzle':
        return (
          <ClickSequencePuzzleModal 
            isOpen={showPuzzleModal} 
            onClose={() => setShowPuzzleModal(false)} 
            element={{...element, clickSequencePuzzleConfig: element.interaction?.clickSequencePuzzleConfig}} 
          />
        );
      case 'sliderPuzzle':
        return (
          <SliderPuzzleModal 
            isOpen={showPuzzleModal} 
            onClose={() => setShowPuzzleModal(false)} 
            element={{...element, sliderPuzzleConfig: element.interaction?.sliderPuzzleConfig}} 
          />
        );
      default:
        return null;
    }
  };
  
  const renderCombinationPuzzleModal = () => {
    if (!combinationPuzzleModal || !element.interaction?.combinationResult) return null;
    
    const result = element.interaction.combinationResult;
    const puzzleType = result.puzzleType || 'puzzle';
    
    const createElementProxy = () => {
      const proxy = { ...element };
      
      if (puzzleType === 'puzzle' && result.puzzleConfig) {
        proxy.puzzleConfig = result.puzzleConfig;
      } 
      else if (puzzleType === 'sequencePuzzle' && result.sequencePuzzleConfig) {
        proxy.sequencePuzzleConfig = result.sequencePuzzleConfig;
      }
      else if (puzzleType === 'clickSequencePuzzle' && result.clickSequencePuzzleConfig) {
        proxy.clickSequencePuzzleConfig = result.clickSequencePuzzleConfig;
      }
      else if (puzzleType === 'sliderPuzzle' && result.sliderPuzzleConfig) {
        proxy.sliderPuzzleConfig = result.sliderPuzzleConfig;
      }
      
      return proxy;
    };
    
    const proxy = createElementProxy();
    
    switch (puzzleType) {
      case 'puzzle':
        return (
          <PuzzleModal 
            isOpen={combinationPuzzleModal} 
            onClose={() => setCombinationPuzzleModal(false)} 
            element={proxy} 
          />
        );
      case 'sequencePuzzle':
        return (
          <SequencePuzzleModal 
            isOpen={combinationPuzzleModal} 
            onClose={() => setCombinationPuzzleModal(false)} 
            element={proxy} 
          />
        );
      case 'clickSequencePuzzle':
        return (
          <ClickSequencePuzzleModal 
            isOpen={combinationPuzzleModal} 
            onClose={() => setCombinationPuzzleModal(false)} 
            element={proxy} 
          />
        );
      case 'sliderPuzzle':
        return (
          <SliderPuzzleModal 
            isOpen={combinationPuzzleModal} 
            onClose={() => setCombinationPuzzleModal(false)} 
            element={proxy} 
          />
        );
      default:
        return null;
    }
  };
  
  // Cleanup audio when component unmounts
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);
  
  return {
    showMessageModal,
    setShowMessageModal,
    showPuzzleModal,
    setShowPuzzleModal,
    combinationPuzzleModal,
    setCombinationPuzzleModal,
    combinationMessage,
    setCombinationMessage,
    audioRef,
    hasInteraction,
    interactionType,
    showInteractionIndicator,
    indicatorStyles,
    handleInteraction,
    renderPuzzleModal,
    renderCombinationPuzzleModal
  };
}
