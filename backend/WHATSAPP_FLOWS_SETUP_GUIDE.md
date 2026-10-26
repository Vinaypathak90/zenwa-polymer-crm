# 📱 WhatsApp Flows (Interactive Chat Forms) Setup & Integration Guide
**ZENVISTA POLYMERS (Shivam Organics) — Meta Cloud API v20.0+**

---

## 🌟 What is a WhatsApp Flow?
WhatsApp Flows allows buyers to open structured, native interactive forms directly inside a WhatsApp chat without leaving the app or opening an external browser. 

In the **ZENVISTA POLYMERS** CRM, WhatsApp Flows are configured for:
1. **Instant Polymer Quotation Flow:** Buyer picks polymer grade (`HDPE B56003`, `PP H110MA`, `LLDPE 010F18A`, `PVC K-67`), specifies quantity in Metric Tons (MT), selects delivery warehouse (`Kandla`, `Mundra`, `Ahmedabad`), and receives an instant proforma quote.
2. **Sample Request & Technical Spec Sheet (COA/TDS):** Lab trial requests for 5kg polymer sample granules with delivery address and GSTIN verification.

---

## 🏗️ Architecture & Data Flow

```mermaid
sequenceDiagram
    autonumber
    actor Buyer as Polymer Buyer (WhatsApp)
    participant Meta as Meta WhatsApp Cloud API
    participant Server as ZenWA Backend (/api/flows)
    participant DB as MongoDB Atlas
    participant Inbox as Shared Inbox (/inbox)
    participant CRM as Contacts CRM (/contacts)

    Buyer->>Meta: Taps "Request Polymer Quote" in Chat
    Meta->>Buyer: Renders Native WhatsApp Flow Form
    Buyer->>Meta: Submits Grade, Tonnage, Delivery Hub
    Meta->>Server: Encrypted Webhook POST /api/flows/:id/submit
    Server->>DB: Decrypts & Stores in WhatsAppFlow.submissions
    Server->>Inbox: Auto-creates/Appends Chat thread in InboxChat
    Server->>CRM: Auto-upserts Buyer into ContactCRM
    Server->>Meta: Acknowledges 200 OK + Triggers AI Quotation Reply
    Meta->>Buyer: Delivers Proforma Quote & COA PDF in Chat
```

---

## 🚀 Step-by-Step Meta WhatsApp Flows Setup

### Step 1: Flow Creation in Meta Developer Portal
1. Login to [Meta for Developers](https://developers.facebook.com/).
2. Select your WhatsApp App > Go to **WhatsApp** > **Flows**.
3. Click **Create Flow**:
   - **Flow Name:** `Instant Polymer Quotation & Tonnage Request`
   - **Category:** `Lead Generation`
   - **Template:** Blank or Lead Generation Form.
4. Copy the generated **Flow ID** (e.g., `flow_poly_quote_001`) and paste into ZenWA.

### Step 2: Screen JSON Schema Configuration
Meta Flows uses declarative JSON to define UI screens. In Meta Flow Builder, paste this verified JSON:

```json
{
  "version": "3.0",
  "screens": [
    {
      "id": "SCREEN_GRADE_QTY",
      "title": "Select Grade & Tonnage",
      "data": {},
      "layout": {
        "type": "SingleColumnLayout",
        "children": [
          {
            "type": "Dropdown",
            "name": "polymer_grade",
            "label": "Select Virgin Polymer Grade",
            "required": true,
            "data_source": [
              { "id": "HDPE_B56003", "title": "HDPE Blow Molding Grade (B56003) - ₹118/kg" },
              { "id": "PP_H110MA", "title": "PP Injection Molding Grade (H110MA) - ₹104/kg" },
              { "id": "LLDPE_010F18A", "title": "LLDPE Film Grade (010F18A) - ₹112/kg" },
              { "id": "PVC_K67", "title": "PVC Resin Suspension (K-67) - ₹89/kg" }
            ]
          },
          {
            "type": "TextInput",
            "name": "tonnage",
            "label": "Required Quantity (Metric Tons)",
            "input_type": "number",
            "required": true
          },
          {
            "type": "Footer",
            "label": "Next: Delivery Hub",
            "on_click_action": {
              "name": "navigate",
              "next": { "type": "screen", "name": "SCREEN_LOGISTICS" }
            }
          }
        ]
      }
    },
    {
      "id": "SCREEN_LOGISTICS",
      "title": "Delivery & GSTIN",
      "data": {},
      "layout": {
        "type": "SingleColumnLayout",
        "children": [
          {
            "type": "Dropdown",
            "name": "delivery_hub",
            "label": "Destination Depot",
            "required": true,
            "data_source": [
              { "id": "Kandla", "title": "Ex-Kandla Port Warehouse (Ready Stock)" },
              { "id": "Mundra", "title": "Ex-Mundra Port Depot" },
              { "id": "Ahmedabad", "title": "FOT Ahmedabad / Dholka" }
            ]
          },
          {
            "type": "TextInput",
            "name": "gstin",
            "label": "Company GSTIN (Optional for Proforma)",
            "required": false
          },
          {
            "type": "Footer",
            "label": "Submit Quotation Request",
            "on_click_action": {
              "name": "complete",
              "payload": {
                "polymer_grade": "${form.polymer_grade}",
                "tonnage": "${form.tonnage}",
                "delivery_hub": "${form.delivery_hub}",
                "gstin": "${form.gstin}"
              }
            }
          }
        ]
      }
    }
  ]
}
```

### Step 3: RSA 2048-bit Encryption Key Generation
Meta WhatsApp Flows requires endpoint payloads to be encrypted with an RSA 2048 keypair.

Run these two commands in PowerShell:
```powershell
# Generate Private Key
openssl genrsa -out flow_private.pem 2048

# Generate Public Key
openssl rsa -in flow_private.pem -pubout -out flow_public.pem
```

1. Open `flow_public.pem`, copy the key, and paste it into Meta Flow Dashboard under **Flow Endpoint Encryption**.
2. Open `flow_private.pem` and paste it into `backend/.env`:
   ```env
   META_FLOW_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\nMIIEowIBAAKCAQEA0...\n-----END RSA PRIVATE KEY-----"
   ```

### Step 4: Endpoint Webhook Configuration
1. Meta WhatsApp Dashboard > **Flows** > **Endpoint URL**:
   ```
   https://<your_server_domain>/api/flows/webhook
   ```
2. Set Endpoint Version: `v3.0`.
3. Click **Health Check** to verify 200 OK ping.

### Step 5: Publishing Flow
1. Click **Publish** in the top right corner of Meta Flow Builder.
2. Note: Once published, a Flow cannot be edited (a new version must be created for schema changes).
3. The Flow can now be attached to any Meta Template or dispatched by the **ZenWA AI Agent** during live customer chats!

---

## 🧪 Testing Your Flow
A built-in interactive simulator is available on `http://localhost:3000/flows`:
1. Click **Test Flow in App** on any flow card.
2. Select grade, tonnage, and delivery hub.
3. Click **Submit Flow Response**.
4. Check **Shared Inbox** (`/inbox`) and **Contacts CRM** (`/contacts`) — the submission will automatically populate both!
