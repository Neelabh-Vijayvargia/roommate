import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

let client: twilio.Twilio | null = null;

if (accountSid && authToken) {
    client = twilio(accountSid, authToken);
} else {
    console.warn('⚠️  Twilio credentials not set. SMS will not be sent.');
}

export async function sendSMS(
    to: string,
    body: string
): Promise<{ success: boolean; error?: string }> {
    if (!client || !fromNumber) {
        console.log(`📱 SMS (not sent — no Twilio config):\n  To: ${to}\n  Body: ${body}`);
        return { success: false, error: 'Twilio not configured' };
    }

    try {
        await client.messages.create({
            body,
            from: fromNumber,
            to,
        });
        console.log(`📱 SMS sent to ${to}`);
        return { success: true };
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error(`❌ SMS failed: ${message}`);
        return { success: false, error: message };
    }
}
