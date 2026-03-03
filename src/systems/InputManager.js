// InputManager.js - Virtual Joystick for mobile + keyboard fallback
export class InputManager {
    constructor(scene) {
        this.scene = scene;
        this.direction = { x: 0, y: 0 };
        this.magnitude = 0;
        this.active = false;

        // Joystick visuals
        this.outerRing = null;
        this.innerKnob = null;
        this.baseX = 0;
        this.baseY = 0;
        this.maxRadius = 50;

        // Keyboard support
        this.keys = null;

        // Pointer tracking
        this.pointerId = null;

        this.setup();
    }

    setup() {
        // Keyboard
        if (this.scene.input.keyboard) {
            this.keys = this.scene.input.keyboard.addKeys({
                up: Phaser.Input.Keyboard.KeyCodes.W,
                down: Phaser.Input.Keyboard.KeyCodes.S,
                left: Phaser.Input.Keyboard.KeyCodes.A,
                right: Phaser.Input.Keyboard.KeyCodes.D,
                arrowUp: Phaser.Input.Keyboard.KeyCodes.UP,
                arrowDown: Phaser.Input.Keyboard.KeyCodes.DOWN,
                arrowLeft: Phaser.Input.Keyboard.KeyCodes.LEFT,
                arrowRight: Phaser.Input.Keyboard.KeyCodes.RIGHT,
            });
        }

        // Create joystick sprites (hidden initially)
        this.outerRing = this.scene.add.image(0, 0, 'joystick_outer')
            .setScrollFactor(0)
            .setDepth(1000)
            .setAlpha(0)
            .setScale(1.2);

        this.innerKnob = this.scene.add.image(0, 0, 'joystick_inner')
            .setScrollFactor(0)
            .setDepth(1001)
            .setAlpha(0);

        // Touch input
        this.scene.input.on('pointerdown', this.onPointerDown, this);
        this.scene.input.on('pointermove', this.onPointerMove, this);
        this.scene.input.on('pointerup', this.onPointerUp, this);
    }

    onPointerDown(pointer) {
        if (this.pointerId !== null) return;
        // Only trigger joystick on bottom 60% of screen
        if (pointer.y < this.scene.scale.height * 0.4) return;

        this.pointerId = pointer.id;
        this.active = true;
        this.baseX = pointer.x;
        this.baseY = pointer.y;

        this.outerRing.setPosition(this.baseX, this.baseY).setAlpha(0.7);
        this.innerKnob.setPosition(this.baseX, this.baseY).setAlpha(0.9);
    }

    onPointerMove(pointer) {
        if (pointer.id !== this.pointerId || !this.active) return;

        const dx = pointer.x - this.baseX;
        const dy = pointer.y - this.baseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const clampedDist = Math.min(dist, this.maxRadius);

        if (dist > 0) {
            this.direction.x = dx / dist;
            this.direction.y = dy / dist;
            this.magnitude = clampedDist / this.maxRadius;

            const knobX = this.baseX + (dx / dist) * clampedDist;
            const knobY = this.baseY + (dy / dist) * clampedDist;
            this.innerKnob.setPosition(knobX, knobY);
        }
    }

    onPointerUp(pointer) {
        if (pointer.id !== this.pointerId) return;

        this.pointerId = null;
        this.active = false;
        this.direction.x = 0;
        this.direction.y = 0;
        this.magnitude = 0;

        this.outerRing.setAlpha(0);
        this.innerKnob.setAlpha(0);
    }

    update() {
        // Keyboard override
        if (this.keys && !this.active) {
            let kx = 0, ky = 0;
            if (this.keys.left.isDown || this.keys.arrowLeft.isDown) kx -= 1;
            if (this.keys.right.isDown || this.keys.arrowRight.isDown) kx += 1;
            if (this.keys.up.isDown || this.keys.arrowUp.isDown) ky -= 1;
            if (this.keys.down.isDown || this.keys.arrowDown.isDown) ky += 1;

            if (kx !== 0 || ky !== 0) {
                const len = Math.sqrt(kx * kx + ky * ky);
                this.direction.x = kx / len;
                this.direction.y = ky / len;
                this.magnitude = 1;
            } else {
                this.direction.x = 0;
                this.direction.y = 0;
                this.magnitude = 0;
            }
        }
    }

    getDirection() {
        return { x: this.direction.x, y: this.direction.y };
    }

    getMagnitude() {
        return this.magnitude;
    }

    destroy() {
        this.scene.input.off('pointerdown', this.onPointerDown, this);
        this.scene.input.off('pointermove', this.onPointerMove, this);
        this.scene.input.off('pointerup', this.onPointerUp, this);
    }
}
