// ParticleManager.js - Manages various 2D particle effects
export class ParticleManager {
    constructor(scene) {
        this.scene = scene;
    }

    // Enemy death burst
    enemyDeath(x, y, color = 0xff8844) {
        const particles = this.scene.add.particles(x, y, 'particle', {
            speed: { min: 80, max: 200 },
            angle: { min: 0, max: 360 },
            scale: { start: 1.5, end: 0 },
            alpha: { start: 1, end: 0 },
            tint: [color, 0xffffff, color],
            lifespan: 400,
            quantity: 12,
            blendMode: 'ADD',
            emitting: false,
        });
        particles.setDepth(300);
        particles.explode(12);
        this.scene.time.delayedCall(500, () => particles.destroy());
    }

    // Projectile impact sparks
    impact(x, y, color = 0x00ffff) {
        const particles = this.scene.add.particles(x, y, 'particle', {
            speed: { min: 50, max: 150 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.8, end: 0 },
            alpha: { start: 1, end: 0 },
            tint: color,
            lifespan: 200,
            quantity: 6,
            blendMode: 'ADD',
            emitting: false,
        });
        particles.setDepth(300);
        particles.explode(6);
        this.scene.time.delayedCall(300, () => particles.destroy());
    }

    // Level up radial burst
    levelUp(x, y) {
        const particles = this.scene.add.particles(x, y, 'star_particle', {
            speed: { min: 100, max: 300 },
            angle: { min: 0, max: 360 },
            scale: { start: 1.5, end: 0 },
            alpha: { start: 1, end: 0 },
            tint: [0xffd700, 0xffff00, 0xffa500],
            lifespan: 800,
            quantity: 20,
            blendMode: 'ADD',
            emitting: false,
        });
        particles.setDepth(400);
        particles.explode(20);
        this.scene.time.delayedCall(900, () => particles.destroy());

        // Ring effect
        const ring = this.scene.add.circle(x, y, 10, 0xffd700, 0.6)
            .setDepth(399);
        this.scene.tweens.add({
            targets: ring,
            scaleX: 8,
            scaleY: 8,
            alpha: 0,
            duration: 600,
            ease: 'Power2',
            onComplete: () => ring.destroy(),
        });
    }

    // XP gem collection sparkle
    collect(x, y, color = 0x00ff88) {
        const particles = this.scene.add.particles(x, y, 'particle', {
            speed: { min: 20, max: 80 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.6, end: 0 },
            alpha: { start: 1, end: 0 },
            tint: color,
            lifespan: 300,
            quantity: 4,
            blendMode: 'ADD',
            emitting: false,
        });
        particles.setDepth(300);
        particles.explode(4);
        this.scene.time.delayedCall(400, () => particles.destroy());
    }

    // Skill activation flash
    skillActivation(x, y) {
        const particles = this.scene.add.particles(x, y, 'star_particle', {
            speed: { min: 150, max: 350 },
            angle: { min: 0, max: 360 },
            scale: { start: 2, end: 0 },
            alpha: { start: 1, end: 0 },
            tint: [0xff44ff, 0x44ffff, 0xffff44],
            lifespan: 600,
            quantity: 15,
            blendMode: 'ADD',
            emitting: false,
        });
        particles.setDepth(400);
        particles.explode(15);
        this.scene.time.delayedCall(700, () => particles.destroy());
    }

    // Projectile trail
    createTrail(x, y, color = 0x00ffff) {
        const particles = this.scene.add.particles(x, y, 'particle', {
            speed: 0,
            scale: { start: 0.6, end: 0 },
            alpha: { start: 0.5, end: 0 },
            tint: color,
            lifespan: 200,
            frequency: 30,
            blendMode: 'ADD',
        });
        particles.setDepth(199);
        return particles;
    }

    // Player damage effect
    playerHit(x, y) {
        const particles = this.scene.add.particles(x, y, 'particle', {
            speed: { min: 60, max: 120 },
            angle: { min: 0, max: 360 },
            scale: { start: 1, end: 0 },
            alpha: { start: 1, end: 0 },
            tint: 0xff3333,
            lifespan: 300,
            quantity: 8,
            blendMode: 'ADD',
            emitting: false,
        });
        particles.setDepth(300);
        particles.explode(8);
        this.scene.time.delayedCall(400, () => particles.destroy());
    }
}
