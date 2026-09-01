# DermaCare — WhatsApp AI Lead & Appointment System (PRD V1.0)

Production-ready, grounded WhatsApp AI assistant and administrative management system for Dermatology & Aesthetic Clinics.

Built with **JavaScript (Node.js Express + React Vite)**.

---

## 🌟 Key Features

1. **Meta WhatsApp Cloud API Integration**:
   - Official WhatsApp Business Cloud API webhook (`/api/webhooks/whatsapp`) with challenge verification.
   - Message idempotency and deduplication on `wa_message_id`.
   - Outgoing text, interactive quick-reply buttons, and template messages.
   - Interactive WhatsApp Mobile Simulator included in dashboard for instant testing.

2. **Grounded AI Conversation Engine**:
   - **Zero Hallucinations**: Grounded strictly on clinic database records for fees, services, doctor schedules, and working hours.
   - **17 Intent Classifications**: `GREETING`, `SERVICE_INFORMATION`, `PRICE_INFORMATION`, `DOCTOR_INFORMATION`, `APPOINTMENT_BOOKING`, `APPOINTMENT_RESCHEDULE`, `APPOINTMENT_CANCEL`, `MEDICAL_QUESTION`, `HUMAN_REQUEST`, `EMERGENCY_SIGNAL`, etc.
   - **Medical Safety Guardrails**: Strict non-diagnostic policy. Medication inquiries automatically trigger safe guidance and create human handoffs.
   - **Multi-language Support**: Natural conversations in English, Hindi, and Hinglish.

3. **Deterministic Appointment Booking**:
   - Dynamic slot calculation respecting doctor shift hours, break times, and appointment duration.
   - Atomic reservation with conflict checks to eliminate double-booking.
   - Reschedule, cancellation, completion, and no-show workflows.

4. **Human Handoff & Receptionist Takeover**:
   - 1-click **Take Over** button: pauses AI immediately so receptionists can reply directly to the patient's WhatsApp from the dashboard.
   - **Return to AI**: resumes autonomous appointment booking anytime.

5. **Google Docs & Sheets Dashboard Live Sync (Toggleable via Flag)**:
   - Easily enabled/disabled via `.env` flag `ENABLE_GOOGLE_DOCS_SYNC=true/false` or the Dashboard Settings toggle.
   - Syncs approved FAQs directly from a Google Doc knowledge base.
   - Streams live leads and confirmed bookings to a connected Google Sheet.

6. **Comprehensive Clinic Dashboard**:
   - Overview KPI Metrics & Conversion Funnels (Qualification, Booking, Completion, No-show rates).
   - Live Conversations & Human Takeover Console.
   - Leads Kanban Board & Filterable Table.
   - Appointment Calendar & Slot Manager.
   - Treatments & Pricing Catalog.
   - Doctor Profiles & Shift Schedule Manager.
   - Approved FAQ Manager.
   - Security Audit Trail (DPDP Act compliance-ready).

---

## 🚀 Quick Start (Development)

### 1. Prerequisites
- Node.js v20+
- npm v10+

### 2. Install & Seed
```bash
# Clone repository
git clone <repo-url>
cd waani-whatapp-agent

# Install dependencies (workspaces)
npm install

# Seed clinic database (doctors, services, FAQs, sample leads)
npm run seed
```

### 3. Run Dev Server (API on 4000 + Web on 5173)
```bash
npm run dev
```

- **Web Dashboard**: [http://localhost:5173](http://localhost:5173)
- **API Server**: [http://localhost:4000](http://localhost:4000)
- **WhatsApp Webhook**: [http://localhost:4000/api/webhooks/whatsapp](http://localhost:4000/api/webhooks/whatsapp)

---

## 🧪 Test Suites & AI Evaluation

```bash
# Run Unit & Integration Tests (13/13 passing)
npm test

# Run 170+ Scenario AI Evaluation Suite (170/170 passing)
npm run test:eval
```

---

## ⚙️ Environment Configuration (`.env`)

```env
PORT=4000
NODE_ENV=development
APP_URL=http://localhost:4000
FRONTEND_URL=http://localhost:5173
JWT_SECRET=super_secret_jwt_key_change_in_production_32chars!

# WhatsApp Business Cloud API
WHATSAPP_PHONE_NUMBER_ID=100000000000001
WHATSAPP_ACCESS_TOKEN=EAAB_sample_meta_access_token
WHATSAPP_VERIFY_TOKEN=clinic_whatsapp_webhook_secret_verify_token

# Google Docs & Sheets Dashboard Live Sync Flag
ENABLE_GOOGLE_DOCS_SYNC=true
GOOGLE_DOCS_DOCUMENT_ID=1_sample_google_doc_id_for_clinic_knowledge_base
GOOGLE_SHEET_LEADS_DASHBOARD_ID=1_sample_google_sheet_id_for_live_lead_stream
```

---

## 🐳 Docker Deployment

```bash
docker-compose up -d --build
```

---

## 📚 Documentation Links
- [System Architecture](file:///d:/All%20Projects/Freelancing%20Projects/waani-whatapp-agent/docs/architecture.md)
- [Google Docs Integration Guide](file:///d:/All%20Projects/Freelancing%20Projects/waani-whatapp-agent/docs/google-docs-integration.md)
- [Production Deployment Guide](file:///d:/All%20Projects/Freelancing%20Projects/waani-whatapp-agent/docs/deployment.md)
- [WhatsApp Cloud API Setup](file:///d:/All%20Projects/Freelancing%20Projects/waani-whatapp-agent/docs/whatsapp.md)
- [Medical Safety & Guardrails](file:///d:/All%20Projects/Freelancing%20Projects/waani-whatapp-agent/docs/safety.md)
- [Clinic Admin Manual](file:///d:/All%20Projects/Freelancing%20Projects/waani-whatapp-agent/docs/admin-guide.md)
- [Client Handover Checklist](file:///d:/All%20Projects/Freelancing%20Projects/waani-whatapp-agent/docs/handover-checklist.md)