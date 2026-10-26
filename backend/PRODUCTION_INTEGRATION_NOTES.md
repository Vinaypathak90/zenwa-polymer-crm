# ZenWA Forest Edition — Production Integration & API Guide
**ZENVISTA POLYMERS (Shivam Organics)**

---

## 📌 Status Summary
All modules have been developed with production-grade backend Mongoose models, Express REST endpoints, and responsive Next.js 14 frontend interfaces.

| Feature Module | Route | Backend API Endpoint | Database Collection | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Coexistence Manager** | `/coexistence` | `GET/POST /api/coexistence` | `coexistences` | ✅ **Live & Pixel-Perfect** |
| **Operations Cockpit** | `/` | `GET/POST /api/dashboard` | `dashboarddatas` | ✅ **Live & Responsive** |
| **Shared Team Inbox** | `/inbox` | `GET/POST/PATCH /api/inbox` | In-Memory / MongoDB | ✅ **Live & Synced** |
| **Broadcast Studio** | `/broadcasts` | `GET/POST /api/broadcasts` | `broadcastcampaigns` | ✅ **Live & Functional** |
| **WhatsApp Flows** | `/flows` | `GET/POST /api/flows` | `whatsappflows` | ✅ **Live & Tested** |
| **Contacts & CRM** | `/contacts` | `GET/POST/DELETE /api/contacts` | `contactcrms` | ✅ **Live & Synced** |
| **AI Agent Studio** | `/ai-agent` | `GET/PATCH/POST /api/ai-agent` | `aiagentconfigs` | ✅ **Live & Simulated** |

---

## 🛠️ Step-by-Step Meta WhatsApp Cloud API Setup

Jab aap Meta se live WhatsApp Business Cloud API connect karenge, bas yeh **5 simple steps** follow karne hain:

### Step 1: Meta Developer Account & App Creation
1. [Meta for Developers](https://developers.facebook.com/) par login karein.
2. **My Apps** > **Create App** > Type select karein: **Business**.
3. App Dashboard me **WhatsApp** product add karein.

### Step 2: System User & Permanent Access Token
1. Meta Business Suite me jayein > **Business Settings** > **System Users**.
2. New System User banayein (Role: `Admin`).
3. **Generate Token** par click karein aur permissions select karein:
   - `whatsapp_business_messaging`
   - `whatsapp_business_management`
4. Is token ko copy karke `backend/.env` me paste karein:
   ```env
   META_ACCESS_TOKEN=EAAG...
   ```

### Step 3: WABA ID & Phone Number ID
1. Meta Business Manager > **WhatsApp Accounts** > Select your WABA.
2. **WhatsApp Business Account ID** ko copy karke `META_WABA_ID` me daalein.
3. Phone number section me jakar **Phone Number ID** copy karein aur `META_PHONE_NUMBER_ID` me daalein.

### Step 4: Webhook Inbound Setup (Live Messages & Delivery Status)
1. Developers Console > WhatsApp > **Configuration** > **Webhook**.
2. Callback URL daalein: `https://your-domain.com/api/webhook`
3. Verify Token: Jo aapne `.env` me set kiya hai:
   ```env
   META_WEBHOOK_VERIFY_TOKEN=zenwa_forest_meta_webhook_token_2026
   ```
4. Webhook subscription fields tick karein:
   - `messages` (inbound customer WhatsApp chats)
   - `message_template_status_update` (Meta template approvals)
   - `flows` (interactive in-chat form submissions)

### Step 5: WhatsApp Flows (RSA Encryption Key)
1. WhatsApp Flows me data encrypted format (AES-128 / RSA-2048) me flow karta hai.
2. Ek RSA 2048 keypair generate karein:
   ```bash
   openssl genrsa -out flow_private.pem 2048
   openssl rsa -in flow_private.pem -pubout -out flow_public.pem
   ```
3. Meta Developer Portal me `flow_public.pem` upload karein.
4. `flow_private.pem` content ko `backend/.env` me `META_FLOW_PRIVATE_KEY` me daalein.

---

## 📱 Mobile & Laptop UI Enhancements Made
1. **Coexistence Header Cutoff Fix (`media_1793008302253_287b784d.png`):**
   - Removed rigid `xl:flex-row` that forced 1,150px of content into a 980px laptop width.
   - Designed 2-tier stacked controls with compact 2-line labels (`Oct 20-26, 2026`, `Refresh Status`, `Connect New Number`), matching the reference mockup (`media_1793007732130_5ca3071c.png`).
   - On mobile screens (< 640px), search is 100% full-width, and the 3 action buttons form a responsive 3-column row with 0px horizontal cutoff.
2. **Table Container Padding Fix:**
   - Corrected negative margins from `-mx-6` to `-mx-4` on mobile so tables scroll smoothly inside cards without bleeding outside the screen or causing page wobble.
3. **Sidebar Drawer Overlay:**
   - Mobile navigation operates as a slide-over drawer with backdrop blur, leaving the main content area full width.
