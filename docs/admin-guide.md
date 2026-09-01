# Clinic Administrator & Receptionist Guide

## 1. Accessing the Dashboard
- **URL**: `http://localhost:5173` (Development) or `https://clinic.yourdomain.com` (Production)
- **Default Owner Login**: `owner@dermacare.com` / `password123`
- **Default Receptionist Login**: `reception@dermacare.com` / `password123`

## 2. Managing Human Takeovers
1. Navigate to **Conversations**.
2. Conversations marked with `🔴 Human Active` or high unread badges require human review.
3. Click **Take Over (Pause AI)**: The AI stops replying automatically to this patient.
4. Type your message in the bottom bar to reply directly to the patient's WhatsApp.
5. Once resolved, click **Return to AI** to re-engage automatic appointment booking.

## 3. Managing Appointments & Doctors
- Go to **Appointments** to view the live day/week schedule.
- To reschedule: Click **Reschedule**, select the new time, and submit. The patient's slot is updated atomically.
- To mark outcomes: Use **Complete** or **No-Show** buttons to maintain analytics accuracy.

## 4. Updating Prices and FAQs
- Go to **Treatments & Pricing** or **Approved FAQs** to update consultation fees or add new services.
- The AI assistant references these records immediately without needing code redeployment.
