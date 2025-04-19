
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { X } from "lucide-react";
import { DesignElement } from "@/types/designTypes";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDesignState } from "@/context/DesignContext";
import { useState } from "react";
import { toast } from "sonner";

interface InteractionSettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  element: DesignElement;
  interactionType: string;
}

const InteractionSettingsPanel = ({
  isOpen,
  onClose,
  element,
  interactionType
}: InteractionSettingsPanelProps) => {
  const { updateElement, canvases, activeCanvasIndex } = useDesignState();
  const [audioFile, setAudioFile] = useState<File | null>(null);

  const interactionConfig = element.interaction || {
    type: 'none',
    message: '',
    sound: '',
    targetCanvasId: ''
  };

  const handleUpdateInteraction = (updates: any) => {
    updateElement(element.id, {
      interaction: {
        ...interactionConfig,
        type: interactionType,
        ...updates
      }
    });
  };

  const handleSoundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('audio/')) {
      toast.error('Please upload a valid audio file');
      return;
    }
    
    setAudioFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        handleUpdateInteraction({
          sound: file.name,
          soundUrl: event.target.result
        });
        toast.success('Sound uploaded successfully');
      }
    };
    reader.readAsDataURL(file);
  };

  const renderContent = () => {
    switch (interactionType) {
      case 'message':
        return (
          <div className="space-y-4">
            <div>
              <Label>Message Text</Label>
              <Textarea
                value={interactionConfig.message || ''}
                onChange={(e) => handleUpdateInteraction({ message: e.target.value })}
                placeholder="Enter message to show..."
                className="min-h-[200px]"
              />
            </div>
          </div>
        );

      case 'sound':
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
            {interactionConfig.sound && (
              <div className="mt-4">
                <p className="text-sm mb-2">Current sound: {interactionConfig.sound}</p>
                {interactionConfig.soundUrl && (
                  <audio 
                    controls 
                    src={interactionConfig.soundUrl} 
                    className="w-full" 
                  />
                )}
              </div>
            )}
          </div>
        );

      case 'canvasNavigation':
        return (
          <div className="space-y-4">
            <div>
              <Label>Target Canvas</Label>
              <Select
                value={interactionConfig.targetCanvasId || ''}
                onValueChange={(value) => handleUpdateInteraction({ targetCanvasId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select target canvas" />
                </SelectTrigger>
                <SelectContent>
                  {canvases.map((canvas, index) => (
                    index !== activeCanvasIndex && (
                      <SelectItem key={canvas.id} value={canvas.id}>
                        {canvas.name}
                      </SelectItem>
                    )
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={() => onClose()}>
      <SheetContent side="bottom" className="h-[90vh]">
        <SheetHeader className="flex flex-row items-center justify-between">
          <SheetTitle>
            {interactionType.charAt(0).toUpperCase() + interactionType.slice(1)} Settings
          </SheetTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </SheetHeader>
        <div className="mt-4">
          {renderContent()}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default InteractionSettingsPanel;
