const mongoose = require('mongoose');

const BroadcastCampaignSchema = new mongoose.Schema({
    campaignName: { type: String, required: true },
    templateName: { type: String, required: true },
    category: { type: String, enum: ['MARKETING', 'UTILITY', 'AUTHENTICATION'], default: 'MARKETING' },
    targetAudience: { type: String, default: 'All Polymer Buyers' },
    audienceSegment: { 
        type: String, 
        enum: ['All Buyers', 'HDPE Blow Molders', 'PP Injection Molding', 'PVC Pipe Extruders', 'Masterbatch Compounders', 'VIP Repeat Clients'],
        default: 'All Buyers'
    },
    product: { type: String, default: 'HDPE Blow Molding Grade' },
    grade: { type: String, default: 'B56003' },
    offerPrice: { type: String, default: '₹118/kg Ex-Kandla' },
    contactsCount: { type: Number, required: true, default: 500 },
    pricePerMessage: { type: Number, default: 0.86 },
    totalCost: { type: Number, default: 430 },
    status: { type: String, enum: ['Draft', 'Scheduled', 'Sending', 'Completed', 'Paused'], default: 'Completed' },
    stats: {
        sent: { type: Number, default: 0 },
        delivered: { type: Number, default: 0 },
        read: { type: Number, default: 0 },
        replied: { type: Number, default: 0 },
        deliveryRate: { type: String, default: '99.4%' },
        readRate: { type: String, default: '84.2%' },
        replyRate: { type: String, default: '28.6%' },
        inquiriesGenerated: { type: Number, default: 0 },
        pipelineValue: { type: String, default: '₹0' }
    },
    scheduledDate: { type: String, default: () => new Date().toISOString().split('T')[0] },
    metaMessageId: { type: String, default: () => `wamid.HBgL${Date.now()}` }
}, { timestamps: true });

// Initial Seed Data for Zenvista Polymers
const defaultCampaigns = [
    {
        campaignName: 'Diwali Bulk Polymer Spot Discount',
        templateName: 'zenvista_polymer_bulk_offer',
        category: 'MARKETING',
        targetAudience: 'Western India Injection Units',
        audienceSegment: 'PP Injection Molding',
        product: 'PP Homopolymer Injection Grade',
        grade: 'H110MA',
        offerPrice: '₹104/kg (FOT Ahmedabad)',
        contactsCount: 1450,
        pricePerMessage: 0.86,
        totalCost: 1247,
        status: 'Completed',
        stats: {
            sent: 1450,
            delivered: 1442,
            read: 1228,
            replied: 412,
            deliveryRate: '99.4%',
            readRate: '85.2%',
            replyRate: '33.5%',
            inquiriesGenerated: 68,
            pipelineValue: '₹8,40,000'
        },
        scheduledDate: '2026-10-24'
    },
    {
        campaignName: 'HDPE B56003 Kandla Port Stock Clearance',
        templateName: 'price_update_hdpe_pp',
        category: 'MARKETING',
        targetAudience: 'Jerrycan & Bottle Manufacturers',
        audienceSegment: 'HDPE Blow Molders',
        product: 'HDPE Blow Molding Grade',
        grade: 'B56003',
        offerPrice: '₹118/kg Ex-Warehouse',
        contactsCount: 2200,
        pricePerMessage: 0.86,
        totalCost: 1892,
        status: 'Completed',
        stats: {
            sent: 2200,
            delivered: 2180,
            read: 1890,
            replied: 640,
            deliveryRate: '99.1%',
            readRate: '86.7%',
            replyRate: '33.9%',
            inquiriesGenerated: 114,
            pipelineValue: '₹14,20,000'
        },
        scheduledDate: '2026-10-21'
    },
    {
        campaignName: 'PVC K-67 Resin Weekly Price Bullet',
        templateName: 'sample_dispatch_alert',
        category: 'UTILITY',
        targetAudience: 'Rigid Pipe & Profile Extruders',
        audienceSegment: 'PVC Pipe Extruders',
        product: 'PVC Resin Suspension Grade',
        grade: 'K-67',
        offerPrice: '₹89/kg + GST',
        contactsCount: 880,
        pricePerMessage: 0.40,
        totalCost: 352,
        status: 'Completed',
        stats: {
            sent: 880,
            delivered: 878,
            read: 760,
            replied: 195,
            deliveryRate: '99.8%',
            readRate: '86.6%',
            replyRate: '25.7%',
            inquiriesGenerated: 34,
            pipelineValue: '₹4,10,000'
        },
        scheduledDate: '2026-10-18'
    }
];

BroadcastCampaignSchema.statics.seedIfEmpty = async function() {
    const count = await this.countDocuments();
    if (count === 0) {
        console.log('Seeding initial Zenvista Broadcast Campaigns...');
        await this.insertMany(defaultCampaigns);
    }
};

module.exports = mongoose.model('BroadcastCampaign', BroadcastCampaignSchema);
