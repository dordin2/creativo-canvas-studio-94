import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Text, Image, Square, Circle, Triangle } from "lucide-react";
import { useDesignState } from "@/context/DesignContext";
import { useLanguage } from "@/context/LanguageContext";
import { PuzzleCategories } from "./sidebar/PuzzleCategories";
const Sidebar = () => {
  const {
    addElement
  } = useDesignState();
  const {
    t,
    language
  } = useLanguage();

  // Color swatches for backgrounds
  const colorSwatches = ["#FFFFFF", "#F3F4F6", "#E5E7EB", "#D1D5DB", "#FEE2E2", "#FEE7AA", "#D1FAE5", "#DBEAFE", "#8B5CF6", "#EC4899", "#F59E0B", "#10B981"];

  // Pre-defined gradient backgrounds
  const gradients = ["linear-gradient(to right, #fc466b, #3f5efb)", "linear-gradient(to right, #8a2387, #e94057, #f27121)", "linear-gradient(to right, #00b09b, #96c93d)", "linear-gradient(to right, #ff9966, #ff5e62)", "linear-gradient(to right, #7f7fd5, #86a8e7, #91eae4)"];
  return;
};
export default Sidebar;