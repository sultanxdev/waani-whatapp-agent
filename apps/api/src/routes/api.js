import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { AuthController } from '../controllers/authController.js';
import { LeadsController } from '../controllers/leadsController.js';
import { AppointmentsController } from '../controllers/appointmentsController.js';
import { ConversationsController } from '../controllers/conversationsController.js';
import { ClinicController } from '../controllers/clinicController.js';
import { AnalyticsController } from '../controllers/analyticsController.js';
import { GoogleDocsController } from '../controllers/googleDocsController.js';
import { SimulatorController } from '../controllers/simulatorController.js';
import { WhatsAppWebhookController } from '../whatsapp/webhook.js';

const router = Router();

// 1. WhatsApp Webhook (Meta verified)
router.get('/webhooks/whatsapp', WhatsAppWebhookController.verifyWebhook);
router.post('/webhooks/whatsapp', WhatsAppWebhookController.handleWebhook);

// 2. Auth Routes
router.post('/auth/login', AuthController.login);
router.get('/auth/me', authenticateToken, AuthController.getProfile);

// 3. Leads Routes
router.get('/leads', authenticateToken, LeadsController.getLeads);
router.get('/leads/:id', authenticateToken, LeadsController.getLeadById);
router.post('/leads', authenticateToken, LeadsController.createLead);
router.patch('/leads/:id', authenticateToken, LeadsController.updateLead);
router.delete('/leads/:id', authenticateToken, LeadsController.deleteLead);

// 4. Appointments & Slots
router.get('/appointments', authenticateToken, AppointmentsController.getAppointments);
router.get('/appointments/slots', authenticateToken, AppointmentsController.getSlots);
router.post('/appointments', authenticateToken, AppointmentsController.createAppointment);
router.post('/appointments/:id/reschedule', authenticateToken, AppointmentsController.rescheduleAppointment);
router.post('/appointments/:id/cancel', authenticateToken, AppointmentsController.cancelAppointment);
router.patch('/appointments/:id/status', authenticateToken, AppointmentsController.updateStatus);

// 5. Conversations & Human Takeover
router.get('/conversations', authenticateToken, ConversationsController.getConversations);
router.get('/conversations/:id', authenticateToken, ConversationsController.getConversationById);
router.post('/conversations/:id/takeover', authenticateToken, ConversationsController.takeover);
router.post('/conversations/:id/release', authenticateToken, ConversationsController.release);
router.post('/conversations/:id/messages', authenticateToken, ConversationsController.sendMessage);

// 6. Clinic Knowledge Management
router.get('/clinic', authenticateToken, ClinicController.getClinic);
router.patch('/clinic', authenticateToken, ClinicController.updateClinic);

router.get('/doctors', authenticateToken, ClinicController.getDoctors);
router.post('/doctors', authenticateToken, ClinicController.createDoctor);
router.patch('/doctors/:id', authenticateToken, ClinicController.updateDoctor);
router.delete('/doctors/:id', authenticateToken, ClinicController.deleteDoctor);

router.get('/services', authenticateToken, ClinicController.getServices);
router.post('/services', authenticateToken, ClinicController.createService);
router.patch('/services/:id', authenticateToken, ClinicController.updateService);
router.delete('/services/:id', authenticateToken, ClinicController.deleteService);

router.get('/faqs', authenticateToken, ClinicController.getFaqs);
router.post('/faqs', authenticateToken, ClinicController.createFaq);
router.patch('/faqs/:id', authenticateToken, ClinicController.updateFaq);
router.delete('/faqs/:id', authenticateToken, ClinicController.deleteFaq);

// 7. Analytics
router.get('/analytics', authenticateToken, AnalyticsController.getMetrics);

// 8. Google Docs & Sheets Dashboard Live Integration
router.get('/google-docs/status', authenticateToken, GoogleDocsController.getStatus);
router.post('/google-docs/toggle', authenticateToken, GoogleDocsController.toggleSync);
router.post('/google-docs/sync', authenticateToken, GoogleDocsController.syncKnowledge);
router.get('/google-docs/export', authenticateToken, GoogleDocsController.exportLiveSheet);
router.get('/audit-logs', authenticateToken, GoogleDocsController.getAuditLogs);

// 9. WhatsApp Interactive Simulator
router.post('/simulator/message', SimulatorController.simulateMessage);
router.get('/simulator/conversation', SimulatorController.getSimulatedConversation);
router.post('/simulator/reset', SimulatorController.resetSimulation);

export default router;
