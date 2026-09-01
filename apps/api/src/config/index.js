import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

export const config = {
  port: parseInt(process.env.PORT || '4000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  appUrl: process.env.APP_URL || 'http://localhost:4000',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  jwtSecret: process.env.JWT_SECRET || 'derma_whatsapp_secret_jwt_key_2026',

  // WhatsApp Meta Cloud API
  whatsapp: {
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '100000000000001',
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN || '',
    verifyToken: process.env.WHATSAPP_VERIFY_TOKEN || 'clinic_whatsapp_webhook_secret_verify_token',
    apiVersion: process.env.WHATSAPP_API_VERSION || 'v19.0'
  },

  // AI / OpenAI
  ai: {
    openaiApiKey: process.env.OPENAI_API_KEY || '',
    model: process.env.AI_MODEL || 'gpt-4o-mini',
    temperature: parseFloat(process.env.AI_TEMPERATURE || '0.2')
  },

  // Clinic
  clinic: {
    id: process.env.CLINIC_ID || 'clinic_derma_care_01',
    name: process.env.CLINIC_NAME || 'DermaCare Skin & Laser Clinic',
    phone: process.env.CLINIC_PHONE || '+919876543210',
    email: process.env.CLINIC_EMAIL || 'care@dermacareclinic.com',
    address: process.env.CLINIC_ADDRESS || 'Suite 402, DLF Cyber City, Sector 24, Gurugram, Haryana 122002',
    currency: process.env.CLINIC_CURRENCY || 'INR'
  },

  // Feature Flags
  googleDocs: {
    enabled: process.env.ENABLE_GOOGLE_DOCS_SYNC === 'true',
    docId: process.env.GOOGLE_DOCS_DOCUMENT_ID || '',
    sheetId: process.env.GOOGLE_SHEET_LEADS_DASHBOARD_ID || '',
    serviceAccountEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || '',
    privateKey: (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n')
  },

  reminders: {
    enabled: process.env.ENABLE_AUTOMATED_REMINDERS !== 'false',
    hoursBefore: parseInt(process.env.REMINDER_HOURS_BEFORE || '24', 10)
  },

  auditLogging: process.env.ENABLE_AUDIT_LOGGING !== 'false'
};

export default config;
