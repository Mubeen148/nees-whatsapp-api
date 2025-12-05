import express from 'express';
import dotenv from 'dotenv';
import { sendTextMessage } from './whatsappClient.js';
import {
    handleInvoiceCreated,
    handlePaymentReceived,
    handleCreditNoteCreated,
    handleInvoiceOverdue
} from './zohoHandler.js';

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Handle URL-encoded bodies

// DEBUG: Log all Zoho requests
app.use('/zoho', (req, res, next) => {
    console.log(`\n--- [${new Date().toISOString()}] Incoming Zoho Request ---`);
    console.log('Method:', req.method);
    console.log('URL:', req.originalUrl);
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    console.log('Body:', JSON.stringify(req.body, null, 2));
    console.log('---------------------------------------------------\n');
    next();
});

const { PORT = 3000, WEBHOOK_VERIFY_TOKEN } = process.env;

// 1. Health Check
app.get('/health', (req, res) => {
    res.send('WhatsApp Integration Service is running');
});

// 2. WhatsApp Webhook Verification (GET)
app.get('/webhook', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token) {
        if (mode === 'subscribe' && token === WEBHOOK_VERIFY_TOKEN) {
            console.log('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);
        } else {
            res.sendStatus(403);
        }
    } else {
        res.sendStatus(400);
    }
});

// 3. WhatsApp Webhook Event Handler (POST)
app.post('/webhook', async (req, res) => {
    try {
        const body = req.body;

        // Check if this is an event from a WhatsApp subscription
        if (body.object) {
            if (
                body.entry &&
                body.entry[0].changes &&
                body.entry[0].changes[0] &&
                body.entry[0].changes[0].value.messages &&
                body.entry[0].changes[0].value.messages[0]
            ) {
                const change = body.entry[0].changes[0].value;
                const message = change.messages[0];
                const from = message.from; // Sender's phone number
                const msgType = message.type;

                console.log(`[Incoming Message] From: ${from}, Type: ${msgType}`);
                console.log('Full Payload:', JSON.stringify(message, null, 2));

                // Auto-reply logic based on message type
                let replyText = '';

                switch (msgType) {
                    case 'text':
                        replyText = `Thanks for your message: "${message.text.body}". We will get back to you shortly.`;
                        break;
                    case 'image':
                        replyText = `We received your image (ID: ${message.image.id}). Thanks!`;
                        break;
                    case 'video':
                        replyText = `We received your video (ID: ${message.video.id}). Thanks!`;
                        break;
                    case 'audio':
                        replyText = `We received your audio message (ID: ${message.audio.id}). Thanks!`;
                        break;
                    case 'document':
                        replyText = `We received your document: "${message.document.filename}". Thanks!`;
                        break;
                    default:
                        replyText = `We received a message of type "${msgType}". Thanks!`;
                }

                // Send the auto-reply
                await sendTextMessage(from, replyText);
            }
            res.sendStatus(200);
        } else {
            res.sendStatus(404);
        }
    } catch (error) {
        console.error('Error processing webhook:', error);
        res.sendStatus(500);
    }
});

// 4. Zoho Books Webhooks
app.post('/zoho/invoice-created', handleInvoiceCreated);
app.post('/zoho/invoice_created', handleInvoiceCreated); // Handle typo

app.post('/zoho/payment-received', handlePaymentReceived);
app.post('/zoho/payment_received', handlePaymentReceived); // Handle typo

app.post('/zoho/credit-note-created', handleCreditNoteCreated);
app.post('/zoho/credit_note_created', handleCreditNoteCreated); // Handle typo

app.post('/zoho/invoice-overdue', handleInvoiceOverdue);
app.post('/zoho/invoice_overdue', handleInvoiceOverdue); // Handle typo

// DEBUG: Catch-all for the mysterious /zoho-webhook requests
app.post('/zoho-webhook', (req, res) => {
    console.log('!!! RECEIVED REQUEST AT /zoho-webhook !!!');
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    console.log('Body:', JSON.stringify(req.body, null, 2));
    res.json({ status: 'received', message: 'This is a debug response' });
});

// 5. Broadcast / Bulk Messaging
app.post('/broadcast', async (req, res) => {
    const { message, numbers } = req.body;

    if (!message || !Array.isArray(numbers) || numbers.length === 0) {
        return res.status(400).json({ error: 'Invalid request. Provide "message" string and "numbers" array.' });
    }

    const results = [];

    // Note: In production, use a queue (e.g., BullMQ) to handle rate limits and large lists.
    for (const number of numbers) {
        try {
            const response = await sendTextMessage(number, message);
            results.push({ number, status: 'success', messageId: response.messages?.[0]?.id });
        } catch (error) {
            results.push({ number, status: 'failed', error: error.message });
        }
    }

    res.json({ results });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
