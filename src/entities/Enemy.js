// Enemy.js - Bear enemy entity (bugs fixed: clear tint on spawn, reduced hit-stop)
const ENEMY_CONFIGS = {
    bear_brown: {
        hp: 30,
        speed: 60,
        damage: 10,
        xpValue: 5,
        color: 0x8B4513,
        size: { w: 24, h: 28 },
    },
    bear_polar: {
        hp: 50,
        speed: 45,
        damage: 15,
        xpValue: 10,
        color: 0xE0E8F0,
        size: { w: 26, h: 30 },
    },
    bear_panda: {
        hp: 80,
        speed: 35,
        damage: 20,
        xpValue: 20,
        color: 0x333333,
        size: { w: 28, h: 32 },
    },
};

export class Enemy {
    static configs = ENEMY_CONFIGS;

    static spawn(scene, group, x, y, type, hpMult = 1, spdMult = 1) {
        const config = ENEMY_CONFIGS[type];
        if (!config) return null;

        let sprite = group.getFirstDead(false);

        if (sprite) {
            sprite.setActive(true).setVisible(true);
            sprite.setPosition(x, y);
            sprite.setTexture(type, 0);
        } else {
            sprite = group.create(x, y, type, 0);
        }

        if (!sprite) return null;

        // FIX: Clear any leftover tint from previous damage flash
        sprite.clearTint();
        sprite.setAlpha(1);
        sprite.setScale(type === 'bear_panda' ? 1.3 : type === 'bear_polar' ? 1.15 : 1);
        sprite.setRotation(0);
        sprite.setFlipX(false);

        sprite.setDepth(200);
        sprite.body.setSize(config.size.w, config.size.h);
        sprite.body.setOffset(
            (48 - config.size.w) / 2,
            (48 - config.size.h) / 2 + 4
        );
        sprite.body.setEnable(true);

        sprite.enemyData = {
            type: type,
            hp: config.hp * hpMult,
            maxHp: config.hp * hpMult,
            speed: config.speed * spdMult,
            damage: config.damage,
            xpValue: config.xpValue,
            color: config.color,
        };

        sprite.play(`${type}_walk`, true);

        // Shadow
        if (!sprite.shadow) {
            sprite.shadow = scene.add.image(x, y + 20, 'shadow')
                .setDepth(99)
                .setScale(0.9)
                .setAlpha(0.3);
        } else {
            sprite.shadow.setPosition(x, y + 20).setVisible(true).setAlpha(0.3);
        }

        return sprite;
    }

    static update(sprite, player, delta) {
        if (!sprite.active || !sprite.enemyData) return;

        const data = sprite.enemyData;
        const px = player.sprite.x;
        const py = player.sprite.y;

        const angle = Phaser.Math.Angle.Between(sprite.x, sprite.y, px, py);
        sprite.body.setVelocity(
            Math.cos(angle) * data.speed,
            Math.sin(angle) * data.speed
        );

        if (px < sprite.x) sprite.setFlipX(true);
        else sprite.setFlipX(false);

        if (sprite.shadow) {
            sprite.shadow.setPosition(sprite.x, sprite.y + 20);
        }
    }

    static takeDamage(scene, sprite, damage, fromX, fromY) {
        if (!sprite.active || !sprite.enemyData) return false;

        const data = sprite.enemyData;
        data.hp -= damage;

        // Flash RED for damage (not white!)
        scene.juiceManager.flash(sprite, 0xff0000, 80);
        scene.juiceManager.knockback(sprite, fromX, fromY, 120);
        scene.juiceManager.damageNumber(sprite.x, sprite.y - 10, damage, '#FFFFFF');
        scene.particleManager.impact(sprite.x, sprite.y, 0x00ffff);

        if (data.hp <= 0) {
            Enemy.kill(scene, sprite);
            return true;
        }
        return false;
    }

    static kill(scene, sprite) {
        const data = sprite.enemyData;

        // Effects
        scene.particleManager.enemyDeath(sprite.x, sprite.y, data.color);
        // FIX: No hit-stop on regular kills - only slight shake for feel
        scene.juiceManager.shake(0.003, 60);
        scene.playSound('sfx_enemyDeath');

        // Drop XP gems
        const gemCount = Phaser.Math.Between(2, 5);
        for (let i = 0; i < gemCount; i++) {
            const ox = Phaser.Math.Between(-20, 20);
            const oy = Phaser.Math.Between(-20, 20);
            scene.spawnXPGem(
                sprite.x + ox,
                sprite.y + oy,
                Math.ceil(data.xpValue / gemCount)
            );
        }

        // Chance to drop health
        if (Math.random() < 0.08) {
            scene.spawnHealthOrb(sprite.x, sprite.y);
        }

        // Chance to drop weapon pickup
        if (Math.random() < 0.04) {
            scene.spawnWeaponPickup(sprite.x, sprite.y);
        }

        // FIX: Clear tint before deactivating so pooled sprites come back clean
        sprite.clearTint();
        sprite.setAlpha(1);
        sprite.setActive(false).setVisible(false);
        sprite.body.setVelocity(0, 0);
        sprite.body.setEnable(false);
        if (sprite.shadow) {
            sprite.shadow.setVisible(false);
        }

        scene.waveManager.onEnemyKilled();
    }
}
