import { sendTextMessage } from './src/whatsappClient.js';

const TEST_PHONE = '923040054288';

console.log(`Attempting to send plain text to ${TEST_PHONE}...`);
console.log('NOTE: This will ONLY work if you have messaged the bot in the last 24 hours.');

sendTextMessage(TEST_PHONE, 'Hello! This is a test message from your code.')
    .then(response => {
        console.log('SUCCESS! WhatsApp API Response:', JSON.stringify(response, null, 2));
    })
    .catch(error => {
        console.error('FAILED. Error:', error.response ? error.response.data : error.message);
    });
