import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for speech recognition functionality
 * Uses Web Speech API for browser-native speech-to-text conversion
 * Supports multiple languages and provides comprehensive error handling
 */
export const useSpeechRecognition = (language = 'en-US') => {
  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);
  const [hasPermission, setHasPermission] = useState(null);

  const recognitionRef = useRef(null);
  const timeoutRef = useRef(null);

  // Language mapping for Web Speech API
  const languageMap = {
    'en': 'en-US',
    'hi': 'hi-IN',
    'bn': 'bn-IN',
    'ar': 'ar-SA',
    'es': 'es-ES',
    'kn': 'kn-IN'
  };

  // Get the appropriate language code for speech recognition
  const getSpeechLanguage = useCallback((lang) => {
    const baseLang = lang.split('-')[0];
    return languageMap[baseLang] || 'en-US';
  }, []);

  // Initialize speech recognition
  useEffect(() => {
    // Check if Web Speech API is supported
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setIsSupported(false);
      setError('Speech recognition is not supported in this browser');
      return;
    }

    setIsSupported(true);

    // Create speech recognition instance
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    // Configure speech recognition
    recognition.continuous = false; // Stop after one result
    recognition.interimResults = true; // Show intermediate results
    recognition.maxAlternatives = 1;
    recognition.lang = getSpeechLanguage(language);

    // Event handlers
    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
      setTranscript('');
    };

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      // Update transcript with final or interim results
      setTranscript(finalTranscript || interimTranscript);
    };

    recognition.onend = () => {
      setIsListening(false);
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      setError(getErrorMessage(event.error));

      // Handle permission denial
      if (event.error === 'not-allowed') {
        setHasPermission(false);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [language, getSpeechLanguage]);

  /**
   * Get user-friendly error messages
   * @param {string} errorCode - Error code from speech recognition
   * @returns {string} User-friendly error message
   */
  const getErrorMessage = (errorCode) => {
    switch (errorCode) {
      case 'not-allowed':
        return 'Microphone access denied. Please allow microphone access and try again.';
      case 'no-speech':
        return 'No speech detected. Please try again.';
      case 'audio-capture':
        return 'No microphone found. Please check your microphone connection.';
      case 'network':
        return 'Network error occurred. Please check your connection.';
      case 'language-not-supported':
        return 'Language not supported for speech recognition.';
      case 'service-not-allowed':
        return 'Speech recognition service is not allowed.';
      default:
        return 'Speech recognition error occurred. Please try again.';
    }
  };

  /**
   * Start speech recognition
   */
  const startListening = useCallback(async () => {
    if (!isSupported || !recognitionRef.current) {
      setError('Speech recognition is not supported');
      return;
    }

    if (isListening) {
      return;
    }

    try {
      // Request microphone permission first
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          await navigator.mediaDevices.getUserMedia({ audio: true });
          setHasPermission(true);
        } catch (permError) {
          setHasPermission(false);
          setError('Microphone access denied. Please allow microphone access.');
          return;
        }
      }

      setError(null);
      setTranscript('');

      // Update language before starting
      recognitionRef.current.lang = getSpeechLanguage(language);

      // Start recognition
      recognitionRef.current.start();

      // Set timeout to automatically stop after 10 seconds
      timeoutRef.current = setTimeout(() => {
        if (recognitionRef.current && isListening) {
          recognitionRef.current.stop();
        }
      }, 10000);

    } catch (err) {
      setError('Failed to start speech recognition: ' + err.message);
    }
  }, [isSupported, isListening, language, getSpeechLanguage]);

  /**
   * Stop speech recognition
   */
  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, [isListening]);

  /**
   * Reset transcript and error state
   */
  const resetTranscript = useCallback(() => {
    setTranscript('');
    setError(null);
  }, []);

  /**
   * Toggle speech recognition on/off
   */
  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  return {
    isSupported,
    isListening,
    transcript,
    error,
    hasPermission,
    startListening,
    stopListening,
    resetTranscript,
    toggleListening
  };
};