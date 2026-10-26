"use client";
import React, { useState, useEffect, useMemo, useRef } from 'react';
import api from '@/services/api';
import { 
    Search, Workflow, Plus, CheckCircle2, RefreshCw, Smartphone, 
    Check, X, FileText, Send, Eye, ShieldCheck, ChevronRight, 
    ArrowRight, Sparkles, Layers, Sliders
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';

export default function FlowsPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    // Active Test Simulator Modal
    const [testFlow, setTestFlow] = useState<any>(null);
    const [testGrade, setTestGrade] = useState("HDPE Blow Molding Grade (B56003)");
    const [testTonnage, setTestTonnage] = useState("20");
    const [testHub, setTestHub] = useState("Kandla Port Warehouse");
    const [testCompany, setTestCompany] = useState("Gujarat Containers Ltd");
    const [testPhone, setTestPhone] = useState("+91 98200 44120");
    const [isSubmittingTest, setIsSubmittingTest] = useState(false);

    // Create New Flow Modal
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newFlowName, setNewFlowName] = useState("");
    const [newFlowCategory, setNewFlowCategory] = useState("LEAD_GENERATION");
    const [newFlowDesc, setNewFlowDesc] = useState("");
    const [isSubmittingCreate, setIsSubmittingCreate] = useState(false);

    const fetchFlows = async () => {
        try {
            setIsRefreshing(true);
            const res = await api.get('/api/flows');
            setData(res.data);
        } catch (error) {
            console.error("Error fetching flows:", error);
            showToast("Failed to fetch WhatsApp flows.");
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchFlows();
    }, []);

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3500);
    };

    // Toggle flow status (Published / Draft)
    const handleToggleFlow = async (id: string) => {
        try {
            const res = await api.patch(`/api/flows/${id}/toggle`);
            if (res.data.success) {
                showToast(res.data.message);
                fetchFlows();
            }
        } catch (error) {
            showToast("Failed to update flow status.");
        }
    };

    // Submit Simulated Flow Response
    const handleSimulatedSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!testFlow) return;

        try {
            setIsSubmittingTest(true);
            const payload = {
                customerPhone: testPhone,
                customerName: 'Verified Polymer Buyer',
                company: testCompany,
                answers: {
                    polymer_grade: testGrade,
                    tonnage: Number(testTonnage) || 10,
                    delivery_hub: testHub
                }
            };

            const res = await api.post(`/api/flows/${testFlow._id}/submit`, payload);
            if (res.data.success) {
                showToast(`✓ Quote request for ${testTonnage} MT submitted via WhatsApp Flow!`);
                setTestFlow(null);
                fetchFlows();
            }
        } catch (error) {
            showToast("Failed to submit test flow.");
        } finally {
            setIsSubmittingTest(false);
        }
    };

    // Create Flow Submit
    const handleCreateFlow = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newFlowName.trim()) {
            showToast("Please enter a flow name.");
            return;
        }

        try {
            setIsSubmittingCreate(true);
            const res = await api.post('/api/flows', {
                name: newFlowName.trim(),
                category: newFlowCategory,
                description: newFlowDesc.trim()
            });

            if (res.data.success) {
                showToast("New WhatsApp Flow published to Meta Cloud!");
                setIsCreateModalOpen(false);
                setNewFlowName("");
                setNewFlowDesc("");
                fetchFlows();
            }
        } catch (error) {
            showToast("Failed to create flow.");
        } finally {
            setIsSubmittingCreate(false);
        }
    };

    if (loading && !data) {
        return (
            <div className="flex flex-col md:flex-row h-screen bg-[#F6F7F4] font-sans overflow-hidden w-full">
                <Sidebar />
                <div className="flex-1 flex flex-col items-center justify-center text-forest font-bold gap-3">
                    <div className="w-10 h-10 border-4 border-lime border-t-forest rounded-full animate-spin"></div>
                    <p className="text-sm">Connecting to Meta WhatsApp Flows Endpoint...</p>
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

            {/* ── Main Content ─────────────────────────────────── */}
            <main className="flex-1 flex flex-col h-full overflow-y-auto overflow-x-hidden bg-[#F6F7F4] relative font-sans text-gray-800 w-full min-w-0">
                
                {/* ── Header ───────────────────────────────────────── */}
                <header className="bg-white px-3.5 sm:px-6 lg:px-8 py-3 border-b border-gray-200 sticky top-0 z-20 shadow-xs backdrop-blur-md bg-white/95 w-full">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 w-full">
                        <div>
                            <h2 className="text-base sm:text-lg lg:text-[19px] font-black text-[#0E3B26] tracking-tight leading-snug">
                                WhatsApp Flows &amp; Interactive Forms
                            </h2>
                            <p className="text-[11px] text-gray-400 font-medium">
                                Meta Native In-Chat Structured Data Capture (v3.0 Endpoint)
                            </p>
                        </div>

                        <div className="flex items-center gap-2 self-start lg:self-auto">
                            <button 
                                onClick={fetchFlows}
                                className={`flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 text-[#0E3B26] bg-white hover:bg-gray-50 rounded-lg shadow-2xs transition text-xs font-bold ${isRefreshing ? 'opacity-60' : ''}`}>
                                <RefreshCw size={13} className={isRefreshing ? 'animate-spin' : ''} />
                                <span>Refresh</span>
                            </button>

                            <button 
                                onClick={() => setIsCreateModalOpen(true)}
                                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0B3822] hover:bg-[#14472d] text-white font-bold rounded-lg shadow-xs transition text-xs whitespace-nowrap">
                                <Plus size={14} className="stroke-[2.5]" /> Create Flow
                            </button>
                        </div>
                    </div>
                </header>

                {/* ── Container ────────────────────────────────────── */}
                <div className="p-3.5 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
                    
                    {/* ══ Metrics ════════════════════════════════════════ */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-4">
                        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-xs space-y-1">
                            <p className="text-[11px] font-bold text-gray-400 uppercase">ACTIVE FLOWS</p>
                            <h3 className="text-xl sm:text-2xl font-black text-forest">{data?.overview?.activePublishedCount || 2}</h3>
                            <p className="text-[10px] text-emerald-600 font-bold">● Published to Meta WABA</p>
                        </div>
                        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-xs space-y-1">
                            <p className="text-[11px] font-bold text-gray-400 uppercase">SUBMISSIONS</p>
                            <h3 className="text-xl sm:text-2xl font-black text-forest">{data?.overview?.totalSubmissions || 220}</h3>
                            <p className="text-[10px] text-gray-500 font-medium">Inbound buyer quotes</p>
                        </div>
                        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-xs space-y-1">
                            <p className="text-[11px] font-bold text-gray-400 uppercase">COMPLETION RATE</p>
                            <h3 className="text-xl sm:text-2xl font-black text-forest">{data?.overview?.avgCompletionRate || '89.2%'}</h3>
                            <p className="text-[10px] text-emerald-700 font-bold">2.4x higher than web forms</p>
                        </div>
                        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-xs space-y-1">
                            <p className="text-[11px] font-bold text-gray-400 uppercase">ENDPOINT STATUS</p>
                            <h3 className="text-sm font-black text-forest truncate">Active (v3.0)</h3>
                            <p className="text-[10px] text-gray-400 font-mono truncate">SSL &amp; AES-128 Encrypted</p>
                        </div>
                    </div>

                    {/* ══ Flow Cards ═════════════════════════════════════ */}
                    <div className="space-y-4">
                        <h3 className="font-black text-forest text-base sm:text-lg">Configured WhatsApp Flows</h3>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {data?.flows?.map((flow: any) => {
                                const isPublished = flow.status === 'PUBLISHED';
                                return (
                                    <div key={flow._id || flow.flowId} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between space-y-4">
                                        <div>
                                            <div className="flex items-start justify-between gap-3 mb-2">
                                                <div>
                                                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-mono">
                                                        {flow.flowId}
                                                    </span>
                                                    <h4 className="font-extrabold text-forest text-base mt-1 leading-snug">
                                                        {flow.name}
                                                    </h4>
                                                </div>
                                                <button 
                                                    onClick={() => handleToggleFlow(flow._id)}
                                                    className={`text-xs font-black px-2.5 py-1 rounded-full border transition shrink-0 ${
                                                        isPublished 
                                                            ? 'bg-[#E8F8EE] text-emerald-800 border-emerald-200' 
                                                            : 'bg-amber-50 text-amber-700 border-amber-200'
                                                    }`}>
                                                    {isPublished ? '● Published' : 'Draft'}
                                                </button>
                                            </div>

                                            <p className="text-xs text-gray-500 font-medium leading-relaxed">
                                                {flow.description}
                                            </p>

                                            {/* Screens Preview */}
                                            <div className="mt-4 p-3 bg-gray-50 rounded-xl space-y-1.5 border border-gray-100">
                                                <p className="text-[11px] font-bold text-forest flex items-center gap-1.5">
                                                    <Layers size={13} /> {flow.screensCount || flow.screens?.length} Interactive Screen(s):
                                                </p>
                                                {flow.screens?.map((scr: any, idx: number) => (
                                                    <div key={idx} className="text-xs text-gray-600 flex items-center gap-2 pl-2">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-forest"></span>
                                                        <span className="font-semibold text-gray-800">{scr.title}</span>
                                                        <span className="text-[10px] text-gray-400">({scr.fields?.length || 2} fields)</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Bottom Action Row */}
                                        <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                                            <span className="font-bold text-gray-500">
                                                <strong>{flow.submissions?.length || flow.submissionsCount || 0}</strong> Captured Leads
                                            </span>
                                            
                                            <button 
                                                onClick={() => setTestFlow(flow)}
                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#D6F35A] hover:bg-[#cbf03f] text-[#0E3B26] font-extrabold rounded-lg shadow-2xs transition">
                                                <Smartphone size={14} /> Test Flow in App
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* ══ Recent Submissions Captured via Flow ═══════════ */}
                    <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-black text-forest text-base sm:text-lg">Recent WhatsApp Flow Submissions</h3>
                                <p className="text-xs text-gray-400 font-medium mt-0.5">Live leads captured directly from buyers smartphones</p>
                            </div>
                        </div>

                        <div className="overflow-x-auto -mx-4 sm:mx-0">
                            <table className="w-full text-left border-collapse min-w-[700px]">
                                <thead>
                                    <tr className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-200 bg-gray-50/50">
                                        <th className="py-3 px-4">Customer &amp; Company</th>
                                        <th className="py-3 px-4">Phone Number</th>
                                        <th className="py-3 px-4">Grade &amp; Tonnage</th>
                                        <th className="py-3 px-4">Delivery Port</th>
                                        <th className="py-3 px-4 text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-xs sm:text-sm">
                                    {data?.flows?.flatMap((f: any) => f.submissions || []).map((sub: any, idx: number) => (
                                        <tr key={idx} className="hover:bg-gray-50/80 transition-colors">
                                            <td className="py-4 px-4 font-bold text-forest">
                                                <div>
                                                    <p>{sub.customerName || 'Verified Buyer'}</p>
                                                    <p className="text-[11px] text-gray-400">{sub.company}</p>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 font-mono text-xs text-gray-600">
                                                {sub.customerPhone}
                                            </td>
                                            <td className="py-4 px-4 font-bold text-forest">
                                                {sub.answers?.polymer_grade || sub.answers?.product_interest || 'HDPE B56003'} • {sub.answers?.tonnage ? `${sub.answers.tonnage} MT` : 'Sample'}
                                            </td>
                                            <td className="py-4 px-4 text-gray-600 font-medium">
                                                {sub.answers?.delivery_hub || 'Ex-Kandla Port'}
                                            </td>
                                            <td className="py-4 px-4 text-right">
                                                <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#E8F8EE] text-emerald-800 border border-emerald-200">
                                                    {sub.status || 'Quote Sent'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* ── Modal: Interactive WhatsApp Flow Simulator ────── */}
                {testFlow && (
                    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
                        <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden border border-gray-300 animate-in fade-in zoom-in duration-200">
                            {/* WhatsApp Header Mockup */}
                            <div className="bg-[#075E54] text-white p-4 flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs">
                                        ZP
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm leading-tight">Zenvista Polymers</p>
                                        <p className="text-[10px] text-emerald-200">WhatsApp Flow Form</p>
                                    </div>
                                </div>
                                <button onClick={() => setTestFlow(null)} className="text-white/80 hover:text-white">
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Simulated Flow Form Body */}
                            <form onSubmit={handleSimulatedSubmit} className="p-5 space-y-4">
                                <div className="text-center pb-2 border-b border-gray-100">
                                    <h4 className="font-black text-forest text-sm">{testFlow.name}</h4>
                                    <p className="text-[11px] text-gray-400 mt-0.5">Fill details to receive instant quotation</p>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-forest uppercase mb-1">Company Name</label>
                                    <input 
                                        type="text" 
                                        value={testCompany} 
                                        onChange={(e) => setTestCompany(e.target.value)} 
                                        className="w-full border border-gray-300 p-2 rounded-lg text-xs outline-none focus:ring-1 focus:ring-forest"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-forest uppercase mb-1">Select Grade</label>
                                    <select 
                                        value={testGrade} 
                                        onChange={(e) => setTestGrade(e.target.value)}
                                        className="w-full border border-gray-300 p-2 rounded-lg text-xs outline-none focus:ring-1 focus:ring-forest bg-white">
                                        <option value="HDPE Blow Molding Grade (B56003)">HDPE Blow Molding (B56003)</option>
                                        <option value="PP Homopolymer Injection (H110MA)">PP Homopolymer Injection (H110MA)</option>
                                        <option value="LLDPE Film Grade (010F18A)">LLDPE Film Grade (010F18A)</option>
                                        <option value="PVC Resin Suspension (K-67)">PVC Resin Suspension (K-67)</option>
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block text-[11px] font-bold text-forest uppercase mb-1">Required MT</label>
                                        <input 
                                            type="number" 
                                            value={testTonnage} 
                                            onChange={(e) => setTestTonnage(e.target.value)} 
                                            className="w-full border border-gray-300 p-2 rounded-lg text-xs outline-none focus:ring-1 focus:ring-forest"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-forest uppercase mb-1">Delivery Hub</label>
                                        <select 
                                            value={testHub} 
                                            onChange={(e) => setTestHub(e.target.value)}
                                            className="w-full border border-gray-300 p-2 rounded-lg text-xs outline-none focus:ring-1 focus:ring-forest bg-white">
                                            <option value="Kandla Port Warehouse">Kandla Port</option>
                                            <option value="Mundra Port Depot">Mundra Port</option>
                                            <option value="Ahmedabad FOT">Ahmedabad FOT</option>
                                        </select>
                                    </div>
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={isSubmittingTest}
                                    className="w-full py-2.5 bg-[#075E54] hover:bg-[#128C7E] text-white font-black text-xs rounded-xl shadow transition flex items-center justify-center gap-1.5 disabled:opacity-50">
                                    {isSubmittingTest ? 'Sending to ZenWA...' : 'Submit Flow Response ✓'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* ── Modal: Create Flow ────────────────────────────── */}
                {isCreateModalOpen && (
                    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
                        <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-gray-200">
                            <div className="p-5 border-b border-[#184d33] flex justify-between items-center bg-forest text-white">
                                <h3 className="font-black text-base flex items-center gap-2">
                                    <Workflow size={18} className="text-lime" /> Create WhatsApp Flow
                                </h3>
                                <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-300 hover:text-white">
                                    <X size={18} />
                                </button>
                            </div>
                            <form onSubmit={handleCreateFlow} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-forest uppercase mb-1">Flow Name *</label>
                                    <input 
                                        type="text" 
                                        required 
                                        placeholder="e.g. Bulk PVC Pipe Resin Order Form" 
                                        value={newFlowName}
                                        onChange={(e) => setNewFlowName(e.target.value)}
                                        className="w-full border border-gray-300 p-2.5 rounded-lg text-xs outline-none focus:ring-2 focus:ring-lime"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-forest uppercase mb-1">Category</label>
                                    <select 
                                        value={newFlowCategory}
                                        onChange={(e) => setNewFlowCategory(e.target.value)}
                                        className="w-full border border-gray-300 p-2.5 rounded-lg text-xs outline-none focus:ring-2 focus:ring-lime bg-white">
                                        <option value="LEAD_GENERATION">Lead Generation</option>
                                        <option value="ORDER_MANAGEMENT">Order Management</option>
                                        <option value="CUSTOMER_SUPPORT">Customer Support</option>
                                        <option value="SURVEY">Feedback &amp; Survey</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-forest uppercase mb-1">Description</label>
                                    <textarea 
                                        rows={3}
                                        placeholder="Explain what this interactive flow collects from WhatsApp buyers..."
                                        value={newFlowDesc}
                                        onChange={(e) => setNewFlowDesc(e.target.value)}
                                        className="w-full border border-gray-300 p-2.5 rounded-lg text-xs outline-none focus:ring-2 focus:ring-lime"
                                    />
                                </div>
                                <div className="pt-3 border-t flex justify-end gap-2.5">
                                    <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2 font-bold text-xs text-gray-600 hover:bg-gray-100 rounded-lg">
                                        Cancel
                                    </button>
                                    <button type="submit" disabled={isSubmittingCreate} className="px-5 py-2.5 font-black text-xs bg-forest text-lime rounded-lg hover:bg-forest-light transition shadow flex items-center gap-1.5">
                                        Publish to Meta Cloud ✓
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
