const http = require('http');
const crypto = require('crypto');

// ============================================
// LINE Messaging API 共通Webhookサーバー
// 全Mini App共通で使用
// ============================================

const CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN
    || 'xiMhlDNrq6UMWJRcC+t3eWfIh9uqH7ZgcE8anl+1EGEpxvet3V52xX1ASVLqLTLgrYgo83oBm1nIeKDNtW8YZr1T3lwF2VN1TQEPwhWkJr357LCrsTEdhcbd4RzxNwQCoQX4X6urDe9XPbacSGANFwdB04t89/1O/w1cDnyilFU=';
const CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET
    || '63c0e44b0633d7acd94671033501c775';
const PORT = process.env.PORT || 8000;

// ============================================
// 全APP一覧（新APP追加時はここに追記するだけ）
// ============================================
const APPS = [
    {
        name: '🐱 にゃんこサバイバー',
        description: 'カワイイ猫でクマの大群をなぎ倒すローグライクゲーム！',
        url: 'https://miniapp.line.me/2009305161-txfC9bAx',
        buttonLabel: '🎮 プレイする！',
        buttonColor: '#e74c3c',
    },
    {
        name: '🔮 西洋占い',
        description: '毎日の運勢をチェック！12星座の詳細占い',
        url: 'https://miniapp.line.me/2009283727-N8DPpof7',
        buttonLabel: '🔮 占う！',
        buttonColor: '#8e44ad',
    },
    // ★ 新APP追加時はここに追記 ★
    // {
    //     name: '新APP名',
    //     description: '説明',
    //     url: 'https://miniapp.line.me/xxxxx',
    //     buttonLabel: 'ボタン文',
    //     buttonColor: '#カラー',
    // },
];

// ============================================
// Webhook Handler
// ============================================
function verifySignature(body, signature) {
    const hash = crypto
        .createHmac('SHA256', CHANNEL_SECRET)
        .update(body)
        .digest('base64');
    return hash === signature;
}

function buildWelcomeMessage() {
    // カルーセルで全APP一覧を送信
    const bubbles = APPS.map(app => ({
        type: 'bubble',
        size: 'kilo',
        header: {
            type: 'box',
            layout: 'vertical',
            contents: [{
                type: 'text',
                text: app.name,
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
            contents: [{
                type: 'text',
                text: app.description,
                wrap: true,
                size: 'sm',
                color: '#666666',
            }],
        },
        footer: {
            type: 'box',
            layout: 'vertical',
            contents: [{
                type: 'button',
                action: {
                    type: 'uri',
                    label: app.buttonLabel,
                    uri: app.url,
                },
                style: 'primary',
                color: app.buttonColor,
            }],
            paddingAll: '10px',
        },
    }));

    return {
        type: 'flex',
        altText: 'ようこそ！🎉 KM-Studioのミニアプリをお楽しみください！',
        contents: {
            type: 'carousel',
            contents: bubbles,
        },
    };
}

async function sendReply(replyToken, messages) {
    const res = await fetch('https://api.line.me/v2/bot/message/reply', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${CHANNEL_ACCESS_TOKEN}`,
        },
        body: JSON.stringify({ replyToken, messages: Array.isArray(messages) ? messages : [messages] }),
    });
    if (!res.ok) {
        console.error('LINE API Error:', res.status, await res.text());
    }
}

async function handleEvent(event) {
    if (event.type === 'follow') {
        console.log(`[FOLLOW] userId: ${event.source?.userId}`);
        await sendReply(event.replyToken, [
            {
                type: 'text',
                text: 'ようこそ！🎉\nKM-Studioのミニアプリをお楽しみください！',
            },
            buildWelcomeMessage(),
        ]);
    }
}

// ============================================
// HTTP Server
// ============================================
const server = http.createServer((req, res) => {
    // Health check
    if (req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok', apps: APPS.length }));
        return;
    }

    if (req.method !== 'POST') {
        res.writeHead(405);
        res.end('Method Not Allowed');
        return;
    }

    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
        // Verify signature
        const signature = req.headers['x-line-signature'];
        if (!signature || !verifySignature(body, signature)) {
            console.warn('Invalid signature');
            res.writeHead(401);
            res.end('Invalid signature');
            return;
        }

        try {
            const parsed = JSON.parse(body);
            const events = parsed.events || [];
            for (const event of events) {
                await handleEvent(event);
            }
        } catch (e) {
            console.error('Error handling event:', e);
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok' }));
    });
});

server.listen(PORT, () => {
    console.log(`LINE Webhook Server running on port ${PORT}`);
    console.log(`Registered apps: ${APPS.map(a => a.name).join(', ')}`);
});
