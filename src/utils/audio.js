// Audio utility functions using Web Audio API
class AudioManager {
  constructor() {
    this.audioContext = null;
    this.musicVolume = 0.3;
    this.sfxVolume = 0.5;
    this.initialized = false;
  }

  // Initialize audio context
  async init() {
    if (this.initialized) return;
    
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.initialized = true;
      console.log('Audio initialized');
    } catch (error) {
      console.log('Audio initialization failed:', error);
    }
  }

  // Create beep sounds
  createBeep(frequency, duration, type = 'sine') {
    if (!this.audioContext) return;
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = type;
    
    gainNode.gain.setValueAtTime(this.sfxVolume, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
    
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  // Play sound effect
  playSound(soundName) {
    if (!this.initialized) {
      this.init();
      return;
    }
    
    try {
      switch(soundName) {
        case 'fire':
          this.createBeep(800, 0.3, 'sawtooth');
          break;
        case 'ice':
          this.createBeep(1200, 0.4, 'triangle');
          break;
        case 'lightning':
          this.createBeep(1500, 0.2, 'square');
          break;
        case 'heal':
          this.createBeep(523, 0.5, 'sine');
          break;
        case 'potion':
          this.createBeep(400, 0.3, 'sine');
          break;
        case 'slash':
          this.createBeep(300, 0.2, 'sawtooth');
          break;
        default:
          this.createBeep(440, 0.2, 'sine');
      }
    } catch (error) {
      console.log('Sound effect failed:', error);
    }
  }

  playMusic() {
    // Simple background music
    if (this.initialized) {
      this.createBeep(523, 0.5, 'sine');
    }
  }

  setMusicVolume(volume) {
    this.musicVolume = volume;
  }

  setSFXVolume(volume) {
    this.sfxVolume = volume;
  }
}

export const audioManager = new AudioManager();

// Initialize on first click
document.addEventListener('click', () => {
  audioManager.init();
}, { once: true });