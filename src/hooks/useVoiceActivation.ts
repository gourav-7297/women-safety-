import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';

interface VoiceActivationOptions {
  onTrigger: () => void;
  keywords?: string[];
  isEnabled?: boolean;
}

// Type declarations for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export const useVoiceActivation = ({ 
  onTrigger, 
  keywords = ['emergency', 'help', 'sos'], 
  isEnabled = false 
}: VoiceActivationOptions) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    // Check if Web Speech API is supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSupported(true);
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        console.log('Voice activation started');
      };

      recognition.onend = () => {
        setIsListening(false);
        console.log('Voice activation ended');
        
        // Restart if still enabled
        if (isEnabled && recognitionRef.current) {
          try {
            recognitionRef.current.start();
          } catch (error) {
            console.error('Error restarting recognition:', error);
          }
        }
      };

      recognition.onerror = (event) => {
        console.error('Voice recognition error:', event.error);
        
        if (event.error === 'not-allowed') {
          toast.error('Microphone access denied. Please enable microphone permissions.');
          setIsListening(false);
        }
      };

      recognition.onresult = (event) => {
        const last = event.results.length - 1;
        const transcript = event.results[last][0].transcript.toLowerCase().trim();
        
        console.log('Voice detected:', transcript);
        
        // Check if any keyword matches
        const matched = keywords.some(keyword => 
          transcript.includes(keyword.toLowerCase())
        );
        
        if (matched) {
          console.log('Emergency keyword detected:', transcript);
          toast.success('Voice command detected!');
          onTrigger();
        }
      };

      recognitionRef.current = recognition;
    } else {
      setIsSupported(false);
      console.warn('Web Speech API not supported');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [keywords, onTrigger]);

  useEffect(() => {
    if (!isSupported || !recognitionRef.current) return;

    if (isEnabled) {
      try {
        recognitionRef.current.start();
        toast.success('Voice activation enabled');
      } catch (error) {
        console.error('Error starting recognition:', error);
      }
    } else {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [isEnabled, isSupported]);

  const toggle = useCallback(() => {
    if (!isSupported) {
      toast.error('Voice activation not supported in this browser');
      return false;
    }
    return true;
  }, [isSupported]);

  return {
    isListening,
    isSupported,
    toggle
  };
};
