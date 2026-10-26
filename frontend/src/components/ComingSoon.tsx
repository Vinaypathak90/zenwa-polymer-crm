"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Sparkles, Bell, ArrowRight, MessageSquare, LayoutDashboard } from 'lucide-react';

interface ComingSoonProps {
    title: string;
    tagline: string;
    description: string;
    highlights: string[];
    icon: React.ReactNode;
    badge?: string;
}

export default function ComingSoon({
    title,
    tagline,
    description,
    highlights,
    icon,
    badge = "Coming Soon"
}: ComingSoonProps) {
    const [notified, setNotified] = useState(false);
    const [email, setEmail] = useState("");

    const handleNotify = (e: React.FormEvent) => {
        e.preventDefault();
        setNotified(true);
        setTimeout(() => setNotified(false), 4000);
        setEmail("");
    };

    return (
        <main className="flex-1 flex flex-col h-full overflow-y-auto bg-[#F6F7F4] font-sans text-gray-800 w-full">
            {/* Top Bar */}
            <header className="bg-white px-3.5 sm:px-6 py-3 border-b border-gray-200 flex items-center justify-between shadow-2xs shrink-0 w-full">
                <div className="flex items-center gap-2 sm:gap-3">
                    <Link 
                        href="/" 
                        className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-600 transition flex items-center gap-1 text-xs font-bold">
                        <ArrowLeft size={15} /> <span className="hidden sm:inline">Cockpit</span>
                    </Link>
                    <div className="h-4 w-[1px] bg-gray-300"></div>
                    <h2 className="text-sm sm:text-base font-extrabold text-forest truncate max-w-[150px] sm:max-w-none">{title}</h2>
                </div>

                <div className="flex items-center gap-2">
                    <Link 
                        href="/inbox" 
                        className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 border border-gray-200 bg-white text-forest text-xs font-bold rounded-lg hover:bg-gray-50 transition shadow-2xs">
                        <MessageSquare size={13} /> <span className="hidden sm:inline">Shared</span> Inbox
                    </Link>
                    <Link 
                        href="/" 
                        className="flex items-center gap-1 px-3 sm:px-3.5 py-1.5 bg-lime text-forest text-xs font-black rounded-lg hover:bg-[#cbf03f] transition shadow-2xs">
                        <LayoutDashboard size={13} /> Cockpit
                    </Link>
                </div>
            </header>

            {/* Main Hero Container */}
            <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
                <div className="max-w-2xl w-full bg-white rounded-3xl border border-gray-200 p-6 sm:p-12 shadow-xl text-center relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    
                    {/* Background Glow */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-lime/25 blur-3xl rounded-full pointer-events-none"></div>

                    {/* Feature Icon */}
                    <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-3xl bg-forest text-lime flex items-center justify-center shadow-lg border-2 border-lime mb-5 relative">
                        {icon}
                        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-lime rounded-full animate-ping"></span>
                    </div>

                    {/* Badges */}
                    <div className="inline-flex items-center gap-1.5 bg-lime-soft border border-lime text-forest font-black text-[11px] sm:text-xs px-3 py-1 rounded-full uppercase tracking-wider mb-3">
                        <Sparkles size={13} className="text-lime-700" />
                        {badge}
                    </div>

                    {/* Headings */}
                    <h1 className="text-xl sm:text-3xl font-black text-forest tracking-tight">
                        {title}
                    </h1>
                    <p className="text-xs sm:text-sm font-bold text-gray-500 mt-1">
                        {tagline}
                    </p>

                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed max-w-lg mx-auto mt-3 font-medium">
                        {description}
                    </p>

                    {/* Highlights Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 my-6 sm:my-8 text-left">
                        {highlights.map((item, idx) => (
                            <div key={idx} className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs space-y-1">
                                <span className="w-5 h-5 rounded-md bg-lime text-forest font-bold text-[10px] flex items-center justify-center mb-1">
                                    0{idx + 1}
                                </span>
                                <p className="font-extrabold text-forest text-xs">{item.split(' - ')[0]}</p>
                                <p className="text-[11px] text-gray-500 leading-tight">
                                    {item.split(' - ')[1] || item}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Notification Alert or Success */}
                    {notified ? (
                        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2">
                            <CheckCircle2 size={16} className="text-emerald-600" />
                            You are on the priority early-access list! We'll notify you upon release.
                        </div>
                    ) : (
                        <form onSubmit={handleNotify} className="max-w-md mx-auto flex gap-2">
                            <input 
                                type="email" 
                                required
                                placeholder="Enter work email for early access..." 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="flex-1 border border-gray-300 rounded-xl px-3.5 py-2 text-xs outline-none focus:ring-2 focus:ring-lime bg-gray-50 focus:bg-white transition"
                            />
                            <button 
                                type="submit" 
                                className="px-3.5 sm:px-4 py-2 bg-forest hover:bg-forest-light text-lime text-xs font-black rounded-xl shadow transition flex items-center gap-1.5 shrink-0">
                                <Bell size={13} /> Notify Me
                            </button>
                        </form>
                    )}

                    {/* Back Link */}
                    <div className="mt-6 sm:mt-8 pt-5 border-t border-gray-100 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs font-bold text-gray-500">
                        <Link href="/" className="hover:text-forest flex items-center gap-1">
                            ← Return to Cockpit
                        </Link>
                        <span>•</span>
                        <Link href="/inbox" className="hover:text-forest flex items-center gap-1">
                            Open Shared Inbox <ArrowRight size={13} />
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}
