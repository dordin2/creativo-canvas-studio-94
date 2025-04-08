
import { useRef, useState, useEffect } from "react";
import { DesignElement, useDesignState } from "@/context/DesignContext";
import { useDraggable } from "@/hooks/useDraggable";
import { useElementResize } from "@/hooks/useElementResize";
import { useElementRotation } from "@/hooks/useElementRotation";
import { getElementStyle, getRotation } from "@/utils/elementStyles";
import ElementControls from "./element/ElementControls";
import EditableText from "./element/EditableText";
import PuzzleElement from "./element/PuzzleElement";
import SequencePuzzleElement from "./element/SequencePuzzleElement";
import SliderPuzzleElement from "./element/SliderPuzzleElement";
import ClickSequencePuzzleElement from "./element/ClickSequencePuzzleElement";
import InteractionMessageModal from "./element/InteractionMessageModal";
import PuzzleModal from "./element/PuzzleModal";
import SequencePuzzleModal from "./element/SequencePuzzleModal";
import { SliderPuzzleModal } from "./element/SliderPuzzleModal";
import ClickSequencePuzzleModal from "./element/ClickSequencePuzzleModal";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Copy, Trash2, Eye, EyeOff, Maximize2 } from "lucide-react";
import { toast } from "sonner";

const DraggableElement = ({ element, isActive, children }: {
  element: DesignElement;
  isActive: boolean;
  children: React.ReactNode;
}) => {
  const { updateElement, setActiveElement, removeElement, addElement, setActiveCanvas, canvases, isGameMode } = useDesignState();
  const { startDrag, isDragging: isDraggingFromHook } = useDraggable(element.id);
  const elementRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const textInputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [showControls, setShowControls] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showPuzzleModal, setShowPuzzleModal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const { isResizing, handleResizeStart } = useElementResize(element);
  const { isRotating, handleRotateStart } = useElementRotation(element, elementRef);

  const textElementTypes = ['heading', 'subheading', 'paragraph'];
  const isSequencePuzzleElement = element.type === 'sequencePuzzle';
  const isPuzzleElement = element.type === 'puzzle';
  const isClickSequencePuzzleElement = element.type === 'clickSequencePuzzle';
  const isSliderPuzzleElement = element.type === 'sliderPuzzle';
  const isImageElement = element.type === 'image';
  const isVideoElement = element.type === 'video';
  
  const hasInteraction = element.interaction?.type && element.interaction.type !== 'none';
  const interactionType = element.interaction?.type || 'none';
  const interactionPuzzleType = element.interaction?.puzzleType || 'puzzle';

  // IMPORTANT: We've moved this check here and are now using conditional rendering
  // instead of an early return to avoid React hooks errors
  const shouldRenderElement = !element.isHidden;

  useEffect(() => {
    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  useEffect(() => {
    const handleMouseEnter = () => {
      if (!isGameMode) {
        setShowControls(true);
      }
    };

    const handleMouseLeave = () => {
      if (!isDragging) {
        setShowControls(false);
      }
    };

    const element = elementRef.current;
    if (element) {
      element.addEventListener('mouseenter', handleMouseEnter);
      element.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      if (element) {
        element.removeEventListener('mouseenter', handleMouseEnter);
        element.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [isDragging, isGameMode]);

  // Exit fullscreen when switching away from game mode
  useEffect(() => {
    if (!isGameMode) {
      setIsFullscreen(false);
    }
  }, [isGameMode]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    
    if (isImageElement && 
        (e.target as HTMLElement).classList.contains('upload-placeholder-text')) {
      e.preventDefault();
    }
    
    if (isGameMode) {
      if (isVideoElement) {
        handleVideoClick(e);
        return;
      }
      
      if (hasInteraction) {
        handleInteraction();
      }
      return;
    }
    
    setActiveElement(element);
    
    if (isEditing) return;
    
    if (!isSequencePuzzleElement) {
      startDrag(e, element.position);
      setIsDragging(true);
    }
    
    setStartPos({ x: e.clientX, y: e.clientY });
  };

  const handleVideoClick = (e: React.MouseEvent) => {
    if (!isGameMode) return;
    
    e.stopPropagation();
    
    if (hasInteraction) {
      handleInteraction();
      return;
    }
    
    setIsFullscreen(!isFullscreen);
    
    // If going into fullscreen, try to play the video
    if (!isFullscreen && videoRef.current) {
      videoRef.current.play().catch(err => {
        // Autoplay might be blocked by browser policy
        console.log('Video autoplay blocked:', err);
      });
    }
  };

  const handleTextDoubleClick = (e: React.MouseEvent) => {
    if (isGameMode) {
      return;
    }
    
    if (textElementTypes.includes(element.type)) {
      e.stopPropagation();
      setIsEditing(true);
      setTimeout(() => {
        if (textInputRef.current) {
          textInputRef.current.focus();
        }
      }, 10);
    } else if (isSequencePuzzleElement) {
      startDrag(e, element.position);
      setIsDragging(true);
    } else if (hasInteraction && !isEditing && !isDragging) {
      e.stopPropagation();
      handleInteraction();
    }
  };

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
  };

  const handlePuzzleClick = (e: React.MouseEvent) => {
    if (isGameMode) {
      e.stopPropagation();
      handleInteraction();
      return;
    }
    
    if (isPuzzleElement && !isDragging) {
      e.stopPropagation();
      // The modal is now handled directly in the PuzzleElement component
      // so we don't need to do anything here
    }
  };

  const handleDuplicate = () => {
    const duplicateProps = {
      ...element,
      position: {
        x: element.position.x + 20,
        y: element.position.y + 20
      }
    };
    
    delete (duplicateProps as any).id;
    
    addElement(element.type, duplicateProps);
  };

  const handleToggleVisibility = () => {
    updateElement(element.id, {
      isHidden: !element.isHidden
    });
  };

  const handleDelete = () => {
    removeElement(element.id);
  };

  const elementStyle = getElementStyle(element, isDragging);
  const rotation = getRotation(element);
  const frameTransform = `rotate(${rotation}deg)`;

  let childContent = children;
  
  if (textElementTypes.includes(element.type)) {
    childContent = (
      <EditableText
        element={element}
        isEditing={isEditing && !isGameMode}
        setIsEditing={setIsEditing}
        textInputRef={textInputRef}
      />
    );
  } else if (element.type === 'puzzle') {
    childContent = (
      <PuzzleElement 
        element={element} 
        onClick={handlePuzzleClick} 
      />
    );
  } else if (element.type === 'sequencePuzzle') {
    childContent = (
      <SequencePuzzleElement
        element={element}
        onClick={handlePuzzleClick}
      />
    );
  } else if (element.type === 'clickSequencePuzzle') {
    childContent = (
      <ClickSequencePuzzleElement
        element={element}
        onClick={handlePuzzleClick}
      />
    );
  } else if (element.type === 'sliderPuzzle') {
    childContent = (
      <SliderPuzzleElement
        element={element}
        onClick={handlePuzzleClick}
      />
    );
  } else if (element.type === 'video') {
    childContent = (
      <video
        ref={videoRef}
        src={element.dataUrl || element.src}
        className="w-full h-full object-contain"
        autoPlay={element.videoAutoplay}
        muted={element.videoMuted !== false} // Default to muted if not specified
        controls={isGameMode ? element.videoControls !== false : false} // Only show controls in game mode and if not disabled
        loop={element.videoLoop}
        playsInline
        onClick={isGameMode ? handleVideoClick : undefined}
        onDoubleClick={isGameMode ? undefined : handleTextDoubleClick}
        style={{ 
          cursor: isGameMode ? 'pointer' : 'grab',
          pointerEvents: isGameMode ? 'auto' : 'none' // Prevent video controls in edit mode
        }}
      />
    );
    
    // Add fullscreen overlay icon for videos in game mode
    if (isGameMode && !isFullscreen) {
      childContent = (
        <>
          {childContent}
          <div 
            className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
            onClick={handleVideoClick}
          >
            <div className="bg-black bg-opacity-50 rounded-full p-2">
              <Maximize2 className="text-white h-6 w-6" />
            </div>
          </div>
        </>
      );
    }
  }

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

  const showInteractionIndicator = hasInteraction && !isActive && !isDragging;
  const indicatorStyles = interactionType === 'canvasNavigation' ? 
    "absolute bottom-0 right-0 w-3 h-3 bg-blue-500 rounded-full animate-pulse" : "";

  // Render fullscreen video
  if (isGameMode && isVideoElement && isFullscreen) {
    return (
      <div
        className="fixed inset-0 z-50 bg-black flex items-center justify-center"
        onClick={() => setIsFullscreen(false)}
      >
        <video
          ref={videoRef}
          src={element.dataUrl || element.src}
          className="max-w-full max-h-full"
          autoPlay={true}
          muted={element.videoMuted !== false}
          controls={element.videoControls !== false}
          loop={element.videoLoop}
          playsInline
          onClick={(e) => e.stopPropagation()} // Prevent closing when clicking directly on video
          style={{ width: '90%', height: '90%', objectFit: 'contain' }}
        />
        <button
          className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
          onClick={() => setIsFullscreen(false)}
        >
          <Maximize2 className="h-6 w-6" />
        </button>
      </div>
    );
  }

  const elementContent = (
    <div
      ref={elementRef}
      className="canvas-element"
      style={{
        ...elementStyle,
        transition: isDragging ? 'none' : 'transform 0.1s ease',
        cursor: isGameMode 
          ? (hasInteraction || isVideoElement ? 'pointer' : 'default') 
          : (isDragging ? 'move' : (hasInteraction ? 'pointer' : 'grab')),
        willChange: isDragging ? 'transform' : 'auto',
        position: 'relative',
        display: shouldRenderElement ? 'block' : 'none', // Use display:none instead of early return
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={isGameMode ? undefined : handleTextDoubleClick}
      onClick={isGameMode && (hasInteraction || isVideoElement) ? (e) => isVideoElement ? handleVideoClick(e) : handleInteraction() : undefined}
      draggable={false}
      onDragStart={(e) => {
        e.preventDefault();
      }}
      onDragOver={(e) => {
        if ((isImageElement || isPuzzleElement || isVideoElement) && !isGameMode) {
          e.preventDefault();
          e.stopPropagation();
        }
      }}
    >
      {childContent}
      {showInteractionIndicator && interactionType === 'canvasNavigation' && (
        <div className={indicatorStyles} title="Click to navigate to another canvas"></div>
      )}
    </div>
  );

  return (
    <>
      {isGameMode ? (
        elementContent
      ) : (
        <ContextMenu>
          <ContextMenuTrigger asChild>
            {elementContent}
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem onClick={handleDuplicate} className="flex items-center gap-2">
              <Copy className="h-4 w-4" />
              <span>Duplicate</span>
            </ContextMenuItem>
            <ContextMenuItem onClick={handleToggleVisibility} className="flex items-center gap-2">
              {element.isHidden ? (
                <>
                  <Eye className="h-4 w-4" />
                  <span>Show</span>
                </>
              ) : (
                <>
                  <EyeOff className="h-4 w-4" />
                  <span>Hide</span>
                </>
              )}
            </ContextMenuItem>
            <ContextMenuItem onClick={handleDelete} className="flex items-center gap-2 text-red-500">
              <Trash2 className="h-4 w-4" />
              <span>Delete</span>
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      )}

      {!isGameMode && (
        <ElementControls
          isActive={isActive}
          element={element}
          frameTransform={frameTransform}
          onResizeStart={handleResizeStart}
          onRotateStart={handleRotateStart}
          showControls={showControls && isActive && !element.isHidden}
        />
      )}
      
      {interactionType === 'sound' && element.interaction?.soundUrl && (
        <audio 
          ref={audioRef}
          src={element.interaction.soundUrl}
          style={{ display: 'none' }}
        />
      )}
      
      {interactionType === 'message' && (
        <InteractionMessageModal
          isOpen={showMessageModal}
          onClose={() => setShowMessageModal(false)}
          message={element.interaction?.message || ''}
        />
      )}
      
      {renderPuzzleModal()}
    </>
  );
};

export default DraggableElement;
