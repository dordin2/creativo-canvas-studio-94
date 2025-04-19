import React, { useState, useEffect, useRef } from 'react';
import { useDesignState, DesignElement } from '@/context/DesignContext';
import { X } from 'lucide-react';

interface InventoryItemProps {
  element: DesignElement;
}

const InventoryItem = ({ element }: InventoryItemProps) => {
  const { removeFromInventory, setDraggedInventoryItem, isGameMode } = useDesignState();
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPosition = useRef<{ x: number, y: number } | null>(null);
  const cursorPreviewRef = useRef<HTMLDivElement | null>(null);
  const touchTimeout = useRef<number | null>(null);
  const lastTouchRef = useRef<{ x: number, y: number } | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  // Check if element has transparent background
  const hasTransparentBackground = element.style?.backgroundColor === 'transparent' || 
                                  element.style?.backgroundColor === 'rgba(0,0,0,0)' || 
                                  element.style?.backgroundColor === '#0000' || 
                                  !element.style?.backgroundColor;
  
  // Handle custom drag and drop
  useEffect(() => {
    if (isDragging) {
      // Add dragging classes for styling
      document.body.classList.add('inventory-dragging');
      document.body.style.overflow = 'hidden'; // Prevent scrolling while dragging
      
      // Create and apply a custom cursor with item preview
      const cursorPreview = document.createElement('div');
      cursorPreview.id = 'cursor-preview';
      
      // Enhanced preview styling
      if (hasTransparentBackground) {
        cursorPreview.className = 'fixed pointer-events-none z-[10000] opacity-90 scale-100 w-32 h-32 flex items-center justify-center transform-gpu';
      } else {
        cursorPreview.className = 'fixed pointer-events-none z-[10000] opacity-90 scale-100 w-32 h-32 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-lg shadow-lg transform-gpu';
      }
      
      document.body.appendChild(cursorPreview);
      cursorPreviewRef.current = cursorPreview;
      
      // Add content to the cursor preview based on element type
      let previewContent = '';
      
      switch (element.type) {
        case 'rectangle':
          previewContent = `<div class="h-48 w-48" style="background-color: ${element.style?.backgroundColor || '#8B5CF6'}; border-radius: ${element.style?.borderRadius || '4px'}"></div>`;
          break;
          
        case 'circle':
          previewContent = `<div class="h-48 w-48 rounded-full" style="background-color: ${element.style?.backgroundColor as string || '#8B5CF6'}"></div>`;
          break;
          
        case 'triangle':
          previewContent = `<div style="width: 0; height: 0; border-left: 60px solid transparent; border-right: 60px solid transparent; border-bottom: 120px solid ${element.style?.backgroundColor || '#8B5CF6'}; background-color: transparent;"></div>`;
          break;
          
        case 'image':
          if (element.dataUrl) {
            previewContent = `<img src="${element.dataUrl}" alt="Item" class="w-full h-full object-contain" />`;
          } else if (element.src) {
            previewContent = `<img src="${element.src}" alt="Item" class="w-full h-full object-contain" />`;
          } else {
            previewContent = `<div class="w-full h-full bg-gray-200 flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg></div>`;
          }
          break;
          
        case 'heading':
        case 'subheading':
        case 'paragraph':
          previewContent = `<div class="w-full h-full flex items-center justify-center text-3xl overflow-hidden font-semibold">${element.content?.substring(0, 10) || 'Text'}...</div>`;
          break;
          
        case 'puzzle':
        case 'sequencePuzzle':
        case 'sliderPuzzle':
          previewContent = `<div class="w-full h-full flex items-center justify-center">
            <div class="h-40 w-40 bg-canvas-purple rounded-md flex items-center justify-center text-white text-xl">Puzzle</div>
          </div>`;
          break;
          
        default:
          previewContent = `<div class="w-full h-full bg-gray-200 flex items-center justify-center text-3xl text-gray-600 font-medium">Item</div>`;
      }
      
      cursorPreview.innerHTML = previewContent;
      
      // Enhanced touch move handling with requestAnimationFrame
      const handleTouchMove = (e: TouchEvent) => {
        e.preventDefault(); // Prevent scrolling
        
        const touch = e.touches[0];
        lastTouchRef.current = { x: touch.clientX, y: touch.clientY };
        
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        
        animationFrameRef.current = requestAnimationFrame(() => {
          if (cursorPreview && lastTouchRef.current) {
            const { x, y } = lastTouchRef.current;
            cursorPreview.style.transform = `translate3d(${x - 50}px, ${y - 50}px, 0) scale(1.1)`;
            
            // Dispatch custom event for potential drop targets
            const dragOverEvent = new CustomEvent('custom-drag-over', {
              detail: { clientX: x, clientY: y, elementId: element.id }
            });
            document.dispatchEvent(dragOverEvent);
          }
        });
      };
      
      // Enhanced touch end handling
      const handleTouchEnd = (e: TouchEvent) => {
        if (lastTouchRef.current) {
          const dropEvent = new CustomEvent('custom-drop', {
            detail: {
              clientX: lastTouchRef.current.x,
              clientY: lastTouchRef.current.y,
              elementId: element.id
            }
          });
          document.dispatchEvent(dropEvent);
        }
        
        cleanup();
      };
      
      // Handle touch cancel
      const handleTouchCancel = () => {
        cleanup();
      };
      
      const cleanup = () => {
        setIsDragging(false);
        setDraggedInventoryItem(null);
        document.body.classList.remove('inventory-dragging');
        document.body.style.removeProperty('overflow');
        
        if (cursorPreview && cursorPreview.parentNode) {
          cursorPreview.parentNode.removeChild(cursorPreview);
          cursorPreviewRef.current = null;
        }
        
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
        
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
        document.removeEventListener('touchcancel', handleTouchCancel);
        lastTouchRef.current = null;
      };
      
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
      document.addEventListener('touchcancel', handleTouchCancel);
      
      return cleanup;
    }
  }, [isDragging, element, setDraggedInventoryItem, hasTransparentBackground]);
  
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isGameMode) return;
    
    e.preventDefault();
    const touch = e.touches[0];
    dragStartPosition.current = { x: touch.clientX, y: touch.clientY };
    lastTouchRef.current = { x: touch.clientX, y: touch.clientY };
    
    // Add a small delay to differentiate between tap and drag
    touchTimeout.current = window.setTimeout(() => {
      setIsDragging(true);
      setDraggedInventoryItem(element);
      
      // Add haptic feedback if available
      if (window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(50);
      }
    }, 100);
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchTimeout.current) {
      // If there's significant movement, start dragging immediately
      const touch = e.touches[0];
      const startPos = dragStartPosition.current;
      
      if (startPos) {
        const deltaX = Math.abs(touch.clientX - startPos.x);
        const deltaY = Math.abs(touch.clientY - startPos.y);
        
        if (deltaX > 5 || deltaY > 5) {
          clearTimeout(touchTimeout.current);
          setIsDragging(true);
          setDraggedInventoryItem(element);
          
          if (window.navigator && window.navigator.vibrate) {
            window.navigator.vibrate(50);
          }
        }
      }
    }
  };
  
  const handleTouchEnd = () => {
    if (touchTimeout.current) {
      clearTimeout(touchTimeout.current);
      touchTimeout.current = null;
    }
  };
  
  const renderThumbnail = () => {
    switch (element.type) {
      case 'rectangle':
        return (
          <div
            className="h-full w-full"
            style={{
              backgroundColor: element.style?.backgroundColor as string || '#8B5CF6',
              borderRadius: element.style?.borderRadius || '4px'
            }}
          />
        );
        
      case 'circle':
        return (
          <div
            className="h-full w-full rounded-full"
            style={{
              backgroundColor: element.style?.backgroundColor as string || '#8B5CF6'
            }}
          />
        );
        
      case 'triangle':
        return (
          <div
            className="absolute"
            style={{
              width: 0,
              height: 0,
              borderLeft: '15px solid transparent',
              borderRight: '15px solid transparent',
              borderBottom: `30px solid ${element.style?.backgroundColor as string || '#8B5CF6'}`,
              backgroundColor: 'transparent'
            }}
          />
        );
        
      case 'image':
        return element.dataUrl ? (
          <img 
            src={element.dataUrl} 
            alt="Item" 
            className="w-full h-full object-contain" 
          />
        ) : element.src ? (
          <img 
            src={element.src} 
            alt="Item" 
            className="w-full h-full object-contain" 
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center text-xs text-gray-400">
            No image
          </div>
        );
        
      case 'heading':
      case 'subheading':
      case 'paragraph':
        return (
          <div className="w-full h-full flex items-center justify-center text-xs overflow-hidden">
            {element.content?.substring(0, 20) || 'Text'}
          </div>
        );
        
      default:
        return (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center text-xs text-gray-400">
            Item
          </div>
        );
    }
  };
  
  return (
    <div 
      className={`relative ${hasTransparentBackground ? '' : 'bg-gray-50 border'} rounded-md p-2 h-32 flex items-center justify-center ${hasTransparentBackground ? '' : 'shadow-sm'} group ${isGameMode ? 'cursor-grab active:cursor-grabbing' : ''} ${isDragging ? 'opacity-30' : ''}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={() => removeFromInventory(element.id)}
          className="bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
        >
          <X size={20} />
        </button>
      </div>
      
      <div className={`w-full h-full overflow-hidden flex items-center justify-center`}>
        {renderThumbnail()}
      </div>
    </div>
  );
};

export default InventoryItem;
