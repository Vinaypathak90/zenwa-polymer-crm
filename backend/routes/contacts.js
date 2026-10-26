const express = require('express');
const router = express.Router();
const ContactCRM = require('../models/ContactCRM');
const InboxChat = require('../models/InboxChat');

// ── GET /api/contacts ───────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
    try {
        await ContactCRM.seedIfEmpty();

        const { search, stage, segment, tag } = req.query;
        let query = {};

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { company: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { city: { $regex: search, $options: 'i' } }
            ];
        }

        if (stage && stage !== 'All') {
            query.stage = stage;
        }

        if (segment && segment !== 'All') {
            query.industrySegment = segment;
        }

        if (tag && tag !== 'All') {
            query.tags = tag;
        }

        const contacts = await ContactCRM.find(query).sort({ updatedAt: -1 });

        // Aggregate CRM summary metrics
        const totalContacts = await ContactCRM.countDocuments();
        const repeatBuyers = await ContactCRM.countDocuments({ stage: 'Repeat Buyer' });
        const hotPipeline = await ContactCRM.countDocuments({ stage: { $in: ['Quoted', 'Negotiation'] } });
        
        const allContacts = await ContactCRM.find();
        const totalLTV = allContacts.reduce((sum, c) => sum + (c.lifetimeValue || 0), 0);

        const overview = {
            totalContacts,
            repeatBuyers,
            hotPipeline,
            totalPipelineValue: `₹${totalLTV.toLocaleString()}`,
            activeSync: 'WhatsApp Sync Active (Meta WABA)'
        };

        res.json({
            success: true,
            overview,
            contacts
        });
    } catch (error) {
        console.error('Error fetching contacts:', error);
        res.status(500).json({ success: false, message: 'Server error fetching contacts' });
    }
});

// ── POST /api/contacts ──────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
    try {
        const { name, company, phone, email, city, industrySegment, primaryProducts, monthlyCapacityTons, stage, tags, assignee, notes } = req.body;

        if (!name || !phone) {
            return res.status(400).json({ success: false, message: 'Name and Phone number are required' });
        }

        // Check if contact already exists
        const existing = await ContactCRM.findOne({ phone: phone.trim() });
        if (existing) {
            return res.status(400).json({ success: false, message: `Contact with phone ${phone} already exists in CRM.` });
        }

        const newContact = new ContactCRM({
            name: name.trim(),
            company: company ? company.trim() : 'Independent Manufacturer',
            phone: phone.trim(),
            email: email ? email.trim() : '',
            city: city || 'Ahmedabad',
            industrySegment: industrySegment || 'HDPE Blow Molders',
            primaryProducts: primaryProducts || ['Polymer Granules'],
            monthlyCapacityTons: Number(monthlyCapacityTons) || 10,
            stage: stage || 'Lead',
            tags: tags || ['WhatsApp Contact', 'New Buyer'],
            assignee: assignee || 'Neha Sharma',
            notes: notes || ''
        });

        await newContact.save();

        // Cross-module sync: Auto-create conversation thread in Shared Inbox
        const chatId = `chat_${Date.now().toString(36)}`;
        const existingChat = await InboxChat.findOne({ 'customer.phone': phone.trim() });
        if (!existingChat) {
            await InboxChat.create({
                id: chatId,
                customer: {
                    name: newContact.name,
                    company: newContact.company,
                    phone: newContact.phone,
                    location: `${newContact.city}, Gujarat`,
                    dealValue: (newContact.monthlyCapacityTons || 10) * 115000,
                    stage: newContact.stage,
                    product: (newContact.primaryProducts && newContact.primaryProducts[0]) || 'Polymer Granules',
                    estimatedOrder: `${newContact.monthlyCapacityTons || 10} MT Order`,
                    tags: newContact.tags || ['WhatsApp Contact'],
                    notes: newContact.notes || 'Created via CRM Contacts Directory.'
                },
                assignee: newContact.assignee || 'Neha Sharma',
                status: 'open',
                coexistenceSynced: true,
                lastActiveTime: 'Just now',
                badges: [`${newContact.stage}`, 'WhatsApp Synced'],
                messages: [
                    {
                        id: `m_${Date.now()}`,
                        sender: 'system',
                        text: `Contact ${newContact.name} (${newContact.company}) registered in CRM. WhatsApp thread initialized.`,
                        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    }
                ]
            });
        }

        res.json({ success: true, message: `Contact ${name} added successfully & synced with Shared Inbox!`, contact: newContact });
    } catch (error) {
        console.error('Error creating contact:', error);
        res.status(500).json({ success: false, message: 'Failed to create contact' });
    }
});

// ── PATCH /api/contacts/:id ─────────────────────────────────────────────────────
router.patch('/:id', async (req, res) => {
    try {
        const contact = await ContactCRM.findByIdAndUpdate(
            req.params.id,
            { ...req.body, updatedAt: new Date() },
            { new: true }
        );

        if (!contact) return res.status(404).json({ success: false, message: 'Contact not found' });

        res.json({ success: true, message: 'Contact updated successfully', contact });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update contact' });
    }
});

// ── DELETE /api/contacts/:id ────────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
    try {
        await ContactCRM.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Contact deleted from CRM' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete contact' });
    }
});

module.exports = router;
