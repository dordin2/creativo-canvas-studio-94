
import { useEffect, useState } from "react";
import { DesignElement } from "@/types/designTypes";
import { estimateDataUrlSize } from "@/utils/imageUploader";

interface ImageStatsProps {
  element: DesignElement;
  imageSrc?: string;
}

const ImageStats = ({ element, imageSrc }: ImageStatsProps) => {
  const [stats, setStats] = useState<{ size: string; dimensions: string } | null>(
    null
  );

  useEffect(() => {
    if (imageSrc || element.src) {
      const size = imageSrc ? estimateDataUrlSize(imageSrc) : 0;

      let sizeStr = "Unknown";
      if (size > 0) {
        sizeStr =
          size > 1024 * 1024
            ? `${(size / (1024 * 1024)).toFixed(2)}MB`
            : `${(size / 1024).toFixed(2)}KB`;
      } else if (element.file) {
        sizeStr =
          element.file.size > 1024 * 1024
            ? `${(element.file.size / (1024 * 1024)).toFixed(2)}MB`
            : `${(element.file.size / 1024).toFixed(2)}KB`;
      }

      const dimensions = element.originalSize
        ? `${element.originalSize.width} × ${element.originalSize.height}px`
        : "Unknown";

      setStats({ size: sizeStr, dimensions });
    }
  }, [element, imageSrc]);

  if (!stats) return null;

  return (
    <div className="text-xs text-muted-foreground mt-1">
      <div className="flex justify-between">
        <span>Size:</span>
        <span className="font-medium">{stats.size}</span>
      </div>
      <div className="flex justify-between">
        <span>Dimensions:</span>
        <span className="font-medium">{stats.dimensions}</span>
      </div>
    </div>
  );
};

export default ImageStats;
