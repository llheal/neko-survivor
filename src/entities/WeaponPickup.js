// WeaponPickup.js - Temporary weapon drops with time limits
export class WeaponPickup {
    static WEAPONS = [
        { type: 'gatling', key: 'weapon_gatling', name: 'ガトリング', duration: 8000 },
        { type: 'laser', key: 'weapon_laser', name: 'レーザー', duration: 6000 },
        { type: 'bomb', key: 'weapon_bomb', name: 'ボム', duration: 7000 },
        { type: 'freeze', key: 'weapon_freeze', name: 'フリーズ', duration: 8000 },
    ];

    static spawn(scene, group, x, y) {
        const weaponDef = Phaser.Utils.Array.GetRandom(WeaponPickup.WEAPONS);

        let sprite = group.getFirstDead(false);

        if (sprite) {
            sprite.setActive(true).setVisible(true);
            sprite.setPosition(x, y);
            sprite.setTexture(weaponDef.key);
        } else {
            sprite = group.create(x, y, weaponDef.key);
            if (!sprite) return null;
        }

        sprite.setDepth(160);
        sprite.setScale(1.2);
        sprite.body.setSize(20, 20);
        sprite.clearTint();
        sprite.setAlpha(1);

        sprite.weaponData = {
            type: weaponDef.type,
            name: weaponDef.name,
            duration: weaponDef.duration,
            expireTime: scene.time.now + 10000, // disappear after 10s if not collected
        };

        // Floating + pulsing animation
        scene.tweens.add({
            targets: sprite,
            y: y - 5,
            scaleX: 1.35,
            scaleY: 1.35,
            duration: 600,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });

        // Pop-in
        sprite.setScale(0);
        scene.tweens.add({
            targets: sprite,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 300,
            ease: 'Back.easeOut',
        });

        // Scatter
        sprite.body.setVelocity(
            Phaser.Math.Between(-40, 40),
            Phaser.Math.Between(-40, 40)
        );
        sprite.body.setDrag(100);

        return sprite;
    }

    static update(scene, sprite) {
        if (!sprite.active || !sprite.weaponData) return;

        // Auto-expire
        if (scene.time.now > sprite.weaponData.expireTime) {
            // Blink before disappearing
            WeaponPickup.deactivate(scene, sprite);
        } else if (scene.time.now > sprite.weaponData.expireTime - 3000) {
            // Blink warning in last 3 seconds
            sprite.setAlpha(Math.sin(scene.time.now * 0.01) > 0 ? 1 : 0.3);
        }
    }

    static collect(scene, sprite, player) {
        if (!sprite.active || !sprite.weaponData) return;

        const data = sprite.weaponData;
        player.setTempWeapon(data.type, data.duration);

        scene.particleManager.skillActivation(sprite.x, sprite.y);
        scene.juiceManager.waveAnnouncement(`${data.name} GET!`);
        scene.playSound('sfx_levelup');

        WeaponPickup.deactivate(scene, sprite);
    }

    static deactivate(scene, sprite) {
        scene.tweens.killTweensOf(sprite);
        sprite.setActive(false).setVisible(false);
        sprite.body.setVelocity(0, 0);
    }
}
