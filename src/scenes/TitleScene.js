// TitleScene.js - Animated title screen
export class TitleScene extends Phaser.Scene {
    constructor() {
        super({ key: 'TitleScene' });
    }

    create() {
        const { width, height } = this.scale;
        this.cameras.main.setBackgroundColor('#1a1a2e');

        // Background gradient overlay
        const gradient = this.add.graphics();
        gradient.fillGradientStyle(0x16213e, 0x16213e, 0x0f3460, 0x0f3460, 1);
        gradient.fillRect(0, 0, width, height);

        // Floating particles in background
        for (let i = 0; i < 20; i++) {
            const star = this.add.circle(
                Phaser.Math.Between(0, width),
                Phaser.Math.Between(0, height),
                Phaser.Math.Between(1, 3),
                0xFFD700,
                Phaser.Math.FloatBetween(0.2, 0.6)
            );

            this.tweens.add({
                targets: star,
                y: star.y - 50,
                alpha: 0,
                duration: Phaser.Math.Between(2000, 4000),
                repeat: -1,
                yoyo: true,
                ease: 'Sine.easeInOut',
                delay: Phaser.Math.Between(0, 2000),
            });
        }

        // Title
        const titleShadow = this.add.text(width / 2 + 3, height * 0.22 + 3, 'NEKO\nROGUELIKE', {
            fontFamily: 'Arial Black, Arial',
            fontSize: '42px',
            fontStyle: 'bold',
            color: '#000000',
            align: 'center',
            lineSpacing: 5,
        }).setOrigin(0.5).setAlpha(0.3);

        const title = this.add.text(width / 2, height * 0.22, 'NEKO\nROGUELIKE', {
            fontFamily: 'Arial Black, Arial',
            fontSize: '42px',
            fontStyle: 'bold',
            color: '#FFD700',
            align: 'center',
            lineSpacing: 5,
            stroke: '#B8860B',
            strokeThickness: 4,
        }).setOrigin(0.5);

        // Title glow animation
        this.tweens.add({
            targets: title,
            scaleX: { from: 0.95, to: 1.05 },
            scaleY: { from: 0.95, to: 1.05 },
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });

        // Cat character
        const cat = this.add.sprite(width / 2, height * 0.50, 'cat', 0)
            .setScale(3);
        cat.play('cat_idle');

        // Cat bounce animation
        this.tweens.add({
            targets: cat,
            y: height * 0.50 - 10,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });

        // Shadow under cat
        const catShadow = this.add.image(width / 2, height * 0.50 + 40, 'shadow')
            .setScale(2);
        this.tweens.add({
            targets: catShadow,
            scaleX: { from: 1.8, to: 2.2 },
            scaleY: { from: 1.6, to: 2 },
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });

        // Subtitle
        this.add.text(width / 2, height * 0.64, '〜 ネコの冒険 〜', {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#AAAACC',
        }).setOrigin(0.5);

        // Tap to start (blinking)
        const startText = this.add.text(width / 2, height * 0.78, 'TAP TO START', {
            fontFamily: 'Arial Black, Arial',
            fontSize: '22px',
            color: '#FFFFFF',
            stroke: '#333333',
            strokeThickness: 3,
        }).setOrigin(0.5);

        this.tweens.add({
            targets: startText,
            alpha: 0.3,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });

        // Controls hint
        this.add.text(width / 2, height * 0.88, 'ジョイスティックで移動 / 自動攻撃', {
            fontFamily: 'Arial',
            fontSize: '13px',
            color: '#888888',
        }).setOrigin(0.5);

        // Start game on tap
        this.input.once('pointerdown', () => {
            this.cameras.main.fadeOut(300, 0, 0, 0);
            this.time.delayedCall(300, () => {
                this.scene.start('GameScene');
            });
        });

        // Fade in
        this.cameras.main.fadeIn(500, 0, 0, 0);
    }
}
