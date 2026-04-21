/**
 * High-performance browser-native Speech Recognition service.
 * Provides real-time interim results (live captions) with zero disk space.
 */

class LiveCaptionManager {
  constructor() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = SpeechRecognition ? new SpeechRecognition() : null;
    this.isListening = false;
    this.onResultCallback = null;
    this.onErrorCallback = null;
    this.onEndCallback = null;

    if (this.recognition) {
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US'; // Can be updated dynamically

      this.recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        if (this.onResultCallback) {
          this.onResultCallback({
            interim: interimTranscript,
            final: finalTranscript,
          });
        }
      };

      this.recognition.onerror = (event) => {
        console.error('Speech Recognition Error:', event.error);
        if (this.onErrorCallback) this.onErrorCallback(event.error);
      };

      this.recognition.onend = () => {
        // Automatically restart if we are supposed to be listening
        // This handles cases where the browser stops recognition due to silence or timeout
        if (this.isListening) {
          try {
            this.recognition.start();
          } catch (e) {
            console.warn('Silent recognition restart failed', e);
          }
        }
        if (this.onEndCallback) this.onEndCallback();
      };
    }
  }

  isSupported() {
    return !!this.recognition;
  }

  setLanguage(langCode) {
    if (this.recognition) {
      this.recognition.lang = langCode;
      if (this.isListening) {
        this.stop();
        this.start(this.onResultCallback);
      }
    }
  }

  start(onResult, onError) {
    if (!this.recognition || this.isListening) return;
    
    this.onResultCallback = onResult;
    this.onErrorCallback = onError;
    this.isListening = true;
    
    try {
      this.recognition.start();
    } catch (e) {
      console.error('Failed to start recognition', e);
      this.isListening = false;
    }
  }

  stop() {
    if (!this.recognition || !this.isListening) return;
    this.isListening = false;
    this.recognition.stop();
  }
}

export const liveCaptionService = new LiveCaptionManager();
