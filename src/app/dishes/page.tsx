'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useIdentity } from '@/lib/identity';
import BottomTabBar from '@/components/BottomTabBar';
import RoommateCard from '@/components/RoommateCard';

interface DishCooldown {
    userId: string;
    name: string;
    cooldownRemaining: string | null;
}

export default function DishesPage() {
    const router = useRouter();
    const { identity, isLoaded } = useIdentity();
    const [cooldowns, setCooldowns] = useState<DishCooldown[]>([]);
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
            const res = await fetch(`/api/dishes/status?groupId=${identity.groupId}`);
            if (res.ok) {
                const data = await res.json();
                setCooldowns(data.cooldowns || []);
            }
        } catch {
            // Use empty state
        }
        setLoading(false);
    }, [identity]);

    useEffect(() => {
        fetchStatus();
        const interval = setInterval(fetchStatus, 10000);
        return () => clearInterval(interval);
    }, [fetchStatus]);

    const handleNotify = async (reportedUserId: string) => {
        if (!identity) return;
        setActionLoading(true);
        try {
            await fetch('/api/dishes/notify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reportedUserId, groupId: identity.groupId }),
            });
            await fetchStatus();
        } catch { /* handled */ }
        setActionLoading(false);
    };

    if (!isLoaded || !identity) return null;

    return (
        <div className="page-container">
            <h1 className="page-title">Dishes</h1>
            <p className="page-subtitle">Send an anonymous reminder to clean up</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="skeleton" style={{ height: 72 }} />
                    ))
                ) : (
                    cooldowns.map((c, i) => (
                        <div key={c.userId} className={`animate-fade-in-up stagger-${i + 1}`}>
                            <RoommateCard
                                name={c.name}
                                userId={c.userId}
                                canNotify={c.cooldownRemaining === null}
                                cooldownRemaining={c.cooldownRemaining}
                                onNotify={() => handleNotify(c.userId)}
                                isLoading={actionLoading}
                                isCurrentUser={c.userId === identity.userId}
                            />
                        </div>
                    ))
                )}
            </div>

            <BottomTabBar />
        </div>
    );
}
