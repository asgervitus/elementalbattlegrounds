/**
 * Audio System - Background music and sound effects management
 * Elemental Battlegrounds
 */

// Global volume for both background music and sound effects.  Loaded
// from localStorage under 'audioVolume'.
let audioVolume = 0.3;

/**
 * Initialize audio volume from localStorage
 */
export function initAudioVolume() {
  try {
    const saved = localStorage.getItem('audioVolume');
    if (saved !== null) {
      audioVolume = parseFloat(saved);
      if (isNaN(audioVolume) || audioVolume < 0 || audioVolume > 1) {
        audioVolume = 0.3; // Default fallback
      }
    }
  } catch (err) {
    console.warn('Failed to load audio volume:', err);
    audioVolume = 0.3;
  }
  
  // Apply the volume to existing audio elements
  setAudioVolume(audioVolume);
}

/**
 * Set the global audio volume and persist to localStorage
 */
export function setAudioVolume(vol) {
  audioVolume = Math.max(0, Math.min(1, vol));
  
  try {
    localStorage.setItem('audioVolume', audioVolume.toString());
  } catch (err) {
    console.warn('Failed to save audio volume:', err);
  }
  
  // Apply to background music
  const bgMusic = document.getElementById('bg-music');
  if (bgMusic) {
    bgMusic.volume = audioVolume;
  }
}

/**
 * Get current audio volume
 */
export function getAudioVolume() {
  return audioVolume;
}

/**
 * Play a sound effect
 * Currently uses simple beep tones, but could be extended with actual audio files
 */
export function playSound(type) {
  if (audioVolume <= 0) return;
  
  try {
    // Create a simple audio context for sound effects
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Set volume
    gainNode.gain.setValueAtTime(audioVolume * 0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    // Set frequency based on sound type
    let frequency = 440; // Default A note
    switch (type) {
      case 'click':
        frequency = 800;
        break;
      case 'buy':
        frequency = 660;
        break;
      case 'fusion':
        frequency = 880;
        break;
      case 'battle':
        frequency = 220;
        break;
      case 'win':
        frequency = 1100;
        break;
      case 'lose':
        frequency = 150;
        break;
      default:
        frequency = 440;
    }
    
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    oscillator.type = 'sine';
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
    
  } catch (err) {
    // Fallback for browsers without Web Audio API support
    console.warn('Audio not supported:', err);
  }
}

/**
 * Start background music
 */
export function startBackgroundMusic() {
  const bgMusic = document.getElementById('bg-music');
  if (bgMusic && audioVolume > 0) {
    bgMusic.volume = audioVolume;
    bgMusic.play().catch(err => {
      console.warn('Failed to play background music:', err);
    });
  }
}

/**
 * Stop background music
 */
export function stopBackgroundMusic() {
  const bgMusic = document.getElementById('bg-music');
  if (bgMusic) {
    bgMusic.pause();
    bgMusic.currentTime = 0;
  }
}

/**
 * Toggle background music on/off
 */
export function toggleBackgroundMusic() {
  const bgMusic = document.getElementById('bg-music');
  if (bgMusic) {
    if (bgMusic.paused) {
      startBackgroundMusic();
    } else {
      stopBackgroundMusic();
    }
  }
}