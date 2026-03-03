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
            { key: 'bgm_game', buffer: this.createGameBGM() },
            { key: 'bgm_title', buffer: this.createTitleBGM() },
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

    // --- BGM Synthesis ---

    // Helper: convert MIDI note to frequency
    noteToFreq(note) {
        return 440 * Math.pow(2, (note - 69) / 12);
    }

    // Square wave oscillator (chiptune feel)
    squareWave(t, freq) {
        return Math.sin(2 * Math.PI * freq * t) > 0 ? 1 : -1;
    }

    // Triangle wave (softer chiptune)
    triangleWave(t, freq) {
        const p = (t * freq) % 1;
        return 4 * Math.abs(p - 0.5) - 1;
    }

    createGameBGM() {
        const bpm = 140;
        const bars = 8;
        const beatsPerBar = 4;
        const beatDuration = 60 / bpm;
        const totalBeats = bars * beatsPerBar;
        const duration = totalBeats * beatDuration;
        const sampleRate = this.audioCtx.sampleRate;
        const length = Math.floor(duration * sampleRate);
        const buffer = this.audioCtx.createBuffer(1, length, sampleRate);
        const data = buffer.getChannelData(0);

        // Melody: catchy 8-bar loop (MIDI notes)
        // Pattern repeats every 2 bars
        const melodyPattern = [
            // bar 1-2
            72, 72, 74, 76, 79, 76, 74, 72,
            // bar 3-4
            71, 72, 74, 72, 69, 67, 69, 72,
            // bar 5-6
            72, 74, 76, 79, 81, 79, 76, 74,
            // bar 7-8
            76, 74, 72, 71, 72, -1, 72, -1,
        ];

        // Bass: root notes (MIDI)
        const bassPattern = [
            48, 48, 48, 48, 53, 53, 53, 53,
            45, 45, 45, 45, 48, 48, 48, 48,
            48, 48, 48, 48, 53, 53, 53, 53,
            45, 45, 45, 45, 48, 48, 48, 48,
        ];

        // Chord stabs (arpeggios) — MIDI note offsets from bass
        const chordOffsets = [0, 4, 7, 12];

        for (let i = 0; i < length; i++) {
            const t = i / sampleRate;
            const beat = t / beatDuration;
            const beatIndex = Math.floor(beat) % totalBeats;
            const beatFrac = beat - Math.floor(beat);

            let sample = 0;

            // --- Bass (triangle wave, steady) ---
            const bassNote = bassPattern[beatIndex];
            const bassFreq = this.noteToFreq(bassNote);
            const bassEnv = 0.8 - beatFrac * 0.3;
            sample += this.triangleWave(t, bassFreq) * bassEnv * 0.12;

            // --- Melody (square wave, staccato) ---
            const melodyNote = melodyPattern[beatIndex];
            if (melodyNote > 0) {
                const melodyFreq = this.noteToFreq(melodyNote);
                const melodyEnv = beatFrac < 0.7 ? (1 - beatFrac / 0.7) : 0;
                sample += this.squareWave(t, melodyFreq) * melodyEnv * 0.08;
                // Add octave harmonic for brightness
                sample += Math.sin(2 * Math.PI * melodyFreq * 2 * t) * melodyEnv * 0.03;
            }

            // --- Arpeggio (hi-hat rhythm, 16th notes) ---
            const sixteenth = Math.floor(beat * 4) % 4;
            const arpNote = bassNote + 12 + chordOffsets[sixteenth];
            const arpFreq = this.noteToFreq(arpNote);
            const arpT = (beat * 4) % 1;
            const arpEnv = arpT < 0.3 ? (1 - arpT / 0.3) : 0;
            sample += Math.sin(2 * Math.PI * arpFreq * t) * arpEnv * 0.04;

            // --- Percussion (noise kick on beat 1&3, hihat on 2&4) ---
            if (beatFrac < 0.08) {
                if (beatIndex % 2 === 0) {
                    // Kick
                    const kickFreq = 100 * (1 - beatFrac / 0.08);
                    sample += Math.sin(2 * Math.PI * kickFreq * t) * (1 - beatFrac / 0.08) * 0.15;
                } else {
                    // Hihat (noise)
                    sample += (Math.random() * 2 - 1) * (1 - beatFrac / 0.08) * 0.06;
                }
            }

            data[i] = Math.max(-1, Math.min(1, sample));
        }

        return buffer;
    }

    createTitleBGM() {
        const bpm = 80;
        const bars = 8;
        const beatsPerBar = 4;
        const beatDuration = 60 / bpm;
        const totalBeats = bars * beatsPerBar;
        const duration = totalBeats * beatDuration;
        const sampleRate = this.audioCtx.sampleRate;
        const length = Math.floor(duration * sampleRate);
        const buffer = this.audioCtx.createBuffer(1, length, sampleRate);
        const data = buffer.getChannelData(0);

        // Gentle melody notes (C major pentatonic)
        const melodyNotes = [
            60, -1, 64, -1, 67, -1, 72, -1,
            71, -1, 67, -1, 64, -1, 60, -1,
            62, -1, 67, -1, 69, -1, 72, -1,
            71, -1, 69, -1, 67, -1, 64, -1,
        ];

        // Pad chords
        const padRoots = [
            48, 48, 48, 48, 53, 53, 53, 53,
            45, 45, 45, 45, 48, 48, 48, 48,
            48, 48, 48, 48, 53, 53, 53, 53,
            45, 45, 45, 45, 48, 48, 48, 48,
        ];

        for (let i = 0; i < length; i++) {
            const t = i / sampleRate;
            const beat = t / beatDuration;
            const beatIndex = Math.floor(beat) % totalBeats;
            const beatFrac = beat - Math.floor(beat);

            let sample = 0;

            // --- Pad (soft sine chords) ---
            const padRoot = padRoots[beatIndex];
            const padFreq = this.noteToFreq(padRoot);
            sample += Math.sin(2 * Math.PI * padFreq * t) * 0.06;
            sample += Math.sin(2 * Math.PI * padFreq * 1.25 * t) * 0.04; // major 3rd
            sample += Math.sin(2 * Math.PI * padFreq * 1.5 * t) * 0.04;  // 5th

            // --- Melody (soft sine, legato) ---
            const note = melodyNotes[beatIndex];
            if (note > 0) {
                const freq = this.noteToFreq(note);
                const env = Math.sin(Math.PI * beatFrac) * 0.8;
                sample += Math.sin(2 * Math.PI * freq * t) * env * 0.1;
            }

            // Gentle volume swell
            const globalEnv = 0.8 + 0.2 * Math.sin(2 * Math.PI * t / duration);
            data[i] = Math.max(-1, Math.min(1, sample * globalEnv));
        }

        return buffer;
    }
}
