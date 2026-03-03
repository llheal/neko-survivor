// GameOverScene.js - Score display and retry
export class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    init(data) {
        this.finalScore = data.score || 0;
        this.finalWave = data.wave || 1;
        this.finalKills = data.kills || 0;
        this.finalLevel = data.level || 1;
    }

    create() {
        const { width, height } = this.scale;
        this.cameras.main.setBackgroundColor('#1a1a2e');

        // Background gradient
        const gradient = this.add.graphics();
        gradient.fillGradientStyle(0x16213e, 0x16213e, 0x0f3460, 0x0f3460, 1);
        gradient.fillRect(0, 0, width, height);

        // Game Over title
        const title = this.add.text(width / 2, height * 0.15, 'GAME OVER', {
            fontFamily: 'Arial Black, Arial',
            fontSize: '38px',
            fontStyle: 'bold',
            color: '#FF4444',
            stroke: '#000000',
            strokeThickness: 6,
        }).setOrigin(0.5);

        // Animate title
        title.setScale(0);
        this.tweens.add({
            targets: title,
            scaleX: 1,
            scaleY: 1,
            duration: 500,
            ease: 'Back.easeOut',
        });

        // Cat sprite (defeated)
        const cat = this.add.sprite(width / 2, height * 0.32, 'cat', 0)
            .setScale(2.5)
            .setAlpha(0.5)
            .setTint(0x888888);

        // Stats panel
        const panelY = height * 0.48;
        const panelBg = this.add.rectangle(width / 2, panelY, width * 0.75, 160, 0x111133, 0.9)
            .setStrokeStyle(2, 0x4444aa);

        const stats = [
            { label: 'スコア', value: this.finalScore.toLocaleString(), color: '#FFD700' },
            { label: 'ウェーブ', value: `Wave ${this.finalWave}`, color: '#44AAFF' },
            { label: 'キル数', value: this.finalKills.toString(), color: '#FF6644' },
            { label: 'レベル', value: `Lv.${this.finalLevel}`, color: '#44FF88' },
        ];

        stats.forEach((stat, i) => {
            const sy = panelY - 55 + i * 35;

            this.add.text(width * 0.3, sy, stat.label, {
                fontFamily: 'Arial',
                fontSize: '15px',
                color: '#AAAACC',
            }).setOrigin(0, 0.5);

            const valueText = this.add.text(width * 0.7, sy, stat.value, {
                fontFamily: 'Arial Black, Arial',
                fontSize: '18px',
                fontStyle: 'bold',
                color: stat.color,
                stroke: '#000000',
                strokeThickness: 2,
            }).setOrigin(1, 0.5);

            // Animate values
            valueText.setScale(0);
            this.tweens.add({
                targets: valueText,
                scaleX: 1,
                scaleY: 1,
                duration: 400,
                delay: 400 + i * 150,
                ease: 'Back.easeOut',
            });
        });

        // Retry button
        const retryY = height * 0.73;
        const retryBg = this.add.rectangle(width / 2, retryY, 180, 50, 0x4444aa, 1)
            .setStrokeStyle(2, 0x6666cc)
            .setInteractive({ useHandCursor: true });

        const retryText = this.add.text(width / 2, retryY, 'リトライ', {
            fontFamily: 'Arial Black, Arial',
            fontSize: '20px',
            fontStyle: 'bold',
            color: '#FFFFFF',
        }).setOrigin(0.5);

        retryBg.on('pointerover', () => {
            retryBg.setFillStyle(0x5555cc);
            this.tweens.add({ targets: retryBg, scaleX: 1.05, scaleY: 1.05, duration: 100 });
        });

        retryBg.on('pointerout', () => {
            retryBg.setFillStyle(0x4444aa);
            this.tweens.add({ targets: retryBg, scaleX: 1, scaleY: 1, duration: 100 });
        });

        retryBg.on('pointerdown', () => {
            this.cameras.main.fadeOut(300, 0, 0, 0);
            this.time.delayedCall(300, () => {
                this.scene.start('GameScene');
            });
        });

        // Title button
        const titleY = height * 0.83;
        const titleBg = this.add.rectangle(width / 2, titleY, 180, 40, 0x333355, 0.8)
            .setStrokeStyle(1, 0x555577)
            .setInteractive({ useHandCursor: true });

        const titleBtnText = this.add.text(width / 2, titleY, 'タイトルへ', {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: '#AAAACC',
        }).setOrigin(0.5);

        titleBg.on('pointerover', () => {
            titleBg.setFillStyle(0x444466);
        });

        titleBg.on('pointerout', () => {
            titleBg.setFillStyle(0x333355);
        });

        titleBg.on('pointerdown', () => {
            this.cameras.main.fadeOut(300, 0, 0, 0);
            this.time.delayedCall(300, () => {
                this.scene.start('TitleScene');
            });
        });

        // Fade in
        this.cameras.main.fadeIn(500, 0, 0, 0);
    }
}
