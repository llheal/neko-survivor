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
        this.loadingText = this.add.text(width / 2, height / 2 - 40, 'Loading...', {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#FFD700',
        }).setOrigin(0.5);

        // Progress bar background
        this.add.rectangle(width / 2, height / 2 + 10, 200, 16, 0x333333).setOrigin(0.5);

        // Progress bar fill
        this.barFill = this.add.rectangle(width / 2 - 100, height / 2 + 10, 0, 12, 0xFFD700)
            .setOrigin(0, 0.5);

        // Step 1: Generate sprites
        this.time.delayedCall(100, () => {
            this.barFill.width = 40;
            this.loadingText.setText('スプライト生成中...');

            this.time.delayedCall(100, () => {
                const spriteGen = new SpriteGenerator(this);
                spriteGen.generateAll();

                this.barFill.width = 120;
                this.loadingText.setText('サウンド生成中...');

                // Step 2: Generate sounds (loads via Phaser loader)
                this.time.delayedCall(100, () => {
                    const soundGen = new SoundGenerator(this);
                    soundGen.generateAll();

                    this.barFill.width = 180;
                    this.loadingText.setText('読み込み中...');

                    // Wait for all audio to finish loading
                    this.load.once('complete', () => {
                        this.onLoadComplete();
                    });

                    // If load is already complete (no pending), trigger manually
                    if (!this.load.isLoading()) {
                        this.time.delayedCall(200, () => {
                            this.onLoadComplete();
                        });
                    }
                });
            });
        });
    }

    onLoadComplete() {
        if (this._loadCompleted) return; // prevent double call
        this._loadCompleted = true;

        this.barFill.width = 200;
        this.loadingText.setText('準備完了！');

        this.time.delayedCall(300, () => {
            this.scene.start('TitleScene');
        });
    }
}
