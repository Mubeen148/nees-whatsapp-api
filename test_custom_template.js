import { sendTemplateMessage } from './src/whatsappClient.js';

const TEST_PHONE = '923040054288'; // Your number
const TEMPLATE_NAME = 'invoices_created'; // The active template from your screenshot

console.log(`Attempting to send '${TEMPLATE_NAME}' template to ${TEST_PHONE}...`);

// We will try to send it with parameters. 
// If the template has no variables, WhatsApp might ignore them or return an error, 
// but if it sends, we know delivery works!
const components = [
    {
        type: 'body',
        parameters: [
            { type: 'text', text: 'Mr. Mubeen Ilyas' },   // {{1}}
            { type: 'text', text: 'INV-TEST-123' },       // {{2}}
            { type: 'text', text: 'PKR 500.00' }          // {{3}}
        ]
    }
];

sendTemplateMessage(TEST_PHONE, TEMPLATE_NAME, 'en', components)
    .then(response => {
        console.log('SUCCESS! WhatsApp API Response:', JSON.stringify(response, null, 2));
        console.log('\nCHECK YOUR PHONE NOW. You should receive the message (even if the text is wrong).');
    })
    .catch(error => {
        console.error('FAILED. Error:', error.response ? error.response.data : error.message);

        // If it fails because of parameter mismatch, try sending WITHOUT parameters
        if (error.response && error.response.data && error.response.data.error && error.response.data.error.code === 100) {
            console.log('\nRetrying without parameters (in case the template has no variables)...');
            sendTemplateMessage(TEST_PHONE, TEMPLATE_NAME, 'en', [])
                .then(res => console.log('SUCCESS (No Params)! Response:', JSON.stringify(res, null, 2)))
                .catch(err => console.error('FAILED AGAIN.', err.response ? err.response.data : err.message));
        }
    });
