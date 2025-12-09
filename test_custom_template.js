import { sendTemplateMessage } from './src/whatsappClient.js';

const TEST_PHONE = '923040054288'; // Your number
const TEMPLATE_NAME = 'invoices_with_pdf'; // The active template from your screenshot

console.log(`Attempting to send '${TEMPLATE_NAME}' template to ${TEST_PHONE}...`);

const components = [
    {
        type: 'header',
        parameters: [
            {
                type: 'document',
                document: {
                    link: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', // Sample PDF
                    filename: 'invoice.pdf'
                }
            }
        ]
    },
    {
        type: 'body',
        parameters: [
            { type: 'text', text: 'Mr. Mubeen Ilyas' },   // {{1}} Name
            { type: 'text', text: 'INV-TEST-3000' },      // {{2}} Invoice Number
            { type: 'text', text: 'PKR 1500.00' }         // {{3}} Amount
        ]
    }
];


sendTemplateMessage(TEST_PHONE, TEMPLATE_NAME, 'en', components)
    .then(response => {
        console.log('SUCCESS! WhatsApp API Response:', JSON.stringify(response, null, 2));
        console.log('\n--- CRITICAL TIP ---');
        console.log('The API accepted the message (Status: accepted), which means the CODE is correct.');
        console.log('If you do not see it on your phone, you MUST add ' + TEST_PHONE + ' to the "Test Numbers" list in Meta Dashboard.');
        console.log('You might also need to accept a verification code on that number to enable it.');
        console.log('--------------------\n');
    })
    .catch(error => {
        const errData = error.response ? error.response.data : error;
        console.error('FAILED. Error:', JSON.stringify(errData, null, 2));

        if (errData?.error?.code === 133010) {
            console.log('\n[!!! CRITICAL FIX REQUIRED !!!]');
            console.log(`Error 133010 means the recipient number ${TEST_PHONE} is NOT registered as a Test Number.`);
            console.log('1. Go to Meta App Dashboard -> WhatsApp -> API Setup.');
            console.log('2. Scroll to Step 2 "Send and receive messages".');
            console.log(`3. Click "Manage phone number list" and add ${TEST_PHONE}.`);
            console.log('4. CRITICAL: You will receive a code on WhatsApp. You MUST enter it in the dashboard to verify.');
        }
    });
