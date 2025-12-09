import { sendTextMessage, sendDocumentMessage, sendTemplateMessage } from './whatsappClient.js';

// Helper to extract case-insensitive keys
const getField = (body, ...keys) => {
    for (const key of keys) {
        if (body[key] !== undefined) return body[key];
    }
    return null;
};

// Helper to format phone number (03xx -> 923xx)
const formatPhoneNumber = (phone) => {
    if (!phone) return null;
    let cleaned = phone.toString().replace(/\D/g, ''); // Remove non-digits

    // Handle local 03xx format (e.g., 03001234567 -> 923001234567)
    if (cleaned.startsWith('0') && cleaned.length === 11) {
        cleaned = '92' + cleaned.substring(1);
    }

    // Handle 92 prefix if missing on 10 digit number (rare but possible: 3001234567 -> 923001234567)
    if (cleaned.length === 10) {
        cleaned = '92' + cleaned;
    }

    return cleaned;
};

/**
 * Handle Invoice Created Event
 */
export const handleInvoiceCreated = async (req, res) => {
    try {
        console.log('handleInvoiceCreated received body:', JSON.stringify(req.body, null, 2));
        const body = req.body;
        const rawPhone = getField(body, 'customer_phone', 'Customer_number', 'Customer_Phone');
        const phone = formatPhoneNumber(rawPhone);

        const name = getField(body, 'customer_name', 'Customer_name', 'Customer_Name');
        const invoiceNo = getField(body, 'invoice_number', 'Invoice_number', 'Invoice_Number');
        const total = getField(body, 'invoice_total', 'Invoice_total', 'Invoice_Total');
        const pdfUrl = getField(body, 'invoice_pdf_url', 'Invoice_pdf_Url', 'Invoice_PDF_URL');

        if (!phone) {
            console.error('Missing or invalid phone number in handleInvoiceCreated. Raw:', rawPhone);
            return res.status(400).json({ error: 'Missing or invalid phone number' });
        }

        console.log(`Processing Invoice for Phone: ${phone} (Raw: ${rawPhone})`);

        // Use the 'invoices_with_pdf' template
        // Template Body: Dear {{1}}, your invoice {{2}} for {{3}} has been created.
        // Template Header: Document

        const components = [
            {
                type: 'body',
                parameters: [
                    { type: 'text', text: name || 'Customer' },
                    { type: 'text', text: invoiceNo || 'N/A' },
                    { type: 'text', text: total || '0.00' }
                ]
            }
        ];

        if (pdfUrl) {
            components.unshift({
                type: 'header',
                parameters: [
                    {
                        type: 'document',
                        document: {
                            link: pdfUrl,
                            filename: `Invoice-${invoiceNo}.pdf`
                        }
                    }
                ]
            });
        } else {
            console.warn('WARNING: No PDF URL provided for invoice_with_pdf template. Message might fail if header is mandatory.');
        }

        const response = await sendTemplateMessage(phone, 'invoices_with_pdf', 'en', components);
        console.log('WhatsApp Template Response:', JSON.stringify(response, null, 2));

        res.json({ status: 'success', message: 'Invoice created notification sent via template' });
    } catch (error) {
        console.error('Error in handleInvoiceCreated:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

/**
 * Handle Payment Received Event
 */
export const handlePaymentReceived = async (req, res) => {
    try {
        console.log('handlePaymentReceived received body:', JSON.stringify(req.body, null, 2));
        const body = req.body;
        const rawPhone = getField(body, 'customer_phone', 'Customer_number', 'Customer_Phone');
        const phone = formatPhoneNumber(rawPhone);

        const amount = getField(body, 'payment_amount', 'Payment_amount', 'Amount');
        const invoiceNos = getField(body, 'invoice_numbers', 'Invoice_numbers', 'Invoice_Numbers');

        if (!phone) {
            console.error('Missing or invalid phone number in handlePaymentReceived. Raw:', rawPhone);
            return res.status(400).json({ error: 'Missing or invalid phone number' });
        }

        const message = `Thank you! We have received your payment of ${amount} for invoice(s): ${invoiceNos}.`;
        await sendTextMessage(phone, message);

        res.json({ status: 'success', message: 'Payment received notification sent' });
    } catch (error) {
        console.error('Error in handlePaymentReceived:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

/**
 * Handle Credit Note Created Event
 */
export const handleCreditNoteCreated = async (req, res) => {
    try {
        console.log('handleCreditNoteCreated received body:', JSON.stringify(req.body, null, 2));
        const body = req.body;
        const rawPhone = getField(body, 'customer_phone', 'Customer_number', 'Customer_Phone');
        const phone = formatPhoneNumber(rawPhone);

        const creditNoteNo = getField(body, 'credit_note_number', 'Credit_note_number', 'CreditNote_Number');
        const amount = getField(body, 'credit_note_amount', 'Credit_note_amount', 'Amount');

        if (!phone) {
            console.error('Missing or invalid phone number in handleCreditNoteCreated. Raw:', rawPhone);
            return res.status(400).json({ error: 'Missing or invalid phone number' });
        }

        const message = `A credit note ${creditNoteNo} for ${amount} has been created for your account.`;
        await sendTextMessage(phone, message);

        res.json({ status: 'success', message: 'Credit note notification sent' });
    } catch (error) {
        console.error('Error in handleCreditNoteCreated:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

/**
 * Handle Invoice Overdue Event
 */
export const handleInvoiceOverdue = async (req, res) => {
    try {
        console.log('handleInvoiceOverdue received body:', JSON.stringify(req.body, null, 2));
        const body = req.body;
        const rawPhone = getField(body, 'customer_phone', 'Customer_number', 'Customer_Phone');
        const phone = formatPhoneNumber(rawPhone);

        const name = getField(body, 'customer_name', 'Customer_name', 'Customer_Name');
        const invoiceNo = getField(body, 'invoice_number', 'Invoice_number', 'Invoice_Number');
        const daysOverdue = getField(body, 'days_overdue', 'Days_overdue', 'Days_Overdue');
        const pdfUrl = getField(body, 'invoice_pdf_url', 'Invoice_pdf_Url', 'Invoice_PDF_URL');

        if (!phone) {
            console.error('Missing or invalid phone number in handleInvoiceOverdue. Raw:', rawPhone);
            return res.status(400).json({ error: 'Missing or invalid phone number' });
        }

        const message = `Dear ${name || 'Customer'}, this is a reminder that invoice ${invoiceNo} is ${daysOverdue} days overdue. Please make a payment at your earliest convenience.`;
        await sendTextMessage(phone, message);

        if (pdfUrl) {
            await sendDocumentMessage(phone, pdfUrl, `Overdue-Invoice-${invoiceNo}.pdf`, `Overdue Invoice #${invoiceNo}`);
        }

        res.json({ status: 'success', message: 'Overdue notification sent' });
    } catch (error) {
        console.error('Error in handleInvoiceOverdue:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
