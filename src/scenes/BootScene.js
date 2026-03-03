// BootScene.js - Generates all sprites and sounds, shows loading
import { SpriteGenerator } from '../utils/SpriteGenerator.js';
import { SoundGenerator } from '../utils/SoundGenerator.js';

export class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    create() {
        const { width, height } = this.scale;

        // Background
        this.cameras.main.setBackgroundColor('#1a1a2e');

        // Loading text
        const loadingText = this.add.text(width / 2, height / 2 - 40, 'Loading...', {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#FFD700',
        }).setOrigin(0.5);

        // Progress bar background
        const barBg = this.add.rectangle(width / 2, height / 2 + 10, 200, 16, 0x333333)
            .setOrigin(0.5);

        // Progress bar fill
        const barFill = this.add.rectangle(width / 2 - 100, height / 2 + 10, 0, 12, 0xFFD700)
            .setOrigin(0, 0.5);

        // Generate assets with simulated progress
        this.time.delayedCall(100, () => {
            barFill.width = 40;
            loadingText.setText('スプライト生成中...');

            this.time.delayedCall(100, () => {
                const spriteGen = new SpriteGenerator(this);
                spriteGen.generateAll();

                barFill.width = 140;
                loadingText.setText('サウンド生成中...');

                this.time.delayedCall(100, () => {
                    const soundGen = new SoundGenerator(this);
                    soundGen.generateAll();

                    barFill.width = 200;
                    loadingText.setText('準備完了！');

                    this.time.delayedCall(300, () => {
                        this.scene.start('TitleScene');
                    });
                });
            });
        });
    }
}
