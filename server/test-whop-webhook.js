const crypto = require('crypto');
const dotenv = require('dotenv');
const path = require('path');

// Load .env from the server directory
const envPath = path.resolve(__dirname, '.env');
dotenv.config({ path: envPath });

const WHOP_WEBHOOK_SECRET = process.env.WHOP_WEBHOOK_SECRET || 'test_secret_key';
const WEBHOOK_URL = 'http://localhost:3000/api/webhooks/whop';

async function sendTestWebhook() {
    const payload = {
        action: 'membership_activated',
        data: {
            email: 'alvinzwork237@gmail.com',
            user_id: 'user_12345'
        }
    };

    const body = JSON.stringify(payload);
    const id = 'wh_' + crypto.randomBytes(8).toString('hex');
    const timestamp = Math.floor(Date.now() / 1000).toString();

    // Verification Logic: id + "." + timestamp + "." + body
    const signedContent = `${id}.${timestamp}.${body}`;
    const hmac = crypto.createHmac('sha256', WHOP_WEBHOOK_SECRET);
    hmac.update(signedContent);
    const signature = hmac.digest('base64');

    console.log('Sending test webhook to:', WEBHOOK_URL);
    console.log('Payload:', body);

    try {
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'whop-signature': `v1,${signature}`,
                'whop-id': id,
                'whop-timestamp': timestamp
            },
            body: body
        });

        const data = await response.json();
        console.log('Response status:', response.status);
        console.log('Response body:', data);
    } catch (error) {
        console.error('Error sending webhook:', error.message);
    }
}

sendTestWebhook();
