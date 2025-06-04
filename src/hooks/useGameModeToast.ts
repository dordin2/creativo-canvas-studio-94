
import { toast as sonnerToast } from "sonner";

interface ToastFunction {
  (message: string): void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  warning: (message: string) => void;
}

const ALLOWED_TOAST_MESSAGES = [
  'Project saved successfully',
  'פרויקט נשמר בהצלחה',
  'Game link copied to clipboard!',
  'לינק המשחק הועתק ללוח!',
  'Failed to save project',
  'נכשל בשמירת הפרויקט'
];

export const useGameModeToast = (isGameMode?: boolean): ToastFunction => {
  const createToastFunction = (type: keyof typeof sonnerToast) => {
    return (message: string) => {
      // Allow all toasts in edit mode, only specific toasts in game mode
      if (!isGameMode || ALLOWED_TOAST_MESSAGES.includes(message)) {
        (sonnerToast[type] as any)(message);
      }
    };
  };

  const toastFunction = createToastFunction('success') as ToastFunction;
  toastFunction.success = createToastFunction('success');
  toastFunction.error = createToastFunction('error');
  toastFunction.info = createToastFunction('info');
  toastFunction.warning = createToastFunction('warning');

  return toastFunction;
};
