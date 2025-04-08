
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, Play, Pause } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface AudioUploadProps {
  onUpload: (url: string) => void;
  initialValue?: string;
}

export const AudioUpload: React.FC<AudioUploadProps> = ({ onUpload, initialValue = "" }) => {
  const [audioUrl, setAudioUrl] = useState<string>(initialValue);
  const [audioName, setAudioName] = useState<string>("");
  const [isPlaying, setIsPlaying] = useState(false);
  const { t } = useLanguage();
  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file.type.startsWith("audio/")) {
      alert("Please select an audio file.");
      return;
    }

    setAudioName(file.name);
    const url = URL.createObjectURL(file);
    setAudioUrl(url);
    onUpload(url);
  };

  const handleClear = () => {
    setAudioUrl("");
    setAudioName("");
    onUpload("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleTogglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(err => {
        console.error('Audio playback error:', err);
      });
    }
    setIsPlaying(!isPlaying);
  };

  const handleAudioEnd = () => {
    setIsPlaying(false);
  };

  return (
    <div className="grid gap-2">
      <Label>{t('properties.interaction.audioFile') || 'Audio File'}</Label>
      
      <div className="flex items-center gap-2">
        <Input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          onChange={handleFileChange}
          className="flex-1"
        />
        {audioUrl && (
          <Button
            variant="outline"
            size="icon"
            onClick={handleClear}
            type="button"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      {audioUrl && (
        <>
          <div className="mt-2">
            <p className="text-xs text-muted-foreground">{audioName || 'Audio file'}</p>
            <div className="flex items-center gap-2 mt-1">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleTogglePlay}
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4 mr-1" />
                ) : (
                  <Play className="h-4 w-4 mr-1" />
                )}
                {isPlaying ? 'Pause' : 'Play'}
              </Button>
            </div>
          </div>
          <audio
            ref={audioRef}
            src={audioUrl}
            onEnded={handleAudioEnd}
            style={{ display: 'none' }}
          />
        </>
      )}
    </div>
  );
};

export default AudioUpload;
