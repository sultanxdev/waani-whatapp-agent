# Google Docs & Sheets Dashboard Integration Guide

This system includes a native, toggleable Google Docs knowledge sync and Google Sheets live lead streaming feature.

## 1. Feature Overview
The clinic can maintain their FAQ knowledge base in a standard Google Doc or track inquiries in real-time in a Google Sheet dashboard. The system reads approved clinic information directly from the doc and streams new patient bookings into the connected spreadsheet.

## 2. Enabling and Disabling via Environment Flag
The integration can be turned ON or OFF at any time without code modifications using the flag in your `.env` file:

```env
# Set to 'true' to enable Google Docs sync, 'false' to disable
ENABLE_GOOGLE_DOCS_SYNC=true

# Google Doc containing clinic knowledge & FAQ definitions
GOOGLE_DOCS_DOCUMENT_ID=1_sample_google_doc_id_for_clinic_knowledge_base

# Google Sheet for live lead & appointment logging
GOOGLE_SHEET_LEADS_DASHBOARD_ID=1_sample_google_sheet_id_for_live_lead_stream

# Optional: Google Service Account credentials for automatic direct sync
GOOGLE_SERVICE_ACCOUNT_EMAIL=clinic-service-account@gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
```

### To Disable:
Set `ENABLE_GOOGLE_DOCS_SYNC=false` in `.env` or click the toggle button in the Dashboard Settings page. When disabled:
- The system continues using the local PostgreSQL / database knowledge base seamlessly.
- No background sync requests are dispatched.
- Zero downtime or breaking errors occur.

## 3. Knowledge Base Structure in Google Docs
When maintaining FAQs in Google Docs, format them with simple `Q:` and `A:` or Heading blocks:

```text
Q: What is the consultation fee?
A: Our initial consultation fee is ₹800 with our senior dermatologists.

Q: What are the clinic timings and address?
A: We are open Monday to Saturday 10:00 AM - 7:30 PM, Sunday 10:00 AM - 2:00 PM. Address: Suite 402, DLF Cyber City, Sector 24, Gurugram.
```

## 4. Manual Sync & Live Preview
Clinic staff can trigger a manual synchronization anytime from **Settings & Integrations** -> **Sync Knowledge Base Now**, or via the API:

```http
POST /api/google-docs/sync
Content-Type: application/json

{
  "docId": "1_sample_google_doc_id_for_clinic_knowledge_base"
}
```

## 5. Live Google Sheet Export
You can export the entire lead pipeline and appointment ledger formatted for Google Sheets using:

```http
GET /api/google-docs/export
```
