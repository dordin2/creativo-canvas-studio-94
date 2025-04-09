
import React, { useRef, useEffect, useState } from 'react';

interface AudioVisualizerProps {
  audioElement: HTMLAudioElement | null;
  isPlaying: boolean;
  intensity?: number;
  speed?: number; // Controls animation speed
  maxScale?: number; // Controls the maximum scale before shrinking
  children: React.ReactNode;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ 
  audioElement, 
  isPlaying, 
  intensity = 1.0,
  speed = 1.0, // Default speed value
  maxScale = 1.2, // Default maximum scale
  children 
}) => {
  const [scale, setScale] = useState(1);
  const animationRef = useRef<number>(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const animationPhaseRef = useRef<'growing' | 'shrinking'>('growing');
  const animationProgressRef = useRef<number>(0);

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
    if (!isPlaying) {
      // Reset scale when not playing
      setScale(1);
      animationPhaseRef.current = 'growing';
      animationProgressRef.current = 0;
      return;
    }
    
    const animate = (timestamp: number) => {
      if (!analyserRef.current || !dataArrayRef.current) return;
      
      // Get frequency data for amplitude calculation
      analyserRef.current.getByteFrequencyData(dataArrayRef.current);
      
      // Calculate average amplitude
      const average = dataArrayRef.current.reduce((sum, value) => sum + value, 0) / 
                    dataArrayRef.current.length;
      
      // Normalize to 0-1 range
      const normalizedValue = average / 255;
      
      // Calculate max scale based on audio amplitude, intensity and max scale
      const minScale = 1;
      const calculatedMaxScale = 1 + ((maxScale - 1) * intensity * normalizedValue);
      
      // Determine animation progress based on current phase
      const animationStepSize = 0.01 * speed; // Speed affects how fast the animation progresses
      
      if (animationPhaseRef.current === 'growing') {
        animationProgressRef.current += animationStepSize;
        if (animationProgressRef.current >= 1) {
          animationProgressRef.current = 1;
          animationPhaseRef.current = 'shrinking';
        }
      } else {
        animationProgressRef.current -= animationStepSize;
        if (animationProgressRef.current <= 0) {
          animationProgressRef.current = 0;
          animationPhaseRef.current = 'growing';
        }
      }
      
      // Calculate current scale using easing function for smooth animation
      // Using cubic easing for more natural movement
      const easedProgress = easeInOutCubic(animationProgressRef.current);
      const newScale = minScale + (easedProgress * (calculatedMaxScale - minScale));
      
      setScale(newScale);
      
      // Continue animation loop
      animationRef.current = requestAnimationFrame(animate);
    };
    
    // Cubic easing function for smooth transitions
    const easeInOutCubic = (t: number): number => {
      return t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2;
    };
    
    // Start animation loop
    animationRef.current = requestAnimationFrame(animate);
    
    // Clean up animation loop
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, intensity, speed, maxScale]);

  // Apply scale transformation with smooth transition
  return (
    <div style={{ 
      transform: `scale(${scale})`,
      transition: `transform 0.05s ease-in-out`, // Small transition for extra smoothness
      transformOrigin: 'center'
    }}>
      {children}
    </div>
  );
};

export default AudioVisualizer;
