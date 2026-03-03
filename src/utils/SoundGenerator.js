// SoundGenerator.js - Synthesizes all game SFX via Web Audio API
export class SoundGenerator {
    constructor(scene) {
        this.scene = scene;
        this.audioCtx = null;
    }

    generateAll() {
        try {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn('Web Audio API not supported');
            return;
        }

        this.generateSound('sfx_meow', this.createMeow());
        this.generateSound('sfx_hit', this.createHit());
        this.generateSound('sfx_enemyDeath', this.createEnemyDeath());
        this.generateSound('sfx_levelup', this.createLevelUp());
        this.generateSound('sfx_pickup', this.createPickup());
        this.generateSound('sfx_shoot', this.createShoot());
        this.generateSound('sfx_select', this.createSelect());
    }

    generateSound(key, buffer) {
        if (!buffer) return;
        this.scene.cache.audio.add(key, { buffer, encoded: false });
        this.scene.sound.decodeAudio(key, buffer);
    }

    createMeow() {
        const duration = 0.3;
        const sampleRate = this.audioCtx.sampleRate;
        const length = duration * sampleRate;
        const buffer = this.audioCtx.createBuffer(1, length, sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < length; i++) {
            const t = i / sampleRate;
            const freq = 800 + Math.sin(t * 20) * 200 + (1 - t / duration) * 400;
            const envelope = Math.sin(Math.PI * t / duration);
            data[i] = Math.sin(2 * Math.PI * freq * t) * envelope * 0.3;
        }
        return buffer;
    }

    createHit() {
        const duration = 0.1;
        const sampleRate = this.audioCtx.sampleRate;
        const length = duration * sampleRate;
        const buffer = this.audioCtx.createBuffer(1, length, sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < length; i++) {
            const t = i / sampleRate;
            const envelope = 1 - t / duration;
            data[i] = (Math.random() * 2 - 1) * envelope * 0.15 +
                Math.sin(2 * Math.PI * 300 * t) * envelope * 0.2;
        }
        return buffer;
    }

    createEnemyDeath() {
        const duration = 0.25;
        const sampleRate = this.audioCtx.sampleRate;
        const length = duration * sampleRate;
        const buffer = this.audioCtx.createBuffer(1, length, sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < length; i++) {
            const t = i / sampleRate;
            const freq = 600 - (t / duration) * 400;
            const envelope = Math.pow(1 - t / duration, 2);
            data[i] = Math.sin(2 * Math.PI * freq * t) * envelope * 0.25 +
                Math.sin(2 * Math.PI * freq * 1.5 * t) * envelope * 0.1;
        }
        return buffer;
    }

    createLevelUp() {
        const duration = 0.5;
        const sampleRate = this.audioCtx.sampleRate;
        const length = duration * sampleRate;
        const buffer = this.audioCtx.createBuffer(1, length, sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < length; i++) {
            const t = i / sampleRate;
            const freq = 400 + (t / duration) * 800;
            const envelope = Math.sin(Math.PI * t / duration) * 0.8;
            data[i] = Math.sin(2 * Math.PI * freq * t) * envelope * 0.2 +
                Math.sin(2 * Math.PI * freq * 2 * t) * envelope * 0.1;
        }
        return buffer;
    }

    createPickup() {
        const duration = 0.12;
        const sampleRate = this.audioCtx.sampleRate;
        const length = duration * sampleRate;
        const buffer = this.audioCtx.createBuffer(1, length, sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < length; i++) {
            const t = i / sampleRate;
            const freq = 1000 + (t / duration) * 500;
            const envelope = 1 - t / duration;
            data[i] = Math.sin(2 * Math.PI * freq * t) * envelope * 0.15;
        }
        return buffer;
    }

    createShoot() {
        const duration = 0.08;
        const sampleRate = this.audioCtx.sampleRate;
        const length = duration * sampleRate;
        const buffer = this.audioCtx.createBuffer(1, length, sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < length; i++) {
            const t = i / sampleRate;
            const freq = 2000 - (t / duration) * 1500;
            const envelope = 1 - t / duration;
            data[i] = Math.sin(2 * Math.PI * freq * t) * envelope * 0.1;
        }
        return buffer;
    }

    createSelect() {
        const duration = 0.1;
        const sampleRate = this.audioCtx.sampleRate;
        const length = duration * sampleRate;
        const buffer = this.audioCtx.createBuffer(1, length, sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < length; i++) {
            const t = i / sampleRate;
            const envelope = Math.sin(Math.PI * t / duration);
            data[i] = Math.sin(2 * Math.PI * 1200 * t) * envelope * 0.15;
        }
        return buffer;
    }
}
