# 📱 Meta WhatsApp Cloud API - Coexistence Mode Integration Guide

This guide documents the architecture, logic, and step-by-step instructions to take the **Coexistence Mode Manager & WhatsApp Health** feature from the current fully working local/database state to **100% live production with Meta's official WhatsApp Business Cloud API**.

---

## 🎯 What is Coexistence Mode?

Coexistence Mode is Meta's official linking protocol that solves the single biggest problem in B2B WhatsApp operations:
> **"Keep Your Phone App. Add A Whole Team on Web."**

- **Without Coexistence:** Using the WhatsApp Cloud API traditionally required deleting or disabling the physical WhatsApp app on the business owner's mobile phone.
- **With Coexistence Protocol:** The owner (`+91 98200 11223 Harsh Vardhan`) continues using the **WhatsApp Business mobile app** on their smartphone (iPhone/Android). Simultaneously, the entire team (`Neha Sharma`, `Riya Sen`, etc.) accesses the exact same WhatsApp number on the **ZenWA Web Dashboard & Shared Inbox** with bi-directional real-time sync.

---

## 📋 Architecture & Implementation Status

| Component | Current Status | Production Logic |
|---|---|---|
| **MongoDB Schema & Data Model** | ✅ **100% Complete** | Stores WABA IDs, Health Tier (Tier 3 - 100,000/day), Quality Score (98/100 Green), Team Seats & Device States in `zenwa_crm.coexistences`. |
| **REST APIs & Seat Allocation** | ✅ **100% Complete** | Endpoints for `/api/coexistence`, `/invite`, `/refresh`, `/pair-qr`, `/member/:id`. |
| **Frontend UI Cockpit** | ✅ **100% Complete** | Pixel-perfect matching the Figma/production screenshot at `/coexistence`. |
| **Meta Graph API Health Ping** | 🟡 **Pending Credentials** | Integrated in `/api/coexistence/refresh`. Once `META_ACCESS_TOKEN` is set, pings `graph.facebook.com/v20.0/{phone_number_id}` for live Meta quality scores. |
| **Meta Inbound Webhook** | 🟡 **Pending Endpoint URL** | Webhook handler ready for deployment on public HTTPS domain (e.g. AWS / DigitalOcean / ngrok). |
| **WebSocket Bi-Directional Streaming** | 🟡 **Pending Socket Server** | Ready for bi-directional live sync between mobile app and web inbox. |

---

## 🚀 Step-by-Step Production Deployment Guide

Follow these 5 steps to connect your real Meta WhatsApp Business Account:

### Step 1: Meta Business Manager Verification
1. Go to [business.facebook.com](https://business.facebook.com) > **Security Center**.
2. Complete **Business Verification** by submitting your company registration (GST Certificate / Certificate of Incorporation).
3. Once verified, note down your **Meta Business ID** (e.g., `893120481239102`).

### Step 2: Create Meta Developer App & WABA
1. Go to [developers.facebook.com](https://developers.facebook.com) > **My Apps** > **Create App**.
2. Select **Business** type and add **WhatsApp** product.
3. Link your Verified Business Account (WABA).
4. In WhatsApp > **API Setup**, find:
   - `Phone Number ID` (e.g., `102938475610293`)
   - `WhatsApp Business Account ID` (e.g., `893120481239102`)

### Step 3: Generate Permanent System User Access Token
1. In Meta Business Manager > **Users** > **System Users**.
2. Click **Add System User**, role: `Admin`.
3. Click **Generate New Token**, select your App.
4. Check the following permissions:
   - `whatsapp_business_messaging`
   - `whatsapp_business_management`
5. Copy the permanent token into `backend/.env`:
   ```env
   META_ACCESS_TOKEN=EAAK...your_permanent_token_here
   META_PHONE_NUMBER_ID=your_phone_number_id
   META_WABA_ID=your_waba_id
   ```

### Step 4: Configure Webhook In Meta Developer Dashboard
1. Deploy this backend to a live HTTPS server (e.g., `https://api.zenvistapolymers.com`) or test locally with ngrok (`ngrok http 5000`).
2. In Meta App Dashboard > **WhatsApp** > **Configuration**:
   - **Callback URL:** `https://your-domain.com/api/webhook`
   - **Verify Token:** `zenwa_forest_meta_webhook_token_2026` (must match `META_WEBHOOK_VERIFY_TOKEN` in `.env`).
3. Under **Webhook fields**, subscribe to:
   - `messages` (inbound chats & media)
   - `message_template_status_update` (template approvals)
   - `phone_number_quality_update` (tier & quality rating updates)

### Step 5: QR Code Device Pairing (Coexistence Handshake)
1. In the ZenWA dashboard at `http://localhost:3000/coexistence`, click **"+ Connect New Number"**.
2. Open **WhatsApp Business** on your primary smartphone.
3. Go to **Settings** (iPhone) or **⋮ More Options** (Android) > **Linked Devices**.
4. Tap **Link a Device** and scan the QR code.
5. Meta pairs the mobile app session with the Cloud API webhook. Both your smartphone and the ZenWA dashboard will now receive and send messages simultaneously!

---

## 🔒 Security Best Practices
- Never commit real `META_ACCESS_TOKEN` or `META_APP_SECRET` to GitHub or public repositories.
- Use environment variables (`process.env`) exclusively.
- Verify incoming Meta webhooks using `X-Hub-Signature-256` payload validation.
