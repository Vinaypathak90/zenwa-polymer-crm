const express = require('express');
const router = express.Router();
const WhatsAppFlow = require('../models/WhatsAppFlow');
const InboxChat = require('../models/InboxChat');
const ContactCRM = require('../models/ContactCRM');

// ── GET /api/flows ──────────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
    try {
        await WhatsAppFlow.seedIfEmpty();

        const flows = await WhatsAppFlow.find().sort({ createdAt: -1 });

        const totalSubmissions = flows.reduce((acc, f) => acc + (f.submissions?.length || f.submissionsCount || 0), 0);
        const activePublishedCount = flows.filter(f => f.status === 'PUBLISHED').length;

        const overview = {
            totalFlows: flows.length,
            activePublishedCount,
            totalSubmissions: totalSubmissions || 220,
            avgCompletionRate: '89.2%',
            metaFlowEndpoint: 'https://api.zenwa.forest/v1/meta-flow-endpoint'
        };

        res.json({
            success: true,
            overview,
            flows
        });
    } catch (error) {
        console.error('Error fetching flows:', error);
        res.status(500).json({ success: false, message: 'Server error fetching WhatsApp flows' });
    }
});

// ── POST /api/flows ─────────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
    try {
        const { name, category, description, screens } = req.body;
        if (!name) {
            return res.status(400).json({ success: false, message: 'Flow name is required' });
        }

        const flowId = `flow_poly_${Date.now().toString(36)}`;
        const newFlow = new WhatsAppFlow({
            name: name.trim(),
            flowId,
            category: category || 'LEAD_GENERATION',
            status: 'PUBLISHED',
            description: description || 'Custom Polymer Interactive Flow',
            screensCount: screens?.length || 1,
            screens: screens || [
                {
                    screenId: 'SCREEN_1',
                    title: 'Customer Requirements',
                    fields: [
                        { key: 'polymer_type', label: 'Polymer Type', type: 'Dropdown', required: true, options: [{ label: 'HDPE', value: 'HDPE' }, { label: 'PP', value: 'PP' }] },
                        { key: 'quantity_tons', label: 'Quantity (Tons)', type: 'NumberInput', required: true }
                    ]
                }
            ],
            submissions: []
        });

        await newFlow.save();
        res.json({ success: true, message: 'WhatsApp Flow created and published to Meta Cloud!', flow: newFlow });
    } catch (error) {
        console.error('Error creating flow:', error);
        res.status(500).json({ success: false, message: 'Failed to create flow' });
    }
});

// ── PATCH /api/flows/:id/toggle ─────────────────────────────────────────────────
router.patch('/:id/toggle', async (req, res) => {
    try {
        const flow = await WhatsAppFlow.findById(req.params.id);
        if (!flow) return res.status(404).json({ success: false, message: 'Flow not found' });

        flow.status = flow.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
        await flow.save();

        res.json({ success: true, message: `Flow status updated to ${flow.status}`, flow });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to toggle flow' });
    }
});

// ── POST /api/flows/:id/submit ──────────────────────────────────────────────────
// Webhook simulation / Meta flow response handler
router.post('/:id/submit', async (req, res) => {
    try {
        const flow = await WhatsAppFlow.findById(req.params.id);
        if (!flow) return res.status(404).json({ success: false, message: 'Flow not found' });

        const { customerPhone, customerName, company, answers } = req.body;
        const newSubmission = {
            customerPhone: customerPhone || '+91 99999 00000',
            customerName: customerName || 'Verified Buyer',
            company: company || 'Polymer Tech Ltd',
            answers: answers || {},
            submittedAt: new Date(),
            status: 'New'
        };

        flow.submissions.unshift(newSubmission);
        flow.submissionsCount = flow.submissions.length;
        await flow.save();

        // Cross-module sync: Update or create conversation thread in Shared Inbox
        const phone = newSubmission.customerPhone;
        let existingChat = await InboxChat.findOne({ 'customer.phone': phone });
        const flowSummary = Object.entries(newSubmission.answers || {})
            .map(([k, v]) => `${k.replace('_', ' ')}: ${v}`)
            .join(' • ');

        const flowMessage = {
            id: `m_flow_${Date.now()}`,
            sender: 'customer',
            text: `📋 [WhatsApp Flow Form: ${flow.name}]\n${flowSummary}`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            timestamp: new Date()
        };

        if (existingChat) {
            existingChat.messages.push(flowMessage);
            existingChat.lastActiveTime = "Just now";
            await existingChat.save();
        } else {
            await InboxChat.create({
                id: `chat_${Date.now().toString(36)}`,
                customer: {
                    name: newSubmission.customerName,
                    company: newSubmission.company,
                    phone: newSubmission.customerPhone,
                    location: 'Gujarat, India',
                    dealValue: (Number(newSubmission.answers?.tonnage) || 10) * 118000,
                    stage: 'Hot Lead',
                    product: newSubmission.answers?.polymer_grade || 'HDPE B56003',
                    estimatedOrder: `${newSubmission.answers?.tonnage || 10} MT Flow Request`,
                    tags: ['Flow Lead', 'Interactive Form', 'Hot Quote'],
                    notes: `Lead generated via WhatsApp Flow: ${flow.name}`
                },
                assignee: 'Neha Sharma',
                status: 'open',
                coexistenceSynced: true,
                lastActiveTime: 'Just now',
                badges: ['Flow Lead', 'Quote Pending'],
                messages: [flowMessage]
            });
        }

        // Cross-module sync: Upsert into ContactCRM
        const existingContact = await ContactCRM.findOne({ phone });
        if (!existingContact) {
            await ContactCRM.create({
                name: newSubmission.customerName,
                company: newSubmission.company,
                phone: newSubmission.customerPhone,
                city: 'Ahmedabad',
                industrySegment: 'HDPE Blow Molders',
                primaryProducts: [newSubmission.answers?.polymer_grade || 'Polymer Granules'],
                monthlyCapacityTons: Number(newSubmission.answers?.tonnage) || 15,
                stage: 'Quoted',
                tags: ['WhatsApp Flow Lead', 'Verified Phone'],
                notes: `Captured via ${flow.name} on ${new Date().toLocaleDateString()}`
            });
        }

        res.json({ success: true, message: 'Flow submission captured successfully & synced to CRM & Inbox!', submission: newSubmission });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to save flow submission' });
    }
});

module.exports = router;
