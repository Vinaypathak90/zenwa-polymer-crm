const express = require('express');
const router = express.Router();
const { DashboardData, defaultZenvistaData } = require('../models/DashboardData');

// Helper to get or seed dashboard document
async function getOrCreateDashboard() {
    let doc = await DashboardData.findOne();
    if (!doc) {
        doc = await DashboardData.create(defaultZenvistaData);
    }
    return doc;
}

// 1. GET /api/dashboard - Fetch cockpit data with search and date filters
router.get('/', async (req, res) => {
    try {
        const { search, startDate, endDate, stage } = req.query;
        const doc = await getOrCreateDashboard();
        const dataObj = doc.toObject();

        let filteredLeads = [...(dataObj.leads || [])];

        // Search Filter (Search across Customer, Company, Product, Query, Phone, Assignee, Source)
        if (search && search.trim() !== '') {
            const query = search.trim().toLowerCase();
            filteredLeads = filteredLeads.filter(lead => {
                const customer = (lead.customer || '').toLowerCase();
                const company = (lead.company || '').toLowerCase();
                const phone = (lead.phone || '').toLowerCase();
                const product = (lead.product || '').toLowerCase();
                const queryText = (lead.query || '').toLowerCase();
                const assignee = (lead.assignee || '').toLowerCase();
                const source = (lead.source || '').toLowerCase();
                const leadStage = (lead.stage || '').toLowerCase();

                return customer.includes(query) ||
                       company.includes(query) ||
                       phone.includes(query) ||
                       product.includes(query) ||
                       queryText.includes(query) ||
                       assignee.includes(query) ||
                       source.includes(query) ||
                       leadStage.includes(query);
            });
        }

        // Date Picker Filter (Filter by lead.date: YYYY-MM-DD)
        if (startDate) {
            filteredLeads = filteredLeads.filter(lead => !lead.date || lead.date >= startDate);
        }
        if (endDate) {
            filteredLeads = filteredLeads.filter(lead => !lead.date || lead.date <= endDate);
        }

        // Stage Filter (Optional: Hot, Warm, Cold, etc.)
        if (stage && stage !== 'All') {
            filteredLeads = filteredLeads.filter(lead => lead.stage?.toLowerCase() === stage.toLowerCase());
        }

        // Calculate dynamic pipeline metrics based on active filter
        const filteredPipelineValue = filteredLeads.reduce((acc, lead) => acc + (Number(lead.value) || 0), 0);

        res.status(200).json({
            success: true,
            conversations: dataObj.conversations,
            replies: dataObj.replies,
            broadcast: dataObj.broadcast,
            responseTime: dataObj.responseTime,
            weeklyTraffic: dataObj.weeklyTraffic,
            teamWorkload: dataObj.teamWorkload,
            leads: filteredLeads,
            totalLeadsCount: dataObj.leads.length,
            filteredLeadsCount: filteredLeads.length,
            filteredPipelineValue,
            products: dataObj.products || [],
            metaTemplates: dataObj.metaTemplates || [],
            broadcastsHistory: dataObj.broadcastsHistory || []
        });
    } catch (error) {
        console.error("Dashboard Fetch Error:", error);
        // Resilient fallback with default data
        res.status(200).json({
            success: true,
            isFallback: true,
            ...defaultZenvistaData
        });
    }
});

// 2. POST /api/dashboard/broadcast - Launch New Broadcast with Custom Price & Custom Meta Template
router.post('/broadcast', async (req, res) => {
    try {
        const {
            campaignName,
            templateName,
            isCustomTemplate,
            customTemplateBody,
            templateCategory,
            targetAudience,
            contactsCount,
            pricePerMessage,
            totalCost,
            product
        } = req.body;

        if (!campaignName || !templateName) {
            return res.status(400).json({ success: false, message: 'Campaign name and template are required.' });
        }

        const doc = await getOrCreateDashboard();

        // If user typed a new custom template, add to metaTemplates array for future reuse
        if (isCustomTemplate) {
            const templateExists = doc.metaTemplates.some(t => t.name.toLowerCase() === templateName.toLowerCase());
            if (!templateExists) {
                doc.metaTemplates.push({
                    id: `tpl-${Date.now()}`,
                    name: templateName.trim(),
                    category: templateCategory || 'MARKETING',
                    status: 'Approved',
                    language: 'en_US',
                    body: customTemplateBody || '',
                    isCustom: true
                });
            }
        }

        const numericTotalCost = Number(totalCost) || (Number(contactsCount || 0) * Number(pricePerMessage || 0.86));
        const numericContacts = Number(contactsCount) || 0;
        const numericRate = Number(pricePerMessage) || 0.86;

        // Create new broadcast history record
        const newBroadcast = {
            id: `bc-${Date.now()}`,
            campaignName: campaignName.trim(),
            templateName: templateName.trim(),
            targetAudience: targetAudience || 'Polymer Buyers',
            contactsCount: numericContacts,
            pricePerMessage: numericRate,
            totalCost: numericTotalCost,
            product: product || '',
            status: 'Active',
            date: new Date().toISOString().split('T')[0]
        };

        doc.broadcastsHistory.unshift(newBroadcast);

        // Update overall broadcast spend
        doc.broadcast.spend = (doc.broadcast.spend || 0) + numericTotalCost;

        await doc.save();

        res.status(201).json({
            success: true,
            message: 'Broadcast campaign launched successfully!',
            broadcast: newBroadcast,
            totalSpend: doc.broadcast.spend,
            metaTemplates: doc.metaTemplates
        });
    } catch (error) {
        console.error("Launch Broadcast Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// 3. POST /api/dashboard/template - Add Custom Meta Template
router.post('/template', async (req, res) => {
    try {
        const { name, category, body } = req.body;
        if (!name) {
            return res.status(400).json({ success: false, message: 'Template name is required' });
        }

        const doc = await getOrCreateDashboard();
        const newTemplate = {
            id: `tpl-${Date.now()}`,
            name: name.trim().replace(/\s+/g, '_').toLowerCase(),
            category: category || 'MARKETING',
            status: 'Approved',
            language: 'en_US',
            body: body || '',
            isCustom: true
        };

        doc.metaTemplates.push(newTemplate);
        await doc.save();

        res.status(201).json({ success: true, template: newTemplate, templates: doc.metaTemplates });
    } catch (error) {
        console.error("Add Template Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// 4. GET /api/dashboard/products - Fetch Polymer Catalog
router.get('/products', async (req, res) => {
    try {
        const doc = await getOrCreateDashboard();
        res.status(200).json({ success: true, products: doc.products || [] });
    } catch (error) {
        console.error("Fetch Products Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// 5. POST /api/dashboard/products - Add Polymer Product
router.post('/products', async (req, res) => {
    try {
        const { name, grade, category, pricePerKg, moq, stockStatus } = req.body;
        if (!name || !pricePerKg) {
            return res.status(400).json({ success: false, message: 'Product name and price are required' });
        }

        const doc = await getOrCreateDashboard();
        const newProduct = {
            id: `prod-${Date.now()}`,
            name,
            grade: grade || '',
            category: category || 'Polymers',
            pricePerKg: Number(pricePerKg),
            moq: moq || '1,000 kg',
            stockStatus: stockStatus || 'In Stock'
        };

        doc.products.push(newProduct);
        await doc.save();

        res.status(201).json({ success: true, product: newProduct, products: doc.products });
    } catch (error) {
        console.error("Create Product Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
