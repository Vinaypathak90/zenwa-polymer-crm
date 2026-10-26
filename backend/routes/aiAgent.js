const express = require('express');
const router = express.Router();
const AIAgentConfig = require('../models/AIAgentConfig');

// ── GET /api/ai-agent ───────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
    try {
        await AIAgentConfig.seedIfEmpty();
        let config = await AIAgentConfig.findOne();
        if (!config) {
            config = await AIAgentConfig.create({});
        }

        res.json({
            success: true,
            config
        });
    } catch (error) {
        console.error('Error fetching AI agent config:', error);
        res.status(500).json({ success: false, message: 'Server error fetching AI Agent Studio config' });
    }
});

// ── PATCH /api/ai-agent/config ──────────────────────────────────────────────────
router.patch('/config', async (req, res) => {
    try {
        const updated = await AIAgentConfig.findOneAndUpdate(
            {},
            { ...req.body },
            { new: true, upsert: true }
        );

        res.json({ success: true, message: 'AI Agent settings saved successfully!', config: updated });
    } catch (error) {
        console.error('Error updating AI agent config:', error);
        res.status(500).json({ success: false, message: 'Failed to update AI Agent settings' });
    }
});

// ── POST /api/ai-agent/test ─────────────────────────────────────────────────────
// Real-time WhatsApp AI reply simulation based on knowledge base and system prompt
router.post('/test', async (req, res) => {
    try {
        const { query } = req.body;
        if (!query || !query.trim()) {
            return res.status(400).json({ success: false, message: 'Please provide a test query' });
        }

        const config = await AIAgentConfig.findOne();
        const kb = config?.knowledgeBase || [];
        const q = query.toLowerCase();

        let detectedGrade = null;
        for (const item of kb) {
            if (q.includes(item.grade.toLowerCase()) || q.includes(item.productName.toLowerCase()) || (item.grade === 'B56003' && q.includes('hdpe')) || (item.grade === 'H110MA' && q.includes('pp'))) {
                detectedGrade = item;
                break;
            }
        }

        let aiReply = "";
        let intent = "Price Inquiry";
        let shouldHandover = false;
        let handoverReason = null;

        // Check handover triggers
        if (q.includes('credit') || q.includes('udhar') || q.includes('30 day') || q.includes('discount') || q.includes('kam karo')) {
            shouldHandover = true;
            handoverReason = "Buyer requested custom payment / credit terms";
        } else if (q.includes('50 ton') || q.includes('100 ton') || q.includes('rake') || q.includes('bulk order')) {
            shouldHandover = true;
            handoverReason = "Large bulk volume (>50 MT) detected";
        }

        if (detectedGrade) {
            aiReply = `Namaste! ZENVISTA POLYMERS se Harsh Vardhan ki team ki taraf se greetings.\n\nAaj ka spot rate for *${detectedGrade.productName} (Grade ${detectedGrade.grade})*:\n• Rate: *₹${detectedGrade.pricePerKg}/kg* + GST\n• Delivery: Ex-Kandla Port Warehouse / FOT Ahmedabad\n• Technical Specs: MFI ${detectedGrade.mfi}, Density ${detectedGrade.density}\n• Availability: ${detectedGrade.stockStatus}\n• Minimum Order: 1,000 kg (1 MT)\n\nKya aapko COA (Technical Datasheet) ya 5kg sample trial dispatch karwana hai? Reply YES to confirm.`;
        } else if (q.includes('price') || q.includes('rate') || q.includes('bhav') || q.includes('list')) {
            aiReply = `Namaste! Zenvista Polymers ka current daily polymer price bullet:\n\n1. *HDPE Blow Molding (B56003)*: ₹118/kg Ex-Kandla\n2. *PP Homopolymer Injection (H110MA)*: ₹104/kg FOT Ahmedabad\n3. *LLDPE Film Grade (010F18A)*: ₹112/kg Ex-Mundra\n4. *PVC Suspension Resin (K-67)*: ₹89/kg + GST\n\nAapko kis grade aur kitne metric ton ki requirement hai? Hum turant formal proforma quote generate kar denge.`;
        } else {
            aiReply = `Namaste! ZENVISTA POLYMERS (Shivam Organics) me aapka swagat hai.\nHum virgin polymer raw materials (HDPE, PP, LLDPE, PVC) ke authorized distribution partners hain.\n\nAap apni requirement (Grade & Tonnage) yahan share kar sakte hain, humari team turant spot quotation provide karegi.`;
        }

        if (shouldHandover) {
            aiReply += `\n\n*(Note: Client has requested special terms: ${handoverReason}. AI flagged this chat for immediate personal follow-up by Harsh Vardhan & Neha Sharma).*`;
        }

        res.json({
            success: true,
            query,
            response: aiReply,
            metadata: {
                modelUsed: config?.model || 'Meta Llama 3 70B (WhatsApp Fine-Tuned)',
                confidence: detectedGrade ? '98.8%' : '94.2%',
                intent,
                shouldHandover,
                handoverReason,
                responseTime: '1.4s'
            }
        });
    } catch (error) {
        console.error('Error generating AI simulation reply:', error);
        res.status(500).json({ success: false, message: 'AI test failed' });
    }
});

module.exports = router;
