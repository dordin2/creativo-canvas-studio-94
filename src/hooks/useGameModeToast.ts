
import { useDesignState } from "@/context/DesignContext";
import { toast as sonnerToast } from "sonner";

interface ToastFunction {
  (message: string): void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  warning: (message: string) => void;
}

export const useGameModeToast = (): ToastFunction => {
  const { isGameMode } = useDesignState();

  const createToastFunction = (type: keyof typeof sonnerToast) => {
    return (message: string) => {
      if (!isGameMode) {
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
