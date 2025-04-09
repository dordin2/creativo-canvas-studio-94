
import React, { useRef, useEffect, useState } from 'react';

interface AudioVisualizerProps {
  audioElement: HTMLAudioElement | null;
  isPlaying: boolean;
  intensity?: number;
  speed?: number; // Controls animation speed
  children: React.ReactNode;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ 
  audioElement, 
  isPlaying, 
  intensity = 1.0,
  speed = 1.0, // Default speed value
  children 
}) => {
  const [scale, setScale] = useState(1);
  const animationRef = useRef<number>(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const lastUpdateTimeRef = useRef<number>(0);
  const lastScaleRef = useRef<number>(1);
  const targetScaleRef = useRef<number>(1);

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
      lastScaleRef.current = 1;
      targetScaleRef.current = 1;
      return;
    }
    
    const analyzeAudio = (timestamp: number) => {
      if (!analyserRef.current || !dataArrayRef.current) return;
      
      const updateInterval = 50 / speed; // Base interval adjusted by speed
      const elapsed = timestamp - lastUpdateTimeRef.current;
      
      if (elapsed > updateInterval || lastUpdateTimeRef.current === 0) {
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
        
        // Set target scale based on audio analysis
        targetScaleRef.current = minScale + (normalizedValue * (maxScale - minScale));
        lastUpdateTimeRef.current = timestamp;
      }
      
      // Smoothly interpolate between current scale and target scale
      const interpolationSpeed = 0.1 * speed; // Adjust the interpolation speed based on the speed setting
      const newScale = lastScaleRef.current + (targetScaleRef.current - lastScaleRef.current) * interpolationSpeed;
      
      // Update scale if it has changed significantly
      if (Math.abs(newScale - lastScaleRef.current) > 0.001) {
        setScale(newScale);
        lastScaleRef.current = newScale;
      }
      
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
  }, [isPlaying, intensity, speed]);

  // Apply scale transformation to children with smooth transition
  return (
    <div style={{ 
      transform: `scale(${scale})`,
      transition: `transform ${0.1 / speed}s ease-in-out`, // Smoother transition with ease-in-out
      transformOrigin: 'center'
    }}>
      {children}
    </div>
  );
};

export default AudioVisualizer;
