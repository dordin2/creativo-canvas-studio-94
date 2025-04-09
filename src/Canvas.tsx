
import { useRef, useEffect, useState } from "react";
import { useDesignState } from "@/context/DesignContext";
import DraggableElement from "@/components/DraggableElement";
import LayersList from "@/components/LayersList";
import { Minus, Plus, RotateCcw, Maximize, Minimize } from "lucide-react";
import PuzzleElement from "@/components/element/PuzzleElement";
import SequencePuzzleElement from "@/components/element/SequencePuzzleElement";
import ClickSequencePuzzleElement from "@/components/element/ClickSequencePuzzleElement";
import SliderPuzzleElement from "@/components/element/SliderPuzzleElement";
import InventoryIcon from "@/components/inventory/InventoryIcon";

interface CanvasProps {
  isFullscreenActive?: boolean;
}

// Simply re-export the Canvas component from the components directory
import CanvasComponent from "@/components/Canvas";

const Canvas = (props: CanvasProps) => {
  return <CanvasComponent {...props} />;
};

export default Canvas;
