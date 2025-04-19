
import { DesignElement } from "@/types/designTypes";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface MessageInteractionPropertiesProps {
  element: DesignElement;
  onUpdate: (updates: Partial<DesignElement>) => void;
}

const MessageInteractionProperties = ({ element, onUpdate }: MessageInteractionPropertiesProps) => {
  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate({
      interaction: {
        ...element.interaction,
        message: e.target.value
      }
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Message Text</Label>
        <Textarea
          value={element.interaction?.message || ''}
          onChange={handleMessageChange}
          placeholder="Enter your message here..."
          className="min-h-[200px]"
        />
      </div>
    </div>
  );
};

export default MessageInteractionProperties;
