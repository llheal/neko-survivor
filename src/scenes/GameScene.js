// GameScene.js - Main gameplay scene
import { Player } from '../entities/Player.js';
import { Enemy } from '../entities/Enemy.js';
import { Projectile } from '../entities/Projectile.js';
import { XPGem, HealthOrb } from '../entities/XPGem.js';
import { WeaponPickup } from '../entities/WeaponPickup.js';
import { InputManager } from '../systems/InputManager.js';
import { WaveManager } from '../systems/WaveManager.js';
import { SkillManager, SKILLS } from '../systems/SkillManager.js';
import { JuiceManager } from '../systems/JuiceManager.js';
import { ParticleManager } from '../systems/ParticleManager.js';
import { SaveManager } from '../systems/SaveManager.js';

export class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    init(data) {
        this._loadSave = data?.loadSave || false;
    }

    create() {
        const { width, height } = this.scale;
        this.cameras.main.setBackgroundColor('#4a7c59');
        this.gameActive = true;
        this.score = 0;

        // Create arena
        this.createArena(width, height);

        // Initialize systems
        this.inputManager = new InputManager(this);
        this.waveManager = new WaveManager(this);
        this.skillManager = new SkillManager(this);
        this.juiceManager = new JuiceManager(this);
        this.particleManager = new ParticleManager(this);

        // Physics groups
        this.enemies = this.physics.add.group({
            classType: Phaser.Physics.Arcade.Sprite,
            maxSize: 400,
            runChildUpdate: false,
        });

        this.projectiles = this.physics.add.group({
            classType: Phaser.Physics.Arcade.Sprite,
            maxSize: 150,
            runChildUpdate: false,
        });

        this.xpGems = this.physics.add.group({
            classType: Phaser.Physics.Arcade.Sprite,
            maxSize: 120,
            runChildUpdate: false,
        });

        this.healthOrbs = this.physics.add.group({
            classType: Phaser.Physics.Arcade.Sprite,
            maxSize: 20,
            runChildUpdate: false,
        });

        this.weaponPickups = this.physics.add.group({
            classType: Phaser.Physics.Arcade.Sprite,
            maxSize: 10,
            runChildUpdate: false,
        });

        // Player
        this.player = new Player(this, width / 2, height / 2);

        // Camera
        this.cameras.main.startFollow(this.player.sprite, true, 0.08, 0.08);
        this.cameras.main.setZoom(1);

        // Collisions
        this.physics.add.overlap(
            this.projectiles, this.enemies,
            this.onProjectileHitEnemy, null, this
        );

        this.physics.add.overlap(
            this.player.sprite, this.enemies,
            this.onPlayerHitEnemy, null, this
        );

        this.physics.add.overlap(
            this.player.sprite, this.xpGems,
            this.onPlayerCollectGem, null, this
        );

        this.physics.add.overlap(
            this.player.sprite, this.healthOrbs,
            this.onPlayerCollectHealth, null, this
        );

        this.physics.add.overlap(
            this.player.sprite, this.weaponPickups,
            this.onPlayerCollectWeapon, null, this
        );

        // Start UI
        this.scene.launch('UIScene');

        // Events
        this.events.on('waveStart', (wave) => {
            this.juiceManager.waveAnnouncement(`WAVE ${wave}`);
        });

        this.events.on('levelUp', (level) => {
            this.showSkillSelection();
        });

        // Load save or start fresh
        if (this._loadSave) {
            this.loadSaveData();
        }

        // Start first wave (if not loaded from save, wave is 0)
        this.time.delayedCall(1500, () => {
            this.waveManager.startWave();
        });

        // Start auto-save
        SaveManager.startAutoSave(this);

        // Fade in
        this.cameras.main.fadeIn(300, 0, 0, 0);

        // Start game BGM
        try {
            if (this.cache.audio.exists('bgm_game')) {
                this.bgm = this.sound.add('bgm_game', { loop: true, volume: 0.3 });
                this.bgm.play();
            }
        } catch (e) { }

        // Mobile audio resume
        this.input.once('pointerdown', () => {
            if (this.sound.context && this.sound.context.state === 'suspended') {
                this.sound.context.resume();
            }
        });
    }

    createArena(width, height) {
        const arenaSize = 2000;
        const tileSize = 64;

        const ground = this.add.graphics();
        for (let x = -arenaSize; x < arenaSize; x += tileSize) {
            for (let y = -arenaSize; y < arenaSize; y += tileSize) {
                const isOdd = ((x / tileSize + y / tileSize) % 2 + 2) % 2;
                const color = isOdd ? 0x4a7c59 : 0x3d6b4e;
                ground.fillStyle(color, 1);
                ground.fillRect(x, y, tileSize, tileSize);
            }
        }

        const border = this.add.graphics();
        border.lineStyle(4, 0x2a4a35, 0.8);
        border.strokeRect(-arenaSize, -arenaSize, arenaSize * 2, arenaSize * 2);

        for (let i = 0; i < 40; i++) {
            const gx = Phaser.Math.Between(-arenaSize + 50, arenaSize - 50);
            const gy = Phaser.Math.Between(-arenaSize + 50, arenaSize - 50);
            this.add.circle(gx, gy, Phaser.Math.Between(2, 4), 0x5a9a6e, 0.4)
                .setDepth(50);
        }

        ground.setDepth(0);
        border.setDepth(1);
    }

    update(time, delta) {
        if (!this.gameActive) return;

        this.inputManager.update();
        this.player.update(time, delta);

        for (const enemy of this.enemies.getChildren()) {
            if (enemy.active) {
                Enemy.update(enemy, this.player, delta);
            }
        }

        for (const proj of this.projectiles.getChildren()) {
            if (proj.active) {
                Projectile.update(this, proj, this.enemies);
            }
        }

        for (const gem of this.xpGems.getChildren()) {
            if (gem.active) {
                XPGem.update(gem, this.player);
            }
        }

        for (const orb of this.healthOrbs.getChildren()) {
            if (orb.active) {
                HealthOrb.update(orb, this.player);
            }
        }

        for (const wp of this.weaponPickups.getChildren()) {
            if (wp.active) {
                WeaponPickup.update(this, wp);
            }
        }
    }

    // --- Spawn methods ---
    spawnEnemy(x, y, type, hpMult, spdMult) {
        Enemy.spawn(this, this.enemies, x, y, type, hpMult, spdMult);
    }

    fireProjectile(x, y, angle, damage, mods, textureKey = 'projectile_arrow') {
        Projectile.fire(this, this.projectiles, x, y, angle, damage, mods, textureKey);
    }

    spawnXPGem(x, y, value) {
        XPGem.spawn(this, this.xpGems, x, y, value);
    }

    spawnHealthOrb(x, y) {
        HealthOrb.spawn(this, this.healthOrbs, x, y);
    }

    spawnWeaponPickup(x, y) {
        WeaponPickup.spawn(this, this.weaponPickups, x, y);
    }

    // --- Collisions ---
    onProjectileHitEnemy(projectile, enemy) {
        Projectile.onHitEnemy(this, projectile, enemy);
    }

    onPlayerHitEnemy(playerSprite, enemySprite) {
        if (!enemySprite.active || !enemySprite.enemyData) return;
        this.player.takeDamage(enemySprite.enemyData.damage, enemySprite.x, enemySprite.y);
    }

    onPlayerCollectGem(playerSprite, gemSprite) {
        XPGem.collect(this, gemSprite, this.player);
        this.score += 10;
    }

    onPlayerCollectHealth(playerSprite, orbSprite) {
        HealthOrb.collect(this, orbSprite, this.player);
    }

    onPlayerCollectWeapon(playerSprite, weaponSprite) {
        WeaponPickup.collect(this, weaponSprite, this.player);
    }

    enemyTakeDamage(enemySprite, damage, fromX, fromY) {
        return Enemy.takeDamage(this, enemySprite, damage, fromX, fromY);
    }

    // --- Skill Selection ---
    showSkillSelection() {
        this.gameActive = false;
        this.physics.pause();
        this.scene.get('UIScene').showSkillSelection(
            this.skillManager.getRandomSkills()
        );
    }

    onSkillSelected(skillId) {
        this.skillManager.selectSkill(skillId);
        this.particleManager.skillActivation(this.player.sprite.x, this.player.sprite.y);
        this.playSound('sfx_select');
        this.gameActive = true;
        this.physics.resume();
    }

    playSound(key) {
        try {
            if (this.cache.audio.exists(key)) {
                this.sound.play(key, { volume: 0.3 });
            }
        } catch (e) { }
    }

    gameOver() {
        this.gameActive = false;
        SaveManager.stopAutoSave(this);
        SaveManager.deleteSave(); // Game over = no save
        if (this.bgm) this.bgm.stop();
        this.scene.stop('UIScene');
        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.time.delayedCall(600, () => {
            this.scene.start('GameOverScene', {
                score: this.score,
                wave: this.waveManager.getWave(),
                kills: this.waveManager.totalKills,
                level: this.player.level,
            });
        });
    }

    loadSaveData() {
        const data = SaveManager.load();
        if (!data) return;

        console.log('[Load] Restoring save: Lv.', data.player.level, 'Wave', data.wave);

        // Restore player state
        const p = this.player;
        p.sprite.setPosition(data.player.x, data.player.y);
        p.hp = data.player.hp;
        p.maxHp = data.player.maxHp;
        p.level = data.player.level;
        p.xp = data.player.xp;
        p.xpToNext = data.player.xpToNext;
        p.critChance = data.player.critChance || 0;
        p.critMultiplier = data.player.critMultiplier || 1.5;
        p.freezeChance = data.player.freezeChance || 0;
        p.evolutionStage = data.player.evolutionStage || 0;
        p.currentSpriteKey = data.player.currentSpriteKey || 'cat';

        // Apply evolution sprite + animation
        p.sprite.setTexture(p.currentSpriteKey, 0);
        p.sprite.play(p.getAnimKey('idle'));

        // Restore shield
        if (data.player.shieldActive && data.player.shieldHits > 0) {
            p.activateShield(data.player.shieldHits);
        }

        // Restore wave
        this.waveManager.wave = data.wave;
        this.waveManager.totalKills = data.totalKills || 0;

        // Restore score
        this.score = data.score || 0;

        // Restore skills — apply effects first (this resets stats to base + skill modifiers)
        if (data.acquiredSkills) {
            this.skillManager.acquiredSkills = { ...data.acquiredSkills };
            this.skillManager.applySkillEffects();
        }

        // Re-apply level-based auto-boosts ON TOP of skill effects
        // (applySkillEffects calls resetStats which only has base values)
        p.damage = p.baseDamage * (1 + (p.level - 1) * 0.08);
        p.attackInterval = Math.max(200, p.baseAttackInterval * (1 - (p.level - 1) * 0.03));

        // Apply skill damage multiplier on top of level boost
        if (data.acquiredSkills?.DMG !== undefined) {
            const dmgLevel = SKILLS.DMG.levels[data.acquiredSkills.DMG];
            p.damage *= dmgLevel.multiplier;
        }
        // Apply skill attack speed on top of level boost
        if (data.acquiredSkills?.ATKSPD !== undefined) {
            const atkLevel = SKILLS.ATKSPD.levels[data.acquiredSkills.ATKSPD];
            p.attackInterval *= atkLevel.multiplier;
        }

        // Delay UI update to ensure UIScene is ready
        this.time.delayedCall(200, () => {
            this.events.emit('playerHPChanged', p.hp, p.maxHp);
            this.events.emit('xpChanged', p.xp, p.xpToNext, p.level);
            this.events.emit('waveStart', this.waveManager.wave);
        });
    }
}
