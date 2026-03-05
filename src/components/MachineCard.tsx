'use client';

import type { MachineStatus } from '@/types';

interface MachineCardProps {
    status: MachineStatus;
    currentUserId: string;
    onCheckIn: () => void;
    onUpdate: (newState: string) => void;
    onCheckOut: () => void;
    onNotify: () => void;
    isLoading: boolean;
}

function getStateLabel(state: string, machine: string): string {
    switch (state) {
        case 'free': return 'Available';
        case 'in_use': return 'In Use';
        case 'ready_to_transfer': return machine === 'washer' ? 'Ready to Transfer' : 'Ready';
        case 'done': return 'Done';
        default: return state;
    }
}

function getBadgeClass(state: string): string {
    switch (state) {
        case 'free': return 'badge-free';
        case 'in_use': return 'badge-in-use';
        case 'ready_to_transfer': return 'badge-ready';
        case 'done': return 'badge-done';
        default: return 'badge-free';
    }
}

function getMachineIcon(machine: string): string {
    return machine === 'washer' ? '🧺' : '🌀';
}

function formatElapsed(minutes: number): string {
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${Math.floor(minutes)}m ago`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    return `${hours}h ${mins}m ago`;
}

function getNotificationCooldownMinutes(lastNotification?: { sent_at: string }): number | null {
    if (!lastNotification) return null;
    const sentAt = new Date(lastNotification.sent_at).getTime();
    const now = Date.now();
    const elapsedMin = (now - sentAt) / 60000;
    if (elapsedMin < 60) return Math.floor(elapsedMin);
    return null; // cooldown expired
}

export default function MachineCard({
    status,
    currentUserId,
    onCheckIn,
    onUpdate,
    onCheckOut,
    onNotify,
    isLoading,
}: MachineCardProps) {
    const { machine, state, session, occupant, elapsedMinutes, lastNotification } = status;
    const isOwner = session?.user_id === currentUserId;
    const cooldownMin = getNotificationCooldownMinutes(lastNotification);
    const canNotify = state === 'in_use' && !isOwner && (elapsedMinutes ?? 0) >= 60 && cooldownMin === null;
    const isInCooldown = cooldownMin !== null && state === 'in_use' && !isOwner;

    const glowColor =
        state === 'free'
            ? 'rgba(34, 197, 94, 0.08)'
            : state === 'in_use'
                ? 'rgba(239, 68, 68, 0.08)'
                : state === 'ready_to_transfer'
                    ? 'rgba(245, 158, 11, 0.08)'
                    : 'rgba(139, 92, 246, 0.08)';

    return (
        <div
            className="glass-card-static"
            style={{
                padding: 20,
                background: `linear-gradient(135deg, ${glowColor}, var(--bg-card))`,
            }}
        >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: '1.8rem' }}>{getMachineIcon(machine)}</span>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, textTransform: 'capitalize' }}>
                        {machine}
                    </h3>
                </div>
                <span className={getBadgeClass(state)}>{getStateLabel(state, machine)}</span>
            </div>

            {/* Occupant info */}
            {state !== 'free' && occupant && (
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        marginBottom: 16,
                        padding: '10px 14px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        borderRadius: 10,
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                    }}
                >
                    <div
                        style={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            background: 'var(--gradient-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            color: 'white',
                        }}
                    >
                        {occupant.charAt(0)}
                    </div>
                    <div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{occupant}</div>
                        {elapsedMinutes !== undefined && (
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                {formatElapsed(elapsedMinutes)}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {state === 'free' && (
                    <button className="btn-primary" onClick={onCheckIn} disabled={isLoading} style={{ flex: 1 }}>
                        Check In
                    </button>
                )}

                {state === 'in_use' && isOwner && machine === 'washer' && (
                    <button className="btn-success" onClick={() => onUpdate('ready_to_transfer')} disabled={isLoading} style={{ flex: 1 }}>
                        Mark Ready to Transfer
                    </button>
                )}

                {state === 'in_use' && isOwner && machine === 'dryer' && (
                    <button className="btn-success" onClick={() => onUpdate('done')} disabled={isLoading} style={{ flex: 1 }}>
                        Mark Done
                    </button>
                )}

                {state === 'ready_to_transfer' && isOwner && (
                    <button className="btn-success" onClick={onCheckOut} disabled={isLoading} style={{ flex: 1 }}>
                        Transfer Complete
                    </button>
                )}

                {state === 'done' && isOwner && (
                    <button className="btn-success" onClick={onCheckOut} disabled={isLoading} style={{ flex: 1 }}>
                        Check Out
                    </button>
                )}

                {canNotify && (
                    <button className="btn-danger" onClick={onNotify} disabled={isLoading} style={{ flex: 1 }}>
                        🔔 Notify Them
                    </button>
                )}

                {isInCooldown && (
                    <div
                        style={{
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 6,
                            padding: '10px 16px',
                            background: 'rgba(255, 255, 255, 0.03)',
                            borderRadius: 12,
                            color: 'var(--text-muted)',
                            fontSize: '0.8rem',
                        }}
                    >
                        <span>🕐</span>
                        <span>Notified {cooldownMin}m ago</span>
                    </div>
                )}
            </div>
        </div>
    );
}
