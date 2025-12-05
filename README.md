# WhatsApp-Zoho Integration Service

This Node.js service integrates Meta's WhatsApp Cloud API with Zoho Books. It handles:
- Sending Invoice, Credit Note, and Payment notifications from Zoho to customers.
- Receiving messages (Text, Image, Video, Audio, Document) from customers.
- Broadcasting messages to multiple numbers.

## Prerequisites

- Node.js 18+
- A Meta Developer App with WhatsApp Product enabled.
- A Zoho Books account.

## Setup

1.  **Install Dependencies**
    ```bash
    npm install
    ```

2.  **Configure Environment**
    - Copy `.env.example` to `.env`:
      ```bash
      cp .env.example .env
      ```
    - Fill in the values in `.env`:
      - `WA_PHONE_NUMBER_ID`: From Meta Dashboard > WhatsApp > API Setup.
      - `CLOUD_API_ACCESS_TOKEN`: A permanent token from Meta Business Settings > System Users.
      - `WEBHOOK_VERIFY_TOKEN`: A random string you create (e.g., `my_secure_token_123`).

## Running the Server

- **Development Mode** (auto-restart on changes):
  ```bash
  npm run dev
  ```
- **Production Mode**:
  ```bash
  npm start
  ```

The server runs on port `3000` by default.

## Configuration

### 1. WhatsApp Webhook (Meta Dashboard)
1.  Go to your App Dashboard > WhatsApp > Configuration.
2.  Click **Edit** under Webhook.
3.  **Callback URL**: Your public server URL + `/webhook` (e.g., `https://your-domain.com/webhook`).
4.  **Verify Token**: The `WEBHOOK_VERIFY_TOKEN` you set in `.env`.
5.  Verify and Save.
6.  Under **Webhook fields**, subscribe to `messages`.

### 2. Zoho Books Webhooks
Create automation rules in Zoho Books (Settings > Automation > Webhooks) for each event.

**Common Settings:**
- **Method**: POST
- **Entity**: Invoice / Payment / Credit Note
- **URL**: Your public server URL + endpoint (see below)
- **Body Type**: JSON

#### A. Invoice Created
- **Endpoint**: `/zoho/invoice-created`
- **JSON Body**:
  ```json
  {
    "customer_phone": "${Customer.Mobile}",
    "customer_name": "${Customer.First Name}",
    "invoice_number": "${Invoice.Invoice Number}",
    "invoice_total": "${Invoice.Total}",
    "invoice_pdf_url": "URL_TO_PUBLIC_PDF_OR_SIGNED_URL"
  }
  ```

#### B. Payment Received
- **Endpoint**: `/zoho/payment-received`
- **JSON Body**:
  ```json
  {
    "customer_phone": "${Customer.Mobile}",
    "customer_name": "${Customer.First Name}",
    "payment_number": "${Payment.Payment Number}",
    "payment_amount": "${Payment.Amount}",
    "invoice_numbers": "${Payment.Invoice Numbers}"
  }
  ```

#### C. Credit Note Created
- **Endpoint**: `/zoho/credit-note-created`
- **JSON Body**:
  ```json
  {
    "customer_phone": "${Customer.Mobile}",
    "customer_name": "${Customer.First Name}",
    "creditnote_number": "${CreditNote.Credit Note Number}",
    "creditnote_amount": "${CreditNote.Total}",
    "creditnote_pdf_url": "URL_TO_PUBLIC_PDF"
  }
  ```

#### D. Invoice Overdue
- **Endpoint**: `/zoho/invoice-overdue`
- **Trigger**: Scheduled workflow (e.g., 1 day after due date).
- **JSON Body**:
  ```json
  {
    "customer_phone": "${Customer.Mobile}",
    "customer_name": "${Customer.First Name}",
    "invoice_number": "${Invoice.Invoice Number}",
    "invoice_total": "${Invoice.Total}",
    "invoice_pdf_url": "URL_TO_PUBLIC_PDF",
    "days_overdue": "X"
  }
  ```

## API Endpoints

- `GET /health`: Check server status.
- `POST /broadcast`: Send a message to multiple numbers.
  ```json
  {
    "message": "Hello everyone!",
    "numbers": ["923001234567", "923001234568"]
  }
  ```
