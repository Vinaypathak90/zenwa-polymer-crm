const mongoose = require('mongoose');

const AIAgentConfigSchema = new mongoose.Schema({
    agentName: { type: String, default: 'ZenWA Polymer Copilot' },
    status: { type: String, enum: ['Active', 'ApprovalMode', 'Paused'], default: 'Active' },
    model: { type: String, default: 'Meta Llama 3 70B (WhatsApp Fine-Tuned)' },
    temperature: { type: Number, default: 0.2 },
    responseLanguage: { type: String, enum: ['English', 'Hinglish', 'Hindi', 'Gujarati'], default: 'Hinglish' },
    systemPrompt: { 
        type: String, 
        default: `You are the official WhatsApp Sales & Technical Assistant for ZENVISTA POLYMERS (Shivam Organics), managed by Harsh Vardhan.
Your job is to assist plastic manufacturers, injection molders, blow molders, and packaging units with verified polymer granule rates, technical datasheets (TDS), sample requests, and order dispatch terms.

Pricing & Grade Rules:
1. HDPE Blow Molding Grade B56003 is priced at ₹118/kg Ex-Kandla.
2. PP Homopolymer Injection Grade H110MA is priced at ₹104/kg FOT Ahmedabad.
3. LLDPE Film Grade 010F18A is priced at ₹112/kg Ex-Mundra.
4. PVC Resin Suspension K-67 is priced at ₹89/kg + GST.

Operational Rules:
- Minimum Order Quantity (MOQ) is 1,000 kg (1 Metric Ton).
- Payment terms are 100% Advance RTGS or 15-day PDC for verified GST accounts.
- If a client requests >50 MT or asks for >₹2/kg discount, tag the conversation for immediate handover to Harsh Vardhan or Neha Sharma.
- Speak in professional, polite Hinglish or English.`
    },
    knowledgeBase: [
        {
            grade: { type: String },
            productName: { type: String },
            pricePerKg: { type: Number },
            mfi: { type: String },
            density: { type: String },
            stockStatus: { type: String, default: 'In Stock' }
        }
    ],
    handoverRules: [
        { trigger: { type: String }, action: { type: String } }
    ],
    stats: {
        autoResolvedChats: { type: Number, default: 1140 },
        avgResponseTimeSeconds: { type: Number, default: 2.8 },
        handoverRatePercent: { type: Number, default: 14.2 },
        accuracyScorePercent: { type: Number, default: 97.5 }
    }
}, { timestamps: true });

const defaultAgentConfig = {
    agentName: 'ZenWA Polymer Copilot',
    status: 'Active',
    model: 'Meta Llama 3 70B (WhatsApp Fine-Tuned)',
    temperature: 0.2,
    responseLanguage: 'Hinglish',
    knowledgeBase: [
        { grade: 'B56003', productName: 'HDPE Blow Molding Grade', pricePerKg: 118, mfi: '0.35 g/10min', density: '0.958 g/cc', stockStatus: 'In Stock' },
        { grade: 'H110MA', productName: 'PP Homopolymer Injection Grade', pricePerKg: 104, mfi: '11.0 g/10min', density: '0.905 g/cc', stockStatus: 'In Stock' },
        { grade: '010F18A', productName: 'LLDPE Film Grade', pricePerKg: 112, mfi: '1.0 g/10min', density: '0.918 g/cc', stockStatus: 'In Stock' },
        { grade: 'K-67', productName: 'PVC Resin Suspension Grade', pricePerKg: 89, mfi: 'K-Value 67', density: '1.40 g/cc', stockStatus: 'In Stock' }
    ],
    handoverRules: [
        { trigger: 'Tonnage > 50 MT requested', action: 'Route immediately to Harsh Vardhan (Owner)' },
        { trigger: 'Credit terms request (> 15 Days)', action: 'Route to Neha Sharma (Sales Lead)' },
        { trigger: 'Lab trial / sample dispatch approval', action: 'Auto-create Sample Dispatch Flow' },
        { trigger: 'Dispute or quality complaint', action: 'High priority alert to Harsh Vardhan' }
    ],
    stats: {
        autoResolvedChats: 1140,
        avgResponseTimeSeconds: 2.8,
        handoverRatePercent: 14.2,
        accuracyScorePercent: 97.5
    }
};

AIAgentConfigSchema.statics.seedIfEmpty = async function() {
    const count = await this.countDocuments();
    if (count === 0) {
        console.log('Seeding initial AI Agent Studio Config...');
        await this.create(defaultAgentConfig);
    }
};

module.exports = mongoose.model('AIAgentConfig', AIAgentConfigSchema);
