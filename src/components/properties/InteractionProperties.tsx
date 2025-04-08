import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UploadButton } from "../ui/upload-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { PuzzleProperties } from "./PuzzleProperties";
import { SequencePuzzleProperties } from "./SequencePuzzleProperties";
import { processImageUpload } from "@/utils/imageUploader";
import { DesignElement, useDesignState } from "@/context/DesignContext";
import { useLanguage } from "@/context/LanguageContext";
import { AudioUpload } from "./AudioUpload";
import { SliderPuzzleProperties } from "./SliderPuzzleProperties";
import { ClickSequencePuzzleProperties } from "./ClickSequencePuzzleProperties";

interface InteractionPropertiesProps {
  element: DesignElement;
}

export const InteractionProperties: React.FC<InteractionPropertiesProps> = ({ element }) => {
  const { updateElement, canvases } = useDesignState();
  const { t, language } = useLanguage();
  const [interactionType, setInteractionType] = useState<string>(element.interaction?.type || 'none');
  const [message, setMessage] = useState<string>(element.interaction?.message || '');
  const [messageDuration, setMessageDuration] = useState<number>(element.interaction?.messageDuration || 5000);
  const [targetCanvasId, setTargetCanvasId] = useState<string>(element.interaction?.targetCanvasId || '');
  const [puzzleTab, setPuzzleTab] = useState<string>(element.interaction?.puzzleType || 'puzzle');
  
  useEffect(() => {
    setInteractionType(element.interaction?.type || 'none');
    setMessage(element.interaction?.message || '');
    setMessageDuration(element.interaction?.messageDuration || 5000);
    setTargetCanvasId(element.interaction?.targetCanvasId || '');
    setPuzzleTab(element.interaction?.puzzleType || 'puzzle');
  }, [element.interaction]);

  const handleTypeChange = (value: string) => {
    setInteractionType(value);
    
    if (value === 'none') {
      updateElement(element.id, {
        interaction: {
          type: 'none'
        }
      });
    } else if (value === 'message') {
      updateElement(element.id, {
        interaction: {
          type: 'message',
          message: message,
          messageDuration: messageDuration
        }
      });
    } else if (value === 'sound') {
      updateElement(element.id, {
        interaction: {
          type: 'sound',
          soundUrl: element.interaction?.soundUrl || ''
        }
      });
    } else if (value === 'canvasNavigation') {
      updateElement(element.id, {
        interaction: {
          type: 'canvasNavigation',
          targetCanvasId: targetCanvasId
        }
      });
    } else if (value === 'puzzle') {
      updateElement(element.id, {
        interaction: {
          type: 'puzzle',
          puzzleType: element.interaction?.puzzleType || 'puzzle',
          puzzleConfig: element.interaction?.puzzleConfig,
          sequencePuzzleConfig: element.interaction?.sequencePuzzleConfig,
          sliderPuzzleConfig: element.interaction?.sliderPuzzleConfig,
          clickSequencePuzzleConfig: element.interaction?.clickSequencePuzzleConfig,
        }
      });
    }
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newMessage = e.target.value;
    setMessage(newMessage);
    
    updateElement(element.id, {
      interaction: {
        ...element.interaction,
        type: 'message',
        message: newMessage,
        messageDuration: messageDuration
      }
    });
  };
  
  const handleMessageDurationChange = (value: number[]) => {
    const newDuration = value[0];
    setMessageDuration(newDuration);
    
    updateElement(element.id, {
      interaction: {
        ...element.interaction,
        type: 'message',
        message: message,
        messageDuration: newDuration
      }
    });
  };

  const handleSoundUpload = (url: string) => {
    updateElement(element.id, {
      interaction: {
        ...element.interaction,
        type: 'sound',
        soundUrl: url
      }
    });
  };

  const handleCanvasChange = (value: string) => {
    setTargetCanvasId(value);
    updateElement(element.id, {
      interaction: {
        ...element.interaction,
        type: 'canvasNavigation',
        targetCanvasId: value
      }
    });
  };

  const handlePuzzleTabChange = (value: string) => {
    setPuzzleTab(value);
    updateElement(element.id, {
      interaction: {
        ...element.interaction,
        type: 'puzzle',
        puzzleType: value,
      }
    });
  };

  const canvasOptions = canvases.map((canvas) => ({
    label: canvas.name,
    value: canvas.id,
  }));

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-2">{t('properties.interaction.title')}</h3>
      
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="interactionType">{t('properties.interaction.type')}</Label>
          <Select value={interactionType} onValueChange={handleTypeChange}>
            <SelectTrigger>
              <SelectValue placeholder={t('properties.interaction.selectType')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">{t('properties.interaction.none')}</SelectItem>
              <SelectItem value="message">{t('properties.interaction.message')}</SelectItem>
              <SelectItem value="sound">{t('properties.interaction.sound')}</SelectItem>
              <SelectItem value="canvasNavigation">{t('properties.interaction.canvasNavigation')}</SelectItem>
              <SelectItem value="puzzle">{t('properties.interaction.puzzle')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {interactionType === 'message' && (
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="message">{t('properties.interaction.messageText')}</Label>
              <textarea
                id="message"
                className="resize-none min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={message}
                onChange={handleMessageChange}
                placeholder={t('properties.interaction.messagePlaceholder')}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="messageDuration">
                {t('properties.interaction.messageDuration')} ({(messageDuration / 1000).toFixed(1)} {t('properties.interaction.seconds')})
              </Label>
              <Slider
                id="messageDuration"
                defaultValue={[messageDuration]}
                max={10000}
                min={1000}
                step={500}
                onValueChange={handleMessageDurationChange}
              />
            </div>
          </div>
        )}
        
        {interactionType === 'sound' && (
          <div className="grid gap-4">
            <AudioUpload onUpload={handleSoundUpload} initialValue={element.interaction?.soundUrl || ''} />
          </div>
        )}
        
        {interactionType === 'canvasNavigation' && (
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="targetCanvas">{t('properties.interaction.targetCanvas')}</Label>
              <Select value={targetCanvasId} onValueChange={handleCanvasChange}>
                <SelectTrigger>
                  <SelectValue placeholder={t('properties.interaction.selectCanvas')} />
                </SelectTrigger>
                <SelectContent>
                  {canvasOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
        
        {interactionType === 'puzzle' && (
          <div className="grid gap-4">
            <Tabs defaultValue={puzzleTab} className="w-full" onValueChange={handlePuzzleTabChange}>
              <TabsList>
                <TabsTrigger value="puzzle">{t('properties.puzzle.puzzle')}</TabsTrigger>
                <TabsTrigger value="sequencePuzzle">{t('properties.puzzle.sequencePuzzle')}</TabsTrigger>
                <TabsTrigger value="sliderPuzzle">{t('properties.puzzle.sliderPuzzle')}</TabsTrigger>
                <TabsTrigger value="clickSequencePuzzle">{t('properties.puzzle.clickSequencePuzzle')}</TabsTrigger>
              </TabsList>
              <TabsContent value="puzzle">
                <PuzzleProperties element={element} />
              </TabsContent>
              <TabsContent value="sequencePuzzle">
                <SequencePuzzleProperties element={element} />
              </TabsContent>
              <TabsContent value="sliderPuzzle">
                <SliderPuzzleProperties element={element} />
              </TabsContent>
              <TabsContent value="clickSequencePuzzle">
                <ClickSequencePuzzleProperties element={element} />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
};
