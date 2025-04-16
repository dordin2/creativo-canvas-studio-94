
// A compatibility layer to ensure all toast calls are filtered

import { toast as sonnerToast } from "../components/ui/sonner";

// Export the filtered version of toast
export const toast = sonnerToast;

// For compatibility with direct sonner imports
export default sonnerToast;
