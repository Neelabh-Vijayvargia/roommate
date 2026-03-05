'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useIdentity } from '@/lib/identity';
import BottomTabBar from '@/components/BottomTabBar';
import type { MachineStatus } from '@/types';

interface DishCooldown {
    userId: string;
    name: string;
    cooldownRemaining: string | null;
}

export default function DashboardPage() {
    const router = useRouter();
    const { identity, isLoaded, clearIdentity } = useIdentity();
    const [machines, setMachines] = useState<MachineStatus[]>([]);
    const [dishCooldowns, setDishCooldowns] = useState<DishCooldown[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isLoaded && !identity) {
            router.replace('/');
        }
    }, [isLoaded, identity, router]);

    const fetchData = useCallback(async () => {
        if (!identity) return;
        try {
            const [laundryRes, dishesRes] = await Promise.all([
                fetch(`/api/laundry/status?groupId=${identity.groupId}`),
                fetch(`/api/dishes/status?groupId=${identity.groupId}`),
            ]);
            if (laundryRes.ok) {
                const data = await laundryRes.json();
                setMachines(data.machines || []);
            }
            if (dishesRes.ok) {
                const data = await dishesRes.json();
                setDishCooldowns(data.cooldowns || []);
            }
        } catch {
            // Use empty state
        }
        setLoading(false);
    }, [identity]);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 10000);
        return () => clearInterval(interval);
    }, [fetchData]);

    if (!isLoaded || !identity) return null;

    function getStatusDisplay(machine: MachineStatus) {
        if (machine.state === 'free') {
            return { label: 'Free', color: 'var(--accent-green)' };
        }
        return {
            label: `In Use — ${machine.occupant || 'Someone'}`,
            color: 'var(--accent-red)',
        };
    }

    const washer = machines.find((m) => m.machine === 'washer') || { machine: 'washer' as const, state: 'free' as const };
    const dryer = machines.find((m) => m.machine === 'dryer') || { machine: 'dryer' as const, state: 'free' as const };
    const washerStatus = getStatusDisplay(washer);
    const dryerStatus = getStatusDisplay(dryer);

    const activeDishReports = dishCooldowns.filter((c) => c.cooldownRemaining !== null).length;

    return (
        <div className="page-container">
            {/* Header */}
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 28,
                }}
            >
                <div>
                    <h1 className="page-title" style={{ marginBottom: 2 }}>
                        Hey, {identity.userName} 👋
                    </h1>
                    <p className="page-subtitle" style={{ marginBottom: 0 }}>Ion 1308 Dashboard</p>
                </div>
                <button
                    onClick={clearIdentity}
                    style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: 10,
                        padding: '8px 10px',
                        cursor: 'pointer',
                        color: 'var(--text-muted)',
                        fontSize: '0.75rem',
                        transition: 'all 0.2s ease',
                    }}
                    title="Switch user"
                >
                    ⚙️
                </button>
            </div>

            {/* Laundry Card */}
            <div
                className="glass-card animate-fade-in-up"
                style={{ padding: 20, marginBottom: 14, cursor: 'pointer' }}
                onClick={() => router.push('/laundry')}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: '1.4rem' }}>🧺</span>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Laundry</h2>
                    </div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>→</span>
                </div>

                {loading ? (
                    <div style={{ display: 'flex', gap: 10 }}>
                        <div className="skeleton" style={{ flex: 1, height: 52 }} />
                        <div className="skeleton" style={{ flex: 1, height: 52 }} />
                    </div>
                ) : (
                    <div style={{ display: 'flex', gap: 10 }}>
                        {/* Washer mini */}
                        <div
                            style={{
                                flex: 1,
                                padding: '10px 12px',
                                borderRadius: 10,
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.05)',
                            }}
                        >
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Washer
                            </div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: washerStatus.color }}>
                                {washerStatus.label}
                            </div>
                        </div>
                        {/* Dryer mini */}
                        <div
                            style={{
                                flex: 1,
                                padding: '10px 12px',
                                borderRadius: 10,
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.05)',
                            }}
                        >
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Dryer
                            </div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: dryerStatus.color }}>
                                {dryerStatus.label}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Dishes Card */}
            <div
                className="glass-card animate-fade-in-up stagger-2"
                style={{ padding: 20, cursor: 'pointer' }}
                onClick={() => router.push('/dishes')}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: '1.4rem' }}>🍽️</span>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Dishes</h2>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {activeDishReports > 0 && (
                            <span
                                style={{
                                    background: 'var(--gradient-danger)',
                                    color: 'white',
                                    borderRadius: 10,
                                    padding: '2px 8px',
                                    fontSize: '0.7rem',
                                    fontWeight: 700,
                                }}
                            >
                                {activeDishReports}
                            </span>
                        )}
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>→</span>
                    </div>
                </div>

                {loading ? (
                    <div className="skeleton" style={{ height: 40 }} />
                ) : (
                    <div style={{ display: 'flex', gap: 8 }}>
                        {dishCooldowns.map((c) => (
                            <div
                                key={c.userId}
                                style={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: '50%',
                                    background: c.cooldownRemaining
                                        ? 'var(--gradient-danger)'
                                        : 'rgba(255,255,255,0.06)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '0.8rem',
                                    fontWeight: 600,
                                    color: c.cooldownRemaining ? 'white' : 'var(--text-secondary)',
                                    position: 'relative',
                                }}
                                title={c.name}
                            >
                                {c.name.charAt(0)}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <BottomTabBar />
        </div>
    );
}
