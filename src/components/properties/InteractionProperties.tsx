import { useState } from "react";
import { useDesignState } from "@/context/DesignContext";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DesignElement, InteractionType } from "@/types/designTypes";

interface InteractionPropertiesProps {
  element: DesignElement;
}

const InteractionProperties = ({ element }: InteractionPropertiesProps) => {
  const { updateElement } = useDesignState();
  const [interactionType, setInteractionType] = useState<InteractionType>(
    element.interaction?.type || 'none'
  );

  const handleInteractionChange = (value: InteractionType) => {
    setInteractionType(value);
    updateElement(element.id, {
      interaction: {
        ...element.interaction,
        type: value,
      }
    });
  };

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Interaction Setup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="interaction-type">Interaction Type</Label>
            <Select
              value={interactionType}
              onValueChange={handleInteractionChange}
            >
              <SelectTrigger id="interaction-type">
                <SelectValue placeholder="Select interaction type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="message">Show Message</SelectItem>
                <SelectItem value="sound">Play Sound</SelectItem>
                <SelectItem value="canvasNavigation">Navigate to Canvas</SelectItem>
                <SelectItem value="puzzle">Show Puzzle</SelectItem>
                <SelectItem value="addToInventory">Add to Inventory</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {interactionType === 'message' && (
            <div className="space-y-2">
              <Label htmlFor="message">Message Text</Label>
              <Input
                id="message"
                value={element.interaction?.message || ''}
                onChange={(e) => updateElement(element.id, {
                  interaction: {
                    ...element.interaction,
                    type: 'message',
                    message: e.target.value
                  }
                })}
                placeholder="Enter message to show"
              />
            </div>
          )}
          
          {/* Add more interaction type specific inputs as needed */}
        </CardContent>
      </Card>
    </div>
  );
};

export default InteractionProperties;
