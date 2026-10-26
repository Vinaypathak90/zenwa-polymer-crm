"use client";
import React, { useState, useMemo, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
    Search, Calendar, Megaphone, ArrowRight, Download, X, 
    RefreshCw, Plus, Check, Layers, Filter, Sparkles, Building2,
    MessageCircle, Clock, ChevronDown, CheckCircle2
} from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DashboardContentProps {
    data: any;
    setData?: (data: any) => void;
    onRefresh?: (params?: any) => void;
    isRefreshing?: boolean;
    lastUpdated?: Date;
}

export default function DashboardContent({ 
    data, 
    setData, 
    onRefresh, 
    isRefreshing = false, 
    lastUpdated = new Date() 
}: DashboardContentProps) {
    const searchInputRef = useRef<HTMLInputElement>(null);

    // ── Search & Filter State ─────────────────────────────────
    const [searchTerm, setSearchTerm] = useState("");
    const [startDate, setStartDate] = useState("2026-10-20");
    const [endDate, setEndDate] = useState("2026-10-26");
    const [selectedStage, setSelectedStage] = useState("All");
    const [datePreset, setDatePreset] = useState<string>("7D");

    // ── Toast / Feedback State ─────────────────────────────────
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    // ── Broadcast Modal State ──────────────────────────────────
    const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
    const [campaignName, setCampaignName] = useState("");
    const [selectedProduct, setSelectedProduct] = useState("HDPE Blow Molding Grade");
    const [targetAudience, setTargetAudience] = useState("Plastic Molders - Gujarat & Daman");
    const [contactsCount, setContactsCount] = useState<number>(12400);
    const [pricePerMessage, setPricePerMessage] = useState<number>(0.86);
    const [isCustomPriceOverride, setIsCustomPriceOverride] = useState(false);
    const [customTotalPrice, setCustomTotalPrice] = useState<number>(10664);

    // Template selection / Custom template typing
    const [templateMode, setTemplateMode] = useState<'list' | 'custom'>('list');
    const [selectedTemplateName, setSelectedTemplateName] = useState("zenvista_polymer_bulk_offer");
    const [customTemplateName, setCustomTemplateName] = useState("");
    const [customTemplateCategory, setCustomTemplateCategory] = useState("MARKETING");
    const [customTemplateBody, setCustomTemplateBody] = useState(
        "Namaste {{1}}! Zenvista Polymers is offering exclusive spot prices on virgin polymer granules. Reply QUOTE to get instant rates."
    );
    const [saveTemplateForFuture, setSaveTemplateForFuture] = useState(true);
    const [isSubmittingBroadcast, setIsSubmittingBroadcast] = useState(false);

    // ── WhatsApp Chat Preview Modal ───────────────────────────
    const [activeChatLead, setActiveChatLead] = useState<any | null>(null);

    // ── Keyboard shortcut Ctrl+K / '/' for search ─────────────
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey && e.key === 'k') || (e.key === '/' && document.activeElement !== searchInputRef.current)) {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // ── Quick Date Range Preset Handler ────────────────────────
    const applyDatePreset = (preset: 'today' | '7D' | '30D' | 'all') => {
        setDatePreset(preset);
        const today = new Date();
        const formatDate = (d: Date) => d.toISOString().split('T')[0];

        if (preset === 'today') {
            const todayStr = formatDate(today);
            setStartDate(todayStr);
            setEndDate(todayStr);
        } else if (preset === '7D') {
            const past7 = new Date();
            past7.setDate(today.getDate() - 6);
            setStartDate(formatDate(past7));
            setEndDate(formatDate(today));
        } else if (preset === '30D') {
            const past30 = new Date();
            past30.setDate(today.getDate() - 29);
            setStartDate(formatDate(past30));
            setEndDate(formatDate(today));
        } else if (preset === 'all') {
            setStartDate('2026-01-01');
            setEndDate('2026-12-31');
        }
    };

    // Calculate effective total broadcast cost
    const effectiveTotalCost = useMemo(() => {
        if (isCustomPriceOverride) {
            return Number(customTotalPrice) || 0;
        }
        return Math.round((Number(contactsCount) || 0) * (Number(pricePerMessage) || 0));
    }, [isCustomPriceOverride, customTotalPrice, contactsCount, pricePerMessage]);

    // Keep custom price synced when not overriding
    useEffect(() => {
        if (!isCustomPriceOverride) {
            setCustomTotalPrice(Math.round((Number(contactsCount) || 0) * (Number(pricePerMessage) || 0)));
        }
    }, [contactsCount, pricePerMessage, isCustomPriceOverride]);

    // Available Templates
    const metaTemplates = useMemo(() => {
        return data?.metaTemplates || [
            { name: 'zenvista_polymer_bulk_offer', category: 'MARKETING', status: 'Approved' },
            { name: 'price_update_hdpe_pp', category: 'MARKETING', status: 'Approved' },
            { name: 'sample_dispatch_alert', category: 'UTILITY', status: 'Approved' },
            { name: 'order_payment_receipt', category: 'UTILITY', status: 'Approved' }
        ];
    }, [data?.metaTemplates]);

    // Available Products
    const products = useMemo(() => {
        return data?.products || [
            { name: 'HDPE Blow Molding Grade', grade: 'B56003', pricePerKg: 118 },
            { name: 'PP Homopolymer Injection Grade', grade: 'H110MA', pricePerKg: 104 },
            { name: 'LLDPE Film Grade', grade: '010F18A', pricePerKg: 112 },
            { name: 'PVC Resin Suspension Grade', grade: 'K-67', pricePerKg: 89 }
        ];
    }, [data?.products]);

    // ── Filter Leads based on Search, Date Range & Stage ──────
    const filteredLeads = useMemo(() => {
        const rawLeads = data?.leads || [];
        const term = searchTerm.trim().toLowerCase();

        return rawLeads.filter((lead: any) => {
            const matchesSearch = !term || (
                (lead.customer && lead.customer.toLowerCase().includes(term)) ||
                (lead.company && lead.company.toLowerCase().includes(term)) ||
                (lead.phone && lead.phone.toLowerCase().includes(term)) ||
                (lead.product && lead.product.toLowerCase().includes(term)) ||
                (lead.query && lead.query.toLowerCase().includes(term)) ||
                (lead.assignee && lead.assignee.toLowerCase().includes(term)) ||
                (lead.source && lead.source.toLowerCase().includes(term)) ||
                (lead.stage && lead.stage.toLowerCase().includes(term))
            );

            const leadDate = lead.date || '2026-10-26';
            const matchesDate = (!startDate || leadDate >= startDate) && (!endDate || leadDate <= endDate);
            const matchesStage = selectedStage === 'All' || (lead.stage && lead.stage.toLowerCase() === selectedStage.toLowerCase());

            return matchesSearch && matchesDate && matchesStage;
        });
    }, [data?.leads, searchTerm, startDate, endDate, selectedStage]);

    // Filtered pipeline value
    const totalFilteredPipeline = useMemo(() => {
        return filteredLeads.reduce((sum: number, lead: any) => sum + (Number(lead.value) || 0), 0);
    }, [filteredLeads]);

    // ── Reset All Filters ──────────────────────────────────────
    const resetFilters = () => {
        setSearchTerm("");
        setSelectedStage("All");
        applyDatePreset("7D");
    };

    // ── Export to CSV Logic ────────────────────────────────────
    const exportToCSV = () => {
        const headers = ["Customer Name", "Company", "Phone", "Product", "Quantity", "WhatsApp Query", "Deal Value (INR)", "Stage", "Source", "Assigned To", "Date"];
        const rows = filteredLeads.map((lead: any) => [
            `"${(lead.customer || '').replace(/"/g, '""')}"`,
            `"${(lead.company || '').replace(/"/g, '""')}"`,
            `"${(lead.phone || '').replace(/"/g, '""')}"`,
            `"${(lead.product || 'Polymers').replace(/"/g, '""')}"`,
            `"${(lead.quantity || '').replace(/"/g, '""')}"`,
            `"${(lead.query || '').replace(/"/g, '""')}"`,
            lead.value || 0,
            lead.stage || 'Hot',
            lead.source || 'WhatsApp Direct',
            lead.assignee || 'Neha Sharma',
            lead.date || ''
        ]);

        const csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map((e: any) => e.join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Zenvista_Leads_${startDate}_to_${endDate}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showToast("Report exported successfully!");
    };

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3500);
    };

    // ── Launch Broadcast Submit Handler ───────────────────────
    const handleLaunchBroadcast = async (e: React.FormEvent) => {
        e.preventDefault();
        const activeTemplate = templateMode === 'custom' 
            ? (customTemplateName.trim() || 'custom_polymer_campaign')
            : selectedTemplateName;

        if (!campaignName.trim()) {
            showToast("Please enter a campaign name.");
            return;
        }

        try {
            setIsSubmittingBroadcast(true);
            const payload = {
                campaignName: campaignName.trim(),
                templateName: activeTemplate,
                isCustomTemplate: templateMode === 'custom',
                customTemplateBody: templateMode === 'custom' ? customTemplateBody : '',
                templateCategory: customTemplateCategory,
                targetAudience,
                contactsCount: Number(contactsCount),
                pricePerMessage: Number(pricePerMessage),
                totalCost: effectiveTotalCost,
                product: selectedProduct
            };

            const res = await axios.post('http://localhost:5000/api/dashboard/broadcast', payload);
            if (res.data.success) {
                showToast(`🚀 Campaign "${campaignName}" launched! Cost: ₹${effectiveTotalCost.toLocaleString()}`);
                setIsBroadcastModalOpen(false);
                setCampaignName("");
                
                if (onRefresh) {
                    onRefresh();
                } else if (setData) {
                    setData((prev: any) => ({
                        ...prev,
                        broadcast: {
                            ...prev.broadcast,
                            spend: res.data.totalSpend || (prev.broadcast.spend + effectiveTotalCost)
                        },
                        metaTemplates: res.data.metaTemplates || prev.metaTemplates
                    }));
                }
            }
        } catch (error: any) {
            console.error("Broadcast launch failed:", error);
            showToast("Failed to launch campaign. Please check backend connection.");
        } finally {
            setIsSubmittingBroadcast(false);
        }
    };

    return (
        <main className="flex-1 flex flex-col h-full overflow-y-auto overflow-x-hidden bg-[#F6F7F4] relative font-sans text-gray-800 w-full min-w-0">

            {/* ── Toast Notification ────────────────────────────── */}
            {toastMessage && (
                <div className="fixed top-4 right-4 sm:top-5 sm:right-6 z-50 bg-forest text-lime px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl shadow-2xl flex items-center gap-2.5 border border-[#23583c] animate-in fade-in slide-in-from-top-4 duration-300 max-w-[90vw]">
                    <CheckCircle2 size={18} className="text-lime shrink-0" />
                    <span className="font-bold text-xs sm:text-sm text-white truncate">{toastMessage}</span>
                </div>
            )}

            {/* ── Dynamic Top Bar (Fully Responsive) ───────────────── */}
            <header className="bg-white px-3.5 sm:px-6 py-2.5 sm:py-3 border-b border-gray-200 sticky top-0 z-20 shadow-xs backdrop-blur-md bg-white/95 w-full min-w-0">
                <div className="flex flex-col 2xl:flex-row 2xl:items-center justify-between gap-2.5 sm:gap-3 w-full min-w-0">
                    
                    {/* Top Row on Laptop: Title + Action Buttons */}
                    <div className="flex items-center justify-between gap-3 w-full 2xl:w-auto shrink-0">
                        <h2 className="text-base sm:text-lg lg:text-xl font-black text-forest tracking-tight whitespace-nowrap">
                            Operations &amp; Broadcast Cockpit
                        </h2>

                        {/* Action Buttons (Visible on Mobile / Tablet / Laptop right next to title) */}
                        <div className="flex 2xl:hidden items-center gap-1.5 sm:gap-2 shrink-0">
                            <button 
                                onClick={() => onRefresh && onRefresh({ search: searchTerm, startDate, endDate })}
                                title="Refresh live data"
                                className={`p-1.5 sm:p-2 border border-gray-200 text-forest bg-white rounded-lg hover:bg-gray-50 transition shadow-2xs shrink-0 ${isRefreshing ? 'opacity-60' : ''}`}>
                                <RefreshCw size={14} className={isRefreshing ? 'animate-spin text-forest' : ''} />
                            </button>

                            <button 
                                onClick={exportToCSV}
                                className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 sm:py-2 border border-gray-200 text-forest bg-white font-bold rounded-lg text-xs shadow-2xs hover:bg-gray-50 transition whitespace-nowrap">
                                <Download size={13} /> <span className="hidden sm:inline">Export CSV</span><span className="sm:hidden">CSV</span>
                            </button>

                            <button 
                                onClick={() => setIsBroadcastModalOpen(true)}
                                className="flex items-center gap-1 px-2.5 sm:px-3.5 py-1.5 sm:py-2 bg-lime hover:bg-[#cbf03f] text-forest font-black rounded-lg text-xs shadow-sm transition whitespace-nowrap">
                                <Megaphone size={14} /> <span className="hidden sm:inline">Launch Broadcast</span><span className="sm:hidden">Broadcast</span>
                            </button>
                        </div>
                    </div>

                    {/* Bottom Row on Laptop (or right side on 2xl): Search & Date Filters */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2.5 w-full 2xl:w-auto min-w-0">
                        
                        {/* 1. Dynamic Search Bar */}
                        <div className="relative flex-1 w-full sm:w-56 md:w-64 lg:w-72 min-w-0">
                            <Search className="absolute left-3 top-2.5 text-gray-400" size={15} />
                            <input 
                                ref={searchInputRef}
                                type="text" 
                                placeholder="Search polymers, clients... (Ctrl+K)" 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-8 pr-7 py-1.5 bg-gray-50 hover:bg-gray-100/70 focus:bg-white border border-gray-200 rounded-lg text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-lime transition-all" 
                            />
                            {searchTerm ? (
                                <button 
                                    onClick={() => setSearchTerm("")}
                                    className="absolute right-2 top-2 text-gray-400 hover:text-gray-700 p-0.5 rounded-full"
                                    title="Clear Search"
                                >
                                    <X size={14} />
                                </button>
                            ) : (
                                <span className="absolute right-2 top-2 text-[10px] font-bold text-gray-400 border border-gray-200 rounded px-1.5 py-0.5 hidden sm:inline">
                                    ⌘K
                                </span>
                            )}
                        </div>

                        {/* 2. Dynamic Date Picker & Presets */}
                        <div className="flex items-center justify-between sm:justify-start gap-1 bg-gray-50 border border-gray-200 p-1 rounded-lg text-xs shrink-0 overflow-x-auto">
                            {/* Preset Quick Chips */}
                            <div className="flex items-center font-bold text-xs shrink-0">
                                <button 
                                    onClick={() => applyDatePreset('7D')} 
                                    className={`px-2 py-1 rounded-md transition ${datePreset === '7D' ? 'bg-forest text-lime shadow-xs' : 'text-gray-600 hover:text-forest'}`}>
                                    7D
                                </button>
                                <button 
                                    onClick={() => applyDatePreset('30D')} 
                                    className={`px-2 py-1 rounded-md transition ${datePreset === '30D' ? 'bg-forest text-lime shadow-xs' : 'text-gray-600 hover:text-forest'}`}>
                                    30D
                                </button>
                                <button 
                                    onClick={() => applyDatePreset('all')} 
                                    className={`px-2 py-1 rounded-md transition ${datePreset === 'all' ? 'bg-forest text-lime shadow-xs' : 'text-gray-600 hover:text-forest'}`}>
                                    All
                                </button>
                            </div>

                            <div className="h-4 w-[1px] bg-gray-300 mx-1 shrink-0"></div>

                            {/* Calendar Inputs */}
                            <div className="flex items-center gap-1 shrink-0">
                                <Calendar size={13} className="text-gray-400 shrink-0" />
                                <input 
                                    type="date" 
                                    value={startDate} 
                                    onChange={(e) => { setStartDate(e.target.value); setDatePreset('custom'); }} 
                                    className="bg-transparent font-medium text-gray-700 outline-none text-[11px] sm:text-xs w-[95px] sm:w-[105px]" 
                                />
                                <span className="text-gray-300 font-bold">-</span>
                                <input 
                                    type="date" 
                                    value={endDate} 
                                    onChange={(e) => { setEndDate(e.target.value); setDatePreset('custom'); }} 
                                    className="bg-transparent font-medium text-gray-700 outline-none text-[11px] sm:text-xs w-[95px] sm:w-[105px]" 
                                />
                            </div>
                        </div>

                        {/* Action Buttons on 2xl Ultra-Wide Screens */}
                        <div className="hidden 2xl:flex items-center gap-2 shrink-0">
                            <button 
                                onClick={() => onRefresh && onRefresh({ search: searchTerm, startDate, endDate })}
                                title="Refresh live data"
                                className={`p-2 border border-gray-200 text-forest bg-white rounded-lg hover:bg-gray-50 transition shadow-2xs shrink-0 ${isRefreshing ? 'opacity-60' : ''}`}>
                                <RefreshCw size={15} className={isRefreshing ? 'animate-spin text-forest' : ''} />
                            </button>

                            <button 
                                onClick={exportToCSV}
                                className="flex items-center justify-center gap-1.5 px-3 py-2 border border-gray-200 text-forest bg-white font-bold rounded-lg text-xs shadow-2xs hover:bg-gray-50 transition whitespace-nowrap">
                                <Download size={14} /> Export CSV
                            </button>

                            <button 
                                onClick={() => setIsBroadcastModalOpen(true)}
                                className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-lime hover:bg-[#cbf03f] text-forest font-black rounded-lg text-xs shadow-sm transition whitespace-nowrap">
                                <Megaphone size={15} /> Launch Broadcast
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* ── Active Filter Bar (Clean on mobile) ─────────────── */}
            {(searchTerm || selectedStage !== 'All' || datePreset !== 'all') && (
                <div className="bg-lime/20 border-b border-lime/40 px-3.5 sm:px-6 py-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-forest font-semibold">
                    <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold flex items-center gap-1"><Filter size={13} /> Active Filters:</span>
                        {searchTerm && (
                            <span className="bg-white border border-gray-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                                Search: "{searchTerm}"
                                <button onClick={() => setSearchTerm("")} className="hover:text-rose-600"><X size={12} /></button>
                            </span>
                        )}
                        <span className="bg-white border border-gray-200 px-2 py-0.5 rounded-full">
                            Date: {startDate} to {endDate}
                        </span>
                        {selectedStage !== 'All' && (
                            <span className="bg-white border border-gray-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                                Stage: {selectedStage}
                                <button onClick={() => setSelectedStage("All")} className="hover:text-rose-600"><X size={12} /></button>
                            </span>
                        )}
                        <span className="text-forest font-black ml-1">
                            • {filteredLeads.length} leads (₹{totalFilteredPipeline.toLocaleString()})
                        </span>
                    </div>
                    <button onClick={resetFilters} className="text-xs text-rose-600 font-extrabold hover:underline shrink-0">
                        Reset Filters
                    </button>
                </div>
            )}

            {/* ── Main Dashboard Body ───────────────────────────── */}
            <div className="p-3.5 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto w-full">
                
                {/* ── 4 KPI Metric Cards ───────────────────────── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    {/* Card 1 */}
                    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-2xs">
                        <div className="flex items-center justify-between">
                            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Conversations Handled</p>
                            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                                {data?.conversations?.growth || '+21.4%'}
                            </span>
                        </div>
                        <div className="mt-2">
                            <h3 className="text-2xl sm:text-3xl font-black text-forest">
                                {(data?.conversations?.total || 1480).toLocaleString()}
                            </h3>
                            <p className="text-[11px] text-gray-500 mt-1 font-medium">WhatsApp inbound chats this week</p>
                        </div>
                    </div>

                    {/* Card 2 */}
                    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-2xs">
                        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Replies Breakdown</p>
                        <div className="mt-2">
                            <h3 className="text-2xl sm:text-3xl font-black text-forest">
                                {(data?.replies?.total || 2940).toLocaleString()}
                            </h3>
                            <p className="text-[11px] text-gray-500 mt-1 font-medium">
                                AI ({data?.replies?.ai || 35}%) • Phone ({data?.replies?.phone || 40}%) • Inbox ({data?.replies?.inbox || 25}%)
                            </p>
                        </div>
                    </div>

                    {/* Card 3 */}
                    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-2xs">
                        <div className="flex items-center justify-between">
                            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Broadcast Spend</p>
                            <span className="text-[11px] font-bold text-forest bg-lime px-2 py-0.5 rounded-md">
                                ROI {data?.broadcast?.roi || '19.8x'}
                            </span>
                        </div>
                        <div className="mt-2">
                            <h3 className="text-2xl sm:text-3xl font-black text-forest">
                                ₹{(data?.broadcast?.spend || 12500).toLocaleString()}
                            </h3>
                            <p className="text-[11px] text-gray-500 mt-1 font-medium">
                                Generated ₹{data?.broadcast?.sales || '2,48,000'} in polymer deals
                            </p>
                        </div>
                    </div>

                    {/* Card 4 */}
                    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-2xs">
                        <div className="flex items-center justify-between">
                            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Median Reply Time</p>
                            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                                {data?.responseTime?.faster || '62%'} faster
                            </span>
                        </div>
                        <div className="mt-2">
                            <h3 className="text-2xl sm:text-3xl font-black text-forest">
                                {data?.responseTime?.median || '1m 24s'}
                            </h3>
                            <p className="text-[11px] text-gray-500 mt-1 font-medium">
                                AI Bot: &lt; 4s • Human: 2m 50s
                            </p>
                        </div>
                    </div>
                </div>

                {/* ── Chart & Team Workload ────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                    {/* Weekly Inbound Chart */}
                    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-2xs lg:col-span-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                            <div>
                                <h3 className="font-black text-forest text-sm sm:text-base">Weekly Inbound Traffic (Polymers)</h3>
                                <p className="text-[11px] text-gray-500">Inbound inquiries per day via WhatsApp Cloud API</p>
                            </div>
                            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                                <span className="w-3 h-3 rounded bg-forest"></span> Peak Day
                                <span className="w-3 h-3 rounded bg-gray-200 ml-2"></span> Normal
                            </div>
                        </div>
                        <div className="h-56 sm:h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data?.weeklyTraffic || []}>
                                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 11}} />
                                    <Tooltip 
                                        cursor={{fill: '#F3F4F6'}} 
                                        contentStyle={{borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'}}
                                        formatter={(val: any) => [`${val} WhatsApp Inquiries`, 'Inbound Chats']}
                                    />
                                    <Bar dataKey="chats" radius={[6, 6, 0, 0]}>
                                        {(data?.weeklyTraffic || []).map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={entry.day === 'Thu' ? '#0E3B26' : '#D1D5DB'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Team Workload */}
                    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-2xs flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-black text-forest text-sm sm:text-base">Team Workload</h3>
                                <span className="text-[11px] font-bold text-gray-400">Live Status</span>
                            </div>
                            <div className="space-y-2.5">
                                {(data?.teamWorkload || []).map((member: any, idx: number) => (
                                    <div key={idx} className={`flex items-center justify-between p-2.5 sm:p-3 rounded-xl border transition ${
                                        member.name.includes('AI') ? 'bg-lime/20 border-lime/60' : 'bg-gray-50 border-gray-100 hover:bg-gray-100/60'
                                    }`}>
                                        <div className="flex items-center gap-2.5">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${
                                                member.name.includes('AI') ? 'bg-lime text-forest border border-lime-600' : 'bg-forest text-white'
                                            }`}>
                                                {member.name.includes('AI') ? 'AI' : member.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-xs sm:text-sm text-forest leading-tight">{member.name}</p>
                                                <p className="text-[10px] text-gray-500">{member.role}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-extrabold text-xs sm:text-sm text-forest">{member.chats} chats</p>
                                            <p className={`text-[10px] font-bold ${member.trend.includes('+') ? 'text-emerald-600' : 'text-rose-500'}`}>
                                                {member.trend}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── High-Value Hot Leads Pipeline (Product Based) ── */}
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-2xs">
                    {/* Header & Stage Tabs */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-black text-forest text-base sm:text-lg flex items-center gap-2">
                                    🔥 High-Value Polymer Leads Pipeline
                                </h3>
                                <span className="bg-rose-100 text-rose-700 font-extrabold text-[11px] px-2 py-0.5 rounded-full border border-rose-200">
                                    {filteredLeads.length} Inquiries
                                </span>
                            </div>
                            <p className="text-[11px] text-gray-500 mt-0.5">
                                Real-time WhatsApp inquiries for HDPE, PP, LLDPE, and Masterbatches
                            </p>
                        </div>

                        {/* Stage Filter Buttons (Scrolls horizontally on mobile) */}
                        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg text-xs font-bold overflow-x-auto">
                            {['All', 'Hot', 'Warm', 'Proposal'].map(stage => (
                                <button
                                    key={stage}
                                    onClick={() => setSelectedStage(stage)}
                                    className={`px-3 py-1.5 rounded-md transition whitespace-nowrap ${
                                        selectedStage === stage 
                                            ? 'bg-white text-forest shadow-xs' 
                                            : 'text-gray-500 hover:text-forest'
                                    }`}>
                                    {stage === 'All' ? 'All Stages' : stage}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Leads Table (Scrollable horizontally) */}
                    <div className="overflow-x-auto -mx-4 sm:mx-0">
                        {filteredLeads.length === 0 ? (
                            <div className="py-10 text-center border-t border-gray-100 px-4">
                                <p className="text-gray-400 font-bold text-sm">No matching polymer inquiries found.</p>
                                <p className="text-gray-400 text-xs mt-1">Try broadening your search term or date range.</p>
                                <button 
                                    onClick={resetFilters} 
                                    className="mt-3 px-4 py-1.5 bg-forest text-lime text-xs font-bold rounded-lg hover:bg-forest-light transition">
                                    Reset Filters
                                </button>
                            </div>
                        ) : (
                            <table className="w-full text-left border-collapse min-w-[780px]">
                                <thead>
                                    <tr className="text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-t border-gray-200 bg-gray-50/60">
                                        <th className="py-3 px-3">Customer & Company</th>
                                        <th className="py-3 px-3">Product of Interest</th>
                                        <th className="py-3 px-3 w-1/3">WhatsApp Inquiry</th>
                                        <th className="py-3 px-3">Deal Value</th>
                                        <th className="py-3 px-3">Source & Date</th>
                                        <th className="py-3 px-3">Assigned To</th>
                                        <th className="py-3 px-3 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-xs sm:text-sm">
                                    {filteredLeads.map((lead: any, idx: number) => (
                                        <tr key={lead.id || idx} className="hover:bg-gray-50/80 transition-colors">
                                            {/* Customer & Company */}
                                            <td className="py-3 px-3">
                                                <p className="font-black text-forest">{lead.customer}</p>
                                                <p className="text-[11px] font-semibold text-gray-500 flex items-center gap-1 mt-0.5">
                                                    <Building2 size={11} className="text-gray-400" />
                                                    {lead.company || 'Direct Buyer'}
                                                </p>
                                                <p className="text-[10px] text-gray-400 font-mono mt-0.5">{lead.phone}</p>
                                            </td>

                                            {/* Product */}
                                            <td className="py-3 px-3">
                                                <div className="inline-block bg-lime-soft/90 border border-lime text-forest font-bold text-[11px] px-2 py-0.5 rounded-md">
                                                    {lead.product || 'Polymer Granules'}
                                                </div>
                                                {lead.quantity && (
                                                    <p className="text-[10px] font-semibold text-gray-500 mt-1">
                                                        Qty: {lead.quantity}
                                                    </p>
                                                )}
                                            </td>

                                            {/* WhatsApp Query */}
                                            <td className="py-3 px-3">
                                                <p className="text-xs text-gray-700 leading-relaxed font-medium bg-gray-50 p-2 rounded-lg border border-gray-100">
                                                    "{lead.query}"
                                                </p>
                                            </td>

                                            {/* Deal Value & Stage */}
                                            <td className="py-3 px-3">
                                                <p className="font-black text-forest text-xs sm:text-sm">
                                                    ₹{Number(lead.value || 0).toLocaleString()}
                                                </p>
                                                <span className={`inline-block text-[10px] font-extrabold px-2 py-0.5 rounded-full mt-1 ${
                                                    lead.stage === 'Hot' ? 'bg-rose-100 text-rose-700 border border-rose-200' :
                                                    lead.stage === 'Warm' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                                                    'bg-blue-100 text-blue-700 border border-blue-200'
                                                }`}>
                                                    {lead.stage}
                                                </span>
                                            </td>

                                            {/* Source & Date */}
                                            <td className="py-3 px-3">
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                                    lead.source?.includes('AI') ? 'bg-lime text-forest' : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                    {lead.source || 'WhatsApp Direct'}
                                                </span>
                                                <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                                                    <Clock size={10} /> {lead.date || '2026-10-26'}
                                                </p>
                                            </td>

                                            {/* Assigned To */}
                                            <td className="py-3 px-3 text-xs font-semibold text-gray-700">
                                                {lead.assignee}
                                            </td>

                                            {/* Action Button */}
                                            <td className="py-3 px-3 text-right">
                                                <button 
                                                    onClick={() => setActiveChatLead(lead)}
                                                    className="inline-flex items-center gap-1 text-xs font-black bg-lime hover:bg-[#cbf03f] px-2.5 py-1.5 rounded-lg text-forest shadow-xs transition">
                                                    <MessageCircle size={13} /> Chat
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>

            {/* ── 🚀 Launch New Broadcast Modal (Responsive on mobile) ── */}
            {isBroadcastModalOpen && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs overflow-y-auto">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 my-auto border border-gray-200 max-h-[90vh] flex flex-col">
                        
                        {/* Modal Header */}
                        <div className="p-4 sm:p-5 border-b border-[#184d33] flex justify-between items-center bg-forest text-white shrink-0">
                            <div>
                                <h3 className="font-extrabold text-sm sm:text-base flex items-center gap-2">
                                    <Megaphone size={18} className="text-lime" /> Launch WhatsApp Broadcast
                                </h3>
                                <p className="text-[11px] text-lime-soft opacity-85 mt-0.5">
                                    Configure audience, set pricing & choose Meta templates
                                </p>
                            </div>
                            <button 
                                onClick={() => setIsBroadcastModalOpen(false)} 
                                className="p-1.5 rounded-lg text-gray-300 hover:text-white hover:bg-forest-light transition">
                                <X size={18} />
                            </button>
                        </div>

                        {/* Modal Form */}
                        <form onSubmit={handleLaunchBroadcast} className="p-4 sm:p-6 space-y-3.5 overflow-y-auto flex-1">
                            {/* Campaign Name */}
                            <div>
                                <label className="block text-xs font-bold text-forest uppercase tracking-wider mb-1">
                                    Campaign Name <span className="text-rose-500">*</span>
                                </label>
                                <input 
                                    type="text" 
                                    required
                                    placeholder="e.g. Diwali Spot Offer on HDPE Blow Molding" 
                                    value={campaignName}
                                    onChange={(e) => setCampaignName(e.target.value)}
                                    className="w-full border border-gray-300 p-2 sm:p-2.5 rounded-lg text-xs sm:text-sm outline-none focus:ring-2 focus:ring-lime" 
                                />
                            </div>

                            {/* Polymer Product Selection */}
                            <div>
                                <label className="block text-xs font-bold text-forest uppercase tracking-wider mb-1">
                                    Select Promoted Polymer Product
                                </label>
                                <select 
                                    value={selectedProduct}
                                    onChange={(e) => setSelectedProduct(e.target.value)}
                                    className="w-full border border-gray-300 p-2 sm:p-2.5 rounded-lg text-xs sm:text-sm outline-none focus:ring-2 focus:ring-lime bg-white">
                                    {products.map((p: any, idx: number) => (
                                        <option key={idx} value={p.name}>
                                            {p.name} {p.grade ? `(${p.grade})` : ''} - ₹{p.pricePerKg}/kg
                                        </option>
                                    ))}
                                    <option value="All Polymer Products">All Polymer Products (General Catalog)</option>
                                </select>
                            </div>

                            {/* Meta Template Section */}
                            <div className="bg-gray-50 p-3 sm:p-4 rounded-xl border border-gray-200 space-y-2.5">
                                <div className="flex items-center justify-between flex-wrap gap-2">
                                    <label className="text-xs font-bold text-forest uppercase tracking-wider">
                                        Meta WhatsApp Template
                                    </label>
                                    
                                    <div className="flex items-center gap-1 bg-gray-200 p-0.5 rounded-lg text-[11px] font-bold">
                                        <button 
                                            type="button"
                                            onClick={() => setTemplateMode('list')}
                                            className={`px-2 py-0.5 rounded transition ${templateMode === 'list' ? 'bg-white text-forest shadow-xs' : 'text-gray-500 hover:text-forest'}`}>
                                            From List
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={() => setTemplateMode('custom')}
                                            className={`px-2 py-0.5 rounded transition ${templateMode === 'custom' ? 'bg-forest text-lime shadow-xs' : 'text-gray-500 hover:text-forest'}`}>
                                            + Custom
                                        </button>
                                    </div>
                                </div>

                                {templateMode === 'list' ? (
                                    <select 
                                        value={selectedTemplateName}
                                        onChange={(e) => {
                                            if (e.target.value === '__TYPE_CUSTOM__') {
                                                setTemplateMode('custom');
                                            } else {
                                                setSelectedTemplateName(e.target.value);
                                            }
                                        }}
                                        className="w-full border border-gray-300 p-2 sm:p-2.5 rounded-lg text-xs sm:text-sm outline-none focus:ring-2 focus:ring-lime bg-white">
                                        {metaTemplates.map((tpl: any, idx: number) => (
                                            <option key={idx} value={tpl.name}>
                                                {tpl.name} ({tpl.status || 'Approved'})
                                            </option>
                                        ))}
                                        <option value="__TYPE_CUSTOM__" className="font-bold text-forest">
                                            ➕ Type your own custom template...
                                        </option>
                                    </select>
                                ) : (
                                    <div className="space-y-2.5 pt-1 border-t border-gray-200">
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">
                                                Template Name (lowercase, no spaces)
                                            </label>
                                            <input 
                                                type="text" 
                                                placeholder="e.g. zenvista_hdpe_special_oct"
                                                value={customTemplateName}
                                                onChange={(e) => setCustomTemplateName(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                                                className="w-full border border-gray-300 p-2 rounded-lg text-xs outline-none focus:ring-2 focus:ring-lime font-mono" 
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Category</label>
                                                <select 
                                                    value={customTemplateCategory}
                                                    onChange={(e) => setCustomTemplateCategory(e.target.value)}
                                                    className="w-full border border-gray-300 p-2 rounded-lg text-xs outline-none focus:ring-2 focus:ring-lime bg-white">
                                                    <option value="MARKETING">MARKETING</option>
                                                    <option value="UTILITY">UTILITY</option>
                                                    <option value="AUTHENTICATION">AUTHENTICATION</option>
                                                </select>
                                            </div>
                                            <div className="flex items-center pt-4">
                                                <label className="flex items-center gap-1.5 text-xs text-forest font-semibold cursor-pointer">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={saveTemplateForFuture}
                                                        onChange={(e) => setSaveTemplateForFuture(e.target.checked)}
                                                        className="accent-forest w-3.5 h-3.5 rounded" 
                                                    />
                                                    Save template
                                                </label>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">
                                                WhatsApp Message Body (with {'{{1}}'})
                                            </label>
                                            <textarea 
                                                rows={2}
                                                placeholder="Namaste {{1}}! Zenvista Polymers is offering spot discount. Reply for quote."
                                                value={customTemplateBody}
                                                onChange={(e) => setCustomTemplateBody(e.target.value)}
                                                className="w-full border border-gray-300 p-2 rounded-lg text-xs outline-none focus:ring-2 focus:ring-lime"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Audience & Custom Price */}
                            <div className="bg-lime/20 p-3 sm:p-4 rounded-xl border border-lime/70 space-y-2.5">
                                <h4 className="text-xs font-black text-forest uppercase tracking-wider flex items-center gap-1">
                                    <Sparkles size={13} className="text-forest" /> Audience & Pricing
                                </h4>

                                <div>
                                    <label className="block text-[10px] font-bold text-forest uppercase mb-1">
                                        Target Audience Segment / Tag
                                    </label>
                                    <input 
                                        type="text" 
                                        value={targetAudience}
                                        onChange={(e) => setTargetAudience(e.target.value)}
                                        placeholder="e.g. All Polymer Buyers, Blow Molders" 
                                        className="w-full border border-gray-300 p-2 rounded-lg text-xs outline-none focus:ring-2 focus:ring-lime bg-white" 
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-2.5">
                                    <div>
                                        <label className="block text-[10px] font-bold text-forest uppercase mb-1">Contacts Count</label>
                                        <input 
                                            type="number" 
                                            min={1}
                                            value={contactsCount}
                                            onChange={(e) => setContactsCount(Number(e.target.value))}
                                            className="w-full border border-gray-300 p-2 rounded-lg text-xs font-bold text-forest outline-none focus:ring-2 focus:ring-lime bg-white" 
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold text-forest uppercase mb-1">Price / Msg (₹)</label>
                                        <input 
                                            type="number" 
                                            step="0.01"
                                            min={0}
                                            value={pricePerMessage}
                                            onChange={(e) => setPricePerMessage(Number(e.target.value))}
                                            className="w-full border border-gray-300 p-2 rounded-lg text-xs font-bold text-forest outline-none focus:ring-2 focus:ring-lime bg-white" 
                                        />
                                    </div>
                                </div>

                                <div className="pt-2 border-t border-lime/40 flex items-center justify-between">
                                    <label className="flex items-center gap-1.5 text-xs font-bold text-forest cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            checked={isCustomPriceOverride}
                                            onChange={(e) => setIsCustomPriceOverride(e.target.checked)}
                                            className="accent-forest w-3.5 h-3.5 rounded" 
                                        />
                                        Custom Package Price (Override)
                                    </label>
                                    {isCustomPriceOverride && (
                                        <div className="flex items-center gap-1">
                                            <span className="text-xs font-bold text-forest">₹</span>
                                            <input 
                                                type="number"
                                                value={customTotalPrice}
                                                onChange={(e) => setCustomTotalPrice(Number(e.target.value))}
                                                className="w-24 p-1 border border-forest rounded-lg text-xs font-black text-forest outline-none bg-white text-right"
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="bg-white/80 p-2.5 rounded-lg border border-lime flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] font-bold text-forest uppercase">
                                            Total Campaign Cost
                                        </p>
                                        <p className="text-[11px] text-gray-500">
                                            {contactsCount.toLocaleString()} msgs @ ₹{pricePerMessage}/msg
                                        </p>
                                    </div>
                                    <h3 className="text-xl font-black text-forest">
                                        ₹{effectiveTotalCost.toLocaleString()}
                                    </h3>
                                </div>
                            </div>

                            {/* Modal Actions */}
                            <div className="pt-2 border-t border-gray-200 flex justify-end gap-2">
                                <button 
                                    type="button" 
                                    onClick={() => setIsBroadcastModalOpen(false)} 
                                    className="px-3.5 py-2 font-bold text-xs text-gray-600 hover:bg-gray-100 rounded-lg transition">
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={isSubmittingBroadcast}
                                    className="px-4 py-2 font-black text-xs bg-forest text-lime rounded-lg hover:bg-forest-light transition shadow flex items-center gap-1.5 disabled:opacity-50">
                                    {isSubmittingBroadcast ? 'Launching...' : 'Launch Campaign 🚀'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── 💬 Quick WhatsApp Chat Preview Modal ──────────── */}
            {activeChatLead && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs">
                    <div className="bg-[#EFEAE2] rounded-2xl w-full max-w-sm sm:max-w-md shadow-2xl overflow-hidden border border-gray-300">
                        <div className="bg-[#075E54] text-white p-3 flex items-center justify-between shadow">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-lime text-forest font-black flex items-center justify-center text-xs">
                                    {activeChatLead.customer.charAt(0)}
                                </div>
                                <div>
                                    <h4 className="font-bold text-xs sm:text-sm leading-tight">{activeChatLead.customer}</h4>
                                    <p className="text-[10px] text-gray-200 truncate max-w-[180px]">{activeChatLead.company || activeChatLead.phone}</p>
                                </div>
                            </div>
                            <button onClick={() => setActiveChatLead(null)} className="text-white hover:text-lime p-1">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="p-3 sm:p-4 space-y-2.5 min-h-[220px] max-h-[300px] overflow-y-auto">
                            <div className="flex justify-start">
                                <div className="bg-white p-2.5 rounded-xl rounded-tl-none shadow-xs max-w-[85%] text-xs text-gray-800 space-y-1">
                                    <p className="font-semibold text-emerald-800">{activeChatLead.customer}</p>
                                    <p>{activeChatLead.query}</p>
                                    <p className="text-[9px] text-gray-400 text-right">{activeChatLead.date || 'Today'}</p>
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <div className="bg-[#DCF8C6] p-2.5 rounded-xl rounded-tr-none shadow-xs max-w-[85%] text-xs text-gray-800 space-y-1">
                                    <p className="font-bold text-forest">Zenvista AI Bot</p>
                                    <p>Spot quote for <strong>{activeChatLead.product}</strong> ({activeChatLead.quantity || 'this order'}) is ready. Executive {activeChatLead.assignee} assigned.</p>
                                    <p className="text-[9px] text-gray-500 text-right">Just now ✓✓</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-2.5 bg-gray-100 border-t flex items-center justify-between gap-2">
                            <span className="text-[11px] font-semibold text-gray-600 truncate">
                                Deal: <strong className="text-forest">₹{Number(activeChatLead.value || 0).toLocaleString()}</strong>
                            </span>
                            <button 
                                onClick={() => {
                                    showToast(`Connecting to WhatsApp Web for ${activeChatLead.phone}...`);
                                    window.open(`https://wa.me/${activeChatLead.phone.replace(/[^0-9]/g, '')}`, '_blank');
                                }}
                                className="px-3 py-1.5 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs rounded-lg shadow-xs transition flex items-center gap-1 shrink-0">
                                <MessageCircle size={13} /> WhatsApp
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
