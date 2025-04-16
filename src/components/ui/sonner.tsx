
import { useTheme } from "next-themes"
import { Toaster as SonnerToaster, toast as sonnerToast } from "sonner"

type ToasterProps = React.ComponentProps<typeof SonnerToaster>

// Create a wrapped version of the sonner toast function
const toast = {
  // Wrap all sonner toast methods
  success: (message: string, ...args: any[]) => {
    // Only allow project save or critical messages
    if (message.includes("Project Saved") || message.includes("Critical")) {
      return sonnerToast.success(message, ...args);
    }
    return { id: '' }; // Return a dummy object
  },
  error: (message: string, ...args: any[]) => {
    // Always allow error messages as they're critical
    return sonnerToast.error(message, ...args);
  },
  info: (message: string, ...args: any[]) => {
    // Filter out non-critical info messages
    if (message.includes("Project") || message.includes("Critical")) {
      return sonnerToast.info(message, ...args);
    }
    return { id: '' }; // Return a dummy object
  },
  warning: (message: string, ...args: any[]) => {
    // Always allow warning messages as they're important
    return sonnerToast.warning(message, ...args);
  },
  // Default toast function
  default: (message: string, ...args: any[]) => {
    // Only allow project save messages
    if (message.includes("Project Saved")) {
      return sonnerToast(message, ...args);
    }
    return { id: '' }; // Return a dummy object
  },
  // Pass through other methods directly
  dismiss: sonnerToast.dismiss,
  custom: sonnerToast.custom,
  promise: sonnerToast.promise,
  loading: sonnerToast.loading,
}

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <SonnerToaster
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      duration={3000} // Set shorter duration (3 seconds)
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  )
}

export { Toaster, toast }
