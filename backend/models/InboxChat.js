const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    id: { type: String, required: true },
    sender: { type: String, enum: ['customer', 'phone_owner', 'agent', 'ai_draft', 'ai_agent', 'system'], required: true },
    author: { type: String },
    text: { type: String, required: true },
    time: { type: String, default: () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
    timestamp: { type: Date, default: Date.now },
    aiMeta: {
        trainedOn: String,
        generationTime: String,
        confidence: String
    }
});

const CustomerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    company: { type: String, default: 'Independent Manufacturer' },
    phone: { type: String, required: true },
    location: { type: String, default: 'Ahmedabad, Gujarat' },
    dealValue: { type: Number, default: 0 },
    stage: { type: String, default: 'Hot Lead' },
    product: { type: String, default: 'HDPE Blow Molding Grade (B56003)' },
    estimatedOrder: { type: String, default: '10 MT Order' },
    tags: [{ type: String }],
    notes: { type: String, default: '' }
});

const InboxChatSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    customer: CustomerSchema,
    assignee: { type: String, default: 'Neha Sharma' },
    status: { type: String, enum: ['open', 'resolved', 'pending'], default: 'open' },
    coexistenceSynced: { type: Boolean, default: true },
    lastActiveTime: { type: String, default: 'Just now' },
    badges: [{ type: String }],
    messages: [MessageSchema]
}, { timestamps: true });

// Initial Seed Polymer WhatsApp Conversations for Zenvista Polymers
const defaultInboxChats = [
    {
        id: "chat_001",
        customer: {
            name: "Priya Sharma",
            company: "Priya Polymers & Packaging",
            phone: "+91 98200 11223",
            location: "Daman / Mumbai, MH",
            dealValue: 590000,
            stage: "Hot Lead",
            product: "HDPE Blow Molding Grade (B56003)",
            estimatedOrder: "5 MT Virgin Granules Order",
            tags: ["Wholesale Buyer", "HDPE B56003", "Daman Plant", "Spot Deal"],
            notes: "Buyer has urgent requirement for extrusion blow molding. Willing to pay advance against PI."
        },
        assignee: "Neha Sharma",
        status: "open",
        coexistenceSynced: true,
        lastActiveTime: "2m ago",
        badges: ["₹5,90,000 Hot", "Phone Synced", "HDPE"],
        messages: [
            { 
                id: "m1", 
                sender: "customer", 
                text: "Namaste Neha ji! Is the 5 MT HDPE Blow Molding Grade B56003 available in ready stock? Need delivery to our Daman plant by Thursday.", 
                time: "10:42 AM" 
            },
            { 
                id: "m2", 
                sender: "phone_owner", 
                author: "Harsh Vardhan", 
                text: "Yes Priya ji, B56003 virgin lot from IOCL is ready in Bhiwandi warehouse. Test certificates and COA are ready 👍", 
                time: "10:43 AM" 
            },
            { 
                id: "m3", 
                sender: "customer", 
                text: "Great! What is today's spot rate per kg and payment terms for 5,000 kg with doorstep freight to Daman?", 
                time: "10:44 AM" 
            },
            { 
                id: "m4", 
                sender: "ai_draft", 
                text: "Today's spot cash rate for HDPE B56003 is ₹118/kg + 18% GST. For 5 MT, freight to Daman is subsidized at flat ₹1.50/kg. Total estimated deal value: ₹5,90,000 + GST. Sharing official Proforma Invoice format now 📄", 
                time: "Just now",
                aiMeta: { 
                    trainedOn: "Zenvista_Polymer_PriceList_Oct2026.pdf", 
                    generationTime: "1.1s" 
                }
            }
        ]
    },
    {
        id: "chat_002",
        customer: {
            name: "Rohan Plastics",
            company: "Rohan Plastotech Pvt Ltd",
            phone: "+91 98765 43210",
            location: "Okhla, Delhi NCR",
            dealValue: 1040000,
            stage: "Hot Lead",
            product: "PP Homopolymer (H110MA)",
            estimatedOrder: "10 MT Injection Molding",
            tags: ["Wholesale", "PP Injection", "Delhi NCR"],
            notes: "Asked for ₹2/kg discount on 10 MT volume. Agreed for ₹104/kg net."
        },
        assignee: "Harsh Vardhan",
        status: "open",
        coexistenceSynced: false,
        lastActiveTime: "9m ago",
        badges: ["₹10,40,000 Hot", "By Harsh", "PP Grade"],
        messages: [
            { 
                id: "m1", 
                sender: "customer", 
                text: "Harsh bhai, we need 10 MT PP Injection Molding Granules H110MA. Can you give best price for immediate loading?", 
                time: "9m ago" 
            },
            { 
                id: "m2", 
                sender: "phone_owner", 
                author: "Harsh Vardhan", 
                text: "Rohan ji, done deal at ₹104/kg net. Dispatching delivery order from Mundra port warehouse today 🤙", 
                time: "8m ago" 
            }
        ]
    },
    {
        id: "chat_003",
        customer: {
            name: "Mehta Extrusions",
            company: "Gujarat Extrusions Ltd",
            phone: "+91 99887 77665",
            location: "Surat, GJ",
            dealValue: 340000,
            stage: "Support",
            product: "PVC Resin (K-67)",
            estimatedOrder: "Repeat Supply Contract",
            tags: ["Repeat Client", "Surat Hub", "PVC Pipe"],
            notes: "Need monthly 15 MT continuous dispatch."
        },
        assignee: "Neha Sharma",
        status: "resolved",
        coexistenceSynced: true,
        lastActiveTime: "1h ago",
        badges: ["Surat Extrusions", "PVC K-67", "Resolved"],
        messages: [
            { 
                id: "m1", 
                sender: "customer", 
                text: "Neha ji, truck received at Surat plant. Weight slip and TDS match perfectly.", 
                time: "Yesterday" 
            },
            { 
                id: "m2", 
                sender: "agent", 
                author: "Neha Sharma", 
                text: "Thank you Mehta ji! Will dispatch next week's 15 MT lot on Monday as scheduled.", 
                time: "1h ago" 
            }
        ]
    }
];

InboxChatSchema.statics.seedIfEmpty = async function() {
    const count = await this.countDocuments();
    if (count === 0) {
        console.log('Seeding initial MongoDB Inbox Conversations...');
        await this.insertMany(defaultInboxChats);
    }
};

module.exports = mongoose.model('InboxChat', InboxChatSchema);
