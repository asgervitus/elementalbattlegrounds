class AudioManager {
    constructor() {
        this.sounds = {};
        this.musicEnabled = true;
        this.soundEnabled = true;
        this.masterVolume = 0.7;
        this.loadSounds();
    }
    
    loadSounds() {
        this.createSound('click', this.generateTone(800, 0.1, 'sine'));
        this.createSound('buy', this.generateTone(600, 0.2, 'triangle'));
        this.createSound('fusion', this.generateChord([440, 554, 659], 0.5));
        this.createSound('victory', this.generateMelody([523, 659, 784], 0.3));
        this.createSound('defeat', this.generateMelody([392, 330, 262], 0.4));
    }
    
    createSound(name, audioBuffer) {
        this.sounds[name] = audioBuffer;
    }
    
    generateTone(frequency, duration, type = 'sine') {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const sampleRate = audioContext.sampleRate;
        const numSamples = duration * sampleRate;
        const buffer = audioContext.createBuffer(1, numSamples, sampleRate);
        const channelData = buffer.getChannelData(0);
        
        for (let i = 0; i < numSamples; i++) {
            const t = i / sampleRate;
            let sample = Math.sin(2 * Math.PI * frequency * t);
            const envelope = Math.exp(-t * 3);
            channelData[i] = sample * envelope * 0.3;
        }
        
        return buffer;
    }
    
    generateChord(frequencies, duration) {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const sampleRate = audioContext.sampleRate;
        const numSamples = duration * sampleRate;
        const buffer = audioContext.createBuffer(1, numSamples, sampleRate);
        const channelData = buffer.getChannelData(0);
        
        for (let i = 0; i < numSamples; i++) {
            const t = i / sampleRate;
            let sample = 0;
            
            frequencies.forEach(freq => {
                sample += Math.sin(2 * Math.PI * freq * t) / frequencies.length;
            });
            
            const envelope = Math.exp(-t * 2);
            channelData[i] = sample * envelope * 0.4;
        }
        
        return buffer;
    }
    
    generateMelody(frequencies, noteDuration) {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const sampleRate = audioContext.sampleRate;
        const totalDuration = frequencies.length * noteDuration;
        const numSamples = totalDuration * sampleRate;
        const buffer = audioContext.createBuffer(1, numSamples, sampleRate);
        const channelData = buffer.getChannelData(0);
        
        frequencies.forEach((freq, noteIndex) => {
            const noteStart = noteIndex * noteDuration;
            const noteEnd = (noteIndex + 1) * noteDuration;
            
            for (let i = 0; i < numSamples; i++) {
                const t = i / sampleRate;
                
                if (t >= noteStart && t < noteEnd) {
                    const noteTime = t - noteStart;
                    const sample = Math.sin(2 * Math.PI * freq * noteTime);
                    const envelope = Math.exp(-noteTime * 4);
                    channelData[i] += sample * envelope * 0.3;
                }
            }
        });
        
        return buffer;
    }
    
    async playSound(soundName, volume = 1) {
        if (!this.soundEnabled || !this.sounds[soundName]) return;
        
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const source = audioContext.createBufferSource();
            const gainNode = audioContext.createGain();
            
            source.buffer = this.sounds[soundName];
            gainNode.gain.value = volume * this.masterVolume;
            
            source.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            source.start();
        } catch (error) {
            console.warn('Audio playback failed:', error);
        }
    }
    
    setSoundEnabled(enabled) {
        this.soundEnabled = enabled;
    }
    
    setMusicEnabled(enabled) {
        this.musicEnabled = enabled;
    }
}

window.audioManager = new AudioManager();