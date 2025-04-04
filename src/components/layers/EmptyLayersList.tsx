
import { useIsMobile } from "@/hooks/use-mobile";

const EmptyLayersList = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className={`text-sm text-gray-500 italic ${isMobile ? 'p-4 text-center' : ''}`}>
      No elements added yet
    </div>
  );
};

export default EmptyLayersList;
