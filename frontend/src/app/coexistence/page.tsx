"use client";
import React, { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import { 
    Search, Calendar, RefreshCw, Plus, Check, Smartphone, 
    ShieldCheck, QrCode, Wifi, Activity, ArrowRight, X, 
    CheckCircle2, Sparkles, UserPlus, PhoneCall, Laptop, Trash2
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';

export default function CoexistencePage() {
    const searchInputRef = useRef<HTMLInputElement>(null);

    // ── State Variables ──────────────────────────────────────
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    // Modals
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [isPairModalOpen, setIsPairModalOpen] = useState(false);
    const [isPairingSuccess, setIsPairingSuccess] = useState(false);

    // Invite Member Form State
    const [newMemberName, setNewMemberName] = useState("");
    const [newMemberEmail, setNewMemberEmail] = useState("");
    const [newMemberRole, setNewMemberRole] = useState("Support Agent");
    const [newMemberAccess, setNewMemberAccess] = useState("Web Dashboard Only");
    const [isSubmittingInvite, setIsSubmittingInvite] = useState(false);

    // ── Fetch Coexistence Data from Backend ──────────────────
    const fetchCoexistenceData = async (query = "") => {
        try {
            const res = await axios.get('http://localhost:5000/api/coexistence', {
                params: { search: query }
            });
            setData(res.data);
        } catch (error) {
            console.error("Error fetching coexistence data:", error);
            showToast("Failed to fetch coexistence data from server.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCoexistenceData();
    }, []);

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3500);
    };

    // ── Handle Refresh Status ────────────────────────────────
    const handleRefresh = async () => {
        try {
            setIsRefreshing(true);
            const res = await axios.post('http://localhost:5000/api/coexistence/refresh', {});
            if (res.data.success) {
                setData((prev: any) => ({
                    ...prev,
                    protocols: res.data.protocols || prev.protocols,
                    healthAndLimits: res.data.healthAndLimits || prev.healthAndLimits,
                    primaryNumber: res.data.primaryNumber || prev.primaryNumber,
                    teamSeats: res.data.teamSeats || prev.teamSeats
                }));
                showToast("Coexistence sync & Meta tier health refreshed!");
            }
        } catch (error) {
            console.error("Refresh error:", error);
            showToast("Connection ping timeout. Local sync maintained.");
        } finally {
            setIsRefreshing(false);
        }
    };

    // ── Handle Invite Member Submit ──────────────────────────
    const handleInviteSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMemberName.trim() || !newMemberEmail.trim()) {
            showToast("Please enter both name and email.");
            return;
        }

        try {
            setIsSubmittingInvite(true);
            const res = await axios.post('http://localhost:5000/api/coexistence/invite', {
                name: newMemberName.trim(),
                email: newMemberEmail.trim(),
                role: newMemberRole,
                phoneAppAccess: newMemberAccess
            });

            if (res.data.success) {
                setData((prev: any) => ({
                    ...prev,
                    teamSeats: res.data.teamSeats
                }));
                showToast(`✓ Seat allocated for ${newMemberName}!`);
                setIsInviteModalOpen(false);
                setNewMemberName("");
                setNewMemberEmail("");
                setNewMemberRole("Support Agent");
            }
        } catch (error: any) {
            console.error("Invite error:", error);
            showToast(error.response?.data?.message || "Failed to invite member.");
        } finally {
            setIsSubmittingInvite(false);
        }
    };

    // ── Handle Delete Member Seat ────────────────────────────
    const handleDeleteMember = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to revoke the shared seat for ${name}?`)) return;

        try {
            const res = await axios.delete(`http://localhost:5000/api/coexistence/member/${id}`);
            if (res.data.success) {
                setData((prev: any) => ({
                    ...prev,
                    teamSeats: res.data.teamSeats
                }));
                showToast(`Seat for ${name} has been revoked.`);
            }
        } catch (error: any) {
            showToast(error.response?.data?.message || "Failed to revoke seat.");
        }
    };

    // ── Filter Team Seats based on search ────────────────────
    const filteredSeats = useMemo(() => {
        const list = data?.teamSeats || [];
        if (!searchTerm.trim()) return list;
        const q = searchTerm.toLowerCase().trim();
        return list.filter((m: any) => 
            m.name.toLowerCase().includes(q) ||
            m.email.toLowerCase().includes(q) ||
            m.role.toLowerCase().includes(q) ||
            m.phoneAppAccess.toLowerCase().includes(q)
        );
    }, [data?.teamSeats, searchTerm]);

    if (loading && !data) {
        return (
            <div className="flex flex-col md:flex-row h-screen bg-neutral-soft font-sans overflow-hidden w-full">
                <Sidebar />
                <div className="flex-1 flex flex-col items-center justify-center text-forest font-bold gap-3">
                    <div className="w-10 h-10 border-4 border-lime border-t-forest rounded-full animate-spin"></div>
                    <p className="text-sm">Connecting to Meta Coexistence Linking Protocol...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col md:flex-row h-screen bg-[#F6F7F4] font-sans overflow-hidden text-gray-800 w-full">
            <Sidebar />

            {/* ── Toast Notification ────────────────────────────── */}
            {toastMessage && (
                <div className="fixed top-4 right-4 sm:top-5 sm:right-6 z-50 bg-forest text-lime px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl shadow-2xl flex items-center gap-2.5 border border-[#23583c] animate-in fade-in slide-in-from-top-4 duration-300 max-w-[90vw]">
                    <CheckCircle2 size={18} className="text-lime shrink-0" />
                    <span className="font-bold text-xs sm:text-sm text-white truncate">{toastMessage}</span>
                </div>
            )}

            {/* ── Main Dashboard Content Area ──────────────────── */}
            <main className="flex-1 flex flex-col h-full overflow-y-auto overflow-x-hidden bg-[#F6F7F4] relative font-sans text-gray-800 w-full min-w-0">
                
                {/* ── Top Header Bar (Pixel-Perfect Matching Screenshot) ── */}
                <header className="bg-white px-3.5 sm:px-6 lg:px-8 py-3 border-b border-gray-200 sticky top-0 z-20 shadow-xs backdrop-blur-md bg-white/95 w-full">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 w-full">
                        
                        {/* Header Title (Clean 2-line title on desktop matching screenshot) */}
                        <div className="shrink-0">
                            <h2 className="text-base sm:text-lg lg:text-[19px] font-black text-[#0E3B26] tracking-tight leading-snug">
                                Coexistence Mode Manager &amp; WhatsApp<br className="hidden sm:inline" /> Health
                            </h2>
                        </div>

                        {/* Top Action Controls */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2.5 w-full lg:w-auto">
                            
                            {/* Search Input */}
                            <div className="relative w-full sm:w-48 md:w-56 lg:w-64">
                                <Search className="absolute left-3 top-2.5 text-gray-400" size={14} />
                                <input 
                                    ref={searchInputRef}
                                    type="text" 
                                    placeholder="Search conversations, orders, tags (Ctrl + K)..." 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-8 pr-7 py-1.5 bg-[#F8F9FA] hover:bg-gray-100/80 focus:bg-white border border-gray-200 rounded-lg text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-lime transition" 
                                />
                                {searchTerm && (
                                    <button onClick={() => setSearchTerm("")} className="absolute right-2 top-2 text-gray-400 hover:text-gray-700">
                                        <X size={13} />
                                    </button>
                                )}
                            </div>

                            {/* Action Buttons Row (Grid on mobile, flex on desktop) */}
                            <div className="grid grid-cols-3 sm:flex items-center gap-1.5 sm:gap-2">
                                
                                {/* Date Range Badge (Stacked 2-line matching screenshot) */}
                                <div className="flex items-center gap-1.5 px-2.5 py-1 border border-gray-200 rounded-lg bg-white shadow-2xs text-left cursor-default shrink-0">
                                    <Calendar size={13} className="text-gray-400 shrink-0" />
                                    <div className="leading-tight text-[11px] font-semibold text-gray-700">
                                        <div className="whitespace-nowrap">Oct 20 - Oct 26,</div>
                                        <div className="text-[10px] text-gray-400 font-medium">2026</div>
                                    </div>
                                </div>

                                {/* Refresh Status Button (Stacked 2-line matching screenshot) */}
                                <button 
                                    onClick={handleRefresh}
                                    title="Ping Meta Cloud API for live health check"
                                    className={`flex items-center gap-1.5 px-2.5 py-1 border border-gray-200 text-[#0E3B26] bg-white hover:bg-gray-50 rounded-lg shadow-2xs transition shrink-0 text-left ${isRefreshing ? 'opacity-60' : ''}`}>
                                    <RefreshCw size={13} className={isRefreshing ? 'animate-spin text-forest shrink-0' : 'text-gray-500 shrink-0'} />
                                    <div className="leading-tight text-[11px] font-bold">
                                        <div>Refresh</div>
                                        <div>Status</div>
                                    </div>
                                </button>

                                {/* Connect New Number Button (Dark Forest, Stacked 2-line matching screenshot) */}
                                <button 
                                    onClick={() => setIsPairModalOpen(true)}
                                    title="Pair new WhatsApp Business number via QR code"
                                    className="flex items-center gap-1.5 px-3 py-1 bg-[#0B3822] hover:bg-[#14472d] text-white font-bold rounded-lg shadow-xs transition shrink-0 text-left">
                                    <Plus size={14} className="stroke-[2.5] shrink-0" />
                                    <div className="leading-tight text-[11px] font-bold">
                                        <div>Connect New</div>
                                        <div>Number</div>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                {/* ── Main Container ───────────────────────────────── */}
                <div className="p-3.5 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
                    
                    {/* ── Top 2 Cards Grid (Matching Screenshot) ───────── */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                        
                        {/* ══ Card 1: Keep Your Phone. Add A Whole Team. (Left, 7 Cols) ══ */}
                        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between space-y-5">
                            
                            <div>
                                {/* Card Header */}
                                <div className="flex items-start justify-between gap-3 mb-4">
                                    <div>
                                        <h3 className="font-extrabold text-forest text-lg leading-tight">
                                            Keep Your Phone. Add A Whole Team.
                                        </h3>
                                        <p className="text-xs text-gray-400 font-medium mt-0.5">
                                            Meta Cloud API Coexistence Linking Protocol
                                        </p>
                                    </div>
                                    <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-[#E8F8EE] border border-emerald-200 px-3 py-1 rounded-full shrink-0">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                        Connected &amp; Live
                                    </span>
                                </div>

                                {/* Inner Prominent Lime Banner */}
                                <div className="bg-[#F4FBDA] border border-[#d4f260] rounded-xl p-4 space-y-1 mb-5">
                                    <h4 className="font-extrabold text-forest text-sm">
                                        Phone App + Web Dashboard Synced
                                    </h4>
                                    <p className="text-xs text-gray-700 leading-relaxed font-medium">
                                        Primary Number: <strong className="text-forest font-bold">{data?.primaryNumber?.phone} ({data?.primaryNumber?.businessName})</strong> is actively receiving messages both on Harsh's smartphone and this ZenWA dashboard.
                                    </p>
                                </div>

                                {/* 3-Step Protocol List */}
                                <div className="space-y-3">
                                    
                                    {/* Step 1: Meta Business Verification */}
                                    <div className="flex items-center justify-between p-3.5 rounded-xl border border-gray-100 hover:border-gray-200 transition bg-white">
                                        <div className="flex items-center gap-3.5">
                                            <div className="w-7 h-7 rounded-full bg-[#0E3B26] text-white flex items-center justify-center font-black text-xs shrink-0">
                                                1
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm text-forest leading-tight">
                                                    Meta Business Verification (Completed)
                                                </p>
                                                <p className="text-xs text-gray-400 mt-0.5">
                                                    Meta Business Manager ID: <span className="font-mono">{data?.protocols?.businessVerification?.metaBusinessId || '893120481239102'}</span> verified with official WABA.
                                                </p>
                                            </div>
                                        </div>
                                        <span className="text-xs font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg flex items-center gap-1 shrink-0">
                                            <Check size={14} className="stroke-[3]" /> Verified
                                        </span>
                                    </div>

                                    {/* Step 2: QR Code Device Pairing */}
                                    <div className="flex items-center justify-between p-3.5 rounded-xl border border-gray-100 hover:border-gray-200 transition bg-white">
                                        <div className="flex items-center gap-3.5">
                                            <div className="w-7 h-7 rounded-full bg-[#0E3B26] text-white flex items-center justify-center font-black text-xs shrink-0">
                                                2
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm text-forest leading-tight">
                                                    QR Code Device Pairing (Paired)
                                                </p>
                                                <p className="text-xs text-gray-400 mt-0.5">
                                                    WhatsApp Business &gt; Settings &gt; Linked platforms scanned successfully.
                                                </p>
                                            </div>
                                        </div>
                                        <span className="text-xs font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg flex items-center gap-1 shrink-0">
                                            <Check size={14} className="stroke-[3]" /> Paired
                                        </span>
                                    </div>

                                    {/* Step 3: Bi-Directional WebSocket Sync */}
                                    <div className="flex items-center justify-between p-3.5 rounded-xl border border-gray-100 hover:border-gray-200 transition bg-white">
                                        <div className="flex items-center gap-3.5">
                                            <div className="w-7 h-7 rounded-full bg-[#0E3B26] text-white flex items-center justify-center font-black text-xs shrink-0">
                                                3
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm text-forest leading-tight">
                                                    Bi-Directional WebSocket Sync (Active)
                                                </p>
                                                <p className="text-xs text-gray-400 mt-0.5">
                                                    Inbound and outbound messages streaming in realtime with {data?.protocols?.webSocketSync?.latencyMs || 0}ms lag.
                                                </p>
                                            </div>
                                        </div>
                                        <span className="text-xs font-black text-forest bg-[#D6F35A] px-3 py-1 rounded-lg flex items-center gap-1.5 shrink-0 shadow-2xs">
                                            <span className="w-2 h-2 rounded-full bg-forest animate-pulse"></span> Streaming
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ══ Card 2: WhatsApp Number Health & Limits (Right, 5 Cols) ══ */}
                        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between space-y-6">
                            
                            <div>
                                {/* Card Header */}
                                <div className="flex items-start justify-between gap-3 mb-5">
                                    <div>
                                        <h3 className="font-extrabold text-forest text-lg leading-tight">
                                            WhatsApp Number Health &amp; Limits
                                        </h3>
                                        <p className="text-xs text-gray-400 font-medium mt-0.5">
                                            Official Meta Tier Monitoring
                                        </p>
                                    </div>
                                    <span className="text-xs font-bold text-emerald-700 bg-[#E8F8EE] border border-emerald-200 px-3 py-1 rounded-full shrink-0">
                                        High Quality
                                    </span>
                                </div>

                                {/* Health Item 1: Daily Messaging Tier */}
                                <div className="space-y-1.5 pb-5 border-b border-gray-100">
                                    <div className="flex items-center justify-between">
                                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                                            DAILY MESSAGING TIER
                                        </p>
                                        <span className="text-[11px] font-extrabold text-white bg-[#0E3B26] px-2.5 py-0.5 rounded-full">
                                            {data?.healthAndLimits?.dailyMessagingTier?.badge || 'Enterprise Tier'}
                                        </span>
                                    </div>
                                    <h4 className="text-2xl font-black text-forest tracking-tight">
                                        {data?.healthAndLimits?.dailyMessagingTier?.tier || 'Tier 3 (100,000 / day)'}
                                    </h4>
                                </div>

                                {/* Health Item 2: Meta Quality Rating */}
                                <div className="space-y-1.5 py-5 border-b border-gray-100">
                                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                                        META QUALITY RATING
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-xs"></span>
                                            <span className="text-base font-black text-forest">
                                                {data?.healthAndLimits?.metaQualityRating?.rating || 'Green (High)'}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-400 font-medium">
                                            {data?.healthAndLimits?.metaQualityRating?.spamComplaints || 'Zero spam complaints'} • Meta score: <strong className="text-forest">{data?.healthAndLimits?.metaQualityRating?.metaScore || '98/100'}</strong>
                                        </p>
                                    </div>
                                </div>

                                {/* Health Item 3: Phone App Sync State */}
                                <div className="space-y-1.5 pt-5">
                                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                                        PHONE APP SYNC STATE
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-base">📱</span>
                                            <span className="text-base font-black text-forest">
                                                {data?.healthAndLimits?.phoneAppSyncState?.status || 'Connected (Online)'}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-400 font-medium">
                                            Device: <strong className="text-forest">{data?.healthAndLimits?.phoneAppSyncState?.device || 'iPhone 15 Pro'}</strong> • App: {data?.healthAndLimits?.phoneAppSyncState?.appVersion || 'Business v24.2'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ══ Card 3: Team Seat Allocation Table ═════════ */}
                    <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                        
                        {/* Table Header Row */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                                <h3 className="font-extrabold text-forest text-base sm:text-lg leading-tight">
                                    Team Seat Allocation (Shared WhatsApp Access)
                                </h3>
                                <p className="text-xs text-gray-400 font-medium mt-0.5">
                                    Manage multi-agent permissions, chat routing, and device access levels
                                </p>
                            </div>
                            <button 
                                onClick={() => setIsInviteModalOpen(true)}
                                className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-[#D6F35A] hover:bg-[#cbf03f] text-[#0E3B26] font-extrabold rounded-lg text-xs shadow-xs transition shrink-0 self-start sm:self-auto">
                                <Plus size={15} className="text-[#0E3B26] stroke-[3]" /> Invite Team Member
                            </button>
                        </div>

                        {/* Table Container */}
                        <div className="overflow-x-auto -mx-4 sm:mx-0">
                            <table className="w-full text-left border-collapse min-w-[700px]">
                                <thead>
                                    <tr className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-200 bg-gray-50/50">
                                        <th className="py-3 px-4 font-bold">Member Name</th>
                                        <th className="py-3 px-4 font-bold">Email</th>
                                        <th className="py-3 px-4 font-bold">Role</th>
                                        <th className="py-3 px-4 font-bold">Assigned Chats</th>
                                        <th className="py-3 px-4 font-bold">Phone App Access</th>
                                        <th className="py-3 px-4 font-bold">Status</th>
                                        <th className="py-3 px-4 text-right font-bold">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-xs sm:text-sm">
                                    {filteredSeats.map((member: any) => {
                                        const isOwner = member.role === 'Owner';
                                        const isSales = member.role === 'Sales Lead';

                                        return (
                                            <tr key={member.id} className="hover:bg-gray-50/80 transition-colors">
                                                
                                                {/* Member Name */}
                                                <td className="py-4 px-4 font-extrabold text-forest">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs ${
                                                            isOwner ? 'bg-[#0E3B26] text-white' : isSales ? 'bg-[#D6F35A] text-forest' : 'bg-gray-200 text-gray-700'
                                                        }`}>
                                                            {member.name.charAt(0)}
                                                        </div>
                                                        <span>{member.name}</span>
                                                    </div>
                                                </td>

                                                {/* Email */}
                                                <td className="py-4 px-4 text-gray-500 font-mono text-xs">
                                                    {member.email}
                                                </td>

                                                {/* Role */}
                                                <td className="py-4 px-4">
                                                    <span className={`inline-block text-[11px] font-extrabold px-3 py-1 rounded-full ${
                                                        isOwner ? 'bg-[#0E3B26] text-white' : 
                                                        isSales ? 'bg-[#EBF7B8] text-[#134e32] border border-[#d6f35a]' : 
                                                        'bg-gray-100 text-gray-600'
                                                    }`}>
                                                        {member.role}
                                                    </span>
                                                </td>

                                                {/* Assigned Chats */}
                                                <td className="py-4 px-4 font-bold text-forest">
                                                    {member.assignedChats}
                                                </td>

                                                {/* Phone App Access */}
                                                <td className="py-4 px-4 font-bold">
                                                    {member.phoneAppAccess === 'Primary Device' ? (
                                                        <span className="text-[#0E8A64] flex items-center gap-1.5 font-bold">
                                                            <Smartphone size={14} /> Primary Device
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400 font-medium flex items-center gap-1.5">
                                                            <Laptop size={14} /> Web Dashboard Only
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Status */}
                                                <td className="py-4 px-4">
                                                    <span className="font-extrabold text-[#10B981] flex items-center gap-1">
                                                        <Check size={14} className="stroke-[3]" /> Active
                                                    </span>
                                                </td>

                                                {/* Action */}
                                                <td className="py-4 px-4 text-right">
                                                    {!isOwner && (
                                                        <button 
                                                            onClick={() => handleDeleteMember(member.id, member.name)}
                                                            className="text-gray-300 hover:text-rose-600 p-1 rounded-md transition"
                                                            title="Revoke Seat">
                                                            <Trash2 size={15} />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* ── Modal 1: Invite Team Member ──────────────────── */}
                {isInviteModalOpen && (
                    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
                        <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-gray-200 animate-in fade-in zoom-in duration-200">
                            <div className="p-5 border-b border-[#184d33] flex justify-between items-center bg-forest text-white">
                                <h3 className="font-black text-base flex items-center gap-2">
                                    <UserPlus size={18} className="text-lime" /> Invite Team Member
                                </h3>
                                <button onClick={() => setIsInviteModalOpen(false)} className="text-gray-300 hover:text-white p-1">
                                    <X size={18} />
                                </button>
                            </div>
                            <form onSubmit={handleInviteSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-forest uppercase tracking-wider mb-1">
                                        Full Name <span className="text-rose-500">*</span>
                                    </label>
                                    <input 
                                        type="text" 
                                        required
                                        placeholder="e.g. Aman Verma" 
                                        value={newMemberName}
                                        onChange={(e) => setNewMemberName(e.target.value)}
                                        className="w-full border border-gray-300 p-2.5 rounded-lg text-sm outline-none focus:ring-2 focus:ring-lime" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-forest uppercase tracking-wider mb-1">
                                        Work Email <span className="text-rose-500">*</span>
                                    </label>
                                    <input 
                                        type="email" 
                                        required
                                        placeholder="e.g. aman.v@shivamorganics.com" 
                                        value={newMemberEmail}
                                        onChange={(e) => setNewMemberEmail(e.target.value)}
                                        className="w-full border border-gray-300 p-2.5 rounded-lg text-sm outline-none focus:ring-2 focus:ring-lime" 
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-forest uppercase tracking-wider mb-1">Role</label>
                                        <select 
                                            value={newMemberRole}
                                            onChange={(e) => setNewMemberRole(e.target.value)}
                                            className="w-full border border-gray-300 p-2.5 rounded-lg text-xs outline-none focus:ring-2 focus:ring-lime bg-white">
                                            <option value="Sales Lead">Sales Lead</option>
                                            <option value="Support Agent">Support Agent</option>
                                            <option value="Executive">Executive</option>
                                            <option value="Admin">Admin</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-forest uppercase tracking-wider mb-1">Access Mode</label>
                                        <select 
                                            value={newMemberAccess}
                                            onChange={(e) => setNewMemberAccess(e.target.value)}
                                            className="w-full border border-gray-300 p-2.5 rounded-lg text-xs outline-none focus:ring-2 focus:ring-lime bg-white">
                                            <option value="Web Dashboard Only">Web Dashboard</option>
                                            <option value="Mobile & Web">Mobile & Web</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="pt-3 border-t flex justify-end gap-2.5">
                                    <button 
                                        type="button" 
                                        onClick={() => setIsInviteModalOpen(false)} 
                                        className="px-4 py-2 font-bold text-xs text-gray-600 hover:bg-gray-100 rounded-lg">
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        disabled={isSubmittingInvite}
                                        className="px-5 py-2.5 font-black text-xs bg-forest text-lime rounded-lg hover:bg-forest-light transition shadow flex items-center gap-1.5 disabled:opacity-50">
                                        {isSubmittingInvite ? 'Allocating Seat...' : 'Allocate Seat ✓'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* ── Modal 2: Connect New Number / QR Code Device Pairing ── */}
                {isPairModalOpen && (
                    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
                        <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-gray-200 animate-in fade-in zoom-in duration-200">
                            <div className="p-5 border-b border-[#184d33] flex justify-between items-center bg-forest text-white">
                                <div>
                                    <h3 className="font-black text-base flex items-center gap-2">
                                        <QrCode size={19} className="text-lime" /> Coexistence Device Pairing
                                    </h3>
                                    <p className="text-[11px] text-lime-soft opacity-85 mt-0.5">
                                        Scan QR Code from WhatsApp Business App
                                    </p>
                                </div>
                                <button onClick={() => { setIsPairModalOpen(false); setIsPairingSuccess(false); }} className="text-gray-300 hover:text-white p-1">
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="p-6 text-center space-y-4">
                                {isPairingSuccess ? (
                                    <div className="py-6 space-y-3">
                                        <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                                            <CheckCircle2 size={36} />
                                        </div>
                                        <h4 className="text-lg font-black text-forest">Device Paired Successfully!</h4>
                                        <p className="text-xs text-gray-600 max-w-xs mx-auto">
                                            Your smartphone is now synced with ZenWA Cloud API with bi-directional message streaming.
                                        </p>
                                        <button 
                                            onClick={() => { setIsPairModalOpen(false); setIsPairingSuccess(false); handleRefresh(); }}
                                            className="mt-2 px-5 py-2 bg-forest text-lime text-xs font-bold rounded-lg shadow">
                                            Done
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        {/* Visual QR Code Display */}
                                        <div className="w-48 h-48 mx-auto p-3 bg-white border-2 border-forest rounded-2xl shadow-md flex flex-col items-center justify-center relative">
                                            <div className="w-40 h-40 bg-gray-900 rounded-xl flex items-center justify-center p-2 relative overflow-hidden">
                                                {/* Simulated QR Pattern */}
                                                <div className="w-full h-full border-4 border-dashed border-lime rounded flex items-center justify-center">
                                                    <div className="text-center text-white space-y-1">
                                                        <QrCode size={56} className="mx-auto text-lime animate-pulse" />
                                                        <p className="text-[9px] font-mono tracking-widest text-gray-300">ZENWA-COEXIST-SYNC</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <span className="text-[10px] text-gray-400 font-semibold mt-1">Refreshes in 120s</span>
                                        </div>

                                        {/* Step-by-step instructions */}
                                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-left text-xs text-gray-600 space-y-1.5 font-medium">
                                            <p className="font-bold text-forest">How to scan:</p>
                                            <p>1. Open <strong>WhatsApp Business</strong> on your phone.</p>
                                            <p>2. Tap <strong>Settings (iOS)</strong> or <strong>⋮ More Options (Android)</strong>.</p>
                                            <p>3. Tap <strong>Linked Devices</strong> &gt; <strong>Link a Device</strong>.</p>
                                            <p>4. Point your phone camera at this QR code.</p>
                                        </div>

                                        <button 
                                            onClick={() => setIsPairingSuccess(true)}
                                            className="w-full py-2.5 bg-forest text-lime text-xs font-black rounded-xl hover:bg-forest-light transition shadow flex items-center justify-center gap-1.5">
                                            <Sparkles size={14} /> Simulate Device Pairing Handshake
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
