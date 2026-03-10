// TitleScene.js - Animated title screen with Continue support
import { SaveManager } from '../systems/SaveManager.js';

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
        const titleShadow = this.add.text(width / 2 + 3, height * 0.18 + 3, 'NEKO\nROGUELIKE', {
            fontFamily: 'Arial Black, Arial',
            fontSize: '42px',
            fontStyle: 'bold',
            color: '#000000',
            align: 'center',
            lineSpacing: 5,
        }).setOrigin(0.5).setAlpha(0.3);

        const title = this.add.text(width / 2, height * 0.18, 'NEKO\nROGUELIKE', {
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
        const cat = this.add.sprite(width / 2, height * 0.42, 'cat', 0)
            .setScale(3);
        cat.play('cat_idle');

        // Cat bounce animation
        this.tweens.add({
            targets: cat,
            y: height * 0.42 - 10,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });

        // Shadow under cat
        const catShadow = this.add.image(width / 2, height * 0.42 + 40, 'shadow')
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
        this.add.text(width / 2, height * 0.56, '〜 ネコの冒険 〜', {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#AAAACC',
        }).setOrigin(0.5);

        // --- Check for save data ---
        const hasSave = SaveManager.hasSave();
        const saveInfo = hasSave ? SaveManager.getSaveInfo() : null;

        if (hasSave && saveInfo) {
            // --- Continue Button ---
            const continueY = height * 0.68;
            const continueBg = this.add.rectangle(width / 2, continueY, 220, 44, 0xe74c3c)
                .setInteractive({ useHandCursor: true })
                .setDepth(100);
            const continueText = this.add.text(width / 2, continueY, `▶ つづきから`, {
                fontFamily: 'Arial Black, Arial',
                fontSize: '18px',
                color: '#FFFFFF',
                stroke: '#000000',
                strokeThickness: 2,
            }).setOrigin(0.5).setDepth(101)
              .setInteractive({ useHandCursor: true });

            // Save info text
            this.add.text(width / 2, continueY + 28, `Lv.${saveInfo.level} / Wave ${saveInfo.wave} / ${saveInfo.score}pt`, {
                fontFamily: 'Arial',
                fontSize: '12px',
                color: '#AAAACC',
            }).setOrigin(0.5);

            // Pulse effect
            this.tweens.add({
                targets: [continueBg],
                scaleX: { from: 1, to: 1.03 },
                scaleY: { from: 1, to: 1.03 },
                duration: 800,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut',
            });

            const doContinue = () => {
                if (this.bgm) this.bgm.stop();
                this.cameras.main.fadeOut(300, 0, 0, 0);
                this.time.delayedCall(300, () => {
                    this.scene.start('GameScene', { loadSave: true });
                });
            };
            continueBg.on('pointerdown', doContinue);
            continueText.on('pointerdown', doContinue);

            // --- New Game Button ---
            const newGameY = height * 0.80;
            const newGameBg = this.add.rectangle(width / 2, newGameY, 180, 36, 0x333355)
                .setStrokeStyle(2, 0x555577)
                .setInteractive({ useHandCursor: true })
                .setDepth(100);
            const newGameText = this.add.text(width / 2, newGameY, 'はじめから', {
                fontFamily: 'Arial',
                fontSize: '15px',
                color: '#AAAACC',
            }).setOrigin(0.5).setDepth(101)
              .setInteractive({ useHandCursor: true });

            const doNewGame = () => {
                SaveManager.deleteSave();
                if (this.bgm) this.bgm.stop();
                this.cameras.main.fadeOut(300, 0, 0, 0);
                this.time.delayedCall(300, () => {
                    this.scene.start('GameScene', { loadSave: false });
                });
            };
            newGameBg.on('pointerdown', doNewGame);
            newGameText.on('pointerdown', doNewGame);

        } else {
            // --- No save: single TAP TO START ---
            const startText = this.add.text(width / 2, height * 0.74, 'TAP TO START', {
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

            this.input.once('pointerdown', () => {
                if (this.bgm) this.bgm.stop();
                this.cameras.main.fadeOut(300, 0, 0, 0);
                this.time.delayedCall(300, () => {
                    this.scene.start('GameScene', { loadSave: false });
                });
            });
        }

        // Controls hint
        this.add.text(width / 2, height * 0.92, 'ジョイスティックで移動 / 自動攻撃', {
            fontFamily: 'Arial',
            fontSize: '13px',
            color: '#888888',
        }).setOrigin(0.5);

        // Play title BGM
        try {
            if (this.cache.audio.exists('bgm_title')) {
                this.bgm = this.sound.add('bgm_title', { loop: true, volume: 0.4 });
                this.bgm.play();
            }
        } catch (e) { }

        // Fade in
        this.cameras.main.fadeIn(500, 0, 0, 0);
    }
}
