import axios from 'axios';

// Mimic local number format 03xx
const TEST_PHONE = '03040054288'; // This should surely be converted to 923...
// TIP: If you want to test with your real number, change it here, but keep '03' start to test converter.

const payload = {
    customer_name: 'Test Customer',
    customer_phone: TEST_PHONE,
    invoice_number: 'INV-TEST-003',
    invoice_total: 'PKR 500.00',
    invoice_pdf_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
};

const WEBHOOK_URL = 'http://localhost:3000/zoho/invoice-created'; // Assuming local server

console.log(`Sending payload with phone ${TEST_PHONE} to ${WEBHOOK_URL}...`);

axios.post(WEBHOOK_URL, payload)
    .then(res => {
        console.log('Webhook Response:', res.status, res.data);
    })
    .catch(err => {
        console.error('Webhook Error:', err.response ? err.response.data : err.message);
    });
