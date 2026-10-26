"use client";
import React, { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { 
    Search, Users, Plus, CheckCircle2, RefreshCw, Smartphone, 
    MessageSquare, Building2, MapPin, Tag, MoreVertical, X, 
    Trash2, Edit, PhoneCall, ExternalLink, Filter, Check
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';

export default function ContactsPage() {
    const searchInputRef = useRef<HTMLInputElement>(null);

    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStage, setSelectedStage] = useState("All");
    const [selectedSegment, setSelectedSegment] = useState("All");
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    // Add Contact Modal
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newName, setNewName] = useState("");
    const [newCompany, setNewCompany] = useState("");
    const [newPhone, setNewPhone] = useState("+91 ");
    const [newEmail, setNewEmail] = useState("");
    const [newCity, setNewCity] = useState("Ahmedabad");
    const [newSegment, setNewSegment] = useState("HDPE Blow Molders");
    const [newCapacity, setNewCapacity] = useState("20");
    const [newStage, setNewStage] = useState("Lead");
    const [newNotes, setNewNotes] = useState("");
    const [isSubmittingContact, setIsSubmittingContact] = useState(false);

    const fetchContacts = async () => {
        try {
            setIsRefreshing(true);
            const res = await axios.get('http://localhost:5000/api/contacts', {
                params: {
                    search: searchTerm,
                    stage: selectedStage !== 'All' ? selectedStage : undefined,
                    segment: selectedSegment !== 'All' ? selectedSegment : undefined
                }
            });
            setData(res.data);
        } catch (error) {
            console.error("Error fetching contacts:", error);
            showToast("Failed to fetch CRM contacts.");
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchContacts();
    }, [selectedStage, selectedSegment]);

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3500);
    };

    // Add Contact Submit
    const handleAddContactSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName.trim() || !newPhone.trim() || newPhone.trim() === '+91') {
            showToast("Please enter contact name and valid phone number.");
            return;
        }

        try {
            setIsSubmittingContact(true);
            const res = await axios.post('http://localhost:5000/api/contacts', {
                name: newName.trim(),
                company: newCompany.trim() || 'Independent Manufacturer',
                phone: newPhone.trim(),
                email: newEmail.trim(),
                city: newCity.trim(),
                industrySegment: newSegment,
                monthlyCapacityTons: Number(newCapacity) || 10,
                stage: newStage,
                tags: ['WhatsApp Sync', newSegment.split(' ')[0]],
                notes: newNotes.trim()
            });

            if (res.data.success) {
                showToast(`✓ Contact ${newName} added to CRM!`);
                setIsAddModalOpen(false);
                setNewName("");
                setNewCompany("");
                setNewPhone("+91 ");
                setNewEmail("");
                fetchContacts();
            }
        } catch (error: any) {
            showToast(error.response?.data?.message || "Failed to add contact.");
        } finally {
            setIsSubmittingContact(false);
        }
    };

    // Delete Contact
    const handleDeleteContact = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to remove ${name} from CRM?`)) return;

        try {
            const res = await axios.delete(`http://localhost:5000/api/contacts/${id}`);
            if (res.data.success) {
                showToast(`Contact ${name} deleted.`);
                fetchContacts();
            }
        } catch (error) {
            showToast("Failed to delete contact.");
        }
    };

    // Filter Contacts based on search input
    const filteredContacts = useMemo(() => {
        const list = data?.contacts || [];
        if (!searchTerm.trim()) return list;
        const q = searchTerm.toLowerCase().trim();
        return list.filter((c: any) => 
            c.name.toLowerCase().includes(q) ||
            c.company.toLowerCase().includes(q) ||
            c.phone.toLowerCase().includes(q) ||
            c.city.toLowerCase().includes(q) ||
            c.industrySegment.toLowerCase().includes(q)
        );
    }, [data?.contacts, searchTerm]);

    if (loading && !data) {
        return (
            <div className="flex flex-col md:flex-row h-screen bg-[#F6F7F4] font-sans overflow-hidden w-full">
                <Sidebar />
                <div className="flex-1 flex flex-col items-center justify-center text-forest font-bold gap-3">
                    <div className="w-10 h-10 border-4 border-lime border-t-forest rounded-full animate-spin"></div>
                    <p className="text-sm">Connecting to Zenvista Polymer CRM Database...</p>
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
                            <h2 className="text-base sm:text-lg lg:text-[19px] font-black text-[#0E3B26] tracking-tight leading-snug">
                                Contacts &amp; Polymer Client CRM
                            </h2>
                            <p className="text-[11px] text-gray-400 font-medium">
                                Multi-Channel Buyer Directory • WhatsApp Coexistence Sync Active
                            </p>
                        </div>

                        {/* Controls */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2.5 w-full lg:w-auto">
                            
                            {/* Search */}
                            <div className="relative w-full sm:w-48 md:w-56 lg:w-64">
                                <Search className="absolute left-3 top-2.5 text-gray-400" size={14} />
                                <input 
                                    ref={searchInputRef}
                                    type="text" 
                                    placeholder="Search buyers, company, city..." 
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
                                    onClick={fetchContacts}
                                    className={`flex items-center justify-center gap-1.5 px-3 py-1.5 border border-gray-200 text-[#0E3B26] bg-white hover:bg-gray-50 rounded-lg shadow-2xs transition text-xs font-bold ${isRefreshing ? 'opacity-60' : ''}`}>
                                    <RefreshCw size={13} className={isRefreshing ? 'animate-spin' : ''} />
                                    <span>Refresh</span>
                                </button>

                                <button 
                                    onClick={() => setIsAddModalOpen(true)}
                                    className="flex items-center justify-center gap-1.5 px-3.5 py-1.5 bg-[#0B3822] hover:bg-[#14472d] text-white font-bold rounded-lg shadow-xs transition text-xs whitespace-nowrap">
                                    <Plus size={14} className="stroke-[2.5]" /> Add Contact
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                {/* ── Main Container ───────────────────────────────── */}
                <div className="p-3.5 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
                    
                    {/* ══ Metrics ════════════════════════════════════════ */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-4">
                        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-xs space-y-1">
                            <p className="text-[11px] font-bold text-gray-400 uppercase">TOTAL CLIENTS</p>
                            <h3 className="text-xl sm:text-2xl font-black text-forest">{data?.overview?.totalContacts || 5}</h3>
                            <p className="text-[10px] text-emerald-600 font-bold">● 100% Phone Verified</p>
                        </div>
                        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-xs space-y-1">
                            <p className="text-[11px] font-bold text-gray-400 uppercase">REPEAT BUYERS</p>
                            <h3 className="text-xl sm:text-2xl font-black text-forest">{data?.overview?.repeatBuyers || 2}</h3>
                            <p className="text-[10px] text-gray-500 font-medium">Regular monthly contracts</p>
                        </div>
                        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-xs space-y-1">
                            <p className="text-[11px] font-bold text-gray-400 uppercase">ACTIVE QUOTATIONS</p>
                            <h3 className="text-xl sm:text-2xl font-black text-forest">{data?.overview?.hotPipeline || 2}</h3>
                            <p className="text-[10px] text-amber-700 font-bold">Negotiation &amp; Spot Offers</p>
                        </div>
                        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-xs space-y-1">
                            <p className="text-[11px] font-bold text-gray-400 uppercase">LIFETIME REVENUE</p>
                            <h3 className="text-xl sm:text-2xl font-black text-forest">{data?.overview?.totalPipelineValue || '₹1,42,40,000'}</h3>
                            <p className="text-[10px] text-emerald-700 font-bold">High LTV Accounts</p>
                        </div>
                    </div>

                    {/* ══ Quick Stage Filter Chips ═══════════════════════ */}
                    <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-bold w-full sm:w-auto">
                            <span className="text-gray-400 mr-1 flex items-center gap-1"><Filter size={13} /> Stage:</span>
                            {['All', 'Repeat Buyer', 'Won', 'Negotiation', 'Quoted', 'Lead'].map((stg) => (
                                <button 
                                    key={stg}
                                    onClick={() => setSelectedStage(stg)}
                                    className={`px-3 py-1.5 rounded-xl transition whitespace-nowrap ${
                                        selectedStage === stg 
                                            ? 'bg-forest text-lime shadow-xs' 
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200/80'
                                    }`}>
                                    {stg}
                                </button>
                            ))}
                        </div>

                        {/* Industry Segment Dropdown */}
                        <div className="flex items-center gap-2 text-xs font-bold text-gray-600">
                            <span>Industry:</span>
                            <select 
                                value={selectedSegment}
                                onChange={(e) => setSelectedSegment(e.target.value)}
                                className="border border-gray-200 bg-gray-50 rounded-lg px-2.5 py-1.5 outline-none focus:ring-1 focus:ring-lime">
                                <option value="All">All Polymer Segments</option>
                                <option value="HDPE Blow Molders">HDPE Blow Molders</option>
                                <option value="PP Injection Molding">PP Injection Molding</option>
                                <option value="PVC Pipe Extruders">PVC Pipe Extruders</option>
                                <option value="Masterbatch Compounders">Masterbatch Compounders</option>
                            </select>
                        </div>
                    </div>

                    {/* ══ Contacts Table ═════════════════════════════════ */}
                    <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-black text-forest text-base sm:text-lg">Polymer Buyer Accounts</h3>
                                <p className="text-xs text-gray-400 font-medium mt-0.5">Showing {filteredContacts.length} verified accounts</p>
                            </div>
                        </div>

                        <div className="overflow-x-auto -mx-4 sm:mx-0">
                            <table className="w-full text-left border-collapse min-w-[780px]">
                                <thead>
                                    <tr className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-200 bg-gray-50/50">
                                        <th className="py-3 px-4">Client Name &amp; Company</th>
                                        <th className="py-3 px-4">WhatsApp Contact</th>
                                        <th className="py-3 px-4">Segment &amp; City</th>
                                        <th className="py-3 px-4">Stage</th>
                                        <th className="py-3 px-4">Capacity / Mo</th>
                                        <th className="py-3 px-4">Total Purchases</th>
                                        <th className="py-3 px-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-xs sm:text-sm">
                                    {filteredContacts.map((contact: any) => {
                                        const isRepeat = contact.stage === 'Repeat Buyer';
                                        const isWon = contact.stage === 'Won';
                                        const isNeg = contact.stage === 'Negotiation';

                                        return (
                                            <tr key={contact._id || contact.phone} className="hover:bg-gray-50/80 transition-colors">
                                                
                                                {/* Client Name & Company */}
                                                <td className="py-4 px-4 font-bold text-forest">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-[#0E3B26] text-white flex items-center justify-center font-black text-xs shrink-0">
                                                            {contact.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="font-extrabold text-forest">{contact.name}</p>
                                                            <p className="text-[11px] text-gray-400 flex items-center gap-1 font-medium">
                                                                <Building2 size={11} /> {contact.company}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* WhatsApp Contact with Link to Inbox */}
                                                <td className="py-4 px-4 font-mono text-xs">
                                                    <div className="space-y-1">
                                                        <span className="text-gray-800 font-bold">{contact.phone}</span>
                                                        <Link 
                                                            href="/inbox" 
                                                            className="flex items-center gap-1 text-[11px] text-emerald-700 hover:text-emerald-900 font-sans font-bold">
                                                            <MessageSquare size={12} /> Open WhatsApp Chat
                                                        </Link>
                                                    </div>
                                                </td>

                                                {/* Segment & City */}
                                                <td className="py-4 px-4">
                                                    <div>
                                                        <p className="font-bold text-forest text-xs">{contact.industrySegment}</p>
                                                        <p className="text-[11px] text-gray-400 flex items-center gap-1">
                                                            <MapPin size={11} /> {contact.city}, {contact.state || 'Gujarat'}
                                                        </p>
                                                    </div>
                                                </td>

                                                {/* Stage */}
                                                <td className="py-4 px-4">
                                                    <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-black ${
                                                        isRepeat ? 'bg-[#0E3B26] text-white' :
                                                        isWon ? 'bg-[#E8F8EE] text-emerald-800 border border-emerald-200' :
                                                        isNeg ? 'bg-[#F4FBDA] text-[#1a5337] border border-[#d4f260]' :
                                                        'bg-gray-100 text-gray-700'
                                                    }`}>
                                                        {contact.stage}
                                                    </span>
                                                </td>

                                                {/* Capacity */}
                                                <td className="py-4 px-4 font-bold text-gray-700">
                                                    {contact.monthlyCapacityTons} MT / mo
                                                </td>

                                                {/* Total Purchases */}
                                                <td className="py-4 px-4 font-black text-forest">
                                                    ₹{contact.lifetimeValue?.toLocaleString() || '0'}
                                                </td>

                                                {/* Action */}
                                                <td className="py-4 px-4 text-right">
                                                    <button 
                                                        onClick={() => handleDeleteContact(contact._id, contact.name)}
                                                        className="p-1 text-gray-300 hover:text-rose-600 transition"
                                                        title="Delete Contact">
                                                        <Trash2 size={15} />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* ── Modal: Add New Contact ────────────────────────── */}
                {isAddModalOpen && (
                    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
                        <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-gray-200 animate-in fade-in zoom-in duration-200">
                            <div className="p-5 border-b border-[#184d33] flex justify-between items-center bg-forest text-white">
                                <div>
                                    <h3 className="font-black text-base flex items-center gap-2">
                                        <Users size={18} className="text-lime" /> Add Polymer Client to CRM
                                    </h3>
                                    <p className="text-[11px] text-lime-soft opacity-85 mt-0.5">
                                        Instantly syncs with WhatsApp Shared Inbox
                                    </p>
                                </div>
                                <button onClick={() => setIsAddModalOpen(false)} className="text-gray-300 hover:text-white p-1">
                                    <X size={18} />
                                </button>
                            </div>

                            <form onSubmit={handleAddContactSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-forest uppercase mb-1">Buyer Name *</label>
                                        <input 
                                            type="text" 
                                            required 
                                            placeholder="e.g. Mukesh Mehta"
                                            value={newName} 
                                            onChange={(e) => setNewName(e.target.value)} 
                                            className="w-full border border-gray-300 p-2.5 rounded-lg text-xs outline-none focus:ring-2 focus:ring-lime"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-forest uppercase mb-1">Company Name</label>
                                        <input 
                                            type="text" 
                                            placeholder="e.g. Reliance Plastotech"
                                            value={newCompany} 
                                            onChange={(e) => setNewCompany(e.target.value)} 
                                            className="w-full border border-gray-300 p-2.5 rounded-lg text-xs outline-none focus:ring-2 focus:ring-lime"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-forest uppercase mb-1">WhatsApp Phone *</label>
                                        <input 
                                            type="text" 
                                            required 
                                            placeholder="+91 98XXX XXXXX"
                                            value={newPhone} 
                                            onChange={(e) => setNewPhone(e.target.value)} 
                                            className="w-full border border-gray-300 p-2.5 rounded-lg text-xs outline-none focus:ring-2 focus:ring-lime font-mono"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-forest uppercase mb-1">Email Address</label>
                                        <input 
                                            type="email" 
                                            placeholder="purchase@company.com"
                                            value={newEmail} 
                                            onChange={(e) => setNewEmail(e.target.value)} 
                                            className="w-full border border-gray-300 p-2.5 rounded-lg text-xs outline-none focus:ring-2 focus:ring-lime"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-forest uppercase mb-1">Industry Segment</label>
                                        <select 
                                            value={newSegment} 
                                            onChange={(e) => setNewSegment(e.target.value)}
                                            className="w-full border border-gray-300 p-2.5 rounded-lg text-xs outline-none focus:ring-2 focus:ring-lime bg-white">
                                            <option value="HDPE Blow Molders">HDPE Blow Molders</option>
                                            <option value="PP Injection Molding">PP Injection Molding</option>
                                            <option value="PVC Pipe Extruders">PVC Pipe Extruders</option>
                                            <option value="Masterbatch Compounders">Masterbatch Compounders</option>
                                            <option value="General Polymers">General Polymers</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-forest uppercase mb-1">Monthly Capacity (MT)</label>
                                        <input 
                                            type="number" 
                                            value={newCapacity} 
                                            onChange={(e) => setNewCapacity(e.target.value)} 
                                            className="w-full border border-gray-300 p-2.5 rounded-lg text-xs outline-none focus:ring-2 focus:ring-lime"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-forest uppercase mb-1">City</label>
                                        <input 
                                            type="text" 
                                            value={newCity} 
                                            onChange={(e) => setNewCity(e.target.value)} 
                                            className="w-full border border-gray-300 p-2.5 rounded-lg text-xs outline-none focus:ring-2 focus:ring-lime"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-forest uppercase mb-1">CRM Stage</label>
                                        <select 
                                            value={newStage} 
                                            onChange={(e) => setNewStage(e.target.value)}
                                            className="w-full border border-gray-300 p-2.5 rounded-lg text-xs outline-none focus:ring-2 focus:ring-lime bg-white">
                                            <option value="Lead">Lead</option>
                                            <option value="Quoted">Quoted</option>
                                            <option value="Negotiation">Negotiation</option>
                                            <option value="Won">Won</option>
                                            <option value="Repeat Buyer">Repeat Buyer</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-forest uppercase mb-1">Client Notes</label>
                                    <textarea 
                                        rows={2}
                                        placeholder="Add delivery terms, preferred ports, payment habits..."
                                        value={newNotes} 
                                        onChange={(e) => setNewNotes(e.target.value)} 
                                        className="w-full border border-gray-300 p-2.5 rounded-lg text-xs outline-none focus:ring-2 focus:ring-lime"
                                    />
                                </div>

                                <div className="pt-3 border-t flex justify-end gap-2.5">
                                    <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 font-bold text-xs text-gray-600 hover:bg-gray-100 rounded-lg">
                                        Cancel
                                    </button>
                                    <button type="submit" disabled={isSubmittingContact} className="px-5 py-2.5 font-black text-xs bg-forest text-lime rounded-lg hover:bg-forest-light transition shadow flex items-center gap-1.5 disabled:opacity-50">
                                        Save Client to CRM ✓
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
