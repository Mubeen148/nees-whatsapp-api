import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const {
  WA_PHONE_NUMBER_ID,
  CLOUD_API_ACCESS_TOKEN,
  CLOUD_API_VERSION = 'v21.0'
} = process.env;

if (!WA_PHONE_NUMBER_ID || !CLOUD_API_ACCESS_TOKEN) {
  console.warn('WARNING: WA_PHONE_NUMBER_ID or CLOUD_API_ACCESS_TOKEN is missing in .env');
}

const apiClient = axios.create({
  baseURL: `https://graph.facebook.com/${CLOUD_API_VERSION}/${WA_PHONE_NUMBER_ID}`,
  headers: {
    'Authorization': `Bearer ${CLOUD_API_ACCESS_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

// Helper to log errors cleanly
const logError = (error, context) => {
  if (error.response) {
    console.error(`[WhatsApp API Error] ${context}:`, JSON.stringify(error.response.data, null, 2));
  } else {
    console.error(`[WhatsApp API Error] ${context}:`, error.message);
  }
};

/**
 * Send a plain text message
 * @param {string} to - Recipient phone number (E.164 format without +)
 * @param {string} text - Message body
 */
export const sendTextMessage = async (to, text) => {
  try {
    const response = await apiClient.post('/messages', {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'text',
      text: { body: text }
    });
    return response.data;
  } catch (error) {
    logError(error, 'sendTextMessage');
    throw error;
  }
};

/**
 * Send a document (PDF, etc.)
 * @param {string} to - Recipient phone number
 * @param {string} link - Public URL of the document
 * @param {string} filename - Filename to display
 * @param {string} caption - Optional caption
 */
export const sendDocumentMessage = async (to, link, filename, caption = '') => {
  try {
    const response = await apiClient.post('/messages', {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'document',
      document: {
        link,
        filename,
        caption
      }
    });
    return response.data;
  } catch (error) {
    logError(error, 'sendDocumentMessage');
    throw error;
  }
};

/**
 * Send an image
 * @param {string} to - Recipient phone number
 * @param {string} link - Public URL of the image
 * @param {string} caption - Optional caption
 */
export const sendImageMessage = async (to, link, caption = '') => {
  try {
    const response = await apiClient.post('/messages', {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'image',
      image: {
        link,
        caption
      }
    });
    return response.data;
  } catch (error) {
    logError(error, 'sendImageMessage');
    throw error;
  }
};

/**
 * Send a video
 * @param {string} to - Recipient phone number
 * @param {string} link - Public URL of the video
 * @param {string} caption - Optional caption
 */
export const sendVideoMessage = async (to, link, caption = '') => {
  try {
    const response = await apiClient.post('/messages', {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'video',
      video: {
        link,
        caption
      }
    });
    return response.data;
  } catch (error) {
    logError(error, 'sendVideoMessage');
    throw error;
  }
};

/**
 * Send a template message
 * @param {string} to - Recipient phone number
 * @param {string} templateName - Name of the template in Meta Manager
 * @param {string} languageCode - e.g. 'en_US'
 * @param {Array} components - Template components (header, body parameters etc.)
 */
export const sendTemplateMessage = async (to, templateName, languageCode = 'en', components = []) => {
  try {
    const response = await apiClient.post('/messages', {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'template',
      template: {
        name: templateName,
        language: { code: languageCode },
        components
      }
    });
    return response.data;
  } catch (error) {
    logError(error, 'sendTemplateMessage');
    throw error;
  }
};
