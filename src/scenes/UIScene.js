// UIScene.js - HUD overlay, skill selection modal, and minimap radar
export class UIScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UIScene' });
    }

    create() {
        const { width, height } = this.scale;

        // HP Bar
        this.hpBarBg = this.add.rectangle(width / 2, 28, width - 40, 16, 0x333333, 0.8)
            .setScrollFactor(0).setDepth(900);
        this.hpBarFill = this.add.rectangle(20, 28, width - 40, 12, 0xff3366, 1)
            .setScrollFactor(0).setDepth(901).setOrigin(0, 0.5);
        this.hpBarBorder = this.add.rectangle(width / 2, 28, width - 40, 16)
            .setScrollFactor(0).setDepth(902).setStrokeStyle(2, 0xffffff, 0.5);

        // HP Text
        this.hpText = this.add.text(width / 2, 28, '100/100', {
            fontFamily: 'Arial',
            fontSize: '11px',
            fontStyle: 'bold',
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 2,
        }).setScrollFactor(0).setDepth(903).setOrigin(0.5);

        // XP Bar
        this.xpBarBg = this.add.rectangle(width / 2, 50, width - 40, 10, 0x222244, 0.8)
            .setScrollFactor(0).setDepth(900);
        this.xpBarFill = this.add.rectangle(20, 50, 0, 8, 0x44aaff, 1)
            .setScrollFactor(0).setDepth(901).setOrigin(0, 0.5);

        // Level text
        this.levelText = this.add.text(width / 2, 68, 'Lv.1', {
            fontFamily: 'Arial Black, Arial',
            fontSize: '14px',
            fontStyle: 'bold',
            color: '#FFD700',
            stroke: '#000000',
            strokeThickness: 3,
        }).setScrollFactor(0).setDepth(903).setOrigin(0.5);

        // Wave text (top right)
        this.waveText = this.add.text(width - 15, 70, 'WAVE 1', {
            fontFamily: 'Arial Black, Arial',
            fontSize: '14px',
            fontStyle: 'bold',
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 3,
        }).setScrollFactor(0).setDepth(903).setOrigin(1, 0.5);

        // Kill count (top left)
        this.killText = this.add.text(15, 70, 'KILLS: 0', {
            fontFamily: 'Arial',
            fontSize: '12px',
            color: '#CCCCCC',
            stroke: '#000000',
            strokeThickness: 2,
        }).setScrollFactor(0).setDepth(903).setOrigin(0, 0.5);

        // --- Minimap Radar ---
        this.radarRadius = 48;
        this.radarX = 22 + this.radarRadius; // bottom-left corner
        this.radarY = height - 22 - this.radarRadius;
        this.radarRange = 900; // game-world px radius shown on radar
        this.radarGraphics = this.add.graphics()
            .setScrollFactor(0).setDepth(950);

        // Radar label
        this.add.text(this.radarX, this.radarY - this.radarRadius - 8, 'RADAR', {
            fontFamily: 'Arial',
            fontSize: '9px',
            fontStyle: 'bold',
            color: '#88AACC',
            stroke: '#000000',
            strokeThickness: 2,
        }).setScrollFactor(0).setDepth(951).setOrigin(0.5);

        // Skill selection container (hidden)
        this.skillContainer = this.add.container(0, 0).setDepth(1000).setVisible(false);

        // Listen for game events
        const gameScene = this.scene.get('GameScene');

        gameScene.events.on('playerHPChanged', (hp, maxHp) => {
            this.updateHPBar(hp, maxHp);
        });

        gameScene.events.on('xpChanged', (xp, xpToNext, level) => {
            this.updateXPBar(xp, xpToNext, level);
        });

        gameScene.events.on('waveStart', (wave) => {
            this.waveText.setText(`WAVE ${wave}`);
        });

        gameScene.events.on('waveComplete', (wave) => {
            // Wave complete indicator could go here
        });

        // Update kill count + radar periodically
        this.time.addEvent({
            delay: 100,
            callback: () => {
                if (gameScene && gameScene.waveManager) {
                    this.killText.setText(`KILLS: ${gameScene.waveManager.totalKills}`);
                }
                this.updateRadar();
            },
            loop: true,
        });
    }

    // --- Minimap Radar ---
    updateRadar() {
        const gameScene = this.scene.get('GameScene');
        if (!gameScene || !gameScene.player || !gameScene.player.isAlive) return;

        const g = this.radarGraphics;
        g.clear();

        const cx = this.radarX;
        const cy = this.radarY;
        const r = this.radarRadius;
        const range = this.radarRange;
        const px = gameScene.player.sprite.x;
        const py = gameScene.player.sprite.y;

        // Background
        g.fillStyle(0x0a0a1e, 0.75);
        g.fillCircle(cx, cy, r);

        // Grid lines
        g.lineStyle(1, 0x334466, 0.3);
        g.strokeCircle(cx, cy, r * 0.5);
        g.strokeCircle(cx, cy, r);
        g.beginPath();
        g.moveTo(cx - r, cy);
        g.lineTo(cx + r, cy);
        g.strokePath();
        g.beginPath();
        g.moveTo(cx, cy - r);
        g.lineTo(cx, cy + r);
        g.strokePath();

        // Border ring
        g.lineStyle(2, 0x4488aa, 0.6);
        g.strokeCircle(cx, cy, r);

        // Draw enemies
        const enemies = gameScene.enemies.getChildren();
        let activeCount = 0;
        for (const enemy of enemies) {
            if (!enemy.active) continue;
            activeCount++;

            const dx = enemy.x - px;
            const dy = enemy.y - py;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // Map world position to radar position
            let radarDx = (dx / range) * r;
            let radarDy = (dy / range) * r;

            // Clamp to radar circle
            const radarDist = Math.sqrt(radarDx * radarDx + radarDy * radarDy);

            if (radarDist > r - 3) {
                // Enemy is at the edge — draw as triangle pointer
                const angle = Math.atan2(radarDy, radarDx);
                const edgeX = cx + Math.cos(angle) * (r - 4);
                const edgeY = cy + Math.sin(angle) * (r - 4);

                g.fillStyle(0xff4444, 0.9);
                g.fillTriangle(
                    edgeX + Math.cos(angle) * 4,
                    edgeY + Math.sin(angle) * 4,
                    edgeX + Math.cos(angle + 2.3) * 3,
                    edgeY + Math.sin(angle + 2.3) * 3,
                    edgeX + Math.cos(angle - 2.3) * 3,
                    edgeY + Math.sin(angle - 2.3) * 3
                );
            } else {
                // Enemy is within range — draw as dot
                const dotX = cx + radarDx;
                const dotY = cy + radarDy;

                // Color by type
                let color = 0xff4444;
                if (enemy.enemyData) {
                    if (enemy.enemyData.type === 'bear_polar') color = 0xaaccff;
                    else if (enemy.enemyData.type === 'bear_panda') color = 0xdddddd;
                }

                g.fillStyle(color, 0.9);
                g.fillCircle(dotX, dotY, dist > range * 0.6 ? 2.5 : 3);
            }
        }

        // Player dot (center, always green)
        g.fillStyle(0x44ff88, 1);
        g.fillCircle(cx, cy, 3);

        // Weapon pickups (yellow dots)
        if (gameScene.weaponPickups) {
            for (const wp of gameScene.weaponPickups.getChildren()) {
                if (!wp.active) continue;
                const dx = wp.x - px;
                const dy = wp.y - py;
                let radarDx = (dx / range) * r;
                let radarDy = (dy / range) * r;
                const radarDist = Math.sqrt(radarDx * radarDx + radarDy * radarDy);
                if (radarDist <= r - 2) {
                    g.fillStyle(0xffdd00, 0.9);
                    g.fillCircle(cx + radarDx, cy + radarDy, 2);
                }
            }
        }

        // Enemy count badge
        if (activeCount > 0) {
            g.fillStyle(0xff2244, 0.85);
            g.fillCircle(cx + r - 4, cy - r + 4, 9);
            // We can't easily draw text in graphics, so use a separate text object
            if (!this.radarCountText) {
                this.radarCountText = this.add.text(cx + r - 4, cy - r + 4, '', {
                    fontFamily: 'Arial',
                    fontSize: '9px',
                    fontStyle: 'bold',
                    color: '#FFFFFF',
                }).setScrollFactor(0).setDepth(952).setOrigin(0.5);
            }
            this.radarCountText.setText(activeCount.toString());
            this.radarCountText.setPosition(cx + r - 4, cy - r + 4);
            this.radarCountText.setVisible(true);
        } else {
            if (this.radarCountText) this.radarCountText.setVisible(false);
        }
    }

    updateHPBar(hp, maxHp) {
        const { width } = this.scale;
        const barWidth = width - 40;
        const ratio = Math.max(0, hp / maxHp);

        this.tweens.add({
            targets: this.hpBarFill,
            width: barWidth * ratio,
            duration: 200,
            ease: 'Power2',
        });

        this.hpText.setText(`${Math.max(0, Math.round(hp))}/${maxHp}`);

        // Color change at low HP
        if (ratio < 0.3) {
            this.hpBarFill.setFillStyle(0xff0000);
        } else if (ratio < 0.6) {
            this.hpBarFill.setFillStyle(0xff8800);
        } else {
            this.hpBarFill.setFillStyle(0xff3366);
        }
    }

    updateXPBar(xp, xpToNext, level) {
        const { width } = this.scale;
        const barWidth = width - 40;
        const ratio = xp / xpToNext;

        this.tweens.add({
            targets: this.xpBarFill,
            width: barWidth * ratio,
            duration: 200,
            ease: 'Power2',
        });

        this.levelText.setText(`Lv.${level}`);
    }

    showSkillSelection(skills) {
        if (skills.length === 0) {
            // No skills available, resume game
            const gameScene = this.scene.get('GameScene');
            gameScene.onSkillSelected(null);
            return;
        }

        const { width, height } = this.scale;

        // Clear previous
        this.skillContainer.removeAll(true);
        this.skillContainer.setVisible(true);

        // Dim overlay
        const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7)
            .setScrollFactor(0).setInteractive();
        this.skillContainer.add(overlay);

        // Title
        const title = this.add.text(width / 2, height * 0.18, 'レベルアップ！', {
            fontFamily: 'Arial Black, Arial',
            fontSize: '28px',
            fontStyle: 'bold',
            color: '#FFD700',
            stroke: '#000000',
            strokeThickness: 4,
        }).setOrigin(0.5);
        this.skillContainer.add(title);

        const subtitle = this.add.text(width / 2, height * 0.24, 'スキルを選択', {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: '#AAAACC',
        }).setOrigin(0.5);
        this.skillContainer.add(subtitle);

        // Skill cards
        const cardWidth = Math.min(width * 0.28, 110);
        const cardHeight = Math.min(height * 0.42, 180);
        const cardSpacing = 10;
        const totalWidth = skills.length * cardWidth + (skills.length - 1) * cardSpacing;
        const startX = width / 2 - totalWidth / 2 + cardWidth / 2;

        for (let i = 0; i < skills.length; i++) {
            const skill = skills[i];
            const cx = startX + i * (cardWidth + cardSpacing);
            const cy = height * 0.52;

            // Card background
            const card = this.add.rectangle(cx, cy, cardWidth, cardHeight, 0x1a1a3e, 0.95)
                .setStrokeStyle(2, 0x4444aa)
                .setInteractive({ useHandCursor: true });

            // Icon
            const icon = this.add.image(cx, cy - cardHeight * 0.28, skill.icon)
                .setScale(1);

            // Skill name
            const nameText = this.add.text(cx, cy - cardHeight * 0.06, skill.name, {
                fontFamily: 'Arial',
                fontSize: '12px',
                fontStyle: 'bold',
                color: '#FFFFFF',
                align: 'center',
                wordWrap: { width: cardWidth - 12 },
            }).setOrigin(0.5);

            // Level indicator
            const levelLabel = skill.currentLevel >= 0
                ? `Lv.${skill.currentLevel + 1} → Lv.${skill.nextLevel + 1}`
                : 'NEW!';
            const levelColor = skill.currentLevel >= 0 ? '#88AAFF' : '#44FF44';
            const levelText = this.add.text(cx, cy + cardHeight * 0.08, levelLabel, {
                fontFamily: 'Arial',
                fontSize: '10px',
                color: levelColor,
            }).setOrigin(0.5);

            // Description
            const descText = this.add.text(cx, cy + cardHeight * 0.22, skill.levels[skill.nextLevel].desc, {
                fontFamily: 'Arial',
                fontSize: '11px',
                color: '#CCCCCC',
                align: 'center',
                wordWrap: { width: cardWidth - 16 },
            }).setOrigin(0.5);

            this.skillContainer.add([card, icon, nameText, levelText, descText]);

            // Entrance animation
            card.setScale(0);
            icon.setScale(0);
            nameText.setAlpha(0);
            levelText.setAlpha(0);
            descText.setAlpha(0);

            this.tweens.add({
                targets: [card],
                scaleX: 1,
                scaleY: 1,
                duration: 300,
                delay: i * 100,
                ease: 'Back.easeOut',
            });

            this.tweens.add({
                targets: [icon],
                scaleX: 1,
                scaleY: 1,
                duration: 300,
                delay: i * 100 + 100,
                ease: 'Back.easeOut',
            });

            this.tweens.add({
                targets: [nameText, levelText, descText],
                alpha: 1,
                duration: 200,
                delay: i * 100 + 200,
            });

            // Hover effect
            card.on('pointerover', () => {
                card.setStrokeStyle(3, 0xFFD700);
                this.tweens.add({
                    targets: card,
                    scaleX: 1.05,
                    scaleY: 1.05,
                    duration: 100,
                });
            });

            card.on('pointerout', () => {
                card.setStrokeStyle(2, 0x4444aa);
                this.tweens.add({
                    targets: card,
                    scaleX: 1,
                    scaleY: 1,
                    duration: 100,
                });
            });

            // Selection
            card.on('pointerdown', () => {
                this.selectSkill(skill.id);
            });
        }

        // --- LINE Share Button ---
        const shareY = height * 0.82;
        const shareBg = this.add.rectangle(width / 2, shareY, 220, 44, 0x06C755, 1)
            .setInteractive({ useHandCursor: true })
            .setDepth(9999);
        this.skillContainer.add(shareBg);

        const shareText = this.add.text(width / 2, shareY, '📤 友だちに共有', {
            fontFamily: 'Arial',
            fontSize: '16px',
            fontStyle: 'bold',
            color: '#FFFFFF',
        }).setOrigin(0.5).setDepth(10000)
            .setInteractive({ useHandCursor: true });
        this.skillContainer.add(shareText);

        // Subtle pulse
        this.tweens.add({
            targets: [shareBg, shareText],
            alpha: { from: 1, to: 0.75 },
            duration: 1200,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });

        const doShare = () => {
            console.log('Share button pressed!');
            // Visual feedback
            shareBg.setFillStyle(0x04a643);
            this.time.delayedCall(200, () => {
                shareBg.setFillStyle(0x06C755);
            });
            this.shareToLINE();
        };

        shareBg.on('pointerdown', doShare);
        shareText.on('pointerdown', doShare);
    }

    async shareToLINE() {
        const gameScene = this.scene.get('GameScene');
        const level = gameScene?.player?.level || 1;
        const kills = gameScene?.waveManager?.totalKills || 0;
        const miniAppUrl = 'https://miniapp.line.me/2009305161-txfC9bAx';

        const flexMessage = {
            type: 'flex',
            altText: `🐱 にゃんこサバイバーで Lv.${level}、${kills}体倒したよ！`,
            contents: {
                type: 'bubble',
                size: 'mega',
                header: {
                    type: 'box',
                    layout: 'vertical',
                    contents: [{
                        type: 'text',
                        text: '🐱 にゃんこサバイバー',
                        weight: 'bold',
                        size: 'lg',
                        color: '#FFD700',
                    }],
                    backgroundColor: '#1a1a2e',
                    paddingAll: '12px',
                },
                body: {
                    type: 'box',
                    layout: 'vertical',
                    contents: [
                        {
                            type: 'text',
                            text: `Lv.${level} まで到達！🎉`,
                            weight: 'bold',
                            size: 'md',
                        },
                        {
                            type: 'text',
                            text: `${kills}体のクマを倒したよ！`,
                            size: 'sm',
                            color: '#666666',
                            margin: 'sm',
                        },
                        {
                            type: 'text',
                            text: 'カワイイ猫でクマの大群をなぎ倒すローグライクゲーム！一緒に遊ぼう！',
                            wrap: true,
                            size: 'xs',
                            color: '#999999',
                            margin: 'md',
                        },
                    ],
                },
                footer: {
                    type: 'box',
                    layout: 'vertical',
                    contents: [{
                        type: 'button',
                        action: {
                            type: 'uri',
                            label: '🎮 プレイする！',
                            uri: miniAppUrl,
                        },
                        style: 'primary',
                        color: '#e74c3c',
                    }],
                    paddingAll: '10px',
                },
            },
        };

        // Try LIFF shareTargetPicker first
        if (window.liff) {
            try {
                const result = await window.liff.shareTargetPicker([flexMessage]);
                if (result) {
                    console.log('Share successful');
                }
                return;
            } catch (e) {
                console.warn('shareTargetPicker failed:', e.message);
            }
        }

        // Fallback: LINE share URL scheme
        const shareText = encodeURIComponent(
            `🐱 にゃんこサバイバーで Lv.${level}、${kills}体倒したよ！一緒に遊ぼう！\n${miniAppUrl}`
        );
        const lineShareUrl = `https://line.me/R/share?text=${shareText}`;

        if (window.liff && window.liff.openWindow) {
            window.liff.openWindow({ url: lineShareUrl, external: true });
        } else {
            window.open(lineShareUrl, '_blank');
        }
    }

    selectSkill(skillId) {
        // Animate out
        this.tweens.add({
            targets: this.skillContainer.list,
            alpha: 0,
            scaleX: 0.8,
            scaleY: 0.8,
            duration: 200,
            onComplete: () => {
                this.skillContainer.setVisible(false);
                this.skillContainer.removeAll(true);

                // Notify game scene
                const gameScene = this.scene.get('GameScene');
                gameScene.onSkillSelected(skillId);
            },
        });
    }
}
