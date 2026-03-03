// XPGem.js - Collectible XP drop with magnetic attraction
export class XPGem {
    static spawn(scene, group, x, y, value) {
        let sprite = group.getFirstDead(false);

        // Determine size based on value
        let textureKey = 'xp_small';
        if (value >= 15) textureKey = 'xp_large';
        else if (value >= 5) textureKey = 'xp_medium';

        if (sprite) {
            sprite.setActive(true).setVisible(true);
            sprite.setPosition(x, y);
            sprite.setTexture(textureKey);
        } else {
            sprite = group.create(x, y, textureKey);
            if (!sprite) return null;
        }

        sprite.setDepth(150);
        sprite.setScale(1);
        sprite.body.setSize(8, 8);

        sprite.gemData = {
            value: value,
            magnetRange: 80,
            magnetSpeed: 300,
            isMagneting: false,
        };

        // Spawn animation: pop out
        sprite.setScale(0);
        scene.tweens.add({
            targets: sprite,
            scaleX: 1,
            scaleY: 1,
            duration: 200,
            ease: 'Back.easeOut',
        });

        // Slight scatter
        sprite.body.setVelocity(
            Phaser.Math.Between(-80, 80),
            Phaser.Math.Between(-80, 80)
        );
        sprite.body.setDrag(200);

        return sprite;
    }

    static update(sprite, player) {
        if (!sprite.active || !sprite.gemData || !player.isAlive) return;

        const dist = Phaser.Math.Distance.Between(
            sprite.x, sprite.y,
            player.sprite.x, player.sprite.y
        );

        // Magnetic attraction
        if (dist < sprite.gemData.magnetRange) {
            sprite.gemData.isMagneting = true;
            const angle = Phaser.Math.Angle.Between(
                sprite.x, sprite.y,
                player.sprite.x, player.sprite.y
            );

            const speed = sprite.gemData.magnetSpeed * (1 - dist / sprite.gemData.magnetRange) + 100;
            sprite.body.setVelocity(
                Math.cos(angle) * speed,
                Math.sin(angle) * speed
            );
        }
    }

    static collect(scene, sprite, player) {
        if (!sprite.active || !sprite.gemData) return;

        const value = sprite.gemData.value;
        player.addXP(value);

        // Effects
        scene.particleManager.collect(sprite.x, sprite.y, 0x00ff88);
        scene.playSound('sfx_pickup');

        // Deactivate
        sprite.setActive(false).setVisible(false);
        sprite.body.setVelocity(0, 0);
    }
}

// HealthOrb - collectible health drop
export class HealthOrb {
    static spawn(scene, group, x, y) {
        let sprite = group.getFirstDead(false);

        if (sprite) {
            sprite.setActive(true).setVisible(true);
            sprite.setPosition(x, y);
        } else {
            sprite = group.create(x, y, 'health_orb');
            if (!sprite) return null;
        }

        sprite.setDepth(150);
        sprite.setScale(1.2);
        sprite.body.setSize(12, 12);

        sprite.orbData = {
            healAmount: 15,
            magnetRange: 60,
        };

        // Pulsing animation
        scene.tweens.add({
            targets: sprite,
            scaleX: 1.5,
            scaleY: 1.5,
            duration: 500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });

        // Scatter
        sprite.body.setVelocity(
            Phaser.Math.Between(-50, 50),
            Phaser.Math.Between(-50, 50)
        );
        sprite.body.setDrag(150);

        return sprite;
    }

    static update(sprite, player) {
        if (!sprite.active || !sprite.orbData || !player.isAlive) return;

        const dist = Phaser.Math.Distance.Between(
            sprite.x, sprite.y,
            player.sprite.x, player.sprite.y
        );

        if (dist < sprite.orbData.magnetRange) {
            const angle = Phaser.Math.Angle.Between(
                sprite.x, sprite.y,
                player.sprite.x, player.sprite.y
            );
            sprite.body.setVelocity(
                Math.cos(angle) * 200,
                Math.sin(angle) * 200
            );
        }
    }

    static collect(scene, sprite, player) {
        if (!sprite.active || !sprite.orbData) return;

        player.heal(sprite.orbData.healAmount);
        scene.particleManager.collect(sprite.x, sprite.y, 0xff3366);
        scene.playSound('sfx_pickup');

        sprite.setActive(false).setVisible(false);
        sprite.body.setVelocity(0, 0);
        scene.tweens.killTweensOf(sprite);
    }
}
