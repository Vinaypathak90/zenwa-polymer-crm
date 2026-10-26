# 👥 Contacts & Polymer CRM Setup & Sync Guide
**ZENVISTA POLYMERS (Shivam Organics) — Client Account Management**

---

## 🌟 What is Contacts & Polymer CRM?
The **ZenWA Contacts CRM** is a purpose-built client directory tailored for polymer distributors and resin manufacturers. It tracks manufacturing application segments, monthly consumption capacity in Metric Tons, GSTIN verification, lifetime purchases, and communication history.

### Key Capabilities:
- **Instant WhatsApp Shared Inbox Sync:** Adding or editing any contact automatically initializes a conversation thread in the **Shared Inbox** (`/inbox`).
- **Segmented Audience Hub:** Filter clients by machine process (`HDPE Blow Molders`, `PP Injection Molding`, `PVC Pipe Extruders`, `Masterbatch Compounders`).
- **Pipeline Stages:** Monitor active deals through 5 verified stages:
  1. `Lead`: Initial WhatsApp inquiry received.
  2. `Quoted`: Formal spot rate and COA dispatched.
  3. `Negotiation`: Freight, credit, or volume pricing being finalized.
  4. `Won`: Payment received via RTGS; loading order issued.
  5. `Repeat Buyer`: High-LTV recurring monthly account.

---

## 🏗️ Data Structure & Schema Reference

```javascript
// ContactCRM Mongoose Schema Reference
{
    name: "Rajesh Patel",
    company: "Gujarat Containers Ltd",
    phone: "+91 98200 44120",                // WhatsApp Primary ID
    email: "rajesh.p@gujaratcontainers.com",
    city: "Ahmedabad",
    state: "Gujarat",
    industrySegment: "HDPE Blow Molders",    // Polymer segment
    primaryProducts: ["HDPE B56003"],
    monthlyCapacityTons: 40,                 // 40 Metric Tons/month
    stage: "Repeat Buyer",                   // CRM Deal stage
    lifetimeValue: 4850000,                  // ₹48,50,000 total purchases
    tags: ["VIP", "Kandla Delivery", "Credit 15D", "GST Verified"],
    assignee: "Harsh Vardhan"
}
```

---

## 🚀 How to Add & Manage Contacts

### Adding a Single Contact:
1. Open `http://localhost:3000/contacts`.
2. Click **+ Add Contact**.
3. Fill in the client's information:
   - Full Name & Company Name
   - WhatsApp Phone Number (with `+91`)
   - Industry Segment & Monthly Tonnage Capacity
   - Pipeline Stage & Notes
4. Click **Save Client to CRM ✓**.
5. The system automatically creates a synchronized chat thread in the **Shared Inbox** (`/inbox`) under the contact's phone number!

### 1-Click WhatsApp Chat Shortcut:
Inside the Contacts table, every contact has a clickable **Open WhatsApp Chat** link that immediately routes you to the customer's live chat thread in the Shared Inbox, allowing team members to review message history and dispatch instant quotes.

---

## 🔄 Cross-Module Interconnection Summary

| Action | Triggering Module | Receiving Modules | Result |
| :--- | :--- | :--- | :--- |
| **New Contact Added** | Contacts CRM (`/contacts`) | Shared Inbox (`/inbox`) | Inbound thread initialized with contact metadata & stage badge. |
| **Flow Form Submitted** | WhatsApp Flows (`/flows`) | Contacts CRM & Shared Inbox | Form answers logged in Inbox chat + contact created/updated in CRM. |
| **Broadcast Launched** | Broadcasts (`/broadcasts`) | Cockpit (`/`) & Shared Inbox | Total campaign spend updated in Dashboard + inbound replies route to Inbox. |
