
import { useState } from "react";
import { DesignElement, useDesignState, InteractionType } from "@/context/DesignContext";
import { MessagePosition } from "@/types/designTypes";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger 
} from "@/components/ui/collapsible";
import {
  Zap,
  ChevronDown,
  ChevronRight,
  MessageSquare,
  VolumeX,
  Navigation,
  ShoppingBag,
  Combine
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface ElementInteractionsProps {
  element: DesignElement;
}

const ElementInteractions = ({ element }: ElementInteractionsProps) => {
  const { updateElement, canvases } = useDesignState();
  const [isInteractionOpen, setIsInteractionOpen] = useState(false);
  const { t } = useLanguage();
  
  // Set default interaction if none exists
  const interaction = element.interaction || { type: 'none' };
  
  const handleInteractionTypeChange = (type: string) => {
    // Validate that the type is a valid InteractionType
    const validType = type as InteractionType;
    
    const updatedInteraction = {
      ...interaction,
      type: validType
    };
    
    updateElement(element.id, { interaction: updatedInteraction });
  };
  
  const handleMessageChange = (message: string) => {
    const updatedInteraction = {
      ...interaction,
      message
    };
    
    updateElement(element.id, { interaction: updatedInteraction });
  };
  
  const handleMessagePositionChange = (position: string) => {
    // Ensure we're using a valid MessagePosition value
    const validPosition = position as MessagePosition;
    
    const updatedInteraction = {
      ...interaction,
      messagePosition: validPosition
    };
    
    updateElement(element.id, { interaction: updatedInteraction });
  };
  
  const handleSoundUrlChange = (soundUrl: string) => {
    const updatedInteraction = {
      ...interaction,
      soundUrl
    };
    
    updateElement(element.id, { interaction: updatedInteraction });
  };
  
  const handleTargetCanvasChange = (targetCanvasId: string) => {
    const updatedInteraction = {
      ...interaction,
      targetCanvasId
    };
    
    updateElement(element.id, { interaction: updatedInteraction });
  };
  
  // Skip interaction options for puzzle types since they're handled by their own properties
  const isPuzzleElement = [
    'puzzle', 
    'sequencePuzzle', 
    'clickSequencePuzzle', 
    'sliderPuzzle'
  ].includes(element.type);
  
  if (isPuzzleElement) {
    return null;
  }
  
  return (
    <Collapsible
      open={isInteractionOpen}
      onOpenChange={setIsInteractionOpen}
      className="border rounded-md p-2"
    >
      <CollapsibleTrigger asChild>
        <Button variant="ghost" className="flex w-full justify-between items-center p-2">
          <div className="flex items-center">
            <Zap className="h-4 w-4 mr-2 text-blue-500" />
            <span>{t('properties.interaction.title') || "Interaction"}</span>
          </div>
          {isInteractionOpen ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="px-2 pt-2 space-y-4">
        <div className="space-y-2">
          <Label>{t('properties.interaction.type') || "Interaction Type"}</Label>
          <Select
            value={interaction.type}
            onValueChange={handleInteractionTypeChange}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('properties.interaction.selectType') || "Select interaction type"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">
                {t('properties.interaction.none') || "None"}
              </SelectItem>
              <SelectItem value="message">
                <div className="flex items-center">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  {t('properties.interaction.message') || "Show Message"}
                </div>
              </SelectItem>
              <SelectItem value="sound">
                <div className="flex items-center">
                  <VolumeX className="h-4 w-4 mr-2" />
                  {t('properties.interaction.sound') || "Play Sound"}
                </div>
              </SelectItem>
              <SelectItem value="canvasNavigation">
                <div className="flex items-center">
                  <Navigation className="h-4 w-4 mr-2" />
                  {t('properties.interaction.navigation') || "Canvas Navigation"}
                </div>
              </SelectItem>
              <SelectItem value="addToInventory">
                <div className="flex items-center">
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  {t('properties.interaction.inventory') || "Add to Inventory"}
                </div>
              </SelectItem>
              <SelectItem value="combinable">
                <div className="flex items-center">
                  <Combine className="h-4 w-4 mr-2" />
                  {t('properties.interaction.combinable') || "Combinable Item"}
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {interaction.type === 'message' && (
          <div className="space-y-2">
            <Label>{t('properties.interaction.message') || "Message Text"}</Label>
            <Textarea
              value={interaction.message || ''}
              onChange={(e) => handleMessageChange(e.target.value)}
              placeholder={t('properties.interaction.message.placeholder') || "Enter message text..."}
              className="min-h-24"
            />
            
            <div className="space-y-2 pt-2">
              <Label>{t('properties.interaction.messagePosition') || "Message Position"}</Label>
              <RadioGroup
                value={interaction.messagePosition || 'bottom'}
                onValueChange={handleMessagePositionChange}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="bottom" id="bottom" />
                  <Label htmlFor="bottom">{t('properties.interaction.position.bottom') || "Bottom"}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="top" id="top" />
                  <Label htmlFor="top">{t('properties.interaction.position.top') || "Top"}</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        )}
        
        {interaction.type === 'sound' && (
          <div className="space-y-2">
            <Label>{t('properties.interaction.sound.url') || "Sound URL"}</Label>
            <Input
              value={interaction.soundUrl || ''}
              onChange={(e) => handleSoundUrlChange(e.target.value)}
              placeholder={t('properties.interaction.sound.placeholder') || "Enter sound URL..."}
            />
            <p className="text-xs text-muted-foreground">
              {t('properties.interaction.sound.help') || "Enter URL to an audio file (MP3, WAV, etc.)"}
            </p>
          </div>
        )}
        
        {interaction.type === 'canvasNavigation' && (
          <div className="space-y-2">
            <Label>{t('properties.interaction.target') || "Target Canvas"}</Label>
            <Select
              value={interaction.targetCanvasId || ''}
              onValueChange={handleTargetCanvasChange}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('properties.interaction.selectCanvas') || "Select target canvas"} />
              </SelectTrigger>
              <SelectContent>
                {canvases.map((canvas) => (
                  <SelectItem key={canvas.id} value={canvas.id}>
                    {canvas.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        
        {interaction.type === 'combinable' && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              {t('properties.interaction.combinable.help') || "This item can be combined with other elements in game mode. Set up combinations in the element properties of other items."}
            </p>
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
};

export default ElementInteractions;
