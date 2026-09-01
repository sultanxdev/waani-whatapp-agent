# WhatsApp Cloud API & Webhook Configuration

## 1. Meta Developer App Setup
1. Log in to [Meta for Developers](https://developers.facebook.com/).
2. Create an App -> Type: **Business** -> Add Product: **WhatsApp**.
3. Under WhatsApp -> Configuration:
   - **Callback URL**: `https://your-domain.com/api/webhooks/whatsapp`
   - **Verify Token**: Must match `WHATSAPP_VERIFY_TOKEN` in your `.env`.
   - **Webhook Fields**: Subscribe to `messages`.

## 2. Inbound Webhook Architecture
- **Idempotency**: All incoming messages are deduplicated using Meta's `wa_message_id`. Duplicate webhook retries are acknowledged with HTTP 200 and discarded to prevent duplicate replies or double bookings.
- **Fast 200 OK**: The server responds with HTTP 200 immediately and delegates NLP / intent processing asynchronously.
- **24-Hour Customer Window**: Normal responses and interactive reply buttons are dispatched during the active customer service window. Outside this window, registered message templates are utilized.
