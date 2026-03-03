// Player.js - Cat player entity with attack animation and evolution
export class Player {
    constructor(scene, x, y) {
        this.scene = scene;

        // Base stats
        this.baseSpeed = 180;
        this.baseAttackInterval = 600;
        this.baseDamage = 10;
        this.baseMaxHp = 100;

        // Current stats
        this.speed = this.baseSpeed;
        this.attackInterval = this.baseAttackInterval;
        this.damage = this.baseDamage;
        this.maxHp = this.baseMaxHp;
        this.hp = this.maxHp;

        // XP / leveling
        this.xp = 0;
        this.level = 1;
        this.xpToNext = 20;

        // Evolution tracking
        this.currentSpriteKey = 'cat';
        this.evolutionStage = 0;

        // State
        this.isInvincible = false;
        this.invincibilityDuration = 1000;
        this.lastAttackTime = 0;
        this.isAlive = true;
        this.isAttacking = false;

        // Temporary weapon
        this.tempWeapon = null;
        this.tempWeaponTimer = null;

        // Shield (from skill)
        this.shieldActive = false;
        this.shieldHits = 0;
        this.shieldSprite = null;

        // Critical hit
        this.critChance = 0;
        this.critMultiplier = 1.5;

        // Freeze chance
        this.freezeChance = 0;

        // Shadow
        this.shadow = scene.add.image(x, y + 18, 'shadow')
            .setDepth(99)
            .setScale(0.8);

        // Sprite
        this.sprite = scene.physics.add.sprite(x, y, 'cat', 0)
            .setDepth(200)
            .setScale(1.2)
            .setCollideWorldBounds(false);

        this.sprite.body.setSize(20, 24);
        this.sprite.body.setOffset(14, 16);
        this.sprite.play('cat_idle');

        this.sprite.parentEntity = this;
    }

    resetStats() {
        this.speed = this.baseSpeed;
        this.attackInterval = this.baseAttackInterval;
        this.damage = this.baseDamage;
        this.maxHp = this.baseMaxHp;
        this.critChance = 0;
        this.freezeChance = 0;
    }

    // --- Evolution: change cat appearance at certain levels ---
    checkEvolution() {
        let newKey = 'cat';
        let newStage = 0;

        if (this.level >= 15) {
            newKey = 'cat_evo3';
            newStage = 3;
        } else if (this.level >= 10) {
            newKey = 'cat_evo2';
            newStage = 2;
        } else if (this.level >= 5) {
            newKey = 'cat_evo1';
            newStage = 1;
        }

        if (newStage !== this.evolutionStage) {
            this.evolutionStage = newStage;
            this.currentSpriteKey = newKey;
            this.sprite.setTexture(newKey, 0);

            // Evolution effect
            this.scene.particleManager.skillActivation(this.sprite.x, this.sprite.y);
            this.scene.juiceManager.scalePop(this.sprite, 1.8, 500);
            this.scene.juiceManager.waveAnnouncement(
                newStage === 1 ? '進化！ ブルーネコ！' :
                    newStage === 2 ? '進化！ レッドネコ！' :
                        '最終進化！ パープルネコ！'
            );
        }
    }

    getAnimKey(type) {
        if (this.currentSpriteKey === 'cat') return `cat_${type}`;
        return `${this.currentSpriteKey}_${type}`;
    }

    update(time, delta) {
        if (!this.isAlive) return;

        const input = this.scene.inputManager;
        const dir = input.getDirection();
        const mag = input.getMagnitude();

        // Movement
        if (mag > 0.1) {
            this.sprite.body.setVelocity(
                dir.x * this.speed * mag,
                dir.y * this.speed * mag
            );
            if (!this.isAttacking) {
                this.sprite.play(this.getAnimKey('walk'), true);
            }
            if (dir.x < -0.1) this.sprite.setFlipX(true);
            else if (dir.x > 0.1) this.sprite.setFlipX(false);
        } else {
            this.sprite.body.setVelocity(0, 0);
            if (!this.isAttacking) {
                this.sprite.play(this.getAnimKey('idle'), true);
            }
        }

        // Shadow
        this.shadow.setPosition(this.sprite.x, this.sprite.y + 18);

        // Shield sprite position
        if (this.shieldSprite) {
            this.shieldSprite.setPosition(this.sprite.x, this.sprite.y);
        }

        // Auto-attack
        if (time - this.lastAttackTime > this.attackInterval) {
            this.autoAttack(time);
        }

        // Invincibility blink
        if (this.isInvincible) {
            this.sprite.setAlpha(Math.sin(time * 0.02) > 0 ? 1 : 0.3);
        }
    }

    autoAttack(time) {
        const enemies = this.scene.enemies.getChildren().filter(e => e.active);
        if (enemies.length === 0) return;

        let nearest = null;
        let nearestDist = Infinity;

        for (const enemy of enemies) {
            const dist = Phaser.Math.Distance.Between(
                this.sprite.x, this.sprite.y, enemy.x, enemy.y
            );
            if (dist < nearestDist && dist < 400) {
                nearestDist = dist;
                nearest = enemy;
            }
        }

        if (!nearest) return;

        this.lastAttackTime = time;

        // Play attack animation
        this.isAttacking = true;
        this.sprite.play(this.getAnimKey('attack'), true);
        this.sprite.once('animationcomplete', () => {
            this.isAttacking = false;
        });

        // Get skill modifiers
        const mods = this.scene.skillManager.getProjectileModifiers();

        // Temp weapon overrides
        let projectileType = 'projectile_arrow';
        let dmg = this.damage;
        let extraMods = { ...mods };

        if (this.tempWeapon) {
            switch (this.tempWeapon) {
                case 'gatling':
                    dmg *= 0.5;
                    extraMods.extraShots = (extraMods.extraShots || 0) + 4;
                    projectileType = 'projectile_fire';
                    break;
                case 'laser':
                    dmg *= 2;
                    extraMods.piercing = (extraMods.piercing || 0) + 5;
                    projectileType = 'projectile_lightning';
                    break;
                case 'bomb':
                    dmg *= 3;
                    projectileType = 'projectile_fire';
                    break;
                case 'freeze':
                    extraMods.extraShots = (extraMods.extraShots || 0) + 2;
                    projectileType = 'projectile_ice';
                    break;
            }
        }

        // Critical hit
        if (this.critChance > 0 && Math.random() < this.critChance) {
            dmg *= this.critMultiplier;
            this.scene.juiceManager.damageNumber(
                this.sprite.x, this.sprite.y - 20, 'CRIT!', '#FFD700'
            );
        }

        const angle = Phaser.Math.Angle.Between(
            this.sprite.x, this.sprite.y, nearest.x, nearest.y
        );

        // Base shots increase with level (every 2 levels = +1 shot)
        const levelShots = Math.floor(this.level / 2);
        const totalShots = 1 + levelShots + (extraMods.extraShots || 0);
        const spreadAngle = totalShots > 1 ? Math.min(Math.PI * 0.8, 0.12 * totalShots) : 0;

        for (let i = 0; i < totalShots; i++) {
            let shotAngle = angle;
            if (totalShots > 1) {
                shotAngle = angle - spreadAngle / 2 + (spreadAngle * i / (totalShots - 1));
            }
            this.scene.fireProjectile(
                this.sprite.x,
                this.sprite.y - 5,
                shotAngle,
                dmg,
                extraMods,
                projectileType
            );
        }

        this.scene.playSound('sfx_shoot');
    }

    takeDamage(amount, fromX, fromY) {
        if (this.isInvincible || !this.isAlive) return;

        // Shield check
        if (this.shieldActive && this.shieldHits > 0) {
            this.shieldHits--;
            // FIX: Don't call flash() on Arc/Circle - use alpha tween instead
            if (this.shieldSprite) {
                this.scene.tweens.add({
                    targets: this.shieldSprite,
                    alpha: { from: 0.8, to: 0.2 },
                    duration: 150,
                    ease: 'Power2',
                });
            }
            this.scene.juiceManager.damageNumber(
                this.sprite.x, this.sprite.y, 'BLOCKED!', '#4488FF'
            );
            this.scene.playSound('sfx_hit');
            if (this.shieldHits <= 0) {
                this.removeShield();
            }
            // Brief invincibility after shield block to prevent multi-hit
            this.isInvincible = true;
            this.scene.time.delayedCall(500, () => {
                this.isInvincible = false;
                if (this.sprite && this.sprite.active) {
                    this.sprite.setAlpha(1);
                }
            });
            return;
        }

        this.hp -= amount;
        this.scene.juiceManager.flash(this.sprite, 0xff0000);
        this.scene.juiceManager.knockback(this.sprite, fromX, fromY, 150);
        this.scene.juiceManager.shake(0.008, 150);
        this.scene.juiceManager.damageNumber(this.sprite.x, this.sprite.y, amount, '#FF4444');
        this.scene.particleManager.playerHit(this.sprite.x, this.sprite.y);
        this.scene.playSound('sfx_hit');

        this.isInvincible = true;
        this.scene.time.delayedCall(this.invincibilityDuration, () => {
            this.isInvincible = false;
            if (this.sprite && this.sprite.active) {
                this.sprite.setAlpha(1);
            }
        });

        this.scene.events.emit('playerHPChanged', this.hp, this.maxHp);

        if (this.hp <= 0) {
            this.die();
        }
    }

    addXP(amount) {
        this.xp += amount;
        this.scene.events.emit('xpChanged', this.xp, this.xpToNext, this.level);

        while (this.xp >= this.xpToNext) {
            this.xp -= this.xpToNext;
            this.levelUp();
        }
    }

    levelUp() {
        this.level++;
        this.xpToNext = Math.floor(20 + this.level * 10 * 1.2);

        // Auto stat boosts per level
        this.damage = this.baseDamage * (1 + (this.level - 1) * 0.08);
        this.attackInterval = Math.max(200, this.baseAttackInterval * (1 - (this.level - 1) * 0.03));

        this.scene.particleManager.levelUp(this.sprite.x, this.sprite.y);
        this.scene.playSound('sfx_levelup');
        this.scene.juiceManager.scalePop(this.sprite, 1.5, 300);

        // Check evolution
        this.checkEvolution();

        this.scene.events.emit('levelUp', this.level);
        this.scene.events.emit('xpChanged', this.xp, this.xpToNext, this.level);
    }

    // --- Shield skill ---
    activateShield(hits) {
        this.shieldActive = true;
        this.shieldHits = hits;
        if (!this.shieldSprite) {
            this.shieldSprite = this.scene.add.circle(
                this.sprite.x, this.sprite.y, 28, 0x4488ff, 0.2
            ).setDepth(201).setStrokeStyle(2, 0x4488ff, 0.6);
        } else {
            this.shieldSprite.setVisible(true).setAlpha(0.2);
        }
    }

    removeShield() {
        this.shieldActive = false;
        if (this.shieldSprite) {
            this.shieldSprite.setVisible(false);
        }
    }

    // --- Temp weapon ---
    setTempWeapon(type, duration) {
        this.tempWeapon = type;
        if (this.tempWeaponTimer) {
            this.tempWeaponTimer.destroy();
        }
        this.tempWeaponTimer = this.scene.time.delayedCall(duration, () => {
            this.tempWeapon = null;
            this.tempWeaponTimer = null;
            this.scene.events.emit('tempWeaponExpired');
        });
        this.scene.events.emit('tempWeaponActive', type, duration);
    }

    die() {
        this.isAlive = false;
        this.sprite.body.setVelocity(0, 0);
        this.scene.cameras.main.shake(300, 0.02);

        this.scene.tweens.add({
            targets: this.sprite,
            alpha: 0,
            scaleX: 0,
            scaleY: 0,
            rotation: Math.PI * 2,
            duration: 800,
            ease: 'Power2',
            onComplete: () => {
                this.scene.time.delayedCall(500, () => {
                    this.scene.gameOver();
                });
            },
        });
    }

    getPosition() {
        return { x: this.sprite.x, y: this.sprite.y };
    }

    heal(amount) {
        this.hp = Math.min(this.hp + amount, this.maxHp);
        this.scene.events.emit('playerHPChanged', this.hp, this.maxHp);
        this.scene.juiceManager.damageNumber(this.sprite.x, this.sprite.y, `+${amount}`, '#44FF44');
    }
}
