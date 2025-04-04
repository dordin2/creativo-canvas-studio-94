
import { Button } from "@/components/ui/button";
import { Download, Share, Undo, Redo } from "lucide-react";
import { useDesignState } from "@/context/DesignContext";
import { toast } from "sonner";
import { useRef } from "react";

const Header = () => {
  const { canvasRef } = useDesignState();

  const handleDownload = () => {
    if (!canvasRef) return;
    
    try {
      // Create a temporary canvas to draw everything
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const canvasElement = canvasRef;
      
      // Set the canvas dimensions
      canvas.width = canvasElement.clientWidth;
      canvas.height = canvasElement.clientHeight;
      
      if (ctx) {
        // Draw white background
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw the HTML content
        const data = new XMLSerializer().serializeToString(canvasElement);
        const img = new Image();
        const svgBlob = new Blob([data], { type: "image/svg+xml;charset=utf-8" });
        const url = URL.createObjectURL(svgBlob);
        
        img.onload = function() {
          ctx.drawImage(img, 0, 0);
          URL.revokeObjectURL(url);
          
          const imgURI = canvas
            .toDataURL("image/png")
            .replace("image/png", "image/octet-stream");
          
          // Trigger download
          const link = document.createElement("a");
          link.download = "canvas-design.png";
          link.href = imgURI;
          link.click();
          
          toast.success("Design downloaded successfully!");
        };
        
        img.src = url;
      }
    } catch (error) {
      console.error("Error downloading design:", error);
      toast.error("Failed to download design. Please try again.");
    }
  };

  const handleShare = () => {
    toast.info("Share functionality coming soon!");
  };

  const handleUndo = () => {
    toast.info("Undo functionality coming soon!");
  };

  const handleRedo = () => {
    toast.info("Redo functionality coming soon!");
  };

  return (
    <header className="flex justify-between items-center py-4 px-6 border-b">
      <div className="flex items-center gap-2">
        <div className="font-bold text-xl text-canvas-purple">CreativoCanvas</div>
      </div>
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={handleUndo} title="Undo">
          <Undo className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={handleRedo} title="Redo">
          <Redo className="h-4 w-4" />
        </Button>
        <Button variant="outline" className="gap-2" onClick={handleShare}>
          <Share className="h-4 w-4" />
          <span>Share</span>
        </Button>
        <Button className="gap-2" onClick={handleDownload}>
          <Download className="h-4 w-4" />
          <span>Download</span>
        </Button>
      </div>
    </header>
  );
};

export default Header;
