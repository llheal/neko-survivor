import crypto from 'crypto';

// LINE Messaging API Webhook Handler
// Sends welcome message when user follows the bot

const CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;
const CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET;
const MINIAPP_URL = 'https://miniapp.line.me/2009305161-txfC9bAx';

export default async function handler(req, res) {
    // Health check for webhook URL verification
    if (req.method === 'GET') {
        return res.status(200).json({ status: 'ok' });
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // Verify LINE signature
    const signature = req.headers['x-line-signature'];
    if (!signature || !verifySignature(req.body, signature)) {
        return res.status(401).json({ error: 'Invalid signature' });
    }

    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const events = body.events || [];

    for (const event of events) {
        if (event.type === 'follow') {
            await sendWelcomeMessage(event.replyToken);
        }
    }

    return res.status(200).json({ status: 'ok' });
}

function verifySignature(body, signature) {
    if (!CHANNEL_SECRET) return true; // Skip if not set (dev mode)
    const bodyStr = typeof body === 'string' ? body : JSON.stringify(body);
    const hash = crypto
        .createHmac('SHA256', CHANNEL_SECRET)
        .update(bodyStr)
        .digest('base64');
    return hash === signature;
}

async function sendWelcomeMessage(replyToken) {
    const messages = [
        {
            type: 'flex',
            altText: '🐱 にゃんこサバイバーへようこそ！',
            contents: {
                type: 'bubble',
                size: 'mega',
                header: {
                    type: 'box',
                    layout: 'vertical',
                    contents: [
                        {
                            type: 'text',
                            text: '🐱 にゃんこサバイバー',
                            weight: 'bold',
                            size: 'xl',
                            color: '#FFD700',
                        },
                    ],
                    backgroundColor: '#1a1a2e',
                    paddingAll: '15px',
                },
                body: {
                    type: 'box',
                    layout: 'vertical',
                    contents: [
                        {
                            type: 'text',
                            text: 'ようこそ！🎉',
                            weight: 'bold',
                            size: 'lg',
                            margin: 'md',
                        },
                        {
                            type: 'text',
                            text: 'カワイイ猫を操作して、押し寄せるクマの大群をなぎ倒せ！レベルアップでスキルを選択し、どこまで生き残れるか挑戦しよう！',
                            wrap: true,
                            size: 'sm',
                            color: '#666666',
                            margin: 'md',
                        },
                        {
                            type: 'separator',
                            margin: 'lg',
                        },
                        {
                            type: 'box',
                            layout: 'vertical',
                            contents: [
                                {
                                    type: 'text',
                                    text: '🎮 ジョイスティックで移動',
                                    size: 'sm',
                                    color: '#555555',
                                },
                                {
                                    type: 'text',
                                    text: '⚔️ 自動で近くの敵を攻撃',
                                    size: 'sm',
                                    color: '#555555',
                                },
                                {
                                    type: 'text',
                                    text: '⬆️ レベルアップでスキル選択',
                                    size: 'sm',
                                    color: '#555555',
                                },
                            ],
                            spacing: 'sm',
                            margin: 'lg',
                        },
                    ],
                    backgroundColor: '#FFFFFF',
                },
                footer: {
                    type: 'box',
                    layout: 'vertical',
                    contents: [
                        {
                            type: 'button',
                            action: {
                                type: 'uri',
                                label: '🎮 ゲームをプレイする！',
                                uri: MINIAPP_URL,
                            },
                            style: 'primary',
                            color: '#e74c3c',
                            height: 'md',
                        },
                    ],
                    paddingAll: '15px',
                },
            },
        },
    ];

    const response = await fetch('https://api.line.me/v2/bot/message/reply', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${CHANNEL_ACCESS_TOKEN}`,
        },
        body: JSON.stringify({
            replyToken: replyToken,
            messages: messages,
        }),
    });

    if (!response.ok) {
        const error = await response.text();
        console.error('LINE API Error:', error);
    }
}
