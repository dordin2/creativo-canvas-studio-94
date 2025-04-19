
import { DesignElement } from "@/types/designTypes";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface SoundInteractionPropertiesProps {
  element: DesignElement;
  onUpdate: (updates: Partial<DesignElement>) => void;
}

const SoundInteractionProperties = ({ element, onUpdate }: SoundInteractionPropertiesProps) => {
  const handleSoundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('audio/')) {
      toast.error('Please upload a valid audio file');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        onUpdate({
          interaction: {
            ...element.interaction,
            sound: file.name,
            soundUrl: event.target.result as string
          }
        });
        toast.success('Sound uploaded successfully');
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Upload Sound</Label>
        <Input 
          type="file" 
          accept="audio/*" 
          onChange={handleSoundUpload}
        />
      </div>
      {element.interaction?.sound && (
        <div className="mt-2">
          <p className="text-sm">Current sound: {element.interaction.sound}</p>
          {element.interaction?.soundUrl && (
            <audio 
              controls 
              src={element.interaction.soundUrl} 
              className="mt-2 w-full" 
            />
          )}
        </div>
      )}
    </div>
  );
};

export default SoundInteractionProperties;
