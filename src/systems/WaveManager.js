// WaveManager.js - Progressive enemy spawning system
export class WaveManager {
    constructor(scene) {
        this.scene = scene;
        this.wave = 0;
        this.enemiesRemaining = 0;
        this.enemiesSpawned = 0;
        this.enemiesPerWave = 0;
        this.spawnTimer = null;
        this.waveDelay = false;
        this.waveActive = false;
        this.totalKills = 0;
    }

    startWave() {
        this.wave++;

        // Early waves are easy (let player level up), then ramp hard
        let enemyCount;
        if (this.wave <= 2) {
            enemyCount = 5 + this.wave * 5;       // Wave1=10, Wave2=15
        } else {
            enemyCount = 15 + (this.wave - 2) * 18; // Wave3=33, Wave5=69, Wave10=159
        }
        this.enemiesPerWave = Math.min(enemyCount, 400);
        this.enemiesSpawned = 0;
        this.enemiesRemaining = this.enemiesPerWave;
        this.waveActive = true;

        // Show wave announcement
        this.scene.events.emit('waveStart', this.wave);

        // Start spawning — slow early, fast later
        const spawnInterval = this.wave <= 2
            ? 600 - this.wave * 100     // Wave1=500ms, Wave2=400ms
            : Math.max(40, 350 - this.wave * 25);
        this.spawnTimer = this.scene.time.addEvent({
            delay: spawnInterval,
            callback: this.spawnEnemy,
            callbackScope: this,
            repeat: this.enemiesPerWave - 1,
        });
    }

    spawnEnemy() {
        if (!this.waveActive) return;

        const player = this.scene.player;
        if (!player || !player.sprite || !player.sprite.active) return;

        // Spawn from screen edges
        const cam = this.scene.cameras.main;
        const margin = 60;
        const side = Phaser.Math.Between(0, 3);
        let x, y;

        switch (side) {
            case 0: // top
                x = Phaser.Math.Between(cam.scrollX - margin, cam.scrollX + cam.width + margin);
                y = cam.scrollY - margin;
                break;
            case 1: // right
                x = cam.scrollX + cam.width + margin;
                y = Phaser.Math.Between(cam.scrollY - margin, cam.scrollY + cam.height + margin);
                break;
            case 2: // bottom
                x = Phaser.Math.Between(cam.scrollX - margin, cam.scrollX + cam.width + margin);
                y = cam.scrollY + cam.height + margin;
                break;
            case 3: // left
                x = cam.scrollX - margin;
                y = Phaser.Math.Between(cam.scrollY - margin, cam.scrollY + cam.height + margin);
                break;
        }

        // Pick enemy type based on wave
        const types = ['bear_brown'];
        if (this.wave >= 3) types.push('bear_polar');
        if (this.wave >= 5) types.push('bear_panda');
        const type = Phaser.Utils.Array.GetRandom(types);

        // Early waves: weak bears. Later: scales with player power
        let hpMultiplier, spdMultiplier;
        if (this.wave <= 2) {
            hpMultiplier = 0.6;   // Weak bears early
            spdMultiplier = 0.8;
        } else {
            hpMultiplier = 1 + (this.wave - 2) * 0.15;
            spdMultiplier = 1 + (this.wave - 2) * 0.08;
        }

        this.scene.spawnEnemy(x, y, type, hpMultiplier, spdMultiplier);
        this.enemiesSpawned++;
    }

    onEnemyKilled() {
        this.enemiesRemaining--;
        this.totalKills++;

        if (this.enemiesRemaining <= 0 && this.waveActive) {
            this.waveActive = false;
            this.scene.events.emit('waveComplete', this.wave);

            // Delay before next wave
            this.scene.time.delayedCall(2000, () => {
                this.startWave();
            });
        }
    }

    getWave() {
        return this.wave;
    }

    destroy() {
        if (this.spawnTimer) {
            this.spawnTimer.destroy();
        }
    }
}
