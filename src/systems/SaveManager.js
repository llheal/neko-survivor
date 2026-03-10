// SaveManager.js - Auto-save/load game state via localStorage
const SAVE_KEY = 'neko_roguelike_save';
const SAVE_INTERVAL = 10000; // Auto-save every 10 seconds

export class SaveManager {
    static save(scene) {
        try {
            const player = scene.player;
            const waveManager = scene.waveManager;
            const skillManager = scene.skillManager;

            const saveData = {
                version: 1,
                timestamp: Date.now(),

                // Player
                player: {
                    x: Math.round(player.sprite.x),
                    y: Math.round(player.sprite.y),
                    hp: player.hp,
                    maxHp: player.maxHp,
                    level: player.level,
                    xp: player.xp,
                    xpToNext: player.xpToNext,
                    damage: player.damage,
                    speed: player.speed,
                    attackInterval: player.attackInterval,
                    critChance: player.critChance,
                    critMultiplier: player.critMultiplier,
                    freezeChance: player.freezeChance,
                    evolutionStage: player.evolutionStage,
                    currentSpriteKey: player.currentSpriteKey,
                    shieldActive: player.shieldActive,
                    shieldHits: player.shieldHits,
                },

                // Wave
                wave: waveManager.wave,
                totalKills: waveManager.totalKills || 0,

                // Score
                score: scene.score,

                // Skills
                acquiredSkills: { ...skillManager.acquiredSkills },
            };

            localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
            console.log(`[Save] Wave ${saveData.wave}, Lv.${saveData.player.level}`);
            return true;
        } catch (e) {
            console.warn('Save failed:', e);
            return false;
        }
    }

    static load() {
        try {
            const raw = localStorage.getItem(SAVE_KEY);
            if (!raw) return null;

            const data = JSON.parse(raw);
            if (!data || !data.version || !data.player) return null;

            return data;
        } catch (e) {
            console.warn('Load failed:', e);
            return null;
        }
    }

    static hasSave() {
        try {
            const raw = localStorage.getItem(SAVE_KEY);
            if (!raw) return false;
            const data = JSON.parse(raw);
            return !!(data && data.version && data.player);
        } catch {
            return false;
        }
    }

    static getSaveInfo() {
        const data = SaveManager.load();
        if (!data) return null;
        return {
            level: data.player.level,
            wave: data.wave,
            score: data.score,
            timestamp: data.timestamp,
        };
    }

    static deleteSave() {
        localStorage.removeItem(SAVE_KEY);
    }

    static startAutoSave(scene) {
        if (scene._autoSaveTimer) {
            scene._autoSaveTimer.remove();
        }
        scene._autoSaveTimer = scene.time.addEvent({
            delay: SAVE_INTERVAL,
            callback: () => {
                if (scene.gameActive) {
                    SaveManager.save(scene);
                }
            },
            loop: true,
        });
    }

    static stopAutoSave(scene) {
        if (scene._autoSaveTimer) {
            scene._autoSaveTimer.remove();
            scene._autoSaveTimer = null;
        }
    }
}
