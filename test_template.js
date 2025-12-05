import { sendTemplateMessage } from './src/whatsappClient.js';

const TEST_PHONE = '923040054288'; // User's number from previous logs

console.log(`Attempting to send 'hello_world' template to ${TEST_PHONE}...`);

sendTemplateMessage(TEST_PHONE, 'hello_world', 'en_US')
    .then(response => {
        console.log('SUCCESS! WhatsApp API Response:', JSON.stringify(response, null, 2));
        console.log('\nCHECK YOUR PHONE NOW. You should see a "Hello World" message.');
    })
    .catch(error => {
        console.error('FAILED. Error:', error.response ? error.response.data : error.message);
    });
