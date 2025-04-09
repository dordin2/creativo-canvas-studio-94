
import React, { useState, useRef } from 'react';
import { DesignElement, useDesignState } from '@/context/DesignContext';

interface InventoryItemProps {
  element: DesignElement;
}

const InventoryItem: React.FC<InventoryItemProps> = ({ element }) => {
  const { removeFromInventory, setDraggedInventoryItem } = useDesignState();
  const [isDragging, setIsDragging] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);
  
  // Track position for custom drag effect
  const startPos = useRef({ x: 0, y: 0 });
  const mouseOffset = useRef({ x: 0, y: 0 });
  
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (elementRef.current) {
      const rect = elementRef.current.getBoundingClientRect();
      startPos.current = { x: e.clientX, y: e.clientY };
      mouseOffset.current = { 
        x: e.clientX - rect.left, 
        y: e.clientY - rect.top 
      };
    }
    
    setIsDragging(true);
    setDraggedInventoryItem(element);
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };
  
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    
    // Create custom event for drag over
    const dragOverEvent = new CustomEvent('custom-drag-over', {
      detail: { clientX: e.clientX, clientY: e.clientY }
    });
    document.dispatchEvent(dragOverEvent);
    
    // Visual feedback - move the dragged element with cursor
    if (elementRef.current) {
      elementRef.current.style.position = 'fixed';
      elementRef.current.style.left = `${e.clientX - mouseOffset.current.x}px`;
      elementRef.current.style.top = `${e.clientY - mouseOffset.current.y}px`;
      elementRef.current.style.pointerEvents = 'none';
      elementRef.current.style.zIndex = '9999';
      elementRef.current.style.opacity = '0.8';
      elementRef.current.style.transform = 'scale(1.05)';
      elementRef.current.style.boxShadow = '0 5px 15px rgba(0,0,0,0.2)';
    }
  };
  
  const handleMouseUp = (e: MouseEvent) => {
    if (!isDragging) return;
    
    // Create custom drop event
    const dropEvent = new CustomEvent('custom-drop', {
      detail: { clientX: e.clientX, clientY: e.clientY }
    });
    document.dispatchEvent(dropEvent);
    
    // Reset styles
    if (elementRef.current) {
      elementRef.current.style.position = '';
      elementRef.current.style.left = '';
      elementRef.current.style.top = '';
      elementRef.current.style.pointerEvents = '';
      elementRef.current.style.zIndex = '';
      elementRef.current.style.opacity = '';
      elementRef.current.style.transform = '';
      elementRef.current.style.boxShadow = '';
    }
    
    setIsDragging(false);
    setDraggedInventoryItem(null);
    
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };
  
  const handleUse = () => {
    // This could be expanded to allow item inspection or other interactions
    console.log("Inventory item used:", element);
  };
  
  const handleRemove = () => {
    removeFromInventory(element.id);
  };
  
  // Get a nice display for the element based on its type
  const getItemPreview = () => {
    if (element.type === 'image' && element.dataUrl) {
      return (
        <img 
          src={element.dataUrl} 
          alt={element.name || 'Item'} 
          className="max-h-full max-w-full object-contain"
        />
      );
    } else if (['rectangle', 'circle', 'triangle'].includes(element.type)) {
      const shapeStyles = {
        backgroundColor: element.style?.backgroundColor as string || '#6366F1',
        width: '90%',
        height: '90%',
        borderRadius: element.type === 'circle' ? '50%' : 
                      element.type === 'rectangle' ? '4px' : '0',
      };
      
      if (element.type === 'triangle') {
        return (
          <div className="w-full h-full flex items-center justify-center">
            <div 
              style={{
                width: 0,
                height: 0,
                borderLeft: '20px solid transparent',
                borderRight: '20px solid transparent',
                borderBottom: `40px solid ${element.style?.backgroundColor as string || '#6366F1'}`,
              }}
            />
          </div>
        );
      }
      
      return <div style={shapeStyles} />;
    }
    
    return (
      <div className="flex items-center justify-center text-lg font-bold">
        {element.name || element.type.charAt(0).toUpperCase() + element.type.slice(1)}
      </div>
    );
  };
  
  return (
    <div 
      ref={elementRef}
      className={`inventory-item w-16 h-16 bg-white rounded-lg border-2 border-gray-200 flex items-center justify-center cursor-grab overflow-hidden relative ${isDragging ? 'cursor-grabbing' : ''}`}
      onMouseDown={handleMouseDown}
      title={element.name || `${element.type} item`}
    >
      {getItemPreview()}
      
      {/* Display item name below the item */}
      <div className="absolute -bottom-6 left-0 right-0 text-center text-xs text-gray-700 whitespace-nowrap overflow-hidden text-ellipsis px-1">
        {element.name || element.type}
      </div>
    </div>
  );
};

export default InventoryItem;
