
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { DesignElement } from "@/types/designTypes";
import { useDesignState } from "@/context/DesignContext";

interface ImageUploaderProps {
  element: DesignElement;
}

const ImageUploader = ({ element }: ImageUploaderProps) => {
  const { handleImageUpload } = useDesignState();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    console.log("ImageUploader - Selected file:", file.name, file.type, file.size);
    handleImageUpload(element.id, file);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="mt-2 flex flex-col gap-2">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageFileSelect}
        accept="image/*"
        className="hidden"
      />
      <Button
        variant="outline"
        onClick={triggerFileInput}
        className="w-full flex items-center justify-center gap-2"
      >
        <Upload className="h-4 w-4" />
        {element.file ? "Change Image" : "Choose Image"}
      </Button>
      {element.file && (
        <p className="text-xs text-muted-foreground">{element.file.name}</p>
      )}
      {element.fileMetadata && !element.file && (
        <p className="text-xs text-muted-foreground">
          {element.fileMetadata.name} (duplicated)
        </p>
      )}
    </div>
  );
};

export default ImageUploader;
