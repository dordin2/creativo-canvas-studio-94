
import React, { useState, useRef } from "react";
import { DesignElement, InteractionType, InteractionConfig } from "@/types/designTypes";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useDesignState } from "@/context/DesignContext";
import { useLanguage } from "@/context/LanguageContext";
import { ColorSwatch } from "@/components/ui/color-swatch";
import { Volume, MessageSquare, Play, PuzzleIcon } from "lucide-react";
import { toast } from "sonner";
import PuzzleProperties from "./PuzzleProperties";
import SequencePuzzleProperties from "./SequencePuzzleProperties";
import ClickSequencePuzzleProperties from "./ClickSequencePuzzleProperties";
import SliderPuzzleProperties from "./SliderPuzzleProperties";

const InteractionProperties: React.FC<{ element: DesignElement }> = ({ element }) => {
  const { updateElement } = useDesignState();
  const { t, language } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const [selectedPuzzleType, setSelectedPuzzleType] = useState<string>("puzzle");
  
  const initialConfig = element.interactionConfig || {
    type: 'none',
    message: {
      text: '',
      duration: 2000,
      color: '#000000',
      position: 'bottom',
    },
    sound: {
      soundUrl: '',
      volume: 0.5,
    }
  };
  
  const [interactionConfig, setInteractionConfig] = useState<InteractionConfig>(initialConfig);
  
  // For message interaction
  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInteractionConfig(prev => ({
      ...prev,
      message: {
        ...prev.message!,
        text: e.target.value
      }
    }));
  };
  
  const handleDurationChange = (value: string) => {
    const duration = parseInt(value);
    setInteractionConfig(prev => ({
      ...prev,
      message: {
        ...prev.message!,
        duration
      }
    }));
  };
  
  const handleColorChange = (color: string) => {
    setInteractionConfig(prev => ({
      ...prev,
      message: {
        ...prev.message!,
        color
      }
    }));
  };
  
  const handlePositionChange = (position: 'top' | 'center' | 'bottom') => {
    setInteractionConfig(prev => ({
      ...prev,
      message: {
        ...prev.message!,
        position
      }
    }));
  };
  
  // For sound interaction
  const handleSoundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    if (!file.type.startsWith('audio/')) {
      toast.error(t('toast.error.file'));
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const soundDataUrl = event.target.result.toString();
        setInteractionConfig(prev => ({
          ...prev,
          sound: {
            ...prev.sound!,
            soundUrl: soundDataUrl
          }
        }));
        toast.success(t('toast.success.upload'));
      }
    };
    reader.onerror = () => {
      toast.error(t('toast.error.upload'));
    };
    reader.readAsDataURL(file);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleVolumeChange = (value: number[]) => {
    setInteractionConfig(prev => ({
      ...prev,
      sound: {
        ...prev.sound!,
        volume: value[0]
      }
    }));
    
    // Update live preview
    if (audioRef.current) {
      audioRef.current.volume = value[0];
    }
  };
  
  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };
  
  const handlePlaySound = () => {
    if (audioRef.current && interactionConfig.sound?.soundUrl) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(err => {
        console.error("Error playing audio:", err);
        toast.error("Failed to play sound");
      });
    } else {
      toast.error("No sound uploaded");
    }
  };
  
  const handleInteractionTypeChange = (type: InteractionType) => {
    setInteractionConfig(prev => ({
      ...prev,
      type
    }));
  };
  
  const handleApplyChanges = () => {
    if (interactionConfig.type === 'message' && (!interactionConfig.message?.text || interactionConfig.message.text.trim() === '')) {
      toast.error(t('toast.error.message'));
      return;
    }
    
    if (interactionConfig.type === 'sound' && (!interactionConfig.sound?.soundUrl || interactionConfig.sound.soundUrl === '')) {
      toast.error(t('toast.error.sound'));
      return;
    }
    
    updateElement(element.id, {
      isInteractive: true,
      interactionConfig
    });
    
    toast.success(t('toast.success.config'));
  };
  
  if (!element.isInteractive) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8 border-2 border-dashed rounded-md">
          <p className="text-gray-500">{language === 'en' ? 'Enable interactivity from element controls to configure interactions' : 'הפעל אינטראקטיביות מבקרות האלמנט כדי להגדיר אינטראקציות'}</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => updateElement(element.id, { isInteractive: true, interactionConfig: initialConfig })}
          >
            {language === 'en' ? 'Enable Interactivity' : 'הפעל אינטראקטיביות'}
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div>
        <Label className="text-base font-semibold mb-2 block">
          {language === 'en' ? 'Interaction Type' : 'סוג אינטראקציה'}
        </Label>
        <RadioGroup 
          value={interactionConfig.type}
          onValueChange={(value) => handleInteractionTypeChange(value as InteractionType)}
          className="flex flex-wrap gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="puzzle" id="puzzle-interaction" />
            <Label htmlFor="puzzle-interaction" className="flex items-center">
              <PuzzleIcon className="h-4 w-4 mr-1" />
              {language === 'en' ? 'Puzzle' : 'פאזל'}
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="message" id="message-interaction" />
            <Label htmlFor="message-interaction" className="flex items-center">
              <MessageSquare className="h-4 w-4 mr-1" />
              {language === 'en' ? 'Message' : 'הודעה'}
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="sound" id="sound-interaction" />
            <Label htmlFor="sound-interaction" className="flex items-center">
              <Volume className="h-4 w-4 mr-1" />
              {language === 'en' ? 'Sound' : 'צליל'}
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="none" id="none-interaction" />
            <Label htmlFor="none-interaction">
              {language === 'en' ? 'None' : 'ללא'}
            </Label>
          </div>
        </RadioGroup>
      </div>
      
      {interactionConfig.type === 'puzzle' && (
        <div className="pt-2">
          <Label className="mb-2 block">
            {language === 'en' ? 'Puzzle Type' : 'סוג פאזל'}
          </Label>
          <Select 
            value={selectedPuzzleType} 
            onValueChange={setSelectedPuzzleType}
          >
            <SelectTrigger>
              <SelectValue placeholder={language === 'en' ? 'Select puzzle type' : 'בחר סוג פאזל'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="puzzle">
                {language === 'en' ? 'Standard Puzzle' : 'פאזל רגיל'}
              </SelectItem>
              <SelectItem value="sequencePuzzle">
                {language === 'en' ? 'Sequence Puzzle' : 'פאזל רצף'}
              </SelectItem>
              <SelectItem value="clickSequencePuzzle">
                {language === 'en' ? 'Click Sequence Puzzle' : 'פאזל רצף לחיצות'}
              </SelectItem>
              <SelectItem value="sliderPuzzle">
                {language === 'en' ? 'Slider Puzzle' : 'פאזל מחוון'}
              </SelectItem>
            </SelectContent>
          </Select>
          
          <div className="mt-4 border-t pt-4">
            {selectedPuzzleType === "puzzle" && <PuzzleProperties element={element} />}
            {selectedPuzzleType === "sequencePuzzle" && <SequencePuzzleProperties element={element} />}
            {selectedPuzzleType === "clickSequencePuzzle" && <ClickSequencePuzzleProperties element={element} />}
            {selectedPuzzleType === "sliderPuzzle" && <SliderPuzzleProperties element={element} />}
          </div>
        </div>
      )}
      
      {interactionConfig.type === 'message' && (
        <div className="space-y-4 pt-2">
          <div>
            <Label htmlFor="message-text">
              {language === 'en' ? 'Message Text' : 'תוכן ההודעה'}
            </Label>
            <Textarea 
              id="message-text"
              value={interactionConfig.message?.text || ''}
              onChange={handleMessageChange}
              placeholder={language === 'en' ? 'Enter message to display' : 'הזן הודעה להצגה'}
              className="mt-1"
              rows={3}
            />
          </div>
          
          <div>
            <Label htmlFor="message-duration">
              {language === 'en' ? 'Duration (ms)' : 'משך זמן (מילישניות)'}
            </Label>
            <Select 
              value={interactionConfig.message?.duration?.toString() || "2000"} 
              onValueChange={handleDurationChange}
            >
              <SelectTrigger id="message-duration" className="mt-1">
                <SelectValue placeholder={language === 'en' ? 'Select duration' : 'בחר משך זמן'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1000">1000 ms (1 sec)</SelectItem>
                <SelectItem value="2000">2000 ms (2 sec)</SelectItem>
                <SelectItem value="3000">3000 ms (3 sec)</SelectItem>
                <SelectItem value="4000">4000 ms (4 sec)</SelectItem>
                <SelectItem value="5000">5000 ms (5 sec)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="message-color">
              {language === 'en' ? 'Text Color' : 'צבע טקסט'}
            </Label>
            <ColorSwatch 
              className="mt-1" 
              value={interactionConfig.message?.color || '#000000'} 
              onChange={handleColorChange} 
            />
          </div>
          
          <div>
            <Label htmlFor="message-position">
              {language === 'en' ? 'Position' : 'מיקום'}
            </Label>
            <Select 
              value={interactionConfig.message?.position || "center"} 
              onValueChange={handlePositionChange}
            >
              <SelectTrigger id="message-position" className="mt-1">
                <SelectValue placeholder={language === 'en' ? 'Select position' : 'בחר מיקום'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="top">{language === 'en' ? 'Top' : 'עליון'}</SelectItem>
                <SelectItem value="center">{language === 'en' ? 'Center' : 'מרכז'}</SelectItem>
                <SelectItem value="bottom">{language === 'en' ? 'Bottom' : 'תחתון'}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
      
      {interactionConfig.type === 'sound' && (
        <div className="space-y-4 pt-2">
          <div>
            <Label className="block mb-2">
              {language === 'en' ? 'Sound File' : 'קובץ צליל'}
            </Label>
            
            <div className="flex items-center gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleSoundUpload}
                accept="audio/*"
                className="hidden"
              />
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={handleBrowseClick}
              >
                {interactionConfig.sound?.soundUrl 
                  ? (language === 'en' ? 'Change Sound' : 'החלף צליל') 
                  : (language === 'en' ? 'Upload Sound' : 'העלה צליל')}
              </Button>
              
              {interactionConfig.sound?.soundUrl && (
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={handlePlaySound}
                  title={language === 'en' ? 'Play Sound' : 'נגן צליל'}
                >
                  <Play className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            {interactionConfig.sound?.soundUrl && (
              <audio 
                ref={audioRef} 
                src={interactionConfig.sound.soundUrl} 
                preload="auto"
                style={{ display: 'none' }} 
              />
            )}
            
            {interactionConfig.sound?.soundUrl && (
              <div className="text-xs text-green-600 mt-1">
                {language === 'en' ? 'Sound uploaded successfully' : 'הצליל הועלה בהצלחה'}
              </div>
            )}
          </div>
          
          <div>
            <div className="flex justify-between mb-2">
              <Label htmlFor="volume-slider">
                {language === 'en' ? 'Volume' : 'עוצמת קול'}
              </Label>
              <span className="text-sm">
                {Math.round(interactionConfig.sound?.volume! * 100)}%
              </span>
            </div>
            <Slider
              id="volume-slider"
              value={[interactionConfig.sound?.volume || 0.5]}
              min={0}
              max={1}
              step={0.01}
              onValueChange={handleVolumeChange}
            />
          </div>
        </div>
      )}
      
      <div className="pt-4">
        <Button 
          variant="default" 
          className="w-full"
          onClick={handleApplyChanges}
        >
          {language === 'en' ? 'Apply Interaction Settings' : 'החל הגדרות אינטראקציה'}
        </Button>
      </div>
    </div>
  );
};

export default InteractionProperties;
