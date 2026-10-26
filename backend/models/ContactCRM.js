const mongoose = require('mongoose');

const ContactCRMSchema = new mongoose.Schema({
    name: { type: String, required: true },
    company: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    email: { type: String, default: '' },
    city: { type: String, default: 'Ahmedabad' },
    state: { type: String, default: 'Gujarat' },
    industrySegment: { 
        type: String, 
        enum: ['HDPE Blow Molders', 'PP Injection Molding', 'PVC Pipe Extruders', 'Masterbatch Compounders', 'Film Extrusion', 'General Polymers'],
        default: 'HDPE Blow Molders'
    },
    primaryProducts: [{ type: String }],
    monthlyCapacityTons: { type: Number, default: 20 },
    stage: { 
        type: String, 
        enum: ['Lead', 'Hot Lead', 'Warm Lead', 'Cold Lead', 'Quoted', 'Negotiation', 'Won', 'Repeat Buyer', 'Inactive'],
        default: 'Quoted'
    },
    lifetimeValue: { type: Number, default: 0 },
    tags: [{ type: String }],
    assignee: { type: String, default: 'Neha Sharma' },
    lastInteraction: { type: Date, default: Date.now },
    notes: { type: String, default: '' }
}, { timestamps: true });

// Seed Data for Zenvista Polymers Contacts
const defaultContacts = [
    {
        name: 'Rajesh Patel',
        company: 'Gujarat Containers Ltd',
        phone: '+91 98200 44120',
        email: 'rajesh.p@gujaratcontainers.com',
        city: 'Ahmedabad',
        state: 'Gujarat',
        industrySegment: 'HDPE Blow Molders',
        primaryProducts: ['HDPE Blow Molding Grade B56003'],
        monthlyCapacityTons: 40,
        stage: 'Repeat Buyer',
        lifetimeValue: 4850000,
        tags: ['VIP', 'Kandla Port Delivery', 'Credit 15D', 'GST Verified'],
        assignee: 'Harsh Vardhan',
        notes: 'Largest HDPE container manufacturer in Dholka. Regular monthly order of 30-40 MT.'
    },
    {
        name: 'Anil Gupta',
        company: 'Supreme Molding Corp',
        phone: '+91 98110 99823',
        email: 'anil@suprememolding.in',
        city: 'Morbi',
        state: 'Gujarat',
        industrySegment: 'PP Injection Molding',
        primaryProducts: ['PP Homopolymer H110MA'],
        monthlyCapacityTons: 25,
        stage: 'Negotiation',
        lifetimeValue: 2100000,
        tags: ['Hot Lead', 'Mundra Port Pickup', 'Immediate Dispatch'],
        assignee: 'Neha Sharma',
        notes: 'Inquiring for 20 MT PP H110MA. Negotiating on freight rate from Kandla.'
    },
    {
        name: 'Maheshwari Plast',
        company: 'Apex PVC Pipes Pvt Ltd',
        phone: '+91 98250 88211',
        email: 'purchase@apexpvc.com',
        city: 'Surat',
        state: 'Gujarat',
        industrySegment: 'PVC Pipe Extruders',
        primaryProducts: ['PVC Resin Suspension K-67'],
        monthlyCapacityTons: 60,
        stage: 'Won',
        lifetimeValue: 6400000,
        tags: ['High Volume', 'FOT Delivery', 'Advance Payment'],
        assignee: 'Harsh Vardhan',
        notes: 'Bought 50 MT PVC K-67 yesterday at ₹89/kg. Payment cleared via RTGS.'
    },
    {
        name: 'Sunil Mehta',
        company: 'Kandla Masterbatch & Polymers',
        phone: '+91 97240 11984',
        email: 'sunil@kandlapolymers.com',
        city: 'Gandhidham',
        state: 'Gujarat',
        industrySegment: 'Masterbatch Compounders',
        primaryProducts: ['LLDPE Film Grade 010F18A', 'Calcium Carbonate Filler'],
        monthlyCapacityTons: 15,
        stage: 'Quoted',
        lifetimeValue: 890000,
        tags: ['Sample Sent', 'New Customer'],
        assignee: 'Neha Sharma',
        notes: 'Sample of LLDPE delivered. Waiting for lab tensile test report.'
    },
    {
        name: 'Dharmendra Singh',
        company: 'Royal Packaging Units',
        phone: '+91 99100 23456',
        email: 'dharmendra@royalpack.in',
        city: 'Daman',
        state: 'UT of DNH & DD',
        industrySegment: 'HDPE Blow Molders',
        primaryProducts: ['HDPE Blow Molding Grade B56003'],
        monthlyCapacityTons: 35,
        stage: 'Lead',
        lifetimeValue: 0,
        tags: ['Cold Call', 'Follow-up Due'],
        assignee: 'Neha Sharma',
        notes: 'Looking for alternate supplier to IOCL. Sent digital brochure and TDS.'
    }
];

ContactCRMSchema.statics.seedIfEmpty = async function() {
    const count = await this.countDocuments();
    if (count === 0) {
        console.log('Seeding initial Zenvista CRM Contacts...');
        await this.insertMany(defaultContacts);
    }
};

module.exports = mongoose.model('ContactCRM', ContactCRMSchema);
