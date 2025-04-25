
import { Canvas, DesignElement } from "@/types/designTypes";

export function isDesignElement(element: unknown): element is DesignElement {
  return (
    typeof element === 'object' &&
    element !== null &&
    'id' in element &&
    'type' in element &&
    'position' in element &&
    'layer' in element
  );
}

export function isValidCanvas(canvas: unknown): canvas is Canvas {
  return (
    typeof canvas === 'object' &&
    canvas !== null &&
    'id' in canvas &&
    'name' in canvas &&
    'elements' in canvas &&
    Array.isArray((canvas as any).elements) &&
    (canvas as any).elements.every((element: unknown) => isDesignElement(element))
  );
}
