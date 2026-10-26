"use client";
import React, { useState, useEffect, useMemo, useRef } from 'react';
import api from '@/services/api';
import { 
    Search, Calendar, RefreshCw, Plus, CheckCircle2, Megaphone, 
    Send, Users, DollarSign, TrendingUp, Check, X, Eye, 
    MessageSquare, AlertCircle, Sparkles, Filter, Trash2
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';

export default function BroadcastsPage() {
    const searchInputRef = useRef<HTMLInputElement>(null);

    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedSegment, setSelectedSegment] = useState("All");
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    // Launch Broadcast Modal
    const [isLaunchModalOpen, setIsLaunchModalOpen] = useState(false);
    const [campaignName, setCampaignName] = useState("");
    const [targetAudience, setTargetAudience] = useState("HDPE Blow Molders");
    const [selectedProduct, setSelectedProduct] = useState("HDPE Blow Molding Grade B56003");
    const [offerPrice, setOfferPrice] = useState("₹118/kg Ex-Kandla");
    const [selectedTemplate, setSelectedTemplate] = useState("zenvista_polymer_bulk_offer");
    const [contactsCount, setContactsCount] = useState<number>(1000);
    const [pricePerMessage, setPricePerMessage] = useState<number>(0.86);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchBroadcasts = async () => {
        try {
            setIsRefreshing(true);
            const res = await api.get('/api/broadcasts', {
                params: {
                    search: searchTerm,
                    segment: selectedSegment !== 'All' ? selectedSegment : undefined
                }
            });
            setData(res.data);
        } catch (error) {
            console.error("Error fetching broadcasts:", error);
            showToast("Failed to load broadcast campaigns.");
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchBroadcasts();
    }, [selectedSegment]);

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3500);
    };

    // Auto-calculate total cost
    const effectiveTotalCost = useMemo(() => {
        return Math.round((Number(contactsCount) || 0) * (Number(pricePerMessage) || 0));
    }, [contactsCount, pricePerMessage]);

    // Handle Launch Campaign Submit
    const handleLaunchSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!campaignName.trim()) {
            showToast("Please enter a campaign name.");
            return;
        }

        try {
            setIsSubmitting(true);
            const payload = {
                campaignName: campaignName.trim(),
                templateName: selectedTemplate,
                audienceSegment: targetAudience,
                targetAudience,
                product: selectedProduct,
                offerPrice,
                contactsCount,
                pricePerMessage,
                totalCost: effectiveTotalCost
            };

            const res = await api.post('/api/broadcasts/launch', payload);
            if (res.data.success) {
                showToast(`🚀 "${campaignName}" dispatched to ${contactsCount} buyers!`);
                setIsLaunchModalOpen(false);
                setCampaignName("");
                fetchBroadcasts();
            }
        } catch (error: any) {
            console.error("Failed to launch campaign:", error);
            showToast(error.response?.data?.message || "Failed to launch campaign.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Filter campaigns based on search term
    const filteredCampaigns = useMemo(() => {
        const list = data?.campaigns || [];
        if (!searchTerm.trim()) return list;
        const q = searchTerm.toLowerCase().trim();
        return list.filter((c: any) => 
            c.campaignName.toLowerCase().includes(q) ||
            c.product.toLowerCase().includes(q) ||
            c.templateName.toLowerCase().includes(q) ||
            c.audienceSegment.toLowerCase().includes(q)
        );
    }, [data?.campaigns, searchTerm]);

    if (loading && !data) {
        return (
            <div className="flex flex-col md:flex-row h-screen bg-[#F6F7F4] font-sans overflow-hidden w-full">
                <Sidebar />
                <div className="flex-1 flex flex-col items-center justify-center text-forest font-bold gap-3">
                    <div className="w-10 h-10 border-4 border-lime border-t-forest rounded-full animate-spin"></div>
                    <p className="text-sm">Connecting to Meta WhatsApp Broadcast Engine...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col md:flex-row h-screen bg-[#F6F7F4] font-sans overflow-hidden text-gray-800 w-full">
            <Sidebar />

            {/* ── Toast Notification ────────────────────────────── */}
            {toastMessage && (
                <div className="fixed top-4 right-4 sm:top-5 sm:right-6 z-50 bg-forest text-lime px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2.5 border border-[#23583c] animate-in fade-in slide-in-from-top-4 duration-300 max-w-[90vw]">
                    <CheckCircle2 size={18} className="text-lime shrink-0" />
                    <span className="font-bold text-xs sm:text-sm text-white truncate">{toastMessage}</span>
                </div>
            )}

            {/* ── Main Broadcasts Content Area ──────────────────── */}
            <main className="flex-1 flex flex-col h-full overflow-y-auto overflow-x-hidden bg-[#F6F7F4] relative font-sans text-gray-800 w-full min-w-0">
                
                {/* ── Top Header Bar ───────────────────────────────── */}
                <header className="bg-white px-3.5 sm:px-6 lg:px-8 py-3 border-b border-gray-200 sticky top-0 z-20 shadow-xs backdrop-blur-md bg-white/95 w-full">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 w-full">
                        
                        {/* Title */}
                        <div>
                            <h2 className="text-base sm:text-lg lg:text-[19px] font-black text-[#0E3B26] tracking-tight leading-snug">
                                WhatsApp Broadcast Studio &amp; Bulk Engine
                            </h2>
                            <p className="text-[11px] text-gray-400 font-medium">
                                Meta Cloud API • Official WABA Tier 3 (100k/day limit)
                            </p>
                        </div>

                        {/* Top Action Controls */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2.5 w-full lg:w-auto">
                            
                            {/* Search */}
                            <div className="relative w-full sm:w-48 md:w-56 lg:w-64">
                                <Search className="absolute left-3 top-2.5 text-gray-400" size={14} />
                                <input 
                                    ref={searchInputRef}
                                    type="text" 
                                    placeholder="Search campaigns, products..." 
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

                            {/* Buttons */}
                            <div className="grid grid-cols-2 sm:flex items-center gap-1.5 sm:gap-2">
                                <button 
                                    onClick={fetchBroadcasts}
                                    className={`flex items-center justify-center gap-1.5 px-3 py-1.5 border border-gray-200 text-[#0E3B26] bg-white hover:bg-gray-50 rounded-lg shadow-2xs transition text-xs font-bold shrink-0 ${isRefreshing ? 'opacity-60' : ''}`}>
                                    <RefreshCw size={13} className={isRefreshing ? 'animate-spin' : ''} />
                                    <span>Refresh</span>
                                </button>

                                <button 
                                    onClick={() => setIsLaunchModalOpen(true)}
                                    className="flex items-center justify-center gap-1.5 px-3.5 py-1.5 bg-[#0B3822] hover:bg-[#14472d] text-white font-bold rounded-lg shadow-xs transition text-xs shrink-0 whitespace-nowrap">
                                    <Plus size={14} className="stroke-[2.5]" /> Launch Broadcast
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                {/* ── Main Container ───────────────────────────────── */}
                <div className="p-3.5 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
                    
                    {/* ══ 1. High-Level Performance Metrics ══════════════ */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-4">
                        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-xs space-y-1">
                            <div className="flex items-center justify-between text-gray-400 text-xs font-bold">
                                <span>TOTAL SENT</span>
                                <Send size={15} className="text-forest" />
                            </div>
                            <h3 className="text-xl sm:text-2xl font-black text-forest">
                                {data?.overview?.totalMessagesSent?.toLocaleString() || '4,530'}
                            </h3>
                            <p className="text-[10px] text-emerald-600 font-bold">✓ 99.4% Delivery Rate</p>
                        </div>

                        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-xs space-y-1">
                            <div className="flex items-center justify-between text-gray-400 text-xs font-bold">
                                <span>READ RATE</span>
                                <Eye size={15} className="text-emerald-600" />
                            </div>
                            <h3 className="text-xl sm:text-2xl font-black text-forest">
                                {data?.overview?.averageReadRate || '86.1%'}
                            </h3>
                            <p className="text-[10px] text-gray-400 font-medium">31.2% Direct Inquiries</p>
                        </div>

                        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-xs space-y-1">
                            <div className="flex items-center justify-between text-gray-400 text-xs font-bold">
                                <span>TOTAL SPEND</span>
                                <DollarSign size={15} className="text-lime-dark" />
                            </div>
                            <h3 className="text-xl sm:text-2xl font-black text-forest">
                                ₹{data?.overview?.totalSpend?.toLocaleString() || '3,491'}
                            </h3>
                            <p className="text-[10px] text-gray-500 font-medium">Avg ₹0.77/delivered msg</p>
                        </div>

                        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-xs space-y-1">
                            <div className="flex items-center justify-between text-gray-400 text-xs font-bold">
                                <span>PIPELINE VALUE</span>
                                <TrendingUp size={15} className="text-forest" />
                            </div>
                            <h3 className="text-xl sm:text-2xl font-black text-forest">
                                {data?.overview?.estimatedPipelineValue || '₹26,70,000'}
                            </h3>
                            <p className="text-[10px] text-emerald-700 font-bold">18.4x Marketing ROI</p>
                        </div>
                    </div>

                    {/* ══ 2. Audience Segment Quick Filters ══════════════ */}
                    <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs space-y-2.5">
                        <div className="flex items-center justify-between">
                            <h4 className="text-xs font-extrabold text-forest uppercase tracking-wider flex items-center gap-1.5">
                                <Users size={14} className="text-forest" /> Target Audience Segments
                            </h4>
                            <span className="text-[11px] text-gray-400 font-medium">Filter verified buyers</span>
                        </div>
                        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-bold">
                            {['All', 'HDPE Blow Molders', 'PP Injection Molding', 'PVC Pipe Extruders', 'Masterbatch Compounders'].map((seg) => {
                                const isActive = selectedSegment === seg;
                                return (
                                    <button 
                                        key={seg}
                                        onClick={() => setSelectedSegment(seg)}
                                        className={`px-3 py-1.5 rounded-xl transition whitespace-nowrap ${
                                            isActive 
                                                ? 'bg-forest text-lime shadow-xs' 
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200/80'
                                        }`}>
                                        {seg}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* ══ 3. Broadcast Campaigns Table ═══════════════════ */}
                    <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                                <h3 className="font-black text-forest text-base sm:text-lg">
                                    Dispatched &amp; Scheduled Broadcasts
                                </h3>
                                <p className="text-xs text-gray-400 font-medium mt-0.5">
                                    Real-time delivery status, open rate, and lead conversions
                                </p>
                            </div>
                            <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full self-start sm:self-auto">
                                {filteredCampaigns.length} Campaigns Found
                            </span>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto -mx-4 sm:mx-0">
                            <table className="w-full text-left border-collapse min-w-[750px]">
                                <thead>
                                    <tr className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-200 bg-gray-50/50">
                                        <th className="py-3 px-4">Campaign &amp; Product</th>
                                        <th className="py-3 px-4">Segment</th>
                                        <th className="py-3 px-4">Recipients</th>
                                        <th className="py-3 px-4">Cost</th>
                                        <th className="py-3 px-4">Delivery &amp; Read</th>
                                        <th className="py-3 px-4">Inquiries</th>
                                        <th className="py-3 px-4 text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-xs sm:text-sm">
                                    {filteredCampaigns.map((camp: any) => (
                                        <tr key={camp._id || camp.campaignName} className="hover:bg-gray-50/80 transition-colors">
                                            
                                            {/* Campaign & Product */}
                                            <td className="py-4 px-4 font-bold text-forest">
                                                <div>
                                                    <p className="font-extrabold text-forest">{camp.campaignName}</p>
                                                    <p className="text-[11px] text-gray-400 font-mono mt-0.5">{camp.product} • {camp.offerPrice}</p>
                                                </div>
                                            </td>

                                            {/* Segment */}
                                            <td className="py-4 px-4">
                                                <span className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-gray-100 text-gray-700">
                                                    {camp.audienceSegment}
                                                </span>
                                            </td>

                                            {/* Recipients */}
                                            <td className="py-4 px-4 font-extrabold text-forest">
                                                {camp.contactsCount?.toLocaleString()}
                                            </td>

                                            {/* Cost */}
                                            <td className="py-4 px-4 font-extrabold text-forest">
                                                ₹{camp.totalCost?.toLocaleString()}
                                            </td>

                                            {/* Delivery & Read Progress */}
                                            <td className="py-4 px-4">
                                                <div className="space-y-1 w-32">
                                                    <div className="flex justify-between text-[10px] font-bold text-gray-500">
                                                        <span>{camp.stats?.deliveryRate || '99%'}</span>
                                                        <span>{camp.stats?.readRate || '85%'} read</span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                                                        <div className="bg-[#10B981] h-full" style={{ width: camp.stats?.readRate || '85%' }}></div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Inquiries Generated */}
                                            <td className="py-4 px-4 font-black text-emerald-700">
                                                +{camp.stats?.inquiriesGenerated || 0} Leads
                                            </td>

                                            {/* Status */}
                                            <td className="py-4 px-4 text-right">
                                                <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-800 bg-[#E8F8EE] border border-emerald-200 px-2.5 py-0.5 rounded-full">
                                                    <Check size={12} className="stroke-[3]" /> {camp.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* ── Modal: Launch New Broadcast ───────────────────── */}
                {isLaunchModalOpen && (
                    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
                        <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-gray-200 animate-in fade-in zoom-in duration-200">
                            <div className="p-5 border-b border-[#184d33] flex justify-between items-center bg-forest text-white">
                                <div>
                                    <h3 className="font-black text-base flex items-center gap-2">
                                        <Megaphone size={18} className="text-lime" /> Launch WhatsApp Broadcast
                                    </h3>
                                    <p className="text-[11px] text-lime-soft opacity-85 mt-0.5">
                                        Meta-Approved Bulk Broadcast Engine
                                    </p>
                                </div>
                                <button onClick={() => setIsLaunchModalOpen(false)} className="text-gray-300 hover:text-white p-1">
                                    <X size={18} />
                                </button>
                            </div>

                            <form onSubmit={handleLaunchSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                                <div>
                                    <label className="block text-xs font-bold text-forest uppercase tracking-wider mb-1">
                                        Campaign Name <span className="text-rose-500">*</span>
                                    </label>
                                    <input 
                                        type="text" 
                                        required
                                        placeholder="e.g. HDPE Kandla Port Bulk Flash Offer" 
                                        value={campaignName}
                                        onChange={(e) => setCampaignName(e.target.value)}
                                        className="w-full border border-gray-300 p-2.5 rounded-lg text-sm outline-none focus:ring-2 focus:ring-lime" 
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-forest uppercase tracking-wider mb-1">Target Segment</label>
                                        <select 
                                            value={targetAudience}
                                            onChange={(e) => setTargetAudience(e.target.value)}
                                            className="w-full border border-gray-300 p-2.5 rounded-lg text-xs outline-none focus:ring-2 focus:ring-lime bg-white">
                                            <option value="HDPE Blow Molders">HDPE Blow Molders (1,820)</option>
                                            <option value="PP Injection Molding">PP Injection Units (1,450)</option>
                                            <option value="PVC Pipe Extruders">PVC Pipe Extruders (980)</option>
                                            <option value="Masterbatch Compounders">Masterbatch Units (600)</option>
                                            <option value="All Buyers">All Buyers (4,850)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-forest uppercase tracking-wider mb-1">Product Grade</label>
                                        <select 
                                            value={selectedProduct}
                                            onChange={(e) => setSelectedProduct(e.target.value)}
                                            className="w-full border border-gray-300 p-2.5 rounded-lg text-xs outline-none focus:ring-2 focus:ring-lime bg-white">
                                            <option value="HDPE Blow Molding Grade B56003">HDPE B56003 (Blow)</option>
                                            <option value="PP Homopolymer Injection Grade H110MA">PP H110MA (Injection)</option>
                                            <option value="LLDPE Film Grade 010F18A">LLDPE 010F18A (Film)</option>
                                            <option value="PVC Resin Suspension Grade K-67">PVC K-67 (Pipes)</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-forest uppercase tracking-wider mb-1">Spot Offer Price</label>
                                    <input 
                                        type="text" 
                                        value={offerPrice}
                                        onChange={(e) => setOfferPrice(e.target.value)}
                                        className="w-full border border-gray-300 p-2.5 rounded-lg text-xs outline-none focus:ring-2 focus:ring-lime" 
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-forest uppercase tracking-wider mb-1">Contacts Count</label>
                                        <input 
                                            type="number" 
                                            value={contactsCount}
                                            onChange={(e) => setContactsCount(Number(e.target.value))}
                                            className="w-full border border-gray-300 p-2.5 rounded-lg text-xs outline-none focus:ring-2 focus:ring-lime" 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-forest uppercase tracking-wider mb-1">Rate / Message (₹)</label>
                                        <input 
                                            type="number" 
                                            step="0.01"
                                            value={pricePerMessage}
                                            onChange={(e) => setPricePerMessage(Number(e.target.value))}
                                            className="w-full border border-gray-300 p-2.5 rounded-lg text-xs outline-none focus:ring-2 focus:ring-lime" 
                                        />
                                    </div>
                                </div>

                                {/* Dynamic Cost Calculation Banner */}
                                <div className="p-3.5 bg-[#F4FBDA] border border-[#d4f260] rounded-xl flex items-center justify-between text-forest">
                                    <div>
                                        <p className="text-xs font-bold">Estimated Meta Cloud Cost</p>
                                        <p className="text-[11px] text-gray-600">{contactsCount.toLocaleString()} messages × ₹{pricePerMessage}</p>
                                    </div>
                                    <span className="text-lg font-black text-forest">
                                        ₹{effectiveTotalCost.toLocaleString()}
                                    </span>
                                </div>

                                <div className="pt-3 border-t flex justify-end gap-2.5">
                                    <button 
                                        type="button" 
                                        onClick={() => setIsLaunchModalOpen(false)} 
                                        className="px-4 py-2 font-bold text-xs text-gray-600 hover:bg-gray-100 rounded-lg">
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        disabled={isSubmitting}
                                        className="px-5 py-2.5 font-black text-xs bg-forest text-lime rounded-lg hover:bg-forest-light transition shadow flex items-center gap-1.5 disabled:opacity-50">
                                        {isSubmitting ? 'Dispatching...' : 'Dispatch Broadcast Now 🚀'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
