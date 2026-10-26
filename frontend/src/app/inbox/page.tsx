"use client";
import { useEffect, useState, useMemo, useRef } from 'react';
import api from '@/services/api';
import { 
    Search, CheckCircle2, MoreVertical, Paperclip, Send, Plus, 
    Calendar, MessageSquare, Clock, Phone, Building2, Tag, 
    Sparkles, ShieldCheck, Check, AlertCircle, X, ChevronRight, ArrowLeft
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';

export default function SharedInboxPage() {
    const [chats, setChats] = useState<any[]>([]);
    const [activeChatId, setActiveChatId] = useState<string>("chat_001");
    const [isMobileDetailOpen, setIsMobileDetailOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState<'all' | 'mine' | 'ai' | 'hot'>('all');
    const [messageInput, setMessageInput] = useState("");
    const [privateNote, setPrivateNote] = useState("");
    const [isSavingNote, setIsSavingNote] = useState(false);
    const [newTagInput, setNewTagInput] = useState("");
    const [isAddingTag, setIsAddingTag] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const chatScrollRef = useRef<HTMLDivElement>(null);
    const messageInputRef = useRef<HTMLInputElement>(null);

    // Fetch Chats from Backend
    const fetchChats = async () => {
        try {
            const res = await api.get('/api/inbox');
            setChats(res.data);
            if (res.data.length > 0 && !activeChatId) {
                setActiveChatId(res.data[0].id);
                setPrivateNote(res.data[0].customer?.notes || "");
            }
        } catch (err) {
            console.error("Error fetching inbox chats:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchChats();
    }, []);

    // Get Active Chat Object
    const activeChat = useMemo(() => {
        return chats.find(c => c.id === activeChatId) || chats[0] || null;
    }, [chats, activeChatId]);

    // Keep Private Notes synced when active chat changes
    useEffect(() => {
        if (activeChat) {
            setPrivateNote(activeChat.customer?.notes || "");
        }
    }, [activeChatId]);

    // Auto-scroll chat to bottom
    useEffect(() => {
        if (chatScrollRef.current) {
            chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
        }
    }, [activeChat?.messages]);

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3000);
    };

    // Filter Chats based on Tab and Search Term
    const filteredChats = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();

        return chats.filter(chat => {
            // Tab Filter
            let matchesTab = true;
            if (activeTab === 'mine') {
                matchesTab = chat.assignee === 'Harsh Vardhan' || chat.assignee === 'Neha Sharma';
            } else if (activeTab === 'ai') {
                matchesTab = chat.assignee?.includes('AI') || chat.messages.some((m: any) => m.sender === 'ai_draft' || m.sender === 'ai_agent');
            } else if (activeTab === 'hot') {
                matchesTab = chat.customer?.stage?.includes('Hot');
            }

            // Search Filter
            let matchesSearch = true;
            if (term) {
                const name = (chat.customer?.name || '').toLowerCase();
                const company = (chat.customer?.company || '').toLowerCase();
                const phone = (chat.customer?.phone || '').toLowerCase();
                const product = (chat.customer?.product || '').toLowerCase();
                const lastMsg = (chat.messages[chat.messages.length - 1]?.text || '').toLowerCase();
                const tags = (chat.customer?.tags || []).join(' ').toLowerCase();

                matchesSearch = name.includes(term) || company.includes(term) || 
                                phone.includes(term) || product.includes(term) || 
                                lastMsg.includes(term) || tags.includes(term);
            }

            return matchesTab && matchesSearch;
        });
    }, [chats, activeTab, searchTerm]);

    // Send Message Handler
    const handleSendMessage = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!messageInput.trim() || !activeChat) return;

        const textToSend = messageInput.trim();
        setMessageInput("");

        try {
            const res = await api.post(`/api/inbox/${activeChat.id}/message`, {
                text: textToSend,
                author: 'Harsh Vardhan'
            });

            if (res.data.success) {
                setChats(prev => prev.map(c => c.id === activeChat.id ? res.data.chat : c));
                showToast("WhatsApp message sent!");
            }
        } catch (err) {
            console.error("Failed to send message:", err);
            showToast("Failed to send message. Please retry.");
        }
    };

    // Approve AI Copilot Draft
    const handleApproveAIDraft = async (messageId: string) => {
        if (!activeChat) return;

        try {
            const res = await api.post(`/api/inbox/${activeChat.id}/approve-ai`, {
                messageId
            });

            if (res.data.success) {
                setChats(prev => prev.map(c => c.id === activeChat.id ? res.data.chat : c));
                showToast("✨ AI Copilot Draft approved & sent via WhatsApp!");
            }
        } catch (err) {
            console.error("Failed to approve AI draft:", err);
            showToast("Failed to approve draft.");
        }
    };

    // Edit AI Draft (Copies text to composer)
    const handleEditAIDraft = (draftText: string) => {
        setMessageInput(draftText);
        messageInputRef.current?.focus();
        showToast("Draft copied to message composer. Edit and hit send.");
    };

    // Discard AI Draft
    const handleDiscardAIDraft = async (messageId: string) => {
        if (!activeChat) return;

        try {
            const res = await api.post(`/api/inbox/${activeChat.id}/discard-ai`, {
                messageId
            });

            if (res.data.success) {
                setChats(prev => prev.map(c => c.id === activeChat.id ? res.data.chat : c));
                showToast("AI Draft discarded.");
            }
        } catch (err) {
            console.error("Failed to discard draft:", err);
        }
    };

    // Toggle Chat Status (Open / Resolved)
    const handleToggleStatus = async () => {
        if (!activeChat) return;

        const newStatus = activeChat.status === 'resolved' ? 'open' : 'resolved';
        try {
            const res = await api.patch(`/api/inbox/${activeChat.id}/status`, {
                status: newStatus
            });

            if (res.data.success) {
                setChats(prev => prev.map(c => c.id === activeChat.id ? { ...c, status: newStatus } : c));
                showToast(`Chat marked as ${newStatus.toUpperCase()}`);
            }
        } catch (err) {
            console.error("Failed to update status:", err);
        }
    };

    // Save Private Team Notes
    const handleSaveNote = async () => {
        if (!activeChat) return;

        try {
            setIsSavingNote(true);
            const res = await api.patch(`/api/inbox/${activeChat.id}/notes`, {
                notes: privateNote
            });

            if (res.data.success) {
                setChats(prev => prev.map(c => c.id === activeChat.id ? {
                    ...c,
                    customer: { ...c.customer, notes: privateNote }
                } : c));
                showToast("Private note saved successfully!");
            }
        } catch (err) {
            console.error("Failed to save note:", err);
            showToast("Failed to save note.");
        } finally {
            setIsSavingNote(false);
        }
    };

    // Add Tag
    const handleAddTag = async () => {
        if (!newTagInput.trim() || !activeChat) return;

        try {
            const res = await api.post(`/api/inbox/${activeChat.id}/tag`, {
                tag: newTagInput.trim()
            });

            if (res.data.success) {
                setChats(prev => prev.map(c => c.id === activeChat.id ? {
                    ...c,
                    customer: { ...c.customer, tags: res.data.tags }
                } : c));
                setNewTagInput("");
                setIsAddingTag(false);
                showToast("Tag added!");
            }
        } catch (err) {
            console.error("Failed to add tag:", err);
        }
    };

    // Quick Reply Template Snippet Inserts
    const insertQuickReply = (text: string) => {
        setMessageInput(prev => prev ? `${prev} ${text}` : text);
        messageInputRef.current?.focus();
    };

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center bg-neutral-soft text-forest font-bold gap-3">
                <div className="w-8 h-8 border-4 border-lime border-t-forest rounded-full animate-spin"></div>
                <p>Loading Shared Team WhatsApp Workspace...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col md:flex-row h-screen bg-[#F6F7F4] font-sans overflow-hidden text-gray-800 w-full">
            <Sidebar />

            {/* ── Toast Feedback ──────────────────────────────── */}
            {toastMessage && (
                <div className="fixed top-4 right-4 sm:top-5 sm:right-6 z-50 bg-forest text-lime px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 border border-[#23583c] animate-in fade-in slide-in-from-top-4 duration-300 max-w-[90vw]">
                    <CheckCircle2 size={18} className="text-lime shrink-0" />
                    <span className="font-bold text-xs text-white truncate">{toastMessage}</span>
                </div>
            )}

            {/* ── Main Workspace Content Area ──────────────────── */}
            <main className="flex-1 flex flex-col h-full overflow-hidden w-full">
                
                {/* Top Workspace Header */}
                <header className="bg-white px-3.5 sm:px-6 py-2.5 sm:py-3.5 border-b border-gray-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-2xs shrink-0 w-full">
                    <div className="flex items-center justify-between sm:justify-start gap-4 flex-1">
                        <div>
                            <h2 className="text-base sm:text-lg font-black text-forest whitespace-nowrap leading-tight">
                                Shared Team WhatsApp Workspace
                            </h2>
                            <p className="text-[10px] sm:text-[11px] text-gray-500 font-medium">
                                Multi-Agent Inbox • Coexistence Phone Sync Active
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <div className="relative flex-1 sm:w-64">
                            <Search className="absolute left-3 top-2.5 text-gray-400" size={15} />
                            <input 
                                type="text" 
                                placeholder="Search conversations (Ctrl + K)..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-8 pr-7 py-1.5 bg-gray-50 hover:bg-gray-100/70 focus:bg-white border border-gray-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-lime transition" 
                            />
                            {searchTerm && (
                                <button onClick={() => setSearchTerm("")} className="absolute right-2 top-2 text-gray-400 hover:text-gray-700">
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                        <button 
                            onClick={() => {
                                const name = prompt("Enter customer name for new chat:");
                                if (name) {
                                    showToast(`New WhatsApp thread initiated for ${name}`);
                                }
                            }}
                            className="flex items-center justify-center gap-1 px-3 py-2 bg-lime hover:bg-[#cbf03f] text-forest font-black rounded-lg text-xs shadow-2xs transition shrink-0 whitespace-nowrap">
                            <Plus size={15} /> New Chat
                        </button>
                    </div>
                </header>

                {/* ── 3-Pane Layout Box ────────────────────────────── */}
                <div className="flex flex-1 overflow-hidden bg-white">
                    
                    {/* ══ PANE 1: LEFT CHAT LIST ══════════════════════ */}
                    <div className={`w-full md:w-80 border-r border-gray-200 flex flex-col bg-white shrink-0 ${isMobileDetailOpen ? 'hidden md:flex' : 'flex'}`}>
                        {/* Filter Tabs */}
                        <div className="p-2.5 border-b border-gray-100 flex gap-1 bg-gray-50/70 text-xs font-bold overflow-x-auto">
                            <button 
                                onClick={() => setActiveTab('all')}
                                className={`flex-1 py-1.5 px-2 rounded-md transition whitespace-nowrap ${activeTab === 'all' ? 'bg-white text-forest shadow-xs border border-gray-200' : 'text-gray-500 hover:text-forest'}`}>
                                All ({chats.length})
                            </button>
                            <button 
                                onClick={() => setActiveTab('mine')}
                                className={`flex-1 py-1.5 px-2 rounded-md transition whitespace-nowrap ${activeTab === 'mine' ? 'bg-white text-forest shadow-xs border border-gray-200' : 'text-gray-500 hover:text-forest'}`}>
                                Mine (2)
                            </button>
                            <button 
                                onClick={() => setActiveTab('ai')}
                                className={`flex-1 py-1.5 px-2 rounded-md transition whitespace-nowrap ${activeTab === 'ai' ? 'bg-white text-forest shadow-xs border border-gray-200' : 'text-gray-500 hover:text-forest'}`}>
                                AI (2)
                            </button>
                            <button 
                                onClick={() => setActiveTab('hot')}
                                className={`flex-1 py-1.5 px-2 rounded-md transition whitespace-nowrap ${activeTab === 'hot' ? 'bg-white text-forest shadow-xs border border-gray-200' : 'text-gray-500 hover:text-forest'}`}>
                                🔥 Hot
                            </button>
                        </div>

                        {/* Chat Items List */}
                        <div className="overflow-y-auto flex-1 p-2 space-y-1 divide-y divide-gray-50">
                            {filteredChats.length === 0 ? (
                                <div className="p-8 text-center text-xs text-gray-400 font-medium">
                                    No conversations found for current filter.
                                </div>
                            ) : (
                                filteredChats.map((chat) => {
                                    const isSelected = activeChat?.id === chat.id;
                                    const lastMsg = chat.messages[chat.messages.length - 1];

                                    return (
                                        <div 
                                            key={chat.id} 
                                            onClick={() => {
                                                setActiveChatId(chat.id);
                                                setIsMobileDetailOpen(true);
                                            }}
                                            className={`p-3 rounded-xl cursor-pointer transition border text-left ${
                                                isSelected 
                                                    ? 'bg-lime/20 border-lime/70 shadow-xs' 
                                                    : 'border-transparent hover:bg-gray-50'
                                            }`}
                                        >
                                            <div className="flex justify-between items-start mb-1">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-white text-xs ${
                                                        chat.assignee?.includes('AI') ? 'bg-purple-600' :
                                                        chat.customer.name.includes('Priya') ? 'bg-emerald-600' :
                                                        chat.customer.name.includes('Rohan') ? 'bg-blue-600' : 'bg-amber-600'
                                                    }`}>
                                                        {chat.customer.name.substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <div className="overflow-hidden">
                                                        <h4 className="font-extrabold text-xs text-forest truncate max-w-[140px]">
                                                            {chat.customer.name}
                                                        </h4>
                                                        <p className="text-[10px] text-gray-400 truncate max-w-[140px]">
                                                            {chat.customer.company || chat.customer.phone}
                                                        </p>
                                                    </div>
                                                </div>
                                                <span className="text-[10px] font-semibold text-gray-400 shrink-0">
                                                    {chat.lastActiveTime}
                                                </span>
                                            </div>

                                            {/* Last message preview */}
                                            <p className="text-[11px] text-gray-600 truncate mb-2 mt-1 font-medium">
                                                {lastMsg ? (lastMsg.sender === 'ai_draft' ? `✨ AI Draft: ${lastMsg.text}` : lastMsg.text) : 'No messages'}
                                            </p>

                                            {/* Badges */}
                                            <div className="flex gap-1 flex-wrap">
                                                {chat.status === 'resolved' && (
                                                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-gray-200 text-gray-700">Resolved</span>
                                                )}
                                                {chat.badges.map((badge: string, i: number) => (
                                                    <span key={i} className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                                                        badge.includes('₹') ? 'text-rose-700 bg-rose-50 border border-rose-200' : 
                                                        badge.includes('AI') ? 'text-purple-700 bg-purple-50 border border-purple-200' : 
                                                        'text-forest bg-lime-soft border border-lime'
                                                    }`}>
                                                        {badge}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* ══ PANE 2: CENTER CHAT THREAD ═══════════════════ */}
                    {activeChat ? (
                        <div className={`flex-1 flex flex-col bg-[#F9FAFB] overflow-hidden ${!isMobileDetailOpen ? 'hidden md:flex' : 'flex'}`}>
                            {/* Chat Header */}
                            <div className="px-3.5 sm:px-6 py-3 bg-white border-b border-gray-200 flex justify-between items-center shadow-xs shrink-0 z-10">
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <button 
                                        onClick={() => setIsMobileDetailOpen(false)} 
                                        className="md:hidden p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 transition mr-1 shrink-0"
                                        title="Back to conversations">
                                        <ArrowLeft size={16} />
                                    </button>
                                    <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-black text-white text-xs sm:text-sm shrink-0 ${
                                        activeChat.assignee?.includes('AI') ? 'bg-purple-600' : 'bg-emerald-600'
                                    }`}>
                                        {activeChat.customer.name.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div className="overflow-hidden">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-extrabold text-forest text-sm sm:text-base leading-tight truncate">
                                                {activeChat.customer.name}
                                            </h3>
                                            {activeChat.coexistenceSynced && (
                                                <span className="bg-lime text-forest text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full font-extrabold flex items-center gap-1 border border-lime-600 shrink-0 hidden sm:flex">
                                                    <CheckCircle2 size={11}/> Synced
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-[11px] text-gray-500 mt-0.5 truncate flex items-center gap-1">
                                            <Building2 size={11} className="text-gray-400 shrink-0" />
                                            {activeChat.customer.company} • {activeChat.customer.phone}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={handleToggleStatus}
                                        className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition border shrink-0 ${
                                            activeChat.status === 'resolved' 
                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300' 
                                                : 'border-gray-300 hover:bg-gray-50 text-gray-700'
                                        }`}>
                                        {activeChat.status === 'resolved' ? '✓ Resolved' : 'Resolve'}
                                    </button>
                                </div>
                            </div>

                            {/* Chat Messages Area */}
                            <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-6 space-y-5">
                                <div className="text-center">
                                    <span className="bg-white border border-gray-200 text-[11px] font-semibold px-3 py-1 rounded-full text-gray-500 shadow-2xs">
                                        Today, October 26 • Zenvista WhatsApp Official
                                    </span>
                                </div>
                                
                                {activeChat.messages.map((msg: any) => (
                                    <div key={msg.id} className={`flex flex-col ${msg.sender === 'customer' ? 'items-start' : 'items-end'}`}>
                                        
                                        {/* AI Copilot Draft Card */}
                                        {msg.sender === 'ai_draft' ? (
                                            <div className="max-w-lg bg-lime/15 border-2 border-dashed border-lime-600 rounded-2xl p-4 shadow-sm animate-in fade-in duration-200">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-xs font-black text-forest flex items-center gap-1.5">
                                                        <Sparkles size={16} className="text-lime-700" />
                                                        AI Copilot Draft 
                                                        <span className="text-[10px] text-gray-500 font-normal">
                                                            (Trained on {msg.aiMeta?.trainedOn || 'Price List'})
                                                        </span>
                                                    </span>
                                                    <span className="text-[10px] font-black text-amber-700 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-md">
                                                        Needs Approval
                                                    </span>
                                                </div>
                                                <p className="text-xs text-forest leading-relaxed font-medium mb-3">
                                                    {msg.text}
                                                </p>
                                                <div className="flex items-center gap-2 pt-1">
                                                    <button 
                                                        onClick={() => handleApproveAIDraft(msg.id)}
                                                        className="bg-forest text-lime font-black text-xs px-3.5 py-1.5 rounded-lg shadow flex items-center gap-1.5 hover:bg-forest-light transition">
                                                        <CheckCircle2 size={14}/> Approve & Send
                                                    </button>
                                                    <button 
                                                        onClick={() => handleEditAIDraft(msg.text)}
                                                        className="bg-white border border-gray-300 text-forest font-bold text-xs px-3 py-1.5 rounded-lg hover:bg-gray-50 transition">
                                                        Edit Draft
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDiscardAIDraft(msg.id)}
                                                        className="bg-white border border-rose-200 text-rose-600 font-bold text-xs px-3 py-1.5 rounded-lg hover:bg-rose-50 transition">
                                                        Discard
                                                    </button>
                                                </div>
                                                <p className="text-[10px] text-gray-400 mt-2">
                                                    Generated in {msg.aiMeta?.generationTime || '1s'} • Ready for approval
                                                </p>
                                            </div>
                                        ) : (
                                            /* Normal Chat Bubbles */
                                            <div className={`max-w-md p-3.5 rounded-2xl shadow-sm text-xs leading-relaxed ${
                                                msg.sender === 'customer' 
                                                    ? 'bg-white border border-gray-200 text-gray-800 rounded-tl-none' 
                                                    : 'bg-[#DCF8C6] border border-[#bfe8a5] text-forest rounded-tr-none'
                                            }`}>
                                                <p className="font-medium text-gray-800">{msg.text}</p>
                                                <div className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${
                                                    msg.sender === 'customer' ? 'text-gray-400' : 'text-emerald-700'
                                                }`}>
                                                    {msg.author && <span className="font-semibold">{msg.author} • </span>}
                                                    <span>{msg.time}</span>
                                                    {msg.sender !== 'customer' && <span>✓✓</span>}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Chat Composer */}
                            <div className="p-4 bg-white border-t border-gray-200 shrink-0">
                                {/* Quick Template Chips */}
                                <div className="flex gap-2 mb-2.5 flex-wrap">
                                    <span 
                                        onClick={() => insertQuickReply("Today's spot cash rate for HDPE B56003 is ₹118/kg + 18% GST.")}
                                        className="text-[11px] bg-gray-100 text-gray-700 font-semibold px-2.5 py-1 rounded-md cursor-pointer hover:bg-lime/30 hover:text-forest transition border border-gray-200">
                                        /spot_rate_sheet
                                    </span>
                                    <span 
                                        onClick={() => insertQuickReply("Standard MOQ is 1,000 kg (1 MT). Doorstep freight available.")}
                                        className="text-[11px] bg-gray-100 text-gray-700 font-semibold px-2.5 py-1 rounded-md cursor-pointer hover:bg-lime/30 hover:text-forest transition border border-gray-200">
                                        /moq_terms
                                    </span>
                                    <span 
                                        onClick={() => insertQuickReply("Bank: HDFC Bank | A/C: 50200081920192 | IFSC: HDFC0000240 | Zenvista Polymers")}
                                        className="text-[11px] bg-gray-100 text-gray-700 font-semibold px-2.5 py-1 rounded-md cursor-pointer hover:bg-lime/30 hover:text-forest transition border border-gray-200">
                                        /bank_account
                                    </span>
                                    <span 
                                        onClick={() => insertQuickReply("COA & Technical Data Sheet attached for your testing approval.")}
                                        className="text-[11px] bg-gray-100 text-gray-700 font-semibold px-2.5 py-1 rounded-md cursor-pointer hover:bg-lime/30 hover:text-forest transition border border-gray-200">
                                        /test_certificate
                                    </span>
                                </div>

                                {/* Input Form */}
                                <form onSubmit={handleSendMessage} className="flex items-center gap-2 border border-gray-300 rounded-xl px-4 py-1.5 bg-gray-50 focus-within:bg-white focus-within:ring-2 focus-within:ring-lime focus-within:border-transparent transition">
                                    <Paperclip 
                                        onClick={() => showToast("Attachment selector: PDF Quotation / COA")}
                                        className="text-gray-400 cursor-pointer hover:text-forest transition" 
                                        size={18} 
                                    />
                                    <input 
                                        ref={messageInputRef}
                                        type="text" 
                                        value={messageInput}
                                        onChange={(e) => setMessageInput(e.target.value)}
                                        placeholder="Type a WhatsApp reply or click quick snippet above (Press Enter to send)..." 
                                        className="flex-1 bg-transparent outline-none text-xs py-2 text-gray-800" 
                                    />
                                    <button 
                                        type="submit"
                                        disabled={!messageInput.trim()}
                                        className="bg-forest text-lime p-2 rounded-lg hover:bg-forest-light transition disabled:opacity-40">
                                        <Send size={16}/>
                                    </button>
                                </form>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
                            Select a conversation to start chatting.
                        </div>
                    )}

                    {/* ══ PANE 3: RIGHT CRM PROFILE ════════════════════ */}
                    {activeChat && (
                        <div className="w-80 border-l border-gray-200 bg-white hidden xl:flex flex-col shrink-0 overflow-y-auto">
                            <div className="p-4 border-b border-gray-100">
                                <h3 className="font-black text-forest text-base leading-tight">Customer 360° Profile</h3>
                                <p className="text-[11px] text-gray-400">CRM & Polymer Lead Intelligence</p>
                            </div>
                            
                            <div className="p-4 space-y-5">
                                {/* Deal Stage & Value */}
                                <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/70">
                                    <div className="flex justify-between items-center mb-1.5">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Pipeline Stage</span>
                                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                                            activeChat.customer.stage?.includes('Hot') 
                                                ? 'bg-rose-100 text-rose-700 border border-rose-200' 
                                                : 'bg-amber-100 text-amber-700 border border-amber-200'
                                        }`}>
                                            🔥 {activeChat.customer.stage}
                                        </span>
                                    </div>
                                    <h2 className="text-2xl font-black text-forest">
                                        ₹{Number(activeChat.customer.dealValue || 0).toLocaleString()}
                                    </h2>
                                    <p className="text-xs font-semibold text-gray-600 mt-1">
                                        {activeChat.customer.product}
                                    </p>
                                    <p className="text-[11px] text-gray-400 mt-0.5">
                                        {activeChat.customer.estimatedOrder}
                                    </p>
                                </div>

                                {/* Tags */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="text-xs font-extrabold text-forest uppercase tracking-wider flex items-center gap-1">
                                            <Tag size={13} /> Applied Tags
                                        </h4>
                                        <button 
                                            onClick={() => setIsAddingTag(!isAddingTag)}
                                            className="text-[11px] text-forest font-bold hover:underline flex items-center gap-0.5">
                                            <Plus size={12}/> Add
                                        </button>
                                    </div>

                                    {isAddingTag && (
                                        <div className="flex gap-1 mb-2">
                                            <input 
                                                type="text" 
                                                placeholder="New tag..." 
                                                value={newTagInput}
                                                onChange={(e) => setNewTagInput(e.target.value)}
                                                className="flex-1 p-1.5 border border-gray-300 rounded text-xs outline-none focus:ring-1 focus:ring-lime"
                                            />
                                            <button 
                                                onClick={handleAddTag}
                                                className="px-2 bg-forest text-lime font-bold rounded text-xs">
                                                Add
                                            </button>
                                        </div>
                                    )}

                                    <div className="flex flex-wrap gap-1.5">
                                        {activeChat.customer.tags.map((tag: string, i: number) => (
                                            <span key={i} className="bg-gray-100 border border-gray-200 text-gray-700 text-[11px] font-medium px-2 py-0.5 rounded-full">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Coexistence Health */}
                                <div className="bg-emerald-50/50 border border-emerald-200 rounded-xl p-3.5 space-y-1.5">
                                    <h4 className="text-xs font-extrabold text-emerald-900 flex items-center gap-1">
                                        <ShieldCheck size={14} className="text-emerald-700" /> Coexistence Health
                                    </h4>
                                    <ul className="text-[11px] text-gray-600 space-y-1">
                                        <li>• Mobile connection: <strong className="text-emerald-700 font-bold">Active</strong></li>
                                        <li>• Cloud API sync: <strong className="text-emerald-700 font-bold">0ms latency</strong></li>
                                        <li>• Last mobile reply: <strong>{activeChat.lastActiveTime}</strong></li>
                                    </ul>
                                </div>

                                {/* Internal Team Notes */}
                                <div>
                                    <h4 className="text-xs font-extrabold text-forest uppercase tracking-wider mb-1.5">
                                        Private Team Notes
                                    </h4>
                                    <textarea 
                                        value={privateNote}
                                        onChange={(e) => setPrivateNote(e.target.value)}
                                        placeholder={`Write private note for ${activeChat.assignee}...`}
                                        className="w-full border border-gray-300 rounded-lg p-2.5 text-xs outline-none focus:ring-2 focus:ring-lime bg-gray-50 min-h-[90px]"
                                    ></textarea>
                                    <button 
                                        onClick={handleSaveNote}
                                        disabled={isSavingNote}
                                        className="w-full mt-2 py-2 bg-forest text-lime font-extrabold rounded-lg text-xs hover:bg-forest-light transition shadow-sm disabled:opacity-50">
                                        {isSavingNote ? 'Saving...' : 'Save Private Note'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
