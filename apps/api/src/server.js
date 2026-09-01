import express from 'express';
import cors from 'cors';
import http from 'http';
import config from './config/index.js';
import db from './database/db.js';
import { seedDatabase } from './database/seed.js';
import apiRouter from './routes/api.js';

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Auto-seed if database is uninitialized
if (!db.data.clinics || db.data.clinics.length === 0) {
  seedDatabase();
}

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'HEALTHY',
    service: 'Dermatology WhatsApp AI System',
    version: '1.0.0',
    googleDocsSync: config.googleDocs.enabled ? 'ENABLED' : 'DISABLED',
    timestamp: new Date().toISOString()
  });
});

// Mount API routes
app.use('/api', apiRouter);

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Server Error]', err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

server.listen(config.port, () => {
  console.log(`====================================================`);
  console.log(`🏥 DermaCare WhatsApp AI System API Running`);
  console.log(`📡 URL: ${config.appUrl}`);
  console.log(`📱 WhatsApp Webhook: ${config.appUrl}/api/webhooks/whatsapp`);
  console.log(`📄 Google Docs Sync: ${config.googleDocs.enabled ? 'ACTIVE (Enabled)' : 'DISABLED (Flag is false)'}`);
  console.log(`====================================================`);
});

export { app, server };
