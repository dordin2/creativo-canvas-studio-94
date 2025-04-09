
import React, { useRef, useEffect, useState } from 'react';

interface AudioVisualizerProps {
  audioElement: HTMLAudioElement | null;
  isPlaying: boolean;
  intensity?: number;
  children: React.ReactNode;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ 
  audioElement, 
  isPlaying, 
  intensity = 1.0,
  children 
}) => {
  const [scale, setScale] = useState(1);
  const animationRef = useRef<number>(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);

  // Set up the audio analyzer when the audio element changes
  useEffect(() => {
    if (!audioElement) return;

    // Clean up previous audio context if it exists
    if (audioContextRef.current) {
      sourceRef.current?.disconnect();
      analyserRef.current?.disconnect();
      audioContextRef.current.close();
    }

    // Create new audio context and analyzer
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const source = audioContext.createMediaElementSource(audioElement);
    source.connect(analyser);
    analyser.connect(audioContext.destination);
    
    // Store references
    audioContextRef.current = audioContext;
    analyserRef.current = analyser;
    sourceRef.current = source;
    dataArrayRef.current = dataArray;

    return () => {
      // Clean up
      if (sourceRef.current) {
        sourceRef.current.disconnect();
      }
      if (analyserRef.current) {
        analyserRef.current.disconnect();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [audioElement]);

  // Animation loop for visualization
  useEffect(() => {
    if (!isPlaying || !analyserRef.current || !dataArrayRef.current) {
      // Reset scale when not playing
      setScale(1);
      return;
    }
    
    const analyzeAudio = () => {
      if (!analyserRef.current || !dataArrayRef.current) return;
      
      // Get frequency data
      analyserRef.current.getByteFrequencyData(dataArrayRef.current);
      
      // Calculate average amplitude
      const average = dataArrayRef.current.reduce((sum, value) => sum + value, 0) / 
                      dataArrayRef.current.length;
      
      // Normalize to 0-1 range
      const normalizedValue = average / 255;
      
      // Apply intensity and calculate scale factor (add a minimum scale to always show some animation)
      const minScale = 1;
      const maxScale = 1 + (0.2 * intensity);
      const newScale = minScale + (normalizedValue * (maxScale - minScale));
      
      setScale(newScale);
      
      // Continue animation loop
      animationRef.current = requestAnimationFrame(analyzeAudio);
    };
    
    // Start animation loop
    animationRef.current = requestAnimationFrame(analyzeAudio);
    
    // Clean up animation loop
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, intensity]);

  // Apply scale transformation to children
  return (
    <div style={{ 
      transform: `scale(${scale})`,
      transition: 'transform 0.05s ease-out', 
      transformOrigin: 'center'
    }}>
      {children}
    </div>
  );
};

export default AudioVisualizer;
