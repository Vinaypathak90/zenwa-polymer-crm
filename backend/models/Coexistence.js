/**
 * ============================================================================
 * COEXISTENCE MODE & WHATSAPP HEALTH - MONGOOSE MODEL
 * ============================================================================
 * Defines the database schema for the Meta Cloud API Coexistence Linking Protocol,
 * WhatsApp Tier Limits, Meta Quality Rating, and Team Seat Allocations.
 */

const mongoose = require('mongoose');

// Team Member Seat Schema
const TeamMemberSchema = new mongoose.Schema({
    id: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    role: { 
        type: String, 
        enum: ['Owner', 'Sales Lead', 'Support Agent', 'Executive', 'Admin'], 
        default: 'Support Agent' 
    },
    assignedChats: { type: Number, default: 0 },
    phoneAppAccess: { 
        type: String, 
        enum: ['Primary Device', 'Web Dashboard Only', 'Mobile & Web'], 
        default: 'Web Dashboard Only' 
    },
    status: { 
        type: String, 
        enum: ['Active', 'Invited', 'Suspended'], 
        default: 'Active' 
    },
    joinedAt: { type: Date, default: Date.now }
});

// Coexistence Linking Protocol & Health Schema
const CoexistenceSchema = new mongoose.Schema({
    primaryNumber: {
        phone: { type: String, default: '+91 98200 11223' },
        businessName: { type: String, default: 'Shivam Organics' },
        companyTag: { type: String, default: 'ZENVISTA POLYMERS' },
        wabaId: { type: String, default: '893120481239102' },
        phoneNumberId: { type: String, default: '102938475610293' },
        status: { type: String, default: 'Connected & Live' },
        activeReceivingText: { 
            type: String, 
            default: "Primary Number: +91 98200 11223 (Shivam Organics) is actively receiving messages both on Harsh's smartphone and this ZenWA dashboard." 
        }
    },
    protocols: {
        businessVerification: {
            title: { type: String, default: 'Meta Business Verification (Completed)' },
            metaBusinessId: { type: String, default: '893120481239102' },
            description: { type: String, default: 'verified with official WABA.' },
            status: { type: String, default: 'Verified' },
            isVerified: { type: Boolean, default: true }
        },
        qrCodePairing: {
            title: { type: String, default: 'QR Code Device Pairing (Paired)' },
            description: { type: String, default: 'WhatsApp Business > Settings > Linked platforms scanned successfully.' },
            status: { type: String, default: 'Paired' },
            isPaired: { type: Boolean, default: true }
        },
        webSocketSync: {
            title: { type: String, default: 'Bi-Directional WebSocket Sync (Active)' },
            description: { type: String, default: 'Inbound and outbound messages streaming in realtime with 0ms lag.' },
            status: { type: String, default: 'Streaming' },
            isActive: { type: Boolean, default: true },
            latencyMs: { type: Number, default: 0 }
        }
    },
    healthAndLimits: {
        dailyMessagingTier: {
            tier: { type: String, default: 'Tier 3 (100,000 / day)' },
            badge: { type: String, default: 'Enterprise Tier' },
            limit: { type: Number, default: 100000 },
            currentSentToday: { type: Number, default: 14820 }
        },
        metaQualityRating: {
            rating: { type: String, default: 'Green (High)' },
            color: { type: String, default: '#10B981' },
            metaScore: { type: String, default: '98/100' },
            spamComplaints: { type: String, default: 'Zero spam complaints' }
        },
        phoneAppSyncState: {
            status: { type: String, default: 'Connected (Online)' },
            device: { type: String, default: 'iPhone 15 Pro' },
            appVersion: { type: String, default: 'Business v24.2' },
            isOnline: { type: Boolean, default: true },
            lastPing: { type: Date, default: Date.now }
        }
    },
    teamSeats: [TeamMemberSchema]
}, { timestamps: true });

// Seed Data matching the user's exact production screenshot
const defaultCoexistenceData = {
    primaryNumber: {
        phone: '+91 98200 11223',
        businessName: 'Shivam Organics',
        companyTag: 'ZENVISTA POLYMERS',
        wabaId: '893120481239102',
        phoneNumberId: '102938475610293',
        status: 'Connected & Live',
        activeReceivingText: "Primary Number: +91 98200 11223 (Shivam Organics) is actively receiving messages both on Harsh's smartphone and this ZenWA dashboard."
    },
    protocols: {
        businessVerification: {
            title: 'Meta Business Verification (Completed)',
            metaBusinessId: '893120481239102',
            description: 'verified with official WABA.',
            status: 'Verified',
            isVerified: true
        },
        qrCodePairing: {
            title: 'QR Code Device Pairing (Paired)',
            description: 'WhatsApp Business > Settings > Linked platforms scanned successfully.',
            status: 'Paired',
            isPaired: true
        },
        webSocketSync: {
            title: 'Bi-Directional WebSocket Sync (Active)',
            description: 'Inbound and outbound messages streaming in realtime with 0ms lag.',
            status: 'Streaming',
            isActive: true,
            latencyMs: 0
        }
    },
    healthAndLimits: {
        dailyMessagingTier: {
            tier: 'Tier 3 (100,000 / day)',
            badge: 'Enterprise Tier',
            limit: 100000,
            currentSentToday: 14820
        },
        metaQualityRating: {
            rating: 'Green (High)',
            color: '#10B981',
            metaScore: '98/100',
            spamComplaints: 'Zero spam complaints'
        },
        phoneAppSyncState: {
            status: 'Connected (Online)',
            device: 'iPhone 15 Pro',
            appVersion: 'Business v24.2',
            isOnline: true,
            lastPing: new Date()
        }
    },
    teamSeats: [
        {
            id: 'seat-1',
            name: 'Harsh Vardhan',
            email: 'harsh@shivamorganics.com',
            role: 'Owner',
            assignedChats: 31,
            phoneAppAccess: 'Primary Device',
            status: 'Active'
        },
        {
            id: 'seat-2',
            name: 'Neha Sharma',
            email: 'neha.s@shivamorganics.com',
            role: 'Sales Lead',
            assignedChats: 48,
            phoneAppAccess: 'Web Dashboard Only',
            status: 'Active'
        },
        {
            id: 'seat-3',
            name: 'Riya Sen',
            email: 'riya.support@shivamorganics.com',
            role: 'Support Agent',
            assignedChats: 22,
            phoneAppAccess: 'Web Dashboard Only',
            status: 'Active'
        }
    ]
};

const Coexistence = mongoose.models.Coexistence || mongoose.model('Coexistence', CoexistenceSchema);

module.exports = {
    Coexistence,
    defaultCoexistenceData
};
