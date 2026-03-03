// Projectile.js - Object-pooled projectile with skill effects and multiple types
export class Projectile {
    static TRAIL_COLORS = {
        'projectile_arrow': 0x00ffff,
        'projectile_fire': 0xff8800,
        'projectile_ice': 0x88ddff,
        'projectile_star': 0xffd700,
        'projectile_lightning': 0xffdd00,
    };

    static fire(scene, group, x, y, angle, damage, mods = {}, textureKey = 'projectile_arrow') {
        const speed = 500;
        let sprite = group.getFirstDead(false);

        if (sprite) {
            sprite.setActive(true).setVisible(true);
            sprite.setPosition(x, y);
            sprite.setTexture(textureKey);
        } else {
            sprite = group.create(x, y, textureKey);
            if (!sprite) return null;
        }

        sprite.clearTint();
        sprite.setAlpha(1);
        sprite.setDepth(250);
        sprite.setScale(1.5);
        sprite.setRotation(angle + Math.PI / 2);
        sprite.body.setSize(12, 12);
        sprite.body.setEnable(true);

        // Apply color tint for extra glow effect
        const tintMap = {
            'projectile_arrow': 0xaaffff,
            'projectile_fire': 0xffcc66,
            'projectile_ice': 0xcceeFF,
            'projectile_star': 0xffffaa,
            'projectile_lightning': 0xffff88,
        };
        if (tintMap[textureKey]) {
            sprite.setTint(tintMap[textureKey]);
        }

        sprite.projectileData = {
            damage: damage,
            speed: speed,
            angle: angle,
            bounces: mods.bounces || 0,
            bouncesLeft: mods.bounces || 0,
            piercing: mods.piercing || 0,
            piercedCount: 0,
            homingStrength: mods.homingStrength || 0,
            hitEnemies: new Set(),
            lifetime: 3000,
            spawnTime: scene.time.now,
            textureKey: textureKey,
        };

        sprite.body.setVelocity(
            Math.cos(angle) * speed,
            Math.sin(angle) * speed
        );

        // Pulsing glow animation
        if (sprite.glowTween) sprite.glowTween.stop();
        sprite.glowTween = scene.tweens.add({
            targets: sprite,
            scaleX: { from: 1.5, to: 1.8 },
            scaleY: { from: 1.5, to: 1.8 },
            alpha: { from: 1, to: 0.7 },
            duration: 200,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });

        // Trail with color matching projectile
        const trailColor = Projectile.TRAIL_COLORS[textureKey] || 0x00ffff;
        if (sprite.trail) {
            sprite.trail.destroy();
        }
        sprite.trail = scene.particleManager.createTrail(x, y, trailColor);

        return sprite;
    }

    static update(scene, sprite, enemies) {
        if (!sprite.active || !sprite.projectileData) return;

        const data = sprite.projectileData;

        if (sprite.trail) {
            sprite.trail.setPosition(sprite.x, sprite.y);
        }

        // Homing
        if (data.homingStrength > 0) {
            const nearestEnemy = Projectile.findNearestEnemy(sprite, enemies);
            if (nearestEnemy) {
                const targetAngle = Phaser.Math.Angle.Between(
                    sprite.x, sprite.y,
                    nearestEnemy.x, nearestEnemy.y
                );

                let angleDiff = targetAngle - data.angle;
                while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
                while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

                data.angle += angleDiff * data.homingStrength * 3;

                sprite.body.setVelocity(
                    Math.cos(data.angle) * data.speed,
                    Math.sin(data.angle) * data.speed
                );
                sprite.setRotation(data.angle + Math.PI / 2);
            }
        }

        // Lifetime check
        if (scene.time.now - data.spawnTime > data.lifetime) {
            Projectile.deactivate(sprite);
            return;
        }

        // World bounds check (for bouncing)
        const cam = scene.cameras.main;
        const bounds = {
            left: cam.scrollX - 50,
            right: cam.scrollX + cam.width + 50,
            top: cam.scrollY - 50,
            bottom: cam.scrollY + cam.height + 50,
        };

        if (data.bouncesLeft > 0) {
            if (sprite.x <= bounds.left || sprite.x >= bounds.right) {
                sprite.body.velocity.x *= -1;
                data.angle = Math.atan2(sprite.body.velocity.y, sprite.body.velocity.x);
                sprite.setRotation(data.angle + Math.PI / 2);
                data.bouncesLeft--;
            }
            if (sprite.y <= bounds.top || sprite.y >= bounds.bottom) {
                sprite.body.velocity.y *= -1;
                data.angle = Math.atan2(sprite.body.velocity.y, sprite.body.velocity.x);
                sprite.setRotation(data.angle + Math.PI / 2);
                data.bouncesLeft--;
            }
        } else {
            if (sprite.x < bounds.left || sprite.x > bounds.right ||
                sprite.y < bounds.top || sprite.y > bounds.bottom) {
                Projectile.deactivate(sprite);
            }
        }
    }

    static findNearestEnemy(sprite, enemies) {
        let nearest = null;
        let nearestDist = Infinity;

        for (const enemy of enemies.getChildren()) {
            if (!enemy.active) continue;
            const dist = Phaser.Math.Distance.Between(
                sprite.x, sprite.y, enemy.x, enemy.y
            );
            if (dist < nearestDist) {
                nearestDist = dist;
                nearest = enemy;
            }
        }

        return nearest;
    }

    static onHitEnemy(scene, sprite, enemySprite) {
        if (!sprite.active || !sprite.projectileData) return;
        if (!enemySprite.active || !enemySprite.enemyData) return;

        const data = sprite.projectileData;

        if (data.hitEnemies.has(enemySprite)) return;
        data.hitEnemies.add(enemySprite);

        // Impact particles with matching color
        const impactColor = Projectile.TRAIL_COLORS[data.textureKey] || 0x00ffff;
        scene.particleManager.impact(sprite.x, sprite.y, impactColor);

        // Deal damage
        scene.enemyTakeDamage(enemySprite, data.damage, sprite.x, sprite.y);

        // Piercing check
        if (data.piercedCount < data.piercing) {
            data.piercedCount++;
        } else {
            Projectile.deactivate(sprite);
        }
    }

    static deactivate(sprite) {
        sprite.setActive(false).setVisible(false);
        if (sprite.body) {
            sprite.body.setVelocity(0, 0);
            sprite.body.setEnable(false);
        }
        if (sprite.trail) {
            sprite.trail.stop();
        }
        if (sprite.glowTween) {
            sprite.glowTween.stop();
            sprite.glowTween = null;
        }
    }
}
