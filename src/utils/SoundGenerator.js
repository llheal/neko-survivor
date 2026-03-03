// SoundGenerator.js - Synthesizes all game SFX via Web Audio API
// Converts AudioBuffers to WAV blobs for Phaser compatibility
export class SoundGenerator {
    constructor(scene) {
        this.scene = scene;
        this.audioCtx = null;
    }

    async generateAll() {
        try {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            if (this.audioCtx.state === 'suspended') {
                // Will resume on first user interaction
            }
        } catch (e) {
            console.warn('Web Audio API not supported');
            return;
        }

        const sounds = [
            { key: 'sfx_meow', buffer: this.createMeow() },
            { key: 'sfx_hit', buffer: this.createHit() },
            { key: 'sfx_enemyDeath', buffer: this.createEnemyDeath() },
            { key: 'sfx_levelup', buffer: this.createLevelUp() },
            { key: 'sfx_pickup', buffer: this.createPickup() },
            { key: 'sfx_shoot', buffer: this.createShoot() },
            { key: 'sfx_select', buffer: this.createSelect() },
        ];

        for (const s of sounds) {
            if (s.buffer) {
                this.addSoundToPhaser(s.key, s.buffer);
            }
        }
    }

    // Convert AudioBuffer to WAV and add to Phaser's sound system
    addSoundToPhaser(key, audioBuffer) {
        try {
            const wavBlob = this.audioBufferToWav(audioBuffer);
            const url = URL.createObjectURL(wavBlob);

            // Use Phaser's loader to load the WAV blob URL
            this.scene.load.audio(key, url);
            this.scene.load.once('complete', () => {
                // Sounds are now available
            });
            this.scene.load.start();
        } catch (e) {
            console.warn(`Failed to generate sound ${key}:`, e);
        }
    }

    // Convert AudioBuffer to WAV Blob
    audioBufferToWav(buffer) {
        const numChannels = buffer.numberOfChannels;
        const sampleRate = buffer.sampleRate;
        const format = 1; // PCM
        const bitDepth = 16;

        const bytesPerSample = bitDepth / 8;
        const blockAlign = numChannels * bytesPerSample;
        const dataLength = buffer.length * blockAlign;
        const headerLength = 44;
        const totalLength = headerLength + dataLength;

        const wav = new ArrayBuffer(totalLength);
        const view = new DataView(wav);

        // WAV header
        this.writeString(view, 0, 'RIFF');
        view.setUint32(4, totalLength - 8, true);
        this.writeString(view, 8, 'WAVE');
        this.writeString(view, 12, 'fmt ');
        view.setUint32(16, 16, true); // chunk size
        view.setUint16(20, format, true);
        view.setUint16(22, numChannels, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * blockAlign, true);
        view.setUint16(32, blockAlign, true);
        view.setUint16(34, bitDepth, true);
        this.writeString(view, 36, 'data');
        view.setUint32(40, dataLength, true);

        // Write PCM data
        const channelData = buffer.getChannelData(0);
        let offset = 44;
        for (let i = 0; i < buffer.length; i++) {
            for (let ch = 0; ch < numChannels; ch++) {
                const data = ch === 0 ? channelData : buffer.getChannelData(ch);
                const sample = Math.max(-1, Math.min(1, data[i]));
                const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
                view.setInt16(offset, intSample, true);
                offset += 2;
            }
        }

        return new Blob([wav], { type: 'audio/wav' });
    }

    writeString(view, offset, string) {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    }

    // --- Sound Synthesis ---

    createMeow() {
        const duration = 0.3;
        const sampleRate = this.audioCtx.sampleRate;
        const length = Math.floor(duration * sampleRate);
        const buffer = this.audioCtx.createBuffer(1, length, sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < length; i++) {
            const t = i / sampleRate;
            const freq = 800 + Math.sin(t * 20) * 200 + (1 - t / duration) * 400;
            const envelope = Math.sin(Math.PI * t / duration);
            data[i] = Math.sin(2 * Math.PI * freq * t) * envelope * 0.4;
        }
        return buffer;
    }

    createHit() {
        const duration = 0.12;
        const sampleRate = this.audioCtx.sampleRate;
        const length = Math.floor(duration * sampleRate);
        const buffer = this.audioCtx.createBuffer(1, length, sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < length; i++) {
            const t = i / sampleRate;
            const envelope = 1 - t / duration;
            data[i] = (Math.random() * 2 - 1) * envelope * 0.2 +
                Math.sin(2 * Math.PI * 300 * t) * envelope * 0.3;
        }
        return buffer;
    }

    createEnemyDeath() {
        const duration = 0.25;
        const sampleRate = this.audioCtx.sampleRate;
        const length = Math.floor(duration * sampleRate);
        const buffer = this.audioCtx.createBuffer(1, length, sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < length; i++) {
            const t = i / sampleRate;
            const freq = 600 - (t / duration) * 400;
            const envelope = Math.pow(1 - t / duration, 2);
            data[i] = Math.sin(2 * Math.PI * freq * t) * envelope * 0.35 +
                Math.sin(2 * Math.PI * freq * 1.5 * t) * envelope * 0.15;
        }
        return buffer;
    }

    createLevelUp() {
        const duration = 0.6;
        const sampleRate = this.audioCtx.sampleRate;
        const length = Math.floor(duration * sampleRate);
        const buffer = this.audioCtx.createBuffer(1, length, sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < length; i++) {
            const t = i / sampleRate;
            // Rising arpeggio
            const note = Math.floor(t / duration * 4);
            const freqs = [523, 659, 784, 1047]; // C5, E5, G5, C6
            const freq = freqs[Math.min(note, 3)];
            const envelope = Math.sin(Math.PI * t / duration) * 0.9;
            data[i] = Math.sin(2 * Math.PI * freq * t) * envelope * 0.25 +
                Math.sin(2 * Math.PI * freq * 2 * t) * envelope * 0.1;
        }
        return buffer;
    }

    createPickup() {
        const duration = 0.12;
        const sampleRate = this.audioCtx.sampleRate;
        const length = Math.floor(duration * sampleRate);
        const buffer = this.audioCtx.createBuffer(1, length, sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < length; i++) {
            const t = i / sampleRate;
            const freq = 1000 + (t / duration) * 600;
            const envelope = 1 - t / duration;
            data[i] = Math.sin(2 * Math.PI * freq * t) * envelope * 0.2;
        }
        return buffer;
    }

    createShoot() {
        const duration = 0.08;
        const sampleRate = this.audioCtx.sampleRate;
        const length = Math.floor(duration * sampleRate);
        const buffer = this.audioCtx.createBuffer(1, length, sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < length; i++) {
            const t = i / sampleRate;
            const freq = 2000 - (t / duration) * 1500;
            const envelope = 1 - t / duration;
            data[i] = Math.sin(2 * Math.PI * freq * t) * envelope * 0.15;
        }
        return buffer;
    }

    createSelect() {
        const duration = 0.15;
        const sampleRate = this.audioCtx.sampleRate;
        const length = Math.floor(duration * sampleRate);
        const buffer = this.audioCtx.createBuffer(1, length, sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < length; i++) {
            const t = i / sampleRate;
            const envelope = Math.sin(Math.PI * t / duration);
            data[i] = Math.sin(2 * Math.PI * 1200 * t) * envelope * 0.2;
        }
        return buffer;
    }
}
