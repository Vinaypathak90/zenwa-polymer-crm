const express = require('express');
const router = express.Router();
const InboxChat = require('../models/InboxChat');

// ── GET /api/inbox ──────────────────────────────────────────────────────────────
// Fetch all active WhatsApp team conversations from MongoDB
router.get('/', async (req, res) => {
    try {
        await InboxChat.seedIfEmpty();
        const chats = await InboxChat.find().sort({ updatedAt: -1 });
        res.json(chats);
    } catch (error) {
        console.error("Error fetching inbox chats:", error);
        res.status(500).json({ success: false, message: "Server error fetching inbox" });
    }
});

// ── POST /api/inbox/:chatId/message ─────────────────────────────────────────────
// Send outgoing WhatsApp message (Simulates Meta Cloud API dispatch & smartphone sync)
router.post('/:chatId/message', async (req, res) => {
    const { chatId } = req.params;
    const { text, author } = req.body;

    if (!text || !text.trim()) {
        return res.status(400).json({ success: false, message: "Message text cannot be empty" });
    }

    try {
        const chat = await InboxChat.findOne({ id: chatId });
        if (!chat) {
            return res.status(404).json({ success: false, message: "Chat not found" });
        }

        const newMessage = {
            id: `m_${Date.now()}`,
            sender: "agent",
            author: author || "Harsh Vardhan",
            text: text.trim(),
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            timestamp: new Date()
        };

        chat.messages.push(newMessage);
        chat.lastActiveTime = "Just now";
        await chat.save();

        res.json({
            success: true,
            message: newMessage,
            metaDeliveryStatus: "SENT_VIA_CLOUD_API",
            coexistenceStatus: "SYNCED_TO_HARSH_PHONE"
        });
    } catch (error) {
        console.error("Error saving message:", error);
        res.status(500).json({ success: false, message: "Failed to send message" });
    }
});

// ── POST /api/inbox/:chatId/approve-ai ───────────────────────────────────────────
// One-click AI Copilot draft approval
router.post('/:chatId/approve-ai', async (req, res) => {
    const { chatId } = req.params;
    const { messageId } = req.body;

    try {
        const chat = await InboxChat.findOne({ id: chatId });
        if (!chat) {
            return res.status(404).json({ success: false, message: "Chat not found" });
        }

        const msgIndex = chat.messages.findIndex(m => m.id === messageId);
        if (msgIndex === -1) {
            return res.status(404).json({ success: false, message: "Draft message not found" });
        }

        chat.messages[msgIndex].sender = 'agent';
        chat.messages[msgIndex].author = 'Approved by Harsh Vardhan (AI Copilot)';
        chat.messages[msgIndex].time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        chat.lastActiveTime = "Just now";
        await chat.save();

        res.json({
            success: true,
            approvedMessage: chat.messages[msgIndex],
            status: "DISPATCHED_TO_WHATSAPP_CUSTOMER"
        });
    } catch (error) {
        console.error("Error approving AI draft:", error);
        res.status(500).json({ success: false, message: "Failed to approve draft" });
    }
});

// ── POST /api/inbox/:chatId/discard-ai ──────────────────────────────────────────
// Discard or dismiss AI suggestion
router.post('/:chatId/discard-ai', async (req, res) => {
    const { chatId } = req.params;
    const { messageId } = req.body;

    try {
        const chat = await InboxChat.findOne({ id: chatId });
        if (!chat) {
            return res.status(404).json({ success: false, message: "Chat not found" });
        }

        chat.messages = chat.messages.filter(m => m.id !== messageId);
        await chat.save();

        res.json({ success: true, message: "AI Draft discarded successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to discard draft" });
    }
});

// ── PATCH /api/inbox/:chatId/notes ──────────────────────────────────────────────
// Update internal team private CRM notes
router.patch('/:chatId/notes', async (req, res) => {
    const { chatId } = req.params;
    const { notes } = req.body;

    try {
        const chat = await InboxChat.findOne({ id: chatId });
        if (!chat) {
            return res.status(404).json({ success: false, message: "Chat not found" });
        }

        if (!chat.customer) chat.customer = {};
        chat.customer.notes = notes || "";
        await chat.save();

        res.json({ success: true, notes: chat.customer.notes });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to save private note" });
    }
});

// ── PATCH /api/inbox/:chatId/status ─────────────────────────────────────────────
// Toggle chat status (open / resolved)
router.patch('/:chatId/status', async (req, res) => {
    const { chatId } = req.params;
    const { status } = req.body;

    try {
        const chat = await InboxChat.findOne({ id: chatId });
        if (!chat) {
            return res.status(404).json({ success: false, message: "Chat not found" });
        }

        chat.status = status || (chat.status === 'open' ? 'resolved' : 'open');
        await chat.save();

        res.json({ success: true, status: chat.status });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to update status" });
    }
});

// ── POST /api/inbox/:chatId/tag ─────────────────────────────────────────────────
// Add CRM polymer tag to customer
router.post('/:chatId/tag', async (req, res) => {
    const { chatId } = req.params;
    const { tag } = req.body;

    if (!tag) return res.status(400).json({ success: false, message: "Tag is required" });

    try {
        const chat = await InboxChat.findOne({ id: chatId });
        if (!chat) {
            return res.status(404).json({ success: false, message: "Chat not found" });
        }

        if (!chat.customer) chat.customer = {};
        if (!chat.customer.tags) chat.customer.tags = [];

        if (!chat.customer.tags.includes(tag)) {
            chat.customer.tags.push(tag);
            await chat.save();
        }

        res.json({ success: true, tags: chat.customer.tags });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to add tag" });
    }
});

module.exports = router;
