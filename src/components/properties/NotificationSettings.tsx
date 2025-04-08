
import React from "react";
import { useNotification } from "@/context/NotificationContext";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/context/LanguageContext";
import { HexColorPicker } from "react-colorful";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card } from "@/components/ui/card";

const NotificationSettings = () => {
  const { settings, updateSettings } = useNotification();
  const { t } = useLanguage();

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-lg font-semibold">{t('properties.notification.title') || 'Notification Settings'}</h3>
      
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="position">{t('properties.notification.position') || 'Position'}</Label>
          <Select 
            value={settings.position} 
            onValueChange={(value) => updateSettings({ position: value as any })}
          >
            <SelectTrigger id="position">
              <SelectValue placeholder={t('properties.notification.selectPosition') || 'Select position'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="top">Top</SelectItem>
              <SelectItem value="bottom">Bottom</SelectItem>
              <SelectItem value="top-left">Top Left</SelectItem>
              <SelectItem value="top-right">Top Right</SelectItem>
              <SelectItem value="bottom-left">Bottom Left</SelectItem>
              <SelectItem value="bottom-right">Bottom Right</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="width">{t('properties.notification.width') || 'Width'}</Label>
          <Select 
            value={settings.width} 
            onValueChange={(value) => updateSettings({ width: value })}
          >
            <SelectTrigger id="width">
              <SelectValue placeholder={t('properties.notification.selectWidth') || 'Select width'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sm">Small</SelectItem>
              <SelectItem value="md">Medium</SelectItem>
              <SelectItem value="lg">Large</SelectItem>
              <SelectItem value="full">Full Width</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="fontSize">{t('properties.notification.fontSize') || 'Font Size'}</Label>
          <Select 
            value={settings.fontSize} 
            onValueChange={(value) => updateSettings({ fontSize: value })}
          >
            <SelectTrigger id="fontSize">
              <SelectValue placeholder={t('properties.notification.selectFontSize') || 'Select font size'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="xs">Extra Small</SelectItem>
              <SelectItem value="sm">Small</SelectItem>
              <SelectItem value="md">Medium</SelectItem>
              <SelectItem value="lg">Large</SelectItem>
              <SelectItem value="xl">Extra Large</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="padding">{t('properties.notification.padding') || 'Padding'}</Label>
          <Select 
            value={settings.padding} 
            onValueChange={(value) => updateSettings({ padding: value })}
          >
            <SelectTrigger id="padding">
              <SelectValue placeholder={t('properties.notification.selectPadding') || 'Select padding'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sm">Small</SelectItem>
              <SelectItem value="md">Medium</SelectItem>
              <SelectItem value="lg">Large</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="borderRadius">{t('properties.notification.borderRadius') || 'Border Radius'}</Label>
          <Select 
            value={settings.borderRadius} 
            onValueChange={(value) => updateSettings({ borderRadius: value })}
          >
            <SelectTrigger id="borderRadius">
              <SelectValue placeholder={t('properties.notification.selectBorderRadius') || 'Select border radius'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="sm">Small</SelectItem>
              <SelectItem value="md">Medium</SelectItem>
              <SelectItem value="lg">Large</SelectItem>
              <SelectItem value="full">Full</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="grid gap-2">
          <Label>{t('properties.notification.backgroundColor') || 'Background Color'}</Label>
          <Popover>
            <PopoverTrigger asChild>
              <div 
                className="h-8 w-full rounded-md border border-input cursor-pointer flex items-center px-3"
                style={{ backgroundColor: settings.backgroundColor }}
              >
                <span className="text-sm">{settings.backgroundColor}</span>
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Card className="p-3 border-0">
                <HexColorPicker 
                  color={settings.backgroundColor} 
                  onChange={(color) => updateSettings({ backgroundColor: color })} 
                />
              </Card>
            </PopoverContent>
          </Popover>
        </div>
        
        <div className="grid gap-2">
          <Label>{t('properties.notification.textColor') || 'Text Color'}</Label>
          <Popover>
            <PopoverTrigger asChild>
              <div 
                className="h-8 w-full rounded-md border border-input cursor-pointer flex items-center px-3"
                style={{ backgroundColor: settings.textColor }}
              >
                <span className="text-sm" style={{ color: settings.backgroundColor }}>{settings.textColor}</span>
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Card className="p-3 border-0">
                <HexColorPicker 
                  color={settings.textColor} 
                  onChange={(color) => updateSettings({ textColor: color })} 
                />
              </Card>
            </PopoverContent>
          </Popover>
        </div>
        
        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2">{t('properties.notification.preview') || 'Preview'}</h4>
          <div 
            className={`rounded border border-gray-200 shadow-sm p-4 mt-2`}
            style={{ 
              backgroundColor: settings.backgroundColor,
              color: settings.textColor,
              borderRadius: getBorderRadiusValue(settings.borderRadius),
              padding: getPaddingValue(settings.padding),
              fontSize: getFontSizeValue(settings.fontSize),
              width: getWidthValue(settings.width),
              margin: '0 auto'
            }}
          >
            {t('properties.notification.previewText') || 'This is a preview of your notification message'}
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper functions to convert size values
function getBorderRadiusValue(size: string): string {
  switch (size) {
    case 'none': return '0';
    case 'sm': return '0.25rem';
    case 'md': return '0.5rem';
    case 'lg': return '0.75rem';
    case 'full': return '9999px';
    default: return '0.5rem';
  }
}

function getPaddingValue(size: string): string {
  switch (size) {
    case 'sm': return '0.5rem';
    case 'md': return '1rem';
    case 'lg': return '1.5rem';
    default: return '1rem';
  }
}

function getFontSizeValue(size: string): string {
  switch (size) {
    case 'xs': return '0.75rem';
    case 'sm': return '0.875rem';
    case 'md': return '1rem';
    case 'lg': return '1.125rem';
    case 'xl': return '1.25rem';
    default: return '1rem';
  }
}

function getWidthValue(size: string): string {
  switch (size) {
    case 'sm': return '16rem';
    case 'md': return '24rem';
    case 'lg': return '32rem';
    case 'full': return '100%';
    default: return '24rem';
  }
}

export default NotificationSettings;
