
import { useState } from 'react';
import { useDesignState } from '@/context/DesignContext';
import { ElementType } from '@/types/designTypes';
import { toast } from 'sonner';

const useCanvasDrop = () => {
  const { addElement, canvasRef } = useDesignState();
  const [isDropTarget, setIsDropTarget] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setIsDropTarget(true);
  };

  const handleDragLeave = () => {
    setIsDropTarget(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDropTarget(false);

    // Get drop coordinates relative to canvas
    if (!canvasRef) return;
    
    const rect = canvasRef.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Check if this is a file drop
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      
      // Handle image files
      if (file.type.startsWith('image/')) {
        const element = addElement('image', {
          position: { x, y },
          size: { width: 200, height: 200 }
        });
        
        const fileReader = new FileReader();
        fileReader.onload = () => {
          // Create image to get dimensions
          const img = new Image();
          img.onload = () => {
            // Preserve aspect ratio
            const aspectRatio = img.width / img.height;
            const width = Math.min(400, img.width);
            const height = width / aspectRatio;
            
            // Update element with file data and dimensions
            updateElementWithFile(element.id, file, fileReader.result as string, {
              width,
              height
            });
            
            toast.success('Image added to canvas');
          };
          
          img.src = fileReader.result as string;
        };
        
        fileReader.readAsDataURL(file);
      }
      return;
    }
    
    // Handle element types from internal drag operations
    const elementType = e.dataTransfer.getData('elementType') as ElementType;
    if (elementType) {
      const elementData = e.dataTransfer.getData('elementData');
      let additionalProps = {};
      
      if (elementData) {
        try {
          additionalProps = JSON.parse(elementData);
        } catch (err) {
          console.error('Invalid element data:', err);
        }
      }
      
      addElement(elementType, {
        position: { x, y },
        ...additionalProps
      });
      
      toast.success(`${elementType} added to canvas`);
    }
  };

  const updateElementWithFile = (
    id: string, 
    file: File, 
    dataUrl: string, 
    size: { width: number, height: number }
  ) => {
    const { updateElement } = useDesignState();
    
    updateElement(id, {
      dataUrl,
      file,
      size,
      originalSize: { ...size }
    });
  };

  return {
    handleDrop,
    handleDragOver,
    handleDragLeave,
    isDropTarget
  };
};

export default useCanvasDrop;
