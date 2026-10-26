# 🌲 ZenWA (Forest Edition) — Zenvista Polymers WhatsApp CRM

> **Production-grade WhatsApp Business Cloud API & CRM Platform built for ZENVISTA POLYMERS (Shivam Organics).**  
> Managed by **Harsh Vardhan** (Owner).

---

## 📑 Table of Contents
1. [Overview & Architecture](#-overview--architecture)
2. [Feature Modules](#-feature-modules)
3. [Technology Stack](#-technology-stack)
4. [Database & Schema Design](#-database--schema-design)
5. [Complete API Reference Matrix](#-complete-api-reference-matrix)
6. [Quick Start & Setup Guide](#-quick-start--setup-guide)
7. [Environment Configuration (.env)](#-environment-configuration-env)
8. [Integration Guides Directory](#-integration-guides-directory)

---

## 🌟 Overview & Architecture

**ZenWA** is an enterprise WhatsApp CRM that connects to the **Meta WhatsApp Business Cloud API (v20.0+)** using the **Coexistence Linking Protocol**. This enables Harsh Vardhan to keep using his physical WhatsApp Business smartphone app while simultaneously empowering his entire sales and technical team to collaborate on a centralized web dashboard.

```mermaid
flowchart TB
    subgraph Clients["📱 Buyer Endpoints"]
        Buyer["Polymer Buyer (WhatsApp)"]
        Phone["Harsh's Smartphone (WhatsApp Business App)"]
    end

    subgraph MetaCloud["☁️ Meta Cloud Infrastructure"]
        MetaAPI["Meta WhatsApp Business Cloud API (v20.0)"]
        WABA["Official WABA (Tier 3: 100k/day)"]
        Webhook["Meta Inbound Webhooks"]
    end

    subgraph BackendApp["⚡ ZenWA Node.js / Express Backend (Port 5000)"]
        Server["Express REST API Server"]
        RouterDashboard["/api/dashboard"]
        RouterInbox["/api/inbox"]
        RouterCoexist["/api/coexistence"]
        RouterBroadcast["/api/broadcasts"]
        RouterFlows["/api/flows"]
        RouterContacts["/api/contacts"]
        RouterAIAgent["/api/ai-agent"]
    end

    subgraph Database["🍃 MongoDB Atlas Cloud Database"]
        DB[(zenwa_crm Database)]
        CollDash["dashboarddatas"]
        CollInbox["inboxchats"]
        CollCoexist["coexistences"]
        CollBroadcast["broadcastcampaigns"]
        CollFlows["whatsappflows"]
        CollContacts["contactcrms"]
        CollAI["aiagentconfigs"]
    end

    subgraph FrontendApp["🖥️ ZenWA Next.js 14 Frontend (Port 3000)"]
        UI_Cockpit["Operations Cockpit (/)"]
        UI_Inbox["Shared Team Inbox (/inbox)"]
        UI_Coexist["Coexistence Manager (/coexistence)"]
        UI_Broadcast["Broadcast Studio (/broadcasts)"]
        UI_Flows["WhatsApp Flows (/flows)"]
        UI_Contacts["Contacts & CRM (/contacts)"]
        UI_AI["AI Agent Studio (/ai-agent)"]
    end

    Buyer <-->|WhatsApp Messages| MetaAPI
    Phone <-->|Coexistence Sync| MetaAPI
    MetaAPI <--> Webhook <--> Server
    Server <--> Database
    FrontendApp <-->|REST API Calls| BackendApp
```

---

## 🚀 Feature Modules

### 1. Operations & Broadcast Cockpit (`/`)
- **Real-Time KPIs:** Total conversations (1,480), replies count, marketing spend, median response speed (1m 24s), and pipeline value.
- **2-Tier Responsive Header:** Single-line title guarantee with budgeted action controls (`Refresh`, `Export CSV`, `Launch Broadcast`).
- **Dynamic Search & Date Filter:** Live multi-field filtering across polymers, clients, queries, and dates (`7D`, `30D`, `All`).
- **Pipeline Pipeline:** Live lead stages (`Hot`, `Warm`, `Cold`, `Proposal`, `Closed`).

### 2. Coexistence Mode Manager & WhatsApp Health (`/coexistence`)
- **Pixel-Perfect Meta Interface:** Replicates the official Meta Coexistence dashboard matching `media_1793007732130_5ca3071c.png`.
- **Protocol Verification:** Meta Business Verification, QR Code Pairing, and Bi-Directional WebSocket Sync status.
- **Meta Health Tier:** Live monitoring of **Tier 3 (100,000 / day)** limits, Green (High 98/100) quality rating, and smartphone sync state.
- **Team Seat Allocation:** Multi-seat team management with roles (`Owner`, `Sales Lead`, `Support Agent`), access modes, and invite/revoke modal.

### 3. Shared Team Inbox (`/inbox`)
- **3-Pane Real-Time Layout:** Conversations pane, active message thread, and customer CRM details drawer.
- **AI Copilot Drafts:** 1-click **Approve & Send** or discard AI-generated quotations.
- **Quick Reply Chips:** Instant polymer price bullet, COA sample dispatch, and bank RTGS details.
- **Private Team Notes & Tags:** Internal collaboration notes that customers never see.

### 4. WhatsApp Broadcast Studio (`/broadcasts`)
- **Bulk Outreach:** Target thousands of verified polymer buyers without risk of account bans.
- **Audience Segmentation:** Filter dispatches by machine process (`HDPE Blow Molders`, `PP Injection`, `PVC Extruders`, `Masterbatch`).
- **Cost Calculator:** Dynamic budget estimator based on Meta pricing (Marketing: ₹0.86/msg; Utility: ₹0.40/msg).
- **Delivery Funnel:** Tracks Sent, Delivered, Read, and Replied conversions with direct pipeline value.

### 5. WhatsApp Flows & Interactive Forms (`/flows`)
- **In-Chat Structured Data Capture:** Meta native v3.0 interactive forms that open inside WhatsApp.
- **Polymer Quotation Flow:** Buyers select grade, volume in MT, delivery port, and submit in seconds.
- **Sample Request Flow:** Lab trial requests with MFI and density spec requirements.
- **Cross-Module Sync:** Submissions auto-populate the Shared Inbox and CRM Contacts directory.

### 6. Contacts & Polymer CRM (`/contacts`)
- **Comprehensive Buyer Directory:** Filter by manufacturing segment, city, and stage.
- **1-Click WhatsApp Shortcut:** Opens customer conversation in the Shared Inbox directly from the CRM row.
- **Account Metrics:** Monthly tonnage consumption capacity, GSTIN status, and lifetime purchase value.

### 7. AI Agent Studio (`/ai-agent`)
- **Autonomous Polymer Sales Copilot:** Powered by Meta Llama 3 70B (WhatsApp fine-tuned).
- **Grounded Knowledge Base:** Quotes verified spot prices (`HDPE B56003: ₹118/kg`, `PP H110MA: ₹104/kg`, `PVC K-67: ₹89/kg`).
- **Autonomous Handover Triggers:** Automatically routes to Harsh Vardhan or Neha Sharma for credit requests or orders > 50 MT.
- **Live Simulator:** In-browser WhatsApp playground to test AI replies and handover triggers.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend Framework** | **Next.js 14.2.33** (App Router architecture) |
| **UI Library** | **React 18**, **Tailwind CSS 3.4**, **Lucide React** (icons) |
| **State & HTTP** | React Hooks (`useState`, `useEffect`, `useMemo`, `useRef`), **Axios** |
| **Backend Runtime** | **Node.js (v22+)**, **Express 4.19** |
| **Database & ODM** | **MongoDB Atlas Cloud Database**, **Mongoose 8.3** |
| **DNS Optimization** | Google DNS (`8.8.8.8`, `8.8.4.4`) fallback for Windows SRV queries |
| **WhatsApp APIs** | Meta WhatsApp Business Cloud API (Graph API v20.0+), Meta Flows v3.0 |

---

## 🍃 Database & Schema Design

All data is stored in the `zenwa_crm` MongoDB Atlas database across 7 dedicated collections:

```text
zenwa_crm (MongoDB Atlas)
├── dashboarddatas        # Operations Cockpit metrics, weekly traffic, polymer leads
├── coexistences          # Meta Coexistence protocols, Tier 3 limits, team seats
├── inboxchats            # WhatsApp conversation threads, messages, AI drafts
├── broadcastcampaigns    # Dispatched bulk broadcast campaigns & analytics
├── whatsappflows         # Meta Flows JSON schema, screens, and buyer responses
├── contactcrms           # Polymer client directory, monthly capacity, stages
└── aiagentconfigs        # AI Agent system prompts, price knowledge base, triggers
```

---

## 🔌 Complete API Reference Matrix

| Method | Endpoint | Description | Module |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/dashboard` | Fetch Operations Cockpit metrics with search & date filters | Cockpit |
| `POST` | `/api/dashboard/broadcast` | Launch broadcast from cockpit with custom price | Cockpit |
| `GET` | `/api/coexistence` | Retrieve Coexistence linking status & Meta Tier health | Coexistence |
| `POST` | `/api/coexistence/refresh` | Ping Meta Cloud API for live health check | Coexistence |
| `POST` | `/api/coexistence/invite` | Allocate new shared WhatsApp seat to a team member | Coexistence |
| `DELETE` | `/api/coexistence/member/:id` | Revoke a team member's shared WhatsApp access | Coexistence |
| `GET` | `/api/inbox` | Retrieve all active WhatsApp conversation threads | Shared Inbox |
| `POST` | `/api/inbox/:id/message` | Dispatch outgoing WhatsApp message to customer | Shared Inbox |
| `POST` | `/api/inbox/:id/approve-ai` | One-click approve and dispatch AI Copilot draft | Shared Inbox |
| `PATCH` | `/api/inbox/:id/notes` | Update internal private team CRM notes | Shared Inbox |
| `PATCH` | `/api/inbox/:id/status` | Toggle chat status (`open` / `resolved`) | Shared Inbox |
| `GET` | `/api/broadcasts` | List all broadcast campaigns, templates & segments | Broadcasts |
| `POST` | `/api/broadcasts/launch` | Launch bulk campaign & cross-sync with Cockpit | Broadcasts |
| `GET` | `/api/flows` | List all active WhatsApp Flows and captured leads | Flows |
| `POST` | `/api/flows` | Create & publish new interactive Flow to Meta Cloud | Flows |
| `POST` | `/api/flows/:id/submit` | Webhook simulation / Meta Flow response handler | Flows |
| `GET` | `/api/contacts` | List polymer CRM contacts with segment & stage filter | Contacts |
| `POST` | `/api/contacts` | Add new buyer & auto-initialize Shared Inbox thread | Contacts |
| `DELETE` | `/api/contacts/:id` | Remove contact from CRM directory | Contacts |
| `GET` | `/api/ai-agent` | Fetch AI Agent configuration, prompts & price list | AI Studio |
| `PATCH` | `/api/ai-agent/config` | Update system prompt, mode, and handover rules | AI Studio |
| `POST` | `/api/ai-agent/test` | Live test simulation of buyer inquiry against price sheet | AI Studio |

---

## 🚀 Quick Start & Setup Guide

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher (v22 recommended)
- **MongoDB Atlas**: Active cluster URI (already configured in `.env`)
- **Git** / PowerShell (for Windows environments)

### 2. Backend Startup
```powershell
cd "C:\Users\HP\Downloads\company\ZENVISTA POLYMERS\backend"
npm install
npm run dev
# Backend starts on http://localhost:5000
```

### 3. Frontend Startup
```powershell
cd "C:\Users\HP\Downloads\company\ZENVISTA POLYMERS\frontend"
npm install
npm run dev
# Frontend starts on http://localhost:3000
```

### 4. Verification URLs
- **Operations Cockpit:** `http://localhost:3000/`
- **Coexistence Manager:** `http://localhost:3000/coexistence`
- **Shared Inbox:** `http://localhost:3000/inbox`
- **Broadcast Studio:** `http://localhost:3000/broadcasts`
- **WhatsApp Flows:** `http://localhost:3000/flows`
- **Contacts CRM:** `http://localhost:3000/contacts`
- **AI Agent Studio:** `http://localhost:3000/ai-agent`

---

## 🔐 Environment Configuration (.env)

The backend `.env` file is located at `backend/.env`:

```env
PORT=5000
MONGO_URI=mongodb+srv://zenvistasales1_db_user:LzHeHWhL3XlbrE7h@9zenwaforest.9xhzsvm.mongodb.net/zenwa_crm

# META WHATSAPP CLOUD API
META_APP_ID=your_meta_app_id_here
META_APP_SECRET=your_meta_app_secret_here
META_ACCESS_TOKEN=your_meta_system_user_access_token_here
META_WABA_ID=893120481239102
META_PHONE_NUMBER_ID=102938475610293
META_WEBHOOK_VERIFY_TOKEN=zenwa_forest_meta_webhook_token_2026

# COEXISTENCE SYNC
COEXISTENCE_WEBSOCKET_SECRET=zenwa_coexistence_streaming_secret_key

# WHATSAPP FLOWS RSA ENCRYPTION
META_FLOW_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\nMIIEowIBAAKCAQEA0...\n-----END RSA PRIVATE KEY-----"

# AI AGENT STUDIO (Meta Llama 3 / Groq / OpenAI)
AI_STUDIO_PROVIDER=MetaLlama3
AI_STUDIO_API_KEY=your_ai_api_key_here
AI_STUDIO_MODEL=llama-3-70b-instruct
```

---

## 📚 Integration Guides Directory

Detailed, step-by-step documentation files are located in the `backend/` directory:

| Guide Document | File Path | Focus Area |
| :--- | :--- | :--- |
| **Coexistence Setup Guide** | [`backend/COEXISTENCE_INTEGRATION_GUIDE.md`](file:///C:/Users/HP/Downloads/company/ZENVISTA%20POLYMERS/backend/COEXISTENCE_INTEGRATION_GUIDE.md) | Official Meta Coexistence linking, QR pairing & team seats |
| **WhatsApp Flows Guide** | [`backend/WHATSAPP_FLOWS_SETUP_GUIDE.md`](file:///C:/Users/HP/Downloads/company/ZENVISTA%20POLYMERS/backend/WHATSAPP_FLOWS_SETUP_GUIDE.md) | Interactive form schemas, RSA encryption & submissions |
| **Broadcast Studio Guide** | [`backend/BROADCASTS_SETUP_GUIDE.md`](file:///C:/Users/HP/Downloads/company/ZENVISTA%20POLYMERS/backend/BROADCASTS_SETUP_GUIDE.md) | Meta template approvals, segmentation & bulk dispatch |
| **AI Agent Studio Guide** | [`backend/AI_AGENT_STUDIO_SETUP_GUIDE.md`](file:///C:/Users/HP/Downloads/company/ZENVISTA%20POLYMERS/backend/AI_AGENT_STUDIO_SETUP_GUIDE.md) | Llama 3 prompt engineering, price sheets & handovers |
| **Contacts CRM Guide** | [`backend/CRM_INTEGRATION_GUIDE.md`](file:///C:/Users/HP/Downloads/company/ZENVISTA%20POLYMERS/backend/CRM_INTEGRATION_GUIDE.md) | Account stages, tonnage capacity & Shared Inbox sync |
| **Production Notes** | [`backend/PRODUCTION_INTEGRATION_NOTES.md`](file:///C:/Users/HP/Downloads/company/ZENVISTA%20POLYMERS/backend/PRODUCTION_INTEGRATION_NOTES.md) | 5-step checklist for deploying live Meta production credentials |
