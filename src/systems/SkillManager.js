// SkillManager.js - Expanded skill definitions with 12 skills
export const SKILLS = {
    BOUNCE: {
        id: 'BOUNCE',
        name: 'バウンドショット',
        desc: '弾が壁で跳ね返る',
        icon: 'skill_bounce',
        maxLevel: 3,
        levels: [
            { bounces: 1, desc: '1回バウンド' },
            { bounces: 2, desc: '2回バウンド' },
            { bounces: 3, desc: '3回バウンド' },
        ],
    },
    MULTI: {
        id: 'MULTI',
        name: 'マルチショット',
        desc: '追加の弾を発射',
        icon: 'skill_multi',
        maxLevel: 3,
        levels: [
            { extra: 1, desc: '+1発' },
            { extra: 2, desc: '+2発' },
            { extra: 3, desc: '+3発' },
        ],
    },
    HOMING: {
        id: 'HOMING',
        name: 'ホーミング',
        desc: '弾が敵を追尾する',
        icon: 'skill_homing',
        maxLevel: 3,
        levels: [
            { strength: 0.02, desc: '弱い追尾' },
            { strength: 0.04, desc: '中くらいの追尾' },
            { strength: 0.06, desc: '強い追尾' },
        ],
    },
    ATKSPD: {
        id: 'ATKSPD',
        name: '攻撃速度UP',
        desc: '攻撃間隔が短くなる',
        icon: 'skill_atkspd',
        maxLevel: 3,
        levels: [
            { multiplier: 0.85, desc: '15%アップ' },
            { multiplier: 0.70, desc: '30%アップ' },
            { multiplier: 0.55, desc: '45%アップ' },
        ],
    },
    MOVSPD: {
        id: 'MOVSPD',
        name: '移動速度UP',
        desc: '移動が速くなる',
        icon: 'skill_movspd',
        maxLevel: 3,
        levels: [
            { multiplier: 1.2, desc: '20%アップ' },
            { multiplier: 1.4, desc: '40%アップ' },
            { multiplier: 1.6, desc: '60%アップ' },
        ],
    },
    MAXHP: {
        id: 'MAXHP',
        name: 'HP UP',
        desc: '最大HPが増える',
        icon: 'skill_maxhp',
        maxLevel: 3,
        levels: [
            { bonus: 20, desc: '+20 HP' },
            { bonus: 40, desc: '+40 HP' },
            { bonus: 60, desc: '+60 HP' },
        ],
    },
    DMG: {
        id: 'DMG',
        name: 'ダメージUP',
        desc: '攻撃力が上がる',
        icon: 'skill_dmg',
        maxLevel: 3,
        levels: [
            { multiplier: 1.3, desc: '30%アップ' },
            { multiplier: 1.6, desc: '60%アップ' },
            { multiplier: 2.0, desc: '100%アップ' },
        ],
    },
    PIERCE: {
        id: 'PIERCE',
        name: '貫通',
        desc: '弾が敵を貫通する',
        icon: 'skill_pierce',
        maxLevel: 3,
        levels: [
            { piercing: 1, desc: '1体貫通' },
            { piercing: 2, desc: '2体貫通' },
            { piercing: 3, desc: '3体貫通' },
        ],
    },
    SHIELD: {
        id: 'SHIELD',
        name: 'シールド',
        desc: 'ダメージを吸収するバリア',
        icon: 'skill_shield',
        maxLevel: 3,
        levels: [
            { hits: 2, desc: '2回分のバリア' },
            { hits: 4, desc: '4回分のバリア' },
            { hits: 6, desc: '6回分のバリア' },
        ],
    },
    MAGNET: {
        id: 'MAGNET',
        name: 'マグネット',
        desc: 'アイテムの吸引範囲UP',
        icon: 'skill_magnet',
        maxLevel: 3,
        levels: [
            { range: 1.5, desc: '範囲1.5倍' },
            { range: 2.0, desc: '範囲2倍' },
            { range: 3.0, desc: '範囲3倍' },
        ],
    },
    CRIT: {
        id: 'CRIT',
        name: 'クリティカル',
        desc: '一定確率で大ダメージ',
        icon: 'skill_crit',
        maxLevel: 3,
        levels: [
            { chance: 0.1, desc: '10%で1.5倍' },
            { chance: 0.2, desc: '20%で1.5倍' },
            { chance: 0.3, desc: '30%で2倍' },
        ],
    },
    FREEZE: {
        id: 'FREEZE',
        name: 'フリーズ',
        desc: '一定確率で敵を凍結',
        icon: 'skill_freeze',
        maxLevel: 3,
        levels: [
            { chance: 0.08, desc: '8%で凍結' },
            { chance: 0.15, desc: '15%で凍結' },
            { chance: 0.25, desc: '25%で凍結' },
        ],
    },
};

export class SkillManager {
    constructor(scene) {
        this.scene = scene;
        this.acquiredSkills = {};
    }

    getRandomSkills(count = 3) {
        const available = [];

        for (const [id, skill] of Object.entries(SKILLS)) {
            const currentLevel = this.acquiredSkills[id] ?? -1;
            if (currentLevel < skill.maxLevel - 1) {
                available.push({
                    ...skill,
                    currentLevel: currentLevel,
                    nextLevel: currentLevel + 1,
                });
            }
        }

        Phaser.Utils.Array.Shuffle(available);
        return available.slice(0, Math.min(count, available.length));
    }

    selectSkill(skillId) {
        if (!skillId) return;
        const currentLevel = this.acquiredSkills[skillId] ?? -1;
        const skill = SKILLS[skillId];

        if (!skill || currentLevel >= skill.maxLevel - 1) return;

        this.acquiredSkills[skillId] = currentLevel + 1;
        this.applySkillEffects();

        return skill.levels[currentLevel + 1];
    }

    applySkillEffects() {
        const player = this.scene.player;
        if (!player) return;

        player.resetStats();

        // Attack speed
        if (this.acquiredSkills.ATKSPD !== undefined) {
            const level = SKILLS.ATKSPD.levels[this.acquiredSkills.ATKSPD];
            player.attackInterval *= level.multiplier;
        }

        // Move speed
        if (this.acquiredSkills.MOVSPD !== undefined) {
            const level = SKILLS.MOVSPD.levels[this.acquiredSkills.MOVSPD];
            player.speed *= level.multiplier;
        }

        // Max HP
        if (this.acquiredSkills.MAXHP !== undefined) {
            const level = SKILLS.MAXHP.levels[this.acquiredSkills.MAXHP];
            player.maxHp += level.bonus;
            player.hp = player.maxHp;
        }

        // Damage
        if (this.acquiredSkills.DMG !== undefined) {
            const level = SKILLS.DMG.levels[this.acquiredSkills.DMG];
            player.damage *= level.multiplier;
        }

        // Shield
        if (this.acquiredSkills.SHIELD !== undefined) {
            const level = SKILLS.SHIELD.levels[this.acquiredSkills.SHIELD];
            player.activateShield(level.hits);
        }

        // Critical
        if (this.acquiredSkills.CRIT !== undefined) {
            const level = SKILLS.CRIT.levels[this.acquiredSkills.CRIT];
            player.critChance = level.chance;
            if (this.acquiredSkills.CRIT >= 2) {
                player.critMultiplier = 2.0;
            }
        }

        // Freeze
        if (this.acquiredSkills.FREEZE !== undefined) {
            const level = SKILLS.FREEZE.levels[this.acquiredSkills.FREEZE];
            player.freezeChance = level.chance;
        }
    }

    getProjectileModifiers() {
        const mods = {
            bounces: 0,
            extraShots: 0,
            homingStrength: 0,
            piercing: 0,
            magnetRange: 1,
        };

        if (this.acquiredSkills.BOUNCE !== undefined) {
            mods.bounces = SKILLS.BOUNCE.levels[this.acquiredSkills.BOUNCE].bounces;
        }
        if (this.acquiredSkills.MULTI !== undefined) {
            mods.extraShots = SKILLS.MULTI.levels[this.acquiredSkills.MULTI].extra;
        }
        if (this.acquiredSkills.HOMING !== undefined) {
            mods.homingStrength = SKILLS.HOMING.levels[this.acquiredSkills.HOMING].strength;
        }
        if (this.acquiredSkills.PIERCE !== undefined) {
            mods.piercing = SKILLS.PIERCE.levels[this.acquiredSkills.PIERCE].piercing;
        }
        if (this.acquiredSkills.MAGNET !== undefined) {
            mods.magnetRange = SKILLS.MAGNET.levels[this.acquiredSkills.MAGNET].range;
        }

        return mods;
    }
}
