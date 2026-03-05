'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useIdentity } from '@/lib/identity';
import BottomTabBar from '@/components/BottomTabBar';
import MachineCard from '@/components/MachineCard';
import type { MachineStatus } from '@/types';

export default function LaundryPage() {
    const router = useRouter();
    const { identity, isLoaded } = useIdentity();
    const [machines, setMachines] = useState<MachineStatus[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        if (isLoaded && !identity) {
            router.replace('/');
        }
    }, [isLoaded, identity, router]);

    const fetchStatus = useCallback(async () => {
        if (!identity) return;
        try {
            const res = await fetch(`/api/laundry/status?groupId=${identity.groupId}`);
            if (res.ok) {
                const data = await res.json();
                setMachines(data.machines || []);
            }
        } catch {
            // Use empty state
        }
        setLoading(false);
    }, [identity]);

    useEffect(() => {
        fetchStatus();
        const interval = setInterval(fetchStatus, 5000);
        return () => clearInterval(interval);
    }, [fetchStatus]);

    const handleCheckIn = async (machine: string) => {
        if (!identity) return;
        setActionLoading(true);
        try {
            await fetch('/api/laundry/checkin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ machine, userId: identity.userId, groupId: identity.groupId }),
            });
            await fetchStatus();
        } catch { /* handled */ }
        setActionLoading(false);
    };

    const handleUpdate = async (sessionId: string, newState: string) => {
        setActionLoading(true);
        try {
            await fetch('/api/laundry/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId, newState }),
            });
            await fetchStatus();
        } catch { /* handled */ }
        setActionLoading(false);
    };

    const handleCheckOut = async (sessionId: string) => {
        setActionLoading(true);
        try {
            await fetch('/api/laundry/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId }),
            });
            await fetchStatus();
        } catch { /* handled */ }
        setActionLoading(false);
    };

    const handleNotify = async (sessionId: string) => {
        setActionLoading(true);
        try {
            await fetch('/api/laundry/notify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId }),
            });
            await fetchStatus();
        } catch { /* handled */ }
        setActionLoading(false);
    };

    if (!isLoaded || !identity) return null;

    const washer = machines.find((m) => m.machine === 'washer') || {
        machine: 'washer' as const,
        state: 'free' as const,
    };
    const dryer = machines.find((m) => m.machine === 'dryer') || {
        machine: 'dryer' as const,
        state: 'free' as const,
    };

    return (
        <div className="page-container">
            <h1 className="page-title">Laundry</h1>
            <p className="page-subtitle">Check machine status and manage your laundry</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {loading ? (
                    <>
                        <div className="skeleton" style={{ height: 160 }} />
                        <div className="skeleton" style={{ height: 160 }} />
                    </>
                ) : (
                    <>
                        <div className="animate-fade-in-up">
                            <MachineCard
                                status={washer}
                                currentUserId={identity.userId}
                                onCheckIn={() => handleCheckIn('washer')}
                                onUpdate={(s) => washer.session && handleUpdate(washer.session.id, s)}
                                onCheckOut={() => washer.session && handleCheckOut(washer.session.id)}
                                onNotify={() => washer.session && handleNotify(washer.session.id)}
                                isLoading={actionLoading}
                            />
                        </div>
                        <div className="animate-fade-in-up stagger-2">
                            <MachineCard
                                status={dryer}
                                currentUserId={identity.userId}
                                onCheckIn={() => handleCheckIn('dryer')}
                                onUpdate={(s) => dryer.session && handleUpdate(dryer.session.id, s)}
                                onCheckOut={() => dryer.session && handleCheckOut(dryer.session.id)}
                                onNotify={() => dryer.session && handleNotify(dryer.session.id)}
                                isLoading={actionLoading}
                            />
                        </div>
                    </>
                )}
            </div>

            <BottomTabBar />
        </div>
    );
}
