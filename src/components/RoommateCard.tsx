'use client';

interface RoommateCardProps {
    name: string;
    userId: string;
    canNotify: boolean;
    cooldownRemaining: string | null; // e.g. "8h 22m" or null
    onNotify: () => void;
    isLoading: boolean;
    isCurrentUser: boolean;
}

const avatarColors = [
    'linear-gradient(135deg, #3b82f6, #6366f1)',
    'linear-gradient(135deg, #8b5cf6, #a855f7)',
    'linear-gradient(135deg, #ec4899, #f43f5e)',
    'linear-gradient(135deg, #14b8a6, #22c55e)',
];

export default function RoommateCard({
    name,
    canNotify,
    cooldownRemaining,
    onNotify,
    isLoading,
    isCurrentUser,
}: RoommateCardProps) {
    const colorIndex = name.charCodeAt(0) % avatarColors.length;

    return (
        <div
            className="glass-card-static"
            style={{
                padding: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                opacity: isCurrentUser ? 0.5 : 1,
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                    style={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: avatarColors[colorIndex],
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1rem',
                        fontWeight: 700,
                        color: 'white',
                        flexShrink: 0,
                    }}
                >
                    {name.charAt(0)}
                </div>
                <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>{name}</span>
                {isCurrentUser && (
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                        (you)
                    </span>
                )}
            </div>

            {!isCurrentUser && (
                <>
                    {canNotify ? (
                        <button
                            className="btn-danger"
                            onClick={onNotify}
                            disabled={isLoading}
                            style={{ padding: '8px 16px', fontSize: '0.8rem' }}
                        >
                            🍽️ Notify
                        </button>
                    ) : cooldownRemaining ? (
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                                padding: '8px 12px',
                                background: 'rgba(255, 255, 255, 0.03)',
                                borderRadius: 10,
                                color: 'var(--text-muted)',
                                fontSize: '0.75rem',
                            }}
                        >
                            <span style={{ opacity: 0.6 }}>🍽️</span>
                            <span>{cooldownRemaining} left</span>
                        </div>
                    ) : null}
                </>
            )}
        </div>
    );
}
