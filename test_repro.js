
import { handleInvoiceCreated } from './src/zohoHandler.js';

// Mock Request
const req = {
    body: {
        "Customer_number": "923040054288",
        "Customer_name": "Mr. Mubeen Ilyas",
        "Invoice_number": "INV-LHE-17577",
        "Invoice_total": "500.00",
        "Invoice_pdf_Url": "https://example.com/invoice.pdf",
        "days_overdue": "3"
    },
    headers: {
        'content-type': 'application/json'
    }
};

// Mock Response
const res = {
    status: (code) => {
        console.log(`Response Status: ${code}`);
        return {
            json: (data) => {
                console.log('Response JSON:', JSON.stringify(data, null, 2));
                return res;
            }
        };
    },
    json: (data) => {
        console.log('Response JSON:', JSON.stringify(data, null, 2));
        return res;
    }
};

console.log("--- Testing handleInvoiceCreated with User Payload ---");
handleInvoiceCreated(req, res).then(() => {
    console.log("Test finished (promise resolved)");
}).catch((err) => {
    console.log("Test finished (promise rejected)");
    // We expect it to fail at sendTextMessage, but that's fine. 
    // We want to verify it DOES NOT return 400.
});
