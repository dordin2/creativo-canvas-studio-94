
import React, { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDesignState } from "@/context/DesignContext";
import { MessageBoxSettings } from "@/types/designTypes";
import { HexColorPicker } from "react-colorful";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface MessageBoxSettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const MessageBoxSettingsDialog: React.FC<MessageBoxSettingsDialogProps> = ({ isOpen, onClose }) => {
  const { messageBoxSettings, updateMessageBoxSettings } = useDesignState();
  const [localSettings, setLocalSettings] = useState<MessageBoxSettings>({...messageBoxSettings});
  const [showBackgroundPicker, setShowBackgroundPicker] = useState(false);
  const [showTextColorPicker, setShowTextColorPicker] = useState(false);
  const [activeTab, setActiveTab] = useState("settings");

  React.useEffect(() => {
    if (isOpen) {
      setLocalSettings({...messageBoxSettings});
    }
  }, [isOpen, messageBoxSettings]);

  const handleSave = () => {
    updateMessageBoxSettings(localSettings);
    onClose();
  };

  const handleSettingChange = (key: keyof MessageBoxSettings, value: any) => {
    setLocalSettings((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  // Preview component to show how the message box will look
  const MessageBoxPreview = () => {
    const getPositionClasses = () => {
      switch (localSettings.position) {
        case 'top':
          return 'top-4';
        case 'bottom':
          return 'bottom-4';
        case 'center':
        default:
          return 'top-1/2 -translate-y-1/2';
      }
    };

    return (
      <div className="relative w-full h-64 border rounded-md bg-gray-100 overflow-hidden">
        {/* Simulate canvas area */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-gray-400">Canvas Preview</div>
        </div>
        
        {/* Preview message box */}
        <div 
          className={`absolute left-1/2 -translate-x-1/2 ${getPositionClasses()} rounded-lg shadow-md`}
          style={{
            width: `${Math.min(localSettings.width, 300)}px`, // Scale down for preview
            maxWidth: '80%',
            backgroundColor: localSettings.backgroundColor,
            color: localSettings.textColor,
            padding: '0.75rem',
            border: '1px solid rgba(0,0,0,0.1)'
          }}
        >
          <div className="flex justify-between items-center mb-2">
            <div style={{ color: localSettings.textColor, fontWeight: 'bold' }}>Message</div>
            <div className="w-4 h-4 flex items-center justify-center text-xs cursor-pointer">×</div>
          </div>
          <div 
            style={{ 
              fontSize: `${localSettings.fontSize * 0.8}px`, // Scale down font for preview
              color: localSettings.textColor
            }}
          >
            This is a preview of how your message will appear.
          </div>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Message Box Settings</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
          
          <TabsContent value="settings" className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="box-width">Box Width (px)</Label>
              <Input
                id="box-width"
                type="number"
                value={localSettings.width}
                onChange={(e) => handleSettingChange('width', parseInt(e.target.value) || 400)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="font-size">Font Size (px)</Label>
              <div className="flex gap-2 items-center">
                <Slider
                  id="font-size"
                  value={[localSettings.fontSize]}
                  min={12}
                  max={36}
                  step={1}
                  onValueChange={(value) => handleSettingChange('fontSize', value[0])}
                  className="flex-1"
                />
                <span className="w-12 text-center">{localSettings.fontSize}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="position">Position</Label>
              <Select
                value={localSettings.position}
                onValueChange={(value) => handleSettingChange('position', value as 'center' | 'top' | 'bottom')}
              >
                <SelectTrigger id="position">
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="top">Top</SelectItem>
                  <SelectItem value="bottom">Bottom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="background-color">Background Color</Label>
              <div className="flex gap-2">
                <Input
                  id="background-color"
                  value={localSettings.backgroundColor}
                  onChange={(e) => handleSettingChange('backgroundColor', e.target.value)}
                  className="flex-1"
                />
                <div 
                  className="w-10 h-10 rounded border cursor-pointer"
                  style={{ backgroundColor: localSettings.backgroundColor }}
                  onClick={() => setShowBackgroundPicker(!showBackgroundPicker)}
                />
              </div>
              {showBackgroundPicker && (
                <div className="mt-2">
                  <HexColorPicker 
                    color={localSettings.backgroundColor} 
                    onChange={(color) => handleSettingChange('backgroundColor', color)} 
                  />
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="text-color">Text Color</Label>
              <div className="flex gap-2">
                <Input
                  id="text-color"
                  value={localSettings.textColor}
                  onChange={(e) => handleSettingChange('textColor', e.target.value)}
                  className="flex-1"
                />
                <div 
                  className="w-10 h-10 rounded border cursor-pointer"
                  style={{ backgroundColor: localSettings.textColor }}
                  onClick={() => setShowTextColorPicker(!showTextColorPicker)}
                />
              </div>
              {showTextColorPicker && (
                <div className="mt-2">
                  <HexColorPicker 
                    color={localSettings.textColor} 
                    onChange={(color) => handleSettingChange('textColor', color)} 
                  />
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="preview" className="py-4">
            <p className="text-sm text-gray-500 mb-4">
              This preview shows how your message box will appear on the canvas:
            </p>
            <MessageBoxPreview />
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="sm:justify-between">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleSave}>Save Settings</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MessageBoxSettingsDialog;
