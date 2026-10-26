const mongoose = require('mongoose');

const LeadSchema = new mongoose.Schema({
    id: { type: String },
    customer: { type: String, required: true },
    company: { type: String, default: '' },
    phone: { type: String, required: true },
    product: { type: String, default: 'Polymer Granules' },
    quantity: { type: String, default: '1,000 kg' },
    query: { type: String, required: true },
    value: { type: Number, required: true },
    stage: { type: String, enum: ['Hot', 'Warm', 'Cold', 'Proposal', 'Closed'], default: 'Hot' },
    source: { type: String, default: 'WhatsApp Direct' },
    assignee: { type: String, default: 'Neha Sharma' },
    date: { type: String, required: true } // YYYY-MM-DD
});

const ProductSchema = new mongoose.Schema({
    id: { type: String },
    name: { type: String, required: true },
    grade: { type: String, default: '' },
    category: { type: String, default: 'Polymers' },
    pricePerKg: { type: Number, required: true },
    moq: { type: String, default: '1,000 kg' },
    stockStatus: { type: String, default: 'In Stock' }
});

const TemplateSchema = new mongoose.Schema({
    id: { type: String },
    name: { type: String, required: true },
    category: { type: String, default: 'MARKETING' },
    status: { type: String, default: 'Approved' },
    language: { type: String, default: 'en_US' },
    body: { type: String, default: '' },
    isCustom: { type: Boolean, default: false }
});

const BroadcastHistorySchema = new mongoose.Schema({
    id: { type: String },
    campaignName: { type: String, required: true },
    templateName: { type: String, required: true },
    targetAudience: { type: String, default: 'All Polymer Buyers' },
    contactsCount: { type: Number, default: 0 },
    pricePerMessage: { type: Number, default: 0.86 },
    totalCost: { type: Number, default: 0 },
    product: { type: String, default: '' },
    status: { type: String, default: 'Active' },
    date: { type: String, default: () => new Date().toISOString().split('T')[0] }
});

const DashboardDataSchema = new mongoose.Schema({
    conversations: {
        total: { type: Number, default: 1284 },
        growth: { type: String, default: '+18.2%' }
    },
    replies: {
        total: { type: Number, default: 2604 },
        phone: { type: Number, default: 38 },
        ai: { type: Number, default: 35 },
        inbox: { type: Number, default: 27 }
    },
    broadcast: {
        spend: { type: Number, default: 10670 },
        sales: { type: String, default: '1,84,500' },
        roi: { type: String, default: '17.3x' }
    },
    responseTime: {
        median: { type: String, default: '1m 42s' },
        faster: { type: String, default: '58%' }
    },
    weeklyTraffic: [
        {
            day: { type: String },
            chats: { type: Number },
            date: { type: String }
        }
    ],
    teamWorkload: [
        {
            name: { type: String },
            role: { type: String },
            chats: { type: Number },
            trend: { type: String }
        }
    ],
    leads: [LeadSchema],
    products: [ProductSchema],
    metaTemplates: [TemplateSchema],
    broadcastsHistory: [BroadcastHistorySchema]
}, { timestamps: true });

// Initial Polymer Industry Seed Data for ZENVISTA POLYMERS
const defaultZenvistaData = {
    conversations: { total: 1480, growth: '+21.4%' },
    replies: { total: 2940, phone: 40, ai: 35, inbox: 25 },
    broadcast: { spend: 12500, sales: '2,48,000', roi: '19.8x' },
    responseTime: { median: '1m 24s', faster: '62%' },
    weeklyTraffic: [
        { day: 'Mon', chats: 140, date: '2026-10-20' },
        { day: 'Tue', chats: 175, date: '2026-10-21' },
        { day: 'Wed', chats: 160, date: '2026-10-22' },
        { day: 'Thu', chats: 265, date: '2026-10-23' },
        { day: 'Fri', chats: 210, date: '2026-10-24' },
        { day: 'Sat', chats: 115, date: '2026-10-25' },
        { day: 'Sun', chats: 85, date: '2026-10-26' }
    ],
    teamWorkload: [
        { name: 'Neha Sharma', role: 'Sales Executive', chats: 54, trend: '+14%' },
        { name: 'Harsh Vardhan', role: 'Director / Owner', chats: 35, trend: '-2%' },
        { name: 'AI WhatsApp Agent', role: 'Autonomous Sales Bot', chats: 68, trend: '+28%' },
        { name: 'Riya Sen', role: 'Key Accounts Lead', chats: 29, trend: '+8%' }
    ],
    leads: [
        {
            id: 'lead-1',
            customer: 'Priya Sharma',
            company: 'Priya Polymers & Packaging',
            phone: '+91 98200 11223',
            product: 'HDPE Blow Molding (B56003)',
            quantity: '3,000 kg',
            query: 'Need urgent quote for 3 MT HDPE Blow Molding Grade B56003. Need dispatch to Daman by Thursday.',
            value: 354000,
            stage: 'Hot',
            source: 'WhatsApp Direct',
            assignee: 'Neha Sharma',
            date: '2026-10-26'
        },
        {
            id: 'lead-2',
            customer: 'Rajesh K. Mehta',
            company: 'Royal Plastitech Exporters',
            phone: '+91 97112 88490',
            product: 'PP Homopolymer (H110MA)',
            quantity: '10,000 kg',
            query: 'Quotation required for 10 MT PP Injection Molding Granules H110MA with test certificate.',
            value: 1040000,
            stage: 'Hot',
            source: 'AI Handover',
            assignee: 'Harsh Vardhan',
            date: '2026-10-25'
        },
        {
            id: 'lead-3',
            customer: 'Amit Patel',
            company: 'Gujarat Extrusions Pvt Ltd',
            phone: '+91 99041 33219',
            product: 'LLDPE Film Grade (010F18A)',
            quantity: '5,000 kg',
            query: 'Sharing wholesale order for LLDPE Film grade. Confirm payment terms and freight to Ahmedabad.',
            value: 560000,
            stage: 'Warm',
            source: 'Team Inbox',
            assignee: 'Riya Sen',
            date: '2026-10-24'
        },
        {
            id: 'lead-4',
            customer: 'Sunil Agarwal',
            company: 'Agarwal Pipe Industries',
            phone: '+91 98310 44521',
            product: 'PVC Resin Suspension (K-67)',
            quantity: '15,000 kg',
            query: 'Looking for 15 MT PVC K-67 resin for rigid conduit pipe manufacturing. What is the spot cash price?',
            value: 1335000,
            stage: 'Hot',
            source: 'WhatsApp Direct',
            assignee: 'Neha Sharma',
            date: '2026-10-23'
        },
        {
            id: 'lead-5',
            customer: 'Vikas Deshmukh',
            company: 'Deshmukh Mouldings Pune',
            phone: '+91 94220 88910',
            product: 'Recycled PP Granules (Black)',
            quantity: '2,500 kg',
            query: 'Need sample batch of recycled PP black granules for industrial crate molding. Please courier 5kg sample.',
            value: 180000,
            stage: 'Proposal',
            source: 'AI Handover',
            assignee: 'AI WhatsApp Agent',
            date: '2026-10-22'
        },
        {
            id: 'lead-6',
            customer: 'Kavita Chawla',
            company: 'Bright Color Masterbatches',
            phone: '+91 98115 67890',
            product: 'White Masterbatch (70% TiO2)',
            quantity: '1,000 kg',
            query: 'Inquiry for high dispersion 70% Titanium dioxide white masterbatch for multilayer film blowing.',
            value: 185000,
            stage: 'Warm',
            source: 'Phone App',
            assignee: 'Riya Sen',
            date: '2026-10-21'
        }
    ],
    products: [
        { id: 'prod-1', name: 'HDPE Blow Molding Grade', grade: 'B56003', category: 'HDPE', pricePerKg: 118, moq: '1,000 kg', stockStatus: 'In Stock' },
        { id: 'prod-2', name: 'PP Homopolymer Injection Grade', grade: 'H110MA', category: 'PP', pricePerKg: 104, moq: '1,000 kg', stockStatus: 'In Stock' },
        { id: 'prod-3', name: 'LLDPE Film Grade', grade: '010F18A', category: 'LLDPE', pricePerKg: 112, moq: '500 kg', stockStatus: 'In Stock' },
        { id: 'prod-4', name: 'PVC Resin Suspension Grade', grade: 'K-67', category: 'PVC', pricePerKg: 89, moq: '2,000 kg', stockStatus: 'Limited Stock' },
        { id: 'prod-5', name: 'Recycled PP Granules', grade: 'RPP-Black-01', category: 'Recycled', pricePerKg: 72, moq: '1,500 kg', stockStatus: 'In Stock' },
        { id: 'prod-6', name: 'White Masterbatch (70% TiO2)', grade: 'MB-W-70', category: 'Masterbatch', pricePerKg: 185, moq: '250 kg', stockStatus: 'In Stock' }
    ],
    metaTemplates: [
        { id: 'tpl-1', name: 'zenvista_polymer_bulk_offer', category: 'MARKETING', status: 'Approved', language: 'en_US', body: 'Namaste {{1}}! Zenvista Polymers is offering exclusive bulk spot pricing on Virgin HDPE & PP granules valid until this Friday. Reply QUOTE to get instantaneous price sheet.', isCustom: false },
        { id: 'tpl-2', name: 'price_update_hdpe_pp', category: 'MARKETING', status: 'Approved', language: 'en_US', body: 'Dear Partner {{1}}, raw material price revisions for HDPE (B56003) & PP (H110MA) are updated for today. Click below to download PDF quotation.', isCustom: false },
        { id: 'tpl-3', name: 'sample_dispatch_alert', category: 'UTILITY', status: 'Approved', language: 'en_US', body: 'Hello {{1}}, your resin sample kit for {{2}} has been dispatched via BlueDart with AWB #{{3}}. Expected delivery in 2 business days.', isCustom: false },
        { id: 'tpl-4', name: 'order_payment_receipt', category: 'UTILITY', status: 'Approved', language: 'en_US', body: 'Payment received for Order #{{1}} amounting to INR {{2}}. Zenvista Polymers warehouse team is preparing your dispatch.', isCustom: false }
    ],
    broadcastsHistory: [
        {
            id: 'bc-1',
            campaignName: 'Diwali Polymer Advance Booking',
            templateName: 'zenvista_polymer_bulk_offer',
            targetAudience: 'Plastic Injection Molders',
            contactsCount: 12400,
            pricePerMessage: 0.86,
            totalCost: 10664,
            product: 'PP Homopolymer Injection Grade',
            status: 'Completed',
            date: '2026-10-20'
        }
    ]
};

const DashboardData = mongoose.models.DashboardData || mongoose.model('DashboardData', DashboardDataSchema);

module.exports = {
    DashboardData,
    defaultZenvistaData
};
