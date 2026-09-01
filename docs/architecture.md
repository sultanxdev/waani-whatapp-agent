# System Architecture — Dermatology WhatsApp AI Lead & Appointment System

## 1. Overview
The Dermatology WhatsApp AI Lead & Appointment System is a custom software implementation designed to automate customer inquiries, qualify leads, deterministic slot appointment bookings, and human receptionist handoffs for dermatology clinics.

```
                  ┌───────────────────────────────┐
                  │  WhatsApp Customer (Patient)  │
                  └──────────────┬────────────────┘
                                 │
                     Meta WhatsApp Cloud API
                                 │ Webhook (POST /api/webhooks/whatsapp)
                                 ▼
                  ┌───────────────────────────────┐
                  │  Express.js Backend API (JS)  │
                  │  - Idempotency Deduplication  │
                  │  - 24-hr Window Management    │
                  └──────────────┬────────────────┘
                                 │
     ┌───────────────────────────┼───────────────────────────┐
     ▼                           ▼                           ▼
┌──────────────┐        ┌──────────────────┐        ┌──────────────────┐
│  AI Engine   │        │ Booking Service  │        │ Google Docs Sync │
│ - 17 Intents │        │ - Deterministic  │        │ - KB / FAQ sync  │
│ - Safety     │        │ - Atomic Locks   │        │ - Live Lead Log  │
│ - Grounding  │        │ - Conflict Check │        │ - ENV Flag ON/OFF│
└──────┬───────┘        └────────┬─────────┘        └────────┬─────────┘
       │                         │                           │
       └─────────────────────────┼───────────────────────────┘
                                 ▼
                     ┌───────────────────────┐
                     │   Database Storage    │
                     │  - Leads & Pipeline   │
                     │  - Appointments/Slots │
                     │  - Doctors & Services │
                     │  - Audit Logs (DPDP)  │
                     └───────────┬───────────┘
                                 ▲
                                 │ REST API & Live Refresh
                     ┌───────────┴───────────┐
                     │ React Admin Dashboard │
                     │ - Live Takeover       │
                     │ - Leads Kanban        │
                     │ - Calendar & Slots    │
                     │ - WhatsApp Simulator  │
                     └───────────────────────┘
```

## 2. Core Architectural Principles
1. **AI Does Not Own Truth**: Pricing, availability, doctors, and working hours are grounded strictly from the database. The AI cannot invent slots or hallucinate pricing.
2. **Medical Safety First**: Non-diagnostic policy. Any prescription or home diagnosis inquiry is immediately routed to human handoff with safe guidance.
3. **Deterministic Booking**: Slots are calculated based on doctor shifts and break times, and reserved atomically to eliminate double-booking.
4. **Human Handoff as 1st-Class Citizen**: Staff can take over any active conversation, instantly pausing the AI assistant, and resume AI with one click.
5. **Toggleable Integrations**: Google Docs and Google Sheets synchronization can be enabled or disabled cleanly via environment flags with zero downtime.
