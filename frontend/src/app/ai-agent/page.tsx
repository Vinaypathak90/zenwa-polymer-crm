"use client";
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
    Bot, Sparkles, Send, CheckCircle2, RefreshCw, Smartphone, 
    Check, X, Zap, Sliders, ShieldCheck, AlertCircle, Play, 
    ArrowRight, MessageSquare, Terminal, User
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';

export default function AIAgentStudioPage() {
    const [config, setConfig] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    // Form settings
    const [agentStatus, setAgentStatus] = useState("Active");
    const [systemPrompt, setSystemPrompt] = useState("");
    const [selectedLanguage, setSelectedLanguage] = useState("Hinglish");

    // Playground Simulator State
    const [testQuery, setTestQuery] = useState("");
    const [chatLog, setChatLog] = useState<Array<{ sender: 'user' | 'ai'; text: string; meta?: any }>>([
        {
            sender: 'ai',
            text: 'Namaste! Main ZENVISTA POLYMERS (Shivam Organics) ka AI Sales Copilot hoon. Aap virgin polymer granules (HDPE, PP, LLDPE, PVC) ke daily spot rates aur technical datasheets ke baare me pooch sakte hain.'
        }
    ]);
    const [isSimulating, setIsSimulating] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    const fetchAgentConfig = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/ai-agent');
            if (res.data.success && res.data.config) {
                setConfig(res.data.config);
                setAgentStatus(res.data.config.status || "Active");
                setSystemPrompt(res.data.config.systemPrompt || "");
                setSelectedLanguage(res.data.config.responseLanguage || "Hinglish");
            }
        } catch (error) {
            console.error("Error fetching AI agent config:", error);
            showToast("Failed to load AI Agent Studio config.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAgentConfig();
    }, []);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatLog]);

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3500);
    };

    // Save Configuration
    const handleSaveConfig = async () => {
        try {
            setIsSaving(true);
            const res = await axios.patch('http://localhost:5000/api/ai-agent/config', {
                status: agentStatus,
                systemPrompt,
                responseLanguage: selectedLanguage
            });

            if (res.data.success) {
                showToast("✓ AI Agent Studio settings published!");
                setConfig(res.data.config);
            }
        } catch (error) {
            showToast("Failed to save settings.");
        } finally {
            setIsSaving(false);
        }
    };

    // Run Test Query in Playground
    const handleSendTestMessage = async (queryText?: string) => {
        const text = queryText || testQuery;
        if (!text.trim() || isSimulating) return;

        const userMsg = text.trim();
        setChatLog(prev => [...prev, { sender: 'user', text: userMsg }]);
        setTestQuery("");
        setIsSimulating(true);

        try {
            const res = await axios.post('http://localhost:5000/api/ai-agent/test', { query: userMsg });
            if (res.data.success) {
                setChatLog(prev => [...prev, {
                    sender: 'ai',
                    text: res.data.response,
                    meta: res.data.metadata
                }]);
            }
        } catch (error) {
            setChatLog(prev => [...prev, {
                sender: 'ai',
                text: 'Error communicating with AI engine. Check backend connection.'
            }]);
        } finally {
            setIsSimulating(false);
        }
    };

    if (loading && !config) {
        return (
            <div className="flex flex-col md:flex-row h-screen bg-[#F6F7F4] font-sans overflow-hidden w-full">
                <Sidebar />
                <div className="flex-1 flex flex-col items-center justify-center text-forest font-bold gap-3">
                    <div className="w-10 h-10 border-4 border-lime border-t-forest rounded-full animate-spin"></div>
                    <p className="text-sm">Connecting to Meta Llama 3 AI Agent Engine...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col md:flex-row h-screen bg-[#F6F7F4] font-sans overflow-hidden text-gray-800 w-full">
            <Sidebar />

            {/* ── Toast Feedback ──────────────────────────────── */}
            {toastMessage && (
                <div className="fixed top-4 right-4 sm:top-5 sm:right-6 z-50 bg-forest text-lime px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2.5 border border-[#23583c] animate-in fade-in slide-in-from-top-4 duration-300 max-w-[90vw]">
                    <CheckCircle2 size={18} className="text-lime shrink-0" />
                    <span className="font-bold text-xs sm:text-sm text-white truncate">{toastMessage}</span>
                </div>
            )}

            {/* ── Main Content Area ────────────────────────────── */}
            <main className="flex-1 flex flex-col h-full overflow-y-auto overflow-x-hidden bg-[#F6F7F4] relative font-sans text-gray-800 w-full min-w-0">
                
                {/* ── Top Header Bar ───────────────────────────────── */}
                <header className="bg-white px-3.5 sm:px-6 lg:px-8 py-3 border-b border-gray-200 sticky top-0 z-20 shadow-xs backdrop-blur-md bg-white/95 w-full">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 w-full">
                        
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-base sm:text-lg lg:text-[19px] font-black text-[#0E3B26] tracking-tight leading-snug">
                                    AI Agent Studio &amp; Copilot
                                </h2>
                                <span className="bg-[#EBF7B8] text-[#14472d] text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-[#d6f35a]">
                                    Live Auto-Reply
                                </span>
                            </div>
                            <p className="text-[11px] text-gray-400 font-medium">
                                Autonomous 24/7 Polymer Quotations • Meta Llama 3 70B
                            </p>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-2 self-start lg:self-auto">
                            {/* Status Mode Toggle */}
                            <select 
                                value={agentStatus}
                                onChange={(e) => setAgentStatus(e.target.value)}
                                className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-bold text-forest bg-white shadow-2xs outline-none focus:ring-1 focus:ring-lime">
                                <option value="Active">● Active (24/7 Auto-Reply)</option>
                                <option value="ApprovalMode">◐ Draft Mode (Team Approval)</option>
                                <option value="Paused">○ Paused</option>
                            </select>

                            <button 
                                onClick={handleSaveConfig}
                                disabled={isSaving}
                                className="flex items-center gap-1.5 px-4 py-1.5 bg-[#0B3822] hover:bg-[#14472d] text-white font-bold rounded-lg shadow-xs transition text-xs whitespace-nowrap disabled:opacity-50">
                                {isSaving ? 'Saving...' : 'Publish Settings ✓'}
                            </button>
                        </div>
                    </div>
                </header>

                {/* ── Main Container ───────────────────────────────── */}
                <div className="p-3.5 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
                    
                    {/* ══ Metrics ════════════════════════════════════════ */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-4">
                        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-xs space-y-1">
                            <p className="text-[11px] font-bold text-gray-400 uppercase">AUTO-RESOLVED CHATS</p>
                            <h3 className="text-xl sm:text-2xl font-black text-forest">{config?.stats?.autoResolvedChats || 1140}</h3>
                            <p className="text-[10px] text-emerald-600 font-bold">● Without human intervention</p>
                        </div>
                        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-xs space-y-1">
                            <p className="text-[11px] font-bold text-gray-400 uppercase">AVG RESPONSE SPEED</p>
                            <h3 className="text-xl sm:text-2xl font-black text-forest">{config?.stats?.avgResponseTimeSeconds || 2.8}s</h3>
                            <p className="text-[10px] text-gray-500 font-medium">94% faster than phone calls</p>
                        </div>
                        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-xs space-y-1">
                            <p className="text-[11px] font-bold text-gray-400 uppercase">HANDOVER RATE</p>
                            <h3 className="text-xl sm:text-2xl font-black text-forest">{config?.stats?.handoverRatePercent || 14.2}%</h3>
                            <p className="text-[10px] text-gray-500 font-medium">Transferred to Harsh / Neha</p>
                        </div>
                        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-xs space-y-1">
                            <p className="text-[11px] font-bold text-gray-400 uppercase">ACCURACY SCORE</p>
                            <h3 className="text-xl sm:text-2xl font-black text-forest">{config?.stats?.accuracyScorePercent || 97.5}%</h3>
                            <p className="text-[10px] text-emerald-700 font-bold">Zero pricing errors</p>
                        </div>
                    </div>

                    {/* ══ 2-Column Studio Grid ═══════════════════════════ */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                        
                        {/* ── Left Column: AI Knowledge & Prompt Configuration (7 Cols) ── */}
                        <div className="lg:col-span-7 space-y-5">
                            
                            {/* Card 1: System Prompt & Personality */}
                            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-3">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-extrabold text-forest text-base flex items-center gap-2">
                                        <Bot size={18} className="text-forest" /> AI Agent Instructions &amp; Persona
                                    </h3>
                                    <span className="text-[10px] font-mono font-bold bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-full">
                                        {config?.model || 'Meta Llama 3 70B'}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-400">
                                    Define rules for quotations, dispatch hubs, minimum order quantities, and language tone.
                                </p>
                                <textarea 
                                    rows={8}
                                    value={systemPrompt}
                                    onChange={(e) => setSystemPrompt(e.target.value)}
                                    className="w-full border border-gray-200 bg-gray-50/50 hover:bg-white focus:bg-white p-3.5 rounded-xl text-xs font-mono leading-relaxed outline-none focus:ring-2 focus:ring-lime text-gray-800 transition"
                                />
                            </div>

                            {/* Card 2: Polymer Knowledge Base (Live Prices) */}
                            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-3">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-extrabold text-forest text-base flex items-center gap-2">
                                        <Zap size={18} className="text-amber-500" /> Grounded Price Sheet (Knowledge Base)
                                    </h3>
                                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                                        Auto-Synced
                                    </span>
                                </div>
                                <p className="text-xs text-gray-400">
                                    AI strictly cites these rates. No hallucinations or unauthorized discounts.
                                </p>

                                <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden text-xs">
                                    {config?.knowledgeBase?.map((item: any) => (
                                        <div key={item.grade} className="p-3 bg-white hover:bg-gray-50 flex items-center justify-between">
                                            <div>
                                                <p className="font-bold text-forest">
                                                    {item.productName} <span className="font-mono text-gray-400">({item.grade})</span>
                                                </p>
                                                <p className="text-[11px] text-gray-500">MFI: {item.mfi} • Density: {item.density}</p>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-sm font-black text-forest">₹{item.pricePerKg}/kg</span>
                                                <p className="text-[10px] text-emerald-600 font-bold">{item.stockStatus}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Card 3: Autonomous Handover Rules */}
                            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-3">
                                <h3 className="font-extrabold text-forest text-base flex items-center gap-2">
                                    <ShieldCheck size={18} className="text-forest" /> Team Handover Triggers
                                </h3>
                                <p className="text-xs text-gray-400">
                                    When these conditions are met, AI automatically alerts Harsh Vardhan or Neha Sharma.
                                </p>
                                <div className="space-y-2">
                                    {config?.handoverRules?.map((rule: any, idx: number) => (
                                        <div key={idx} className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between text-xs">
                                            <div className="flex items-center gap-2 font-semibold text-gray-700">
                                                <AlertCircle size={14} className="text-amber-600 shrink-0" />
                                                <span>{rule.trigger}</span>
                                            </div>
                                            <span className="text-[11px] font-bold text-forest bg-white px-2 py-0.5 rounded border border-gray-200">
                                                {rule.action}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* ── Right Column: Interactive WhatsApp AI Simulator (5 Cols) ── */}
                        <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-[740px]">
                            {/* WhatsApp Header Mockup */}
                            <div className="bg-[#075E54] text-white p-3.5 flex items-center justify-between shrink-0 shadow-sm">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-black text-xs text-lime">
                                        AI
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm leading-tight">ZenWA Polymer Copilot</p>
                                        <p className="text-[10px] text-emerald-200 flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-lime animate-pulse"></span> Online • WhatsApp AI Simulator
                                        </p>
                                    </div>
                                </div>
                                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded font-mono font-bold">
                                    Llama 3
                                </span>
                            </div>

                            {/* Quick Test Prompt Chips */}
                            <div className="bg-gray-100 p-2.5 border-b border-gray-200 flex gap-1.5 overflow-x-auto text-[11px] shrink-0 font-bold">
                                <button 
                                    onClick={() => handleSendTestMessage("Bhai HDPE B56003 ka 20 ton ka rate kya chal rha hai aaj?")}
                                    className="px-2.5 py-1 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg text-forest whitespace-nowrap shadow-2xs">
                                    💬 HDPE 20 MT Rate
                                </button>
                                <button 
                                    onClick={() => handleSendTestMessage("PP H110MA ka rate aur technical TDS bhej do.")}
                                    className="px-2.5 py-1 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg text-forest whitespace-nowrap shadow-2xs">
                                    💬 PP H110MA TDS
                                </button>
                                <button 
                                    onClick={() => handleSendTestMessage("Mujhe 30 days credit chahiye aur rate ₹2 kam karo.")}
                                    className="px-2.5 py-1 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg text-rose-800 whitespace-nowrap shadow-2xs">
                                    ⚠️ Test Handover Trigger
                                </button>
                            </div>

                            {/* Chat Messages Log */}
                            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#EFEAE2]">
                                {chatLog.map((msg, idx) => {
                                    const isUser = msg.sender === 'user';
                                    return (
                                        <div key={idx} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                                            <div className={`p-3 rounded-2xl max-w-[85%] text-xs shadow-xs leading-relaxed whitespace-pre-wrap ${
                                                isUser 
                                                    ? 'bg-[#D9FDD3] text-gray-900 rounded-tr-none' 
                                                    : 'bg-white text-gray-800 rounded-tl-none border border-gray-200'
                                            }`}>
                                                {msg.text}
                                            </div>

                                            {/* AI Meta Diagnostics */}
                                            {msg.meta && (
                                                <div className="mt-1 flex items-center gap-2 text-[10px] text-gray-500 font-mono px-1">
                                                    <span>⚡ {msg.meta.responseTime}</span>
                                                    <span>• Confidence: {msg.meta.confidence}</span>
                                                    {msg.meta.shouldHandover && (
                                                        <span className="text-amber-700 font-bold">
                                                            🚨 Handover Alert
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}

                                {isSimulating && (
                                    <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl text-xs text-gray-500 shadow-xs border border-gray-200 w-fit">
                                        <div className="w-3.5 h-3.5 border-2 border-forest border-t-transparent rounded-full animate-spin"></div>
                                        <span>AI analyzing polymer price sheet...</span>
                                    </div>
                                )}
                                <div ref={chatEndRef} />
                            </div>

                            {/* Input Bar */}
                            <form 
                                onSubmit={(e) => { e.preventDefault(); handleSendTestMessage(); }}
                                className="p-3 bg-white border-t border-gray-200 flex items-center gap-2 shrink-0">
                                <input 
                                    type="text" 
                                    placeholder="Type a buyer question in Hindi or English..." 
                                    value={testQuery}
                                    onChange={(e) => setTestQuery(e.target.value)}
                                    className="flex-1 border border-gray-300 px-3.5 py-2 rounded-xl text-xs outline-none focus:ring-2 focus:ring-forest"
                                />
                                <button 
                                    type="submit" 
                                    disabled={isSimulating || !testQuery.trim()}
                                    className="p-2.5 bg-[#075E54] hover:bg-[#128C7E] text-white rounded-xl transition shadow disabled:opacity-40">
                                    <Send size={15} />
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
