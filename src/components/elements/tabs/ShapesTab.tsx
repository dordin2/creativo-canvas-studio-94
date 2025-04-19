
import { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useDesignState } from '@/context/DesignContext';
import { Square, Circle, Triangle, Box } from 'lucide-react';

interface ShapesTabProps {
  onClose: () => void;
}

export const ShapesTab = ({ onClose }: ShapesTabProps) => {
  const { addElement } = useDesignState();
  
  const handleShapeAdd = useCallback((type: 'rectangle' | 'circle' | 'triangle' | 'line' | 'customBox') => {
    addElement(type);
    onClose();
  }, [addElement, onClose]);

  return (
    <div className="grid grid-cols-2 gap-2 mt-4">
      <Button variant="outline" className="h-12" onClick={() => handleShapeAdd('rectangle')}>
        <Square className="h-4 w-4 mr-2" />
        <span>Rectangle</span>
      </Button>
      <Button variant="outline" className="h-12" onClick={() => handleShapeAdd('circle')}>
        <Circle className="h-4 w-4 mr-2" />
        <span>Circle</span>
      </Button>
      <Button variant="outline" className="h-12" onClick={() => handleShapeAdd('triangle')}>
        <Triangle className="h-4 w-4 mr-2" />
        <span>Triangle</span>
      </Button>
      <Button variant="outline" className="h-12" onClick={() => handleShapeAdd('line')}>
        <div className="w-4 h-0.5 bg-current mr-2" />
        <span>Line</span>
      </Button>
      <Button variant="outline" className="h-12 col-span-2" onClick={() => handleShapeAdd('customBox')}>
        <Box className="h-4 w-4 mr-2" />
        <span>Custom Box (500x500)</span>
      </Button>
    </div>
  );
};
