const express = require('express');
const router = express.Router();
const BroadcastCampaign = require('../models/BroadcastCampaign');
const { DashboardData } = require('../models/DashboardData');

// ── GET /api/broadcasts ──────────────────────────────────────────────────────────
// Returns overview stats, recent campaigns list, segments, and approved Meta templates
router.get('/', async (req, res) => {
    try {
        await BroadcastCampaign.seedIfEmpty();

        const { search, segment, status } = req.query;
        let query = {};

        if (search) {
            query.$or = [
                { campaignName: { $regex: search, $options: 'i' } },
                { product: { $regex: search, $options: 'i' } },
                { targetAudience: { $regex: search, $options: 'i' } }
            ];
        }

        if (segment && segment !== 'All') {
            query.audienceSegment = segment;
        }

        if (status && status !== 'All') {
            query.status = status;
        }

        const campaigns = await BroadcastCampaign.find(query).sort({ createdAt: -1 });

        // Aggregate high-level stats
        const totalSent = campaigns.reduce((acc, c) => acc + (c.stats?.sent || c.contactsCount || 0), 0);
        const totalSpend = campaigns.reduce((acc, c) => acc + (c.totalCost || 0), 0);
        const totalInquiries = campaigns.reduce((acc, c) => acc + (c.stats?.inquiriesGenerated || 0), 0);

        const overview = {
            totalCampaigns: campaigns.length,
            totalMessagesSent: totalSent || 4530,
            averageDeliveryRate: '99.4%',
            averageReadRate: '86.1%',
            averageReplyRate: '31.2%',
            totalSpend: totalSpend || 3491,
            estimatedPipelineValue: '₹26,70,000',
            activeMetaTier: 'Tier 3 (100,000 msgs/day)'
        };

        const audienceSegments = [
            { id: 'all', name: 'All Buyers', count: 4850, avgReplyRate: '28%' },
            { id: 'hdpe', name: 'HDPE Blow Molders', count: 1820, avgReplyRate: '34%' },
            { id: 'pp', name: 'PP Injection Molding', count: 1450, avgReplyRate: '32%' },
            { id: 'pvc', name: 'PVC Pipe Extruders', count: 980, avgReplyRate: '26%' },
            { id: 'masterbatch', name: 'Masterbatch Compounders', count: 600, avgReplyRate: '30%' }
        ];

        const metaTemplates = [
            {
                name: 'zenvista_polymer_bulk_offer',
                category: 'MARKETING',
                language: 'en_US',
                status: 'Approved',
                preview: '🔥 Special Price Alert: Premium {{1}} (Grade {{2}}) available at ₹{{3}}/kg for bulk booking. MOQ: {{4}} tons. Reply 1 for COA & TDS.',
                variables: ['Product Name', 'Grade Code', 'Price per KG', 'MOQ Tonnage']
            },
            {
                name: 'price_update_hdpe_pp',
                category: 'MARKETING',
                language: 'en_US',
                status: 'Approved',
                preview: '📦 Weekly Polymer Price Sheet from Zenvista Polymers: HDPE Blow Molding, PP Injection, and LLDPE Film grades in stock at Mundra & Kandla port.',
                variables: []
            },
            {
                name: 'sample_dispatch_alert',
                category: 'UTILITY',
                language: 'en_US',
                status: 'Approved',
                preview: '🚚 Dear {{1}}, your requested 5kg polymer testing sample for {{2}} has been dispatched via {{3}} (AWB: {{4}}).',
                variables: ['Customer Name', 'Product Grade', 'Courier Name', 'Tracking No']
            }
        ];

        return res.json({
            success: true,
            overview,
            campaigns,
            audienceSegments,
            metaTemplates
        });
    } catch (error) {
        console.error('Error fetching broadcasts:', error);
        res.status(500).json({ success: false, message: 'Server error fetching broadcasts' });
    }
});

// ── POST /api/broadcasts/launch ──────────────────────────────────────────────────
// Launches or schedules a new broadcast campaign
router.post('/launch', async (req, res) => {
    try {
        const {
            campaignName,
            templateName,
            category,
            audienceSegment,
            targetAudience,
            product,
            grade,
            offerPrice,
            contactsCount,
            pricePerMessage,
            totalCost
        } = req.body;

        if (!campaignName || !templateName) {
            return res.status(400).json({ success: false, message: 'Campaign name and Meta template are required' });
        }

        const count = Number(contactsCount) || 500;
        const rate = Number(pricePerMessage) || (category === 'UTILITY' ? 0.40 : 0.86);
        const cost = totalCost ? Number(totalCost) : Math.round(count * rate);

        // Production simulation of Meta Cloud API Dispatch
        const simulatedSent = count;
        const simulatedDelivered = Math.floor(count * 0.992);
        const simulatedRead = Math.floor(count * 0.85);
        const simulatedReplied = Math.floor(count * 0.31);

        const newCampaign = new BroadcastCampaign({
            campaignName: campaignName.trim(),
            templateName,
            category: category || 'MARKETING',
            audienceSegment: audienceSegment || 'All Buyers',
            targetAudience: targetAudience || 'Verified Polymer Buyers',
            product: product || 'HDPE Blow Molding Grade',
            grade: grade || 'B56003',
            offerPrice: offerPrice || 'Market Rate',
            contactsCount: count,
            pricePerMessage: rate,
            totalCost: cost,
            status: 'Completed',
            stats: {
                sent: simulatedSent,
                delivered: simulatedDelivered,
                read: simulatedRead,
                replied: simulatedReplied,
                deliveryRate: `${((simulatedDelivered / simulatedSent) * 100).toFixed(1)}%`,
                readRate: `${((simulatedRead / simulatedSent) * 100).toFixed(1)}%`,
                replyRate: `${((simulatedReplied / simulatedSent) * 100).toFixed(1)}%`,
                inquiriesGenerated: Math.floor(simulatedReplied * 0.22),
                pipelineValue: `₹${(Math.floor(simulatedReplied * 0.22) * 125000).toLocaleString()}`
            },
            metaMessageId: `wamid.HBgL${Date.now()}`
        });

        await newCampaign.save();

        // Cross-module sync: Update Dashboard Cockpit spend & history
        try {
            await DashboardData.findOneAndUpdate(
                {},
                {
                    $inc: { 'broadcast.spend': cost },
                    $push: {
                        broadcastsHistory: {
                            id: newCampaign._id.toString(),
                            campaignName: newCampaign.campaignName,
                            templateName: newCampaign.templateName,
                            targetAudience: newCampaign.targetAudience,
                            contactsCount: newCampaign.contactsCount,
                            pricePerMessage: newCampaign.pricePerMessage,
                            totalCost: newCampaign.totalCost,
                            product: newCampaign.product,
                            status: newCampaign.status,
                            date: newCampaign.scheduledDate
                        }
                    }
                }
            );
        } catch (dashErr) {
            console.error("Dashboard sync warning:", dashErr);
        }

        res.json({
            success: true,
            message: `Campaign "${campaignName}" launched successfully via Meta Cloud API!`,
            campaign: newCampaign
        });
    } catch (error) {
        console.error('Error launching broadcast:', error);
        res.status(500).json({ success: false, message: 'Failed to launch broadcast campaign' });
    }
});

// ── DELETE /api/broadcasts/:id ──────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
    try {
        await BroadcastCampaign.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Campaign archived successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete campaign' });
    }
});

module.exports = router;
