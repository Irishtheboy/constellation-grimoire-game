// Audio utility functions using Web Audio API
class AudioManager {
  constructor() {
    this.audioContext = null;
    this.musicVolume = 0.3;
    this.sfxVolume = 0.5;
    this.initialized = false;
    this.currentMusic = null;
    this.musicGainNode = null;
    this.pendingMusic = null;
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

  // Play background music from file
  async playMusic(musicFile, loop = true) {
    if (!this.initialized) {
      await this.init();
    }
    
    try {
      // Stop current music if playing
      this.stopMusic();
      
      const audio = new Audio(musicFile);
      audio.loop = loop;
      audio.volume = this.musicVolume;
      
      // Handle loading errors
      audio.onerror = () => {
        console.log('Music file not found:', musicFile);
      };
      
      this.currentMusic = audio;
      
      // Try to play, handle autoplay restrictions
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          console.log('Background music started:', musicFile);
        }).catch(error => {
          console.log('Autoplay prevented. Music will start on user interaction.');
          // Store for later playback
          this.pendingMusic = audio;
        });
      }
    } catch (error) {
      console.log('Music setup failed:', error);
    }
  }
  
  // Stop background music
  stopMusic() {
    if (this.currentMusic) {
      this.currentMusic.pause();
      this.currentMusic.currentTime = 0;
      this.currentMusic = null;
    }
  }
  
  // Pause/resume music
  pauseMusic() {
    if (this.currentMusic && !this.currentMusic.paused) {
      this.currentMusic.pause();
    }
  }
  
  resumeMusic() {
    if (this.currentMusic && this.currentMusic.paused) {
      this.currentMusic.play();
    }
  }

  setMusicVolume(volume) {
    this.musicVolume = volume;
    if (this.currentMusic) {
      this.currentMusic.volume = volume;
    }
  }

  setSFXVolume(volume) {
    this.sfxVolume = volume;
  }
}

export const audioManager = new AudioManager();

// Initialize and play pending music on first user interaction
const initAudioOnInteraction = () => {
  audioManager.init();
  if (audioManager.pendingMusic) {
    audioManager.pendingMusic.play().then(() => {
      audioManager.currentMusic = audioManager.pendingMusic;
      audioManager.pendingMusic = null;
      console.log('Pending music started after user interaction');
    }).catch(console.log);
  }
};

document.addEventListener('click', initAudioOnInteraction, { once: true });
document.addEventListener('keydown', initAudioOnInteraction, { once: true });