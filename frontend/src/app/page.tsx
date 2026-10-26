"use client";
import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import Sidebar from '@/components/Sidebar';
import DashboardContent from '@/components/dashboard/DashboardContent';

export default function DashboardPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

    const fetchDashboardData = useCallback(async (params?: { search?: string; startDate?: string; endDate?: string; stage?: string }) => {
        try {
            setIsRefreshing(true);
            const res = await axios.get('http://localhost:5000/api/dashboard', {
                params: params || {}
            });
            setData(res.data);
            setLastUpdated(new Date());
        } catch (err) {
            console.error("Error fetching dashboard data:", err);
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    if (loading && !data) {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-neutral-soft text-forest font-bold gap-4 p-4 text-center">
                <div className="w-12 h-12 border-4 border-lime border-t-forest rounded-full animate-spin"></div>
                <div>
                    <p className="text-lg font-black tracking-wide text-forest">ZENVISTA POLYMERS</p>
                    <p className="text-xs text-gray-500 font-medium mt-1">Connecting to ZenWA Live Cockpit...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col md:flex-row h-screen bg-neutral-soft font-sans overflow-hidden w-full min-w-0">
            <Sidebar />
            <DashboardContent 
                data={data} 
                setData={setData}
                onRefresh={fetchDashboardData}
                isRefreshing={isRefreshing}
                lastUpdated={lastUpdated}
            />
        </div>
    );
}
