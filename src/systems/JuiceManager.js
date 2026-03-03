// JuiceManager.js - Screen shake, hit-stop, damage numbers, and flash effects
export class JuiceManager {
    constructor(scene) {
        this.scene = scene;
        this.isHitStopping = false;
    }

    // Screen shake
    shake(intensity = 0.005, duration = 100) {
        this.scene.cameras.main.shake(duration, intensity);
    }

    // Hit stop - brief game pause
    hitStop(duration = 50) {
        if (this.isHitStopping) return;
        this.isHitStopping = true;

        this.scene.physics.world.timeScale = 10;
        this.scene.time.timeScale = 0.1;

        this.scene.time.addEvent({
            delay: duration,
            callback: () => {
                this.scene.physics.world.timeScale = 1;
                this.scene.time.timeScale = 1;
                this.isHitStopping = false;
            },
            callbackScope: this,
        });
    }

    // Floating damage number
    damageNumber(x, y, amount, color = '#FFFFFF') {
        const text = this.scene.add.text(x, y - 10, Math.round(amount).toString(), {
            fontFamily: 'Arial Black, Arial',
            fontSize: amount >= 20 ? '18px' : '14px',
            fontStyle: 'bold',
            color: color,
            stroke: '#000000',
            strokeThickness: 3,
        }).setOrigin(0.5).setDepth(500);

        // Random offset
        const offsetX = Phaser.Math.Between(-15, 15);

        this.scene.tweens.add({
            targets: text,
            y: y - 50,
            x: x + offsetX,
            alpha: 0,
            scale: { from: 1.2, to: 0.6 },
            duration: 800,
            ease: 'Power2',
            onComplete: () => text.destroy(),
        });
    }

    // Sprite flash (damage indicator)
    flash(sprite, color = 0xff0000, duration = 100) {
        if (!sprite || !sprite.active) return;
        sprite.setTintFill(color);
        this.scene.time.delayedCall(duration, () => {
            if (sprite && sprite.active) {
                sprite.clearTint();
            }
        });
    }

    // Knockback effect
    knockback(sprite, fromX, fromY, force = 200) {
        if (!sprite || !sprite.body) return;
        const angle = Phaser.Math.Angle.Between(fromX, fromY, sprite.x, sprite.y);
        sprite.body.setVelocity(
            Math.cos(angle) * force,
            Math.sin(angle) * force
        );

        // Reset velocity after brief moment
        this.scene.time.delayedCall(150, () => {
            if (sprite && sprite.body) {
                sprite.body.setVelocity(0, 0);
            }
        });
    }

    // Scale pop (for pickups, level up)
    scalePop(sprite, scale = 1.3, duration = 200) {
        if (!sprite || !sprite.active) return;
        this.scene.tweens.add({
            targets: sprite,
            scaleX: scale,
            scaleY: scale,
            duration: duration / 2,
            yoyo: true,
            ease: 'Bounce.easeOut',
        });
    }

    // Wave announcement text
    waveAnnouncement(text) {
        const cam = this.scene.cameras.main;
        const announcement = this.scene.add.text(
            cam.scrollX + cam.width / 2,
            cam.scrollY + cam.height / 3,
            text,
            {
                fontFamily: 'Arial Black, Arial',
                fontSize: '36px',
                fontStyle: 'bold',
                color: '#FFD700',
                stroke: '#000000',
                strokeThickness: 6,
            }
        ).setOrigin(0.5).setDepth(600).setScrollFactor(0);

        // Position at center of screen
        announcement.setPosition(cam.width / 2, cam.height / 3);

        this.scene.tweens.add({
            targets: announcement,
            scaleX: { from: 2, to: 1 },
            scaleY: { from: 2, to: 1 },
            alpha: { from: 0, to: 1 },
            duration: 300,
            ease: 'Back.easeOut',
            onComplete: () => {
                this.scene.tweens.add({
                    targets: announcement,
                    alpha: 0,
                    y: announcement.y - 30,
                    delay: 1000,
                    duration: 500,
                    onComplete: () => announcement.destroy(),
                });
            },
        });
    }
}
