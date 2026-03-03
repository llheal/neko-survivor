// main.js - Phaser game configuration and entry point with LIFF integration
import Phaser from 'phaser';
window.Phaser = Phaser;
import liff from '@line/liff';
import './style.css';
import { BootScene } from './scenes/BootScene.js';
import { TitleScene } from './scenes/TitleScene.js';
import { GameScene } from './scenes/GameScene.js';
import { UIScene } from './scenes/UIScene.js';
import { GameOverScene } from './scenes/GameOverScene.js';

// LIFF ID (開発用)
const LIFF_ID = '2009305159-Cw9QZDYT';

function startGame() {
    const config = {
        type: Phaser.AUTO,
        parent: 'game-container',
        width: 390,
        height: 844,
        backgroundColor: '#1a1a2e',
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
        },
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 0 },
                debug: false,
            },
        },
        input: {
            touch: {
                capture: true,
            },
        },
        scene: [BootScene, TitleScene, GameScene, UIScene, GameOverScene],
        render: {
            pixelArt: false,
            antialias: true,
            antialiasGL: true,
        },
        audio: {
            disableWebAudio: false,
        },
    };

    const game = new Phaser.Game(config);

    // Handle resize
    window.addEventListener('resize', () => {
        game.scale.resize(window.innerWidth, window.innerHeight);
    });
}

// Initialize LIFF, then start game
async function init() {
    try {
        await liff.init({ liffId: LIFF_ID });
        console.log('LIFF initialized successfully');

        // Store liff instance globally for sharing etc.
        window.liff = liff;

        if (liff.isInClient()) {
            console.log('Running inside LINE app');
        } else {
            console.log('Running in external browser');
        }
    } catch (err) {
        console.warn('LIFF init failed (running standalone):', err.message);
    }

    // Start game regardless of LIFF status
    startGame();
}

init();
