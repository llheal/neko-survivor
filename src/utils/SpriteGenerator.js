// SpriteGenerator.js - Creates all game sprites programmatically via Canvas API
export class SpriteGenerator {
    constructor(scene) {
        this.scene = scene;
    }

    generateAll() {
        this.generateCat();
        this.generateCatEvolutions();
        this.generateBears();
        this.generateProjectiles();
        this.generateXPGems();
        this.generateHealthOrb();
        this.generateShadow();
        this.generateJoystick();
        this.generateParticle();
        this.generateSkillIcons();
        this.generateWeaponPickups();
    }

    // Helper: draw kawaii cat body
    drawCatBody(ctx, ox, cy, bounce, color, earColor, cheekColor, eyeStyle, accessories) {
        const size = 48;
        const cx = ox + size / 2;

        // Tail (behind body)
        const tailWave = accessories.tailWave || 0;
        ctx.strokeStyle = color;
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(cx + 10, cy + 12 + bounce);
        ctx.bezierCurveTo(
            cx + 20 + tailWave, cy + 5 + bounce,
            cx + 22 + tailWave * 1.5, cy - 5 + bounce,
            cx + 18 + tailWave, cy - 12 + bounce
        );
        ctx.stroke();
        // Tail tip
        if (accessories.tailTipColor) {
            ctx.strokeStyle = accessories.tailTipColor;
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.moveTo(cx + 19 + tailWave, cy - 10 + bounce);
            ctx.lineTo(cx + 18 + tailWave, cy - 14 + bounce);
            ctx.stroke();
        }

        // Body (rounder for kawaii)
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.ellipse(cx, cy + 6 + bounce, 15, 16, 0, 0, Math.PI * 2);
        ctx.fill();

        // Belly (lighter)
        ctx.fillStyle = accessories.bellyColor || '#FFF5E0';
        ctx.beginPath();
        ctx.ellipse(cx, cy + 8 + bounce, 10, 11, 0, 0, Math.PI * 2);
        ctx.fill();

        // Head (bigger for kawaii proportion)
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(cx, cy - 9 + bounce, 14, 0, Math.PI * 2);
        ctx.fill();

        // Ears
        const earOuter = color;
        ctx.fillStyle = earOuter;
        // Left ear
        ctx.beginPath();
        ctx.moveTo(cx - 12, cy - 17 + bounce);
        ctx.lineTo(cx - 7, cy - 30 + bounce);
        ctx.lineTo(cx - 2, cy - 17 + bounce);
        ctx.closePath();
        ctx.fill();
        // Right ear
        ctx.beginPath();
        ctx.moveTo(cx + 12, cy - 17 + bounce);
        ctx.lineTo(cx + 7, cy - 30 + bounce);
        ctx.lineTo(cx + 2, cy - 17 + bounce);
        ctx.closePath();
        ctx.fill();

        // Inner ears
        ctx.fillStyle = earColor;
        ctx.beginPath();
        ctx.moveTo(cx - 10, cy - 18 + bounce);
        ctx.lineTo(cx - 7, cy - 27 + bounce);
        ctx.lineTo(cx - 4, cy - 18 + bounce);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(cx + 10, cy - 18 + bounce);
        ctx.lineTo(cx + 7, cy - 27 + bounce);
        ctx.lineTo(cx + 4, cy - 18 + bounce);
        ctx.closePath();
        ctx.fill();

        // Eyes - big kawaii eyes
        if (eyeStyle === 'attack') {
            // Determined eyes (> <)
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 2;
            // Left eye >
            ctx.beginPath();
            ctx.moveTo(cx - 7, cy - 13 + bounce);
            ctx.lineTo(cx - 4, cy - 10 + bounce);
            ctx.lineTo(cx - 7, cy - 7 + bounce);
            ctx.stroke();
            // Right eye <
            ctx.beginPath();
            ctx.moveTo(cx + 3, cy - 13 + bounce);
            ctx.lineTo(cx + 6, cy - 10 + bounce);
            ctx.lineTo(cx + 3, cy - 7 + bounce);
            ctx.stroke();
        } else {
            // Big sparkly eyes
            ctx.fillStyle = '#2a1a3a';
            ctx.beginPath();
            ctx.ellipse(cx - 5, cy - 10 + bounce, 3.5, 4, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(cx + 5, cy - 10 + bounce, 3.5, 4, 0, 0, Math.PI * 2);
            ctx.fill();

            // Eye highlights (two per eye for sparkle)
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(cx - 4, cy - 12 + bounce, 1.8, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(cx - 6, cy - 9 + bounce, 0.8, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(cx + 6, cy - 12 + bounce, 1.8, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(cx + 4, cy - 9 + bounce, 0.8, 0, Math.PI * 2);
            ctx.fill();
        }

        // Blush cheeks
        ctx.fillStyle = cheekColor;
        ctx.globalAlpha = 0.4;
        ctx.beginPath();
        ctx.ellipse(cx - 10, cy - 6 + bounce, 3.5, 2.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(cx + 10, cy - 6 + bounce, 3.5, 2.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;

        // Nose (tiny triangle)
        ctx.fillStyle = '#FFB6C1';
        ctx.beginPath();
        ctx.moveTo(cx, cy - 5 + bounce);
        ctx.lineTo(cx - 1.5, cy - 3 + bounce);
        ctx.lineTo(cx + 1.5, cy - 3 + bounce);
        ctx.closePath();
        ctx.fill();

        // Mouth (w shape for kawaii)
        ctx.strokeStyle = '#7a5a4a';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(cx - 4, cy - 2 + bounce);
        ctx.quadraticCurveTo(cx - 2, cy + 0.5 + bounce, cx, cy - 1.5 + bounce);
        ctx.quadraticCurveTo(cx + 2, cy + 0.5 + bounce, cx + 4, cy - 2 + bounce);
        ctx.stroke();

        // Whiskers (curved)
        ctx.strokeStyle = '#bba090';
        ctx.lineWidth = 0.6;
        for (let w = -1; w <= 1; w += 2) {
            ctx.beginPath();
            ctx.moveTo(cx + w * 6, cy - 5 + bounce);
            ctx.quadraticCurveTo(cx + w * 12, cy - 8 + bounce, cx + w * 18, cy - 7 + bounce);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(cx + w * 6, cy - 3 + bounce);
            ctx.quadraticCurveTo(cx + w * 12, cy - 3 + bounce, cx + w * 18, cy - 2 + bounce);
            ctx.stroke();
        }

        // Feet (little paws)
        ctx.fillStyle = color;
        const footLift = accessories.footLift || 0;
        ctx.beginPath();
        ctx.ellipse(cx - 7, cy + 21 + bounce - footLift, 5, 3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(cx + 7, cy + 21 + bounce + footLift, 5, 3, 0, 0, Math.PI * 2);
        ctx.fill();
        // Paw pads
        ctx.fillStyle = '#FFB6C1';
        ctx.beginPath();
        ctx.arc(cx - 7, cy + 21 + bounce - footLift, 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx + 7, cy + 21 + bounce + footLift, 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Accessories
        if (accessories.crown) {
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.moveTo(cx - 6, cy - 22 + bounce);
            ctx.lineTo(cx - 4, cy - 28 + bounce);
            ctx.lineTo(cx - 1, cy - 24 + bounce);
            ctx.lineTo(cx, cy - 30 + bounce);
            ctx.lineTo(cx + 1, cy - 24 + bounce);
            ctx.lineTo(cx + 4, cy - 28 + bounce);
            ctx.lineTo(cx + 6, cy - 22 + bounce);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = '#FF4444';
            ctx.beginPath();
            ctx.arc(cx, cy - 26 + bounce, 1.2, 0, Math.PI * 2);
            ctx.fill();
        }

        if (accessories.scarf) {
            ctx.fillStyle = accessories.scarf;
            ctx.beginPath();
            ctx.ellipse(cx, cy + 1 + bounce, 12, 4, 0, 0, Math.PI * 2);
            ctx.fill();
            // Scarf tail
            ctx.beginPath();
            ctx.moveTo(cx + 8, cy + 1 + bounce);
            ctx.quadraticCurveTo(cx + 14, cy + 6 + bounce, cx + 12, cy + 12 + bounce);
            ctx.lineTo(cx + 9, cy + 10 + bounce);
            ctx.quadraticCurveTo(cx + 11, cy + 5 + bounce, cx + 6, cy + 2 + bounce);
            ctx.closePath();
            ctx.fill();
        }

        if (accessories.aura) {
            ctx.strokeStyle = accessories.aura;
            ctx.lineWidth = 1.5;
            ctx.globalAlpha = 0.3;
            ctx.beginPath();
            ctx.ellipse(cx, cy + 2 + bounce, 22, 26, 0, 0, Math.PI * 2);
            ctx.stroke();
            ctx.globalAlpha = 1;
        }
    }

    // --- Cat Player (48x48 frames, 6 frames: 4 walk + 2 attack) ---
    generateCat() {
        const size = 48;
        const frames = 6; // 0-3 walk, 4-5 attack
        const canvas = document.createElement('canvas');
        canvas.width = size * frames;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        const cy = size / 2;

        // Walk frames
        for (let f = 0; f < 4; f++) {
            const ox = f * size;
            const bounce = Math.sin((f / 4) * Math.PI * 2) * 2;
            const tailWave = Math.sin((f / 4) * Math.PI * 2) * 6;
            const footLift = f % 2 === 0 ? 2 : -2;
            this.drawCatBody(ctx, ox, cy, bounce, '#FFD54F', '#FFB6C1', '#FF8A80', 'normal', {
                tailWave, footLift, bellyColor: '#FFF8E1', tailTipColor: '#FFB74D'
            });
        }

        // Attack frames
        for (let f = 0; f < 2; f++) {
            const ox = (4 + f) * size;
            const squeeze = f === 0 ? -1 : 1;
            this.drawCatBody(ctx, ox, cy, squeeze, '#FFD54F', '#FFB6C1', '#FF8A80', 'attack', {
                tailWave: f === 0 ? -8 : 8, footLift: 0, bellyColor: '#FFF8E1', tailTipColor: '#FFB74D'
            });
        }

        this.scene.textures.addSpriteSheet('cat', canvas, { frameWidth: size, frameHeight: size });
        this.scene.anims.create({
            key: 'cat_walk',
            frames: this.scene.anims.generateFrameNumbers('cat', { start: 0, end: 3 }),
            frameRate: 8,
            repeat: -1
        });
        this.scene.anims.create({
            key: 'cat_idle',
            frames: this.scene.anims.generateFrameNumbers('cat', { start: 0, end: 1 }),
            frameRate: 4,
            repeat: -1
        });
        this.scene.anims.create({
            key: 'cat_attack',
            frames: this.scene.anims.generateFrameNumbers('cat', { start: 4, end: 5 }),
            frameRate: 12,
            repeat: 0
        });
    }

    // --- Cat Evolutions (different looks at higher levels) ---
    generateCatEvolutions() {
        const evolutions = [
            {
                key: 'cat_evo1', // Level 5+
                color: '#64B5F6', earColor: '#E1BEE7', cheekColor: '#CE93D8',
                bellyColor: '#E3F2FD', tailTipColor: '#42A5F5',
                scarf: '#FF5252', aura: null
            },
            {
                key: 'cat_evo2', // Level 10+
                color: '#EF5350', earColor: '#FFCDD2', cheekColor: '#FF8A80',
                bellyColor: '#FFEBEE', tailTipColor: '#D32F2F',
                scarf: '#FFD700', crown: true, aura: null
            },
            {
                key: 'cat_evo3', // Level 15+
                color: '#AB47BC', earColor: '#F8BBD0', cheekColor: '#F48FB1',
                bellyColor: '#F3E5F5', tailTipColor: '#8E24AA',
                scarf: '#00E5FF', crown: true, aura: '#FFD700'
            },
        ];

        for (const evo of evolutions) {
            const size = 48;
            const frames = 6;
            const canvas = document.createElement('canvas');
            canvas.width = size * frames;
            canvas.height = size;
            const ctx = canvas.getContext('2d');
            const cy = size / 2;

            for (let f = 0; f < 4; f++) {
                const ox = f * size;
                const bounce = Math.sin((f / 4) * Math.PI * 2) * 2;
                const tailWave = Math.sin((f / 4) * Math.PI * 2) * 6;
                const footLift = f % 2 === 0 ? 2 : -2;
                this.drawCatBody(ctx, ox, cy, bounce, evo.color, evo.earColor, evo.cheekColor, 'normal', {
                    tailWave, footLift, bellyColor: evo.bellyColor, tailTipColor: evo.tailTipColor,
                    scarf: evo.scarf, crown: evo.crown, aura: evo.aura
                });
            }

            for (let f = 0; f < 2; f++) {
                const ox = (4 + f) * size;
                const squeeze = f === 0 ? -1 : 1;
                this.drawCatBody(ctx, ox, cy, squeeze, evo.color, evo.earColor, evo.cheekColor, 'attack', {
                    tailWave: f === 0 ? -8 : 8, footLift: 0, bellyColor: evo.bellyColor,
                    tailTipColor: evo.tailTipColor, scarf: evo.scarf, crown: evo.crown, aura: evo.aura
                });
            }

            this.scene.textures.addSpriteSheet(evo.key, canvas, { frameWidth: size, frameHeight: size });
            this.scene.anims.create({
                key: `${evo.key}_walk`,
                frames: this.scene.anims.generateFrameNumbers(evo.key, { start: 0, end: 3 }),
                frameRate: 8, repeat: -1
            });
            this.scene.anims.create({
                key: `${evo.key}_idle`,
                frames: this.scene.anims.generateFrameNumbers(evo.key, { start: 0, end: 1 }),
                frameRate: 4, repeat: -1
            });
            this.scene.anims.create({
                key: `${evo.key}_attack`,
                frames: this.scene.anims.generateFrameNumbers(evo.key, { start: 4, end: 5 }),
                frameRate: 12, repeat: 0
            });
        }
    }

    // --- Bear Enemies (3 variants, 48x48) ---
    generateBears() {
        const variants = [
            { key: 'bear_brown', color: '#8B4513', lightColor: '#CD853F', noseColor: '#000', cheekColor: '#D2691E' },
            { key: 'bear_polar', color: '#E0E8F0', lightColor: '#FFFFFF', noseColor: '#333', cheekColor: '#F0C0C0' },
            { key: 'bear_panda', color: '#333333', lightColor: '#FFFFFF', noseColor: '#000', cheekColor: '#F0D0D0' },
        ];

        for (const v of variants) {
            const size = 48;
            const frames = 2;
            const canvas = document.createElement('canvas');
            canvas.width = size * frames;
            canvas.height = size;
            const ctx = canvas.getContext('2d');

            for (let f = 0; f < frames; f++) {
                const ox = f * size;
                const cx = ox + size / 2;
                const wobble = f === 1 ? 1.5 : -1.5;

                // Body
                ctx.fillStyle = v.color;
                ctx.beginPath();
                ctx.ellipse(cx, size / 2 + 6, 16, 18, 0, 0, Math.PI * 2);
                ctx.fill();

                // Head
                ctx.fillStyle = v.color;
                ctx.beginPath();
                ctx.arc(cx, size / 2 - 6, 14, 0, Math.PI * 2);
                ctx.fill();

                // Ears
                ctx.beginPath();
                ctx.arc(cx - 11, size / 2 - 16, 5, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(cx + 11, size / 2 - 16, 5, 0, Math.PI * 2);
                ctx.fill();

                // Inner ears
                ctx.fillStyle = v.lightColor;
                ctx.beginPath();
                ctx.arc(cx - 11, size / 2 - 16, 3, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(cx + 11, size / 2 - 16, 3, 0, Math.PI * 2);
                ctx.fill();

                // Face patch (for panda)
                if (v.key === 'bear_panda') {
                    ctx.fillStyle = v.lightColor;
                    ctx.beginPath();
                    ctx.ellipse(cx, size / 2 - 4, 10, 8, 0, 0, Math.PI * 2);
                    ctx.fill();
                }

                // Belly
                ctx.fillStyle = v.lightColor;
                ctx.beginPath();
                ctx.ellipse(cx, size / 2 + 8, 10, 12, 0, 0, Math.PI * 2);
                ctx.fill();

                // Panda eye patches
                if (v.key === 'bear_panda') {
                    ctx.fillStyle = '#333';
                    ctx.beginPath();
                    ctx.ellipse(cx - 5, size / 2 - 8, 5, 4, -0.2, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.beginPath();
                    ctx.ellipse(cx + 5, size / 2 - 8, 5, 4, 0.2, 0, Math.PI * 2);
                    ctx.fill();
                }

                // Eyes
                ctx.fillStyle = '#111';
                ctx.beginPath();
                ctx.arc(cx - 5, size / 2 - 8, 2.2, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(cx + 5, size / 2 - 8, 2.2, 0, Math.PI * 2);
                ctx.fill();
                // Eye highlights
                ctx.fillStyle = '#FFF';
                ctx.beginPath();
                ctx.arc(cx - 4, size / 2 - 9, 0.9, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(cx + 6, size / 2 - 9, 0.9, 0, Math.PI * 2);
                ctx.fill();

                // Cheeks
                ctx.fillStyle = v.cheekColor;
                ctx.globalAlpha = 0.3;
                ctx.beginPath();
                ctx.ellipse(cx - 9, size / 2 - 3, 3, 2, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.ellipse(cx + 9, size / 2 - 3, 3, 2, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1;

                // Nose
                ctx.fillStyle = v.noseColor;
                ctx.beginPath();
                ctx.ellipse(cx, size / 2 - 3, 2.5, 2, 0, 0, Math.PI * 2);
                ctx.fill();

                // Mouth
                ctx.strokeStyle = '#555';
                ctx.lineWidth = 0.8;
                ctx.beginPath();
                ctx.moveTo(cx, size / 2 - 1);
                ctx.lineTo(cx - 3, size / 2 + 2);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(cx, size / 2 - 1);
                ctx.lineTo(cx + 3, size / 2 + 2);
                ctx.stroke();

                // Feet
                ctx.fillStyle = v.color;
                ctx.beginPath();
                ctx.ellipse(cx - 7, size / 2 + 22 + wobble, 5, 3, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.ellipse(cx + 7, size / 2 + 22 - wobble, 5, 3, 0, 0, Math.PI * 2);
                ctx.fill();

                // Outline
                ctx.strokeStyle = 'rgba(0,0,0,0.2)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.ellipse(cx, size / 2 + 6, 16, 18, 0, 0, Math.PI * 2);
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(cx, size / 2 - 6, 14, 0, Math.PI * 2);
                ctx.stroke();
            }

            this.scene.textures.addSpriteSheet(v.key, canvas, { frameWidth: size, frameHeight: size });
            this.scene.anims.create({
                key: `${v.key}_walk`,
                frames: this.scene.anims.generateFrameNumbers(v.key, { start: 0, end: 1 }),
                frameRate: 4,
                repeat: -1
            });
        }
    }

    // --- Projectiles (more dazzling) ---
    generateProjectiles() {
        const projectileTypes = [
            { key: 'projectile_arrow', draw: this.drawArrowProjectile },
            { key: 'projectile_fire', draw: this.drawFireProjectile },
            { key: 'projectile_ice', draw: this.drawIceProjectile },
            { key: 'projectile_star', draw: this.drawStarProjectile },
            { key: 'projectile_lightning', draw: this.drawLightningProjectile },
        ];

        for (const p of projectileTypes) {
            const canvas = document.createElement('canvas');
            canvas.width = 24;
            canvas.height = 24;
            const ctx = canvas.getContext('2d');
            p.draw(ctx, 12, 12);
            this.scene.textures.addCanvas(p.key, canvas);
        }
    }

    drawArrowProjectile(ctx, cx, cy) {
        // Glowing energy arrow
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 12);
        grad.addColorStop(0, '#FFFFFF');
        grad.addColorStop(0.3, '#00FFFF');
        grad.addColorStop(0.6, '#0088FF');
        grad.addColorStop(1, 'rgba(0,136,255,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 24, 24);

        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = '#00FFFF';
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.moveTo(cx, cy - 8);
        ctx.lineTo(cx + 5, cy + 2);
        ctx.lineTo(cx + 2, cy + 1);
        ctx.lineTo(cx + 3, cy + 8);
        ctx.lineTo(cx, cy + 4);
        ctx.lineTo(cx - 3, cy + 8);
        ctx.lineTo(cx - 2, cy + 1);
        ctx.lineTo(cx - 5, cy + 2);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;
    }

    drawFireProjectile(ctx, cx, cy) {
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 11);
        grad.addColorStop(0, '#FFFFFF');
        grad.addColorStop(0.2, '#FFFF44');
        grad.addColorStop(0.5, '#FF8800');
        grad.addColorStop(0.8, '#FF2200');
        grad.addColorStop(1, 'rgba(255,0,0,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 24, 24);

        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = '#FF8800';
        ctx.shadowBlur = 4;
        ctx.beginPath();
        ctx.arc(cx, cy, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }

    drawIceProjectile(ctx, cx, cy) {
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 11);
        grad.addColorStop(0, '#FFFFFF');
        grad.addColorStop(0.3, '#AAEEFF');
        grad.addColorStop(0.6, '#44BBFF');
        grad.addColorStop(1, 'rgba(68,187,255,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 24, 24);

        // Crystal shape
        ctx.fillStyle = '#EEFFFF';
        ctx.shadowColor = '#44DDFF';
        ctx.shadowBlur = 5;
        ctx.beginPath();
        ctx.moveTo(cx, cy - 7);
        ctx.lineTo(cx + 5, cy);
        ctx.lineTo(cx, cy + 7);
        ctx.lineTo(cx - 5, cy);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;
    }

    drawStarProjectile(ctx, cx, cy) {
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 11);
        grad.addColorStop(0, '#FFFFFF');
        grad.addColorStop(0.3, '#FFD700');
        grad.addColorStop(0.6, '#FF8C00');
        grad.addColorStop(1, 'rgba(255,140,0,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 24, 24);

        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur = 5;
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const a = (i * 4 * Math.PI) / 5 - Math.PI / 2;
            const x = cx + Math.cos(a) * 6;
            const y = cy + Math.sin(a) * 6;
            if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;
    }

    drawLightningProjectile(ctx, cx, cy) {
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 11);
        grad.addColorStop(0, '#FFFFFF');
        grad.addColorStop(0.3, '#EEDD00');
        grad.addColorStop(0.6, '#FFAA00');
        grad.addColorStop(1, 'rgba(255,170,0,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 24, 24);

        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = '#FFDD00';
        ctx.shadowBlur = 5;
        ctx.beginPath();
        ctx.moveTo(cx + 3, cy - 8);
        ctx.lineTo(cx - 2, cy - 1);
        ctx.lineTo(cx + 1, cy - 1);
        ctx.lineTo(cx - 3, cy + 8);
        ctx.lineTo(cx + 2, cy + 1);
        ctx.lineTo(cx - 1, cy + 1);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;
    }

    // --- XP Gems ---
    generateXPGems() {
        const colors = [
            { key: 'xp_small', color: '#00FF88', glowColor: '#00CC66', size: 12 },
            { key: 'xp_medium', color: '#00CCFF', glowColor: '#0099CC', size: 16 },
            { key: 'xp_large', color: '#FF44FF', glowColor: '#CC00CC', size: 20 },
        ];

        for (const g of colors) {
            const canvas = document.createElement('canvas');
            canvas.width = g.size;
            canvas.height = g.size;
            const ctx = canvas.getContext('2d');
            const cx = g.size / 2;
            const cy = g.size / 2;
            const r = g.size / 2 - 2;

            // Glow
            const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r + 2);
            grad.addColorStop(0, g.color);
            grad.addColorStop(0.6, g.glowColor);
            grad.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, g.size, g.size);

            // Diamond
            ctx.fillStyle = g.color;
            ctx.shadowColor = g.color;
            ctx.shadowBlur = 3;
            ctx.beginPath();
            ctx.moveTo(cx, cy - r);
            ctx.lineTo(cx + r, cy);
            ctx.lineTo(cx, cy + r);
            ctx.lineTo(cx - r, cy);
            ctx.closePath();
            ctx.fill();

            // Highlight
            ctx.fillStyle = 'rgba(255,255,255,0.7)';
            ctx.beginPath();
            ctx.moveTo(cx, cy - r + 2);
            ctx.lineTo(cx + r / 2, cy);
            ctx.lineTo(cx, cy - 1);
            ctx.lineTo(cx - r / 2, cy);
            ctx.closePath();
            ctx.fill();
            ctx.shadowBlur = 0;

            this.scene.textures.addCanvas(g.key, canvas);
        }
    }

    // --- Health Orb ---
    generateHealthOrb() {
        const canvas = document.createElement('canvas');
        canvas.width = 20;
        canvas.height = 20;
        const ctx = canvas.getContext('2d');

        // Glow
        const grad = ctx.createRadialGradient(10, 10, 0, 10, 10, 10);
        grad.addColorStop(0, '#FF6688');
        grad.addColorStop(0.5, '#FF3366');
        grad.addColorStop(1, 'rgba(255,51,102,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 20, 20);

        ctx.fillStyle = '#FF3366';
        ctx.shadowColor = '#FF3366';
        ctx.shadowBlur = 4;
        ctx.beginPath();
        ctx.moveTo(10, 16);
        ctx.bezierCurveTo(2, 10, 2, 4, 6, 4);
        ctx.bezierCurveTo(8, 4, 10, 6, 10, 8);
        ctx.bezierCurveTo(10, 6, 12, 4, 14, 4);
        ctx.bezierCurveTo(18, 4, 18, 10, 10, 16);
        ctx.fill();

        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.beginPath();
        ctx.arc(7, 7, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        this.scene.textures.addCanvas('health_orb', canvas);
    }

    // --- Shadow ---
    generateShadow() {
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 16;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(16, 8, 14, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        this.scene.textures.addCanvas('shadow', canvas);
    }

    // --- Joystick ---
    generateJoystick() {
        const outerCanvas = document.createElement('canvas');
        outerCanvas.width = 128;
        outerCanvas.height = 128;
        let ctx = outerCanvas.getContext('2d');
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(64, 64, 60, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,0.05)';
        ctx.fill();
        this.scene.textures.addCanvas('joystick_outer', outerCanvas);

        const innerCanvas = document.createElement('canvas');
        innerCanvas.width = 64;
        innerCanvas.height = 64;
        ctx = innerCanvas.getContext('2d');
        const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 28);
        gradient.addColorStop(0, 'rgba(255,255,255,0.6)');
        gradient.addColorStop(1, 'rgba(255,255,255,0.2)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(32, 32, 28, 0, Math.PI * 2);
        ctx.fill();
        this.scene.textures.addCanvas('joystick_inner', innerCanvas);
    }

    // --- Particles ---
    generateParticle() {
        const canvas = document.createElement('canvas');
        canvas.width = 8;
        canvas.height = 8;
        const ctx = canvas.getContext('2d');
        const gradient = ctx.createRadialGradient(4, 4, 0, 4, 4, 4);
        gradient.addColorStop(0, 'rgba(255,255,255,1)');
        gradient.addColorStop(0.5, 'rgba(255,255,255,0.5)');
        gradient.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 8, 8);
        this.scene.textures.addCanvas('particle', canvas);

        const starCanvas = document.createElement('canvas');
        starCanvas.width = 12;
        starCanvas.height = 12;
        const ctx2 = starCanvas.getContext('2d');
        ctx2.fillStyle = '#FFFFFF';
        ctx2.shadowColor = '#FFFFFF';
        ctx2.shadowBlur = 2;
        ctx2.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
            const x = 6 + Math.cos(angle) * 5;
            const y = 6 + Math.sin(angle) * 5;
            if (i === 0) ctx2.moveTo(x, y); else ctx2.lineTo(x, y);
        }
        ctx2.closePath();
        ctx2.fill();
        ctx2.shadowBlur = 0;
        this.scene.textures.addCanvas('star_particle', starCanvas);
    }

    // --- Skill Icons ---
    generateSkillIcons() {
        const skills = [
            { key: 'skill_bounce', color: '#00FFAA', symbol: '↩' },
            { key: 'skill_multi', color: '#FF8800', symbol: '✦' },
            { key: 'skill_homing', color: '#FF44FF', symbol: '◎' },
            { key: 'skill_atkspd', color: '#FFFF00', symbol: '⚡' },
            { key: 'skill_movspd', color: '#44FF44', symbol: '💨' },
            { key: 'skill_maxhp', color: '#FF3366', symbol: '♥' },
            { key: 'skill_dmg', color: '#FF2222', symbol: '⚔' },
            { key: 'skill_pierce', color: '#8888FF', symbol: '➤' },
            { key: 'skill_shield', color: '#4488FF', symbol: '🛡' },
            { key: 'skill_magnet', color: '#FFAA00', symbol: '🧲' },
            { key: 'skill_crit', color: '#FF0044', symbol: '💥' },
            { key: 'skill_freeze', color: '#88DDFF', symbol: '❄' },
        ];

        for (const s of skills) {
            const canvas = document.createElement('canvas');
            canvas.width = 48;
            canvas.height = 48;
            const ctx = canvas.getContext('2d');

            const gradient = ctx.createRadialGradient(24, 24, 0, 24, 24, 24);
            gradient.addColorStop(0, s.color);
            gradient.addColorStop(1, 'rgba(0,0,0,0.5)');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(24, 24, 22, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = s.color;
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 22px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(s.symbol, 24, 24);

            this.scene.textures.addCanvas(s.key, canvas);
        }
    }

    // --- Weapon Pickups ---
    generateWeaponPickups() {
        const weapons = [
            { key: 'weapon_gatling', color: '#FF4444', symbol: '🔥' },
            { key: 'weapon_laser', color: '#00FFFF', symbol: '⚡' },
            { key: 'weapon_bomb', color: '#FF8800', symbol: '💣' },
            { key: 'weapon_freeze', color: '#88DDFF', symbol: '❄' },
        ];

        for (const w of weapons) {
            const canvas = document.createElement('canvas');
            canvas.width = 32;
            canvas.height = 32;
            const ctx = canvas.getContext('2d');

            // Glowing box
            const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
            grad.addColorStop(0, w.color);
            grad.addColorStop(0.6, w.color + '88');
            grad.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, 32, 32);

            // Box background
            ctx.fillStyle = '#222244';
            ctx.strokeStyle = w.color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.roundRect(4, 4, 24, 24, 4);
            ctx.fill();
            ctx.stroke();

            // Symbol
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(w.symbol, 16, 16);

            this.scene.textures.addCanvas(w.key, canvas);
        }
    }
}
