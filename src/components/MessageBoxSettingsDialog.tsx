
import React from "react";
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

interface MessageBoxSettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const MessageBoxSettingsDialog: React.FC<MessageBoxSettingsDialogProps> = ({ isOpen, onClose }) => {
  const { messageBoxSettings, updateMessageBoxSettings } = useDesignState();
  const [localSettings, setLocalSettings] = React.useState<MessageBoxSettings>({...messageBoxSettings});
  const [showBackgroundPicker, setShowBackgroundPicker] = React.useState(false);
  const [showTextColorPicker, setShowTextColorPicker] = React.useState(false);

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

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Message Box Settings</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
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
        </div>
        
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
