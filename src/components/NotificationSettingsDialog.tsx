
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import NotificationSettings from "./properties/NotificationSettings";

const NotificationSettingsDialog = () => {
  const { t, language } = useLanguage();
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 hover:bg-gray-50" title={t('app.notificationSettings') || 'Notification Settings'}>
          <Bell className="h-4 w-4" />
          <span>{language === 'he' ? 'הגדרות הודעות' : 'Notifications'}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{language === 'he' ? 'הגדרות הודעות' : 'Notification Settings'}</DialogTitle>
        </DialogHeader>
        <NotificationSettings />
      </DialogContent>
    </Dialog>
  );
};

export default NotificationSettingsDialog;
