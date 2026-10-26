"use client";
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
    LayoutDashboard, MessageSquare, Bot, Megaphone, 
    Workflow, Users, Settings, ChevronLeft, ChevronRight, Menu, X,
    Smartphone, MoreVertical
} from 'lucide-react';

export default function Sidebar() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const pathname = usePathname();

    const menuItems = [
        { name: 'Analytics', href: '/', icon: <LayoutDashboard size={20} />, badge: null },
        { name: 'Shared Inbox', href: '/inbox', icon: <MessageSquare size={20} />, badge: '24' },
        { name: 'AI Agent Studio', href: '/ai-agent', icon: <Bot size={20} />, badge: 'Live' },
        { name: 'Broadcasts', href: '/broadcasts', icon: <Megaphone size={20} />, badge: null },
        { name: 'WhatsApp Flows', href: '/flows', icon: <Workflow size={20} />, badge: null },
        { name: 'Contacts & CRM', href: '/contacts', icon: <Users size={20} />, badge: null },
        { name: 'Coexistence Setup', href: '/coexistence', icon: <Settings size={20} />, badge: 'Sync' },
    ];

    return (
        <>
            {/* ── Mobile Header Bar (Full width, top of screen on mobile) ── */}
            <div className="md:hidden flex items-center justify-between bg-forest text-white px-4 py-3 shrink-0 w-full shadow-sm z-30">
                <Link href="/" className="flex items-center gap-2.5 font-bold text-base">
                    <div className="w-8 h-8 bg-lime text-forest flex items-center justify-center rounded-lg font-black text-sm shadow-sm">Z</div>
                    <div className="flex items-center gap-2">
                        <span className="font-extrabold tracking-tight">ZenWA</span>
                        <span className="text-[10px] text-lime-soft bg-forest-light px-2 py-0.5 rounded-full font-semibold border border-[#1d593b]">Forest</span>
                    </div>
                </Link>
                <button 
                    onClick={() => setIsMobileOpen(!isMobileOpen)}
                    className="p-1.5 rounded-lg hover:bg-forest-light text-white transition focus:outline-none focus:ring-1 focus:ring-lime"
                    aria-label="Toggle Navigation Menu">
                    {isMobileOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
            </div>

            {/* ── Sidebar Container (Slide-over drawer on mobile, static column on desktop) ── */}
            <aside className={`
                fixed md:static inset-y-0 left-0 h-screen bg-forest text-white transition-transform duration-300 ease-in-out z-50 flex flex-col border-r border-[#15462f] shadow-2xl md:shadow-none
                ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} 
                ${isCollapsed ? 'md:w-20' : 'w-64'}
            `}>
                {/* Brand Header */}
                <div className="p-4 flex items-center justify-between border-b border-[#174f33]">
                    {!isCollapsed && (
                        <Link href="/" onClick={() => setIsMobileOpen(false)} className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-lime text-forest flex items-center justify-center rounded-lg font-bold shadow-sm">Z</div>
                            <div>
                                <h1 className="font-bold text-lg leading-tight">ZenWA</h1>
                                <p className="text-xs text-lime-soft opacity-80">Forest Edition</p>
                            </div>
                        </Link>
                    )}
                    {isCollapsed && (
                        <Link href="/" onClick={() => setIsMobileOpen(false)} className="w-8 h-8 mx-auto bg-lime text-forest flex items-center justify-center rounded-lg font-bold">
                            Z
                        </Link>
                    )}
                    
                    {/* Desktop Collapse Toggle */}
                    <button 
                        className="hidden md:block hover:bg-forest-light p-1.5 rounded-lg text-gray-300 hover:text-white transition" 
                        onClick={() => setIsCollapsed(!isCollapsed)}>
                        {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                    </button>

                    {/* Mobile Close Button */}
                    <button 
                        className="md:hidden hover:bg-forest-light p-1.5 rounded-lg text-gray-300 hover:text-white" 
                        onClick={() => setIsMobileOpen(false)}>
                        <X size={20} />
                    </button>
                </div>

                {/* Nav Menu */}
                <div className="flex-1 mt-4 px-3 space-y-1.5 overflow-y-auto">
                    {menuItems.map((item, idx) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link 
                                key={idx} 
                                href={item.href}
                                onClick={() => setIsMobileOpen(false)}
                                className={`
                                    flex items-center justify-between p-2.5 rounded-xl transition-all cursor-pointer text-sm
                                    ${isActive ? 'bg-lime text-forest font-bold shadow-md' : 'hover:bg-forest-light text-gray-300 hover:text-white font-medium'}
                                `}>
                                <div className="flex items-center gap-3">
                                    {item.icon}
                                    {(!isCollapsed || isMobileOpen) && <span>{item.name}</span>}
                                </div>
                                {(!isCollapsed || isMobileOpen) && item.badge && (
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isActive ? 'bg-black text-lime' : 'bg-forest-light text-gray-200'}`}>
                                        {item.badge}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </div>

                {/* ── Bottom Coexistence Status Card (from screenshot) ── */}
                {(!isCollapsed || isMobileOpen) && (
                    <div className="mx-3 mb-2 p-2.5 bg-[#174F33] rounded-xl border border-[#276e4a] flex items-center gap-2.5 shadow-xs">
                        <div className="w-7 h-7 rounded-lg bg-[#216140] flex items-center justify-center text-lime shrink-0">
                            <Smartphone size={15} />
                        </div>
                        <div className="overflow-hidden">
                            <p className="font-extrabold text-xs text-white leading-tight">Coexistence Active</p>
                            <p className="text-[10px] text-lime-soft font-medium leading-tight">Phone & Cloud API Live</p>
                        </div>
                    </div>
                )}

                {/* Bottom User Profile */}
                <div className="p-3 bg-forest-light m-3 mt-1 rounded-xl flex items-center justify-between border border-[#1b5a3b]">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                        <div className="w-8 h-8 bg-lime text-forest font-bold flex items-center justify-center rounded-full text-xs shadow-inner shrink-0">HV</div>
                        {(!isCollapsed || isMobileOpen) && (
                            <div className="overflow-hidden">
                                <p className="font-semibold text-xs text-white truncate">Harsh Vardhan</p>
                                <p className="text-[10px] text-lime-soft opacity-85 truncate">Owner (Shivam Organics)</p>
                            </div>
                        )}
                    </div>
                    {(!isCollapsed || isMobileOpen) && (
                        <MoreVertical size={16} className="text-gray-400 hover:text-white cursor-pointer shrink-0" />
                    )}
                </div>
            </aside>
            
            {/* ── Mobile Backdrop Overlay ── */}
            {isMobileOpen && (
                <div 
                    className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-xs animate-in fade-in duration-200" 
                    onClick={() => setIsMobileOpen(false)} 
                />
            )}
        </>
    );
}
