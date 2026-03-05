'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
    {
        href: '/laundry',
        label: 'Laundry',
        icon: (active: boolean) => (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? '#3b82f6' : '#64748b'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="3" />
                <circle cx="12" cy="13" r="5" />
                <circle cx="12" cy="13" r="2" />
                <line x1="6" y1="6" x2="6.01" y2="6" strokeWidth="3" />
                <line x1="10" y1="6" x2="10.01" y2="6" strokeWidth="3" />
            </svg>
        ),
    },
    {
        href: '/dashboard',
        label: 'Home',
        icon: (active: boolean) => (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? '#3b82f6' : '#64748b'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
        ),
    },
    {
        href: '/dishes',
        label: 'Dishes',
        icon: (active: boolean) => (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? '#3b82f6' : '#64748b'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
                <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
                <line x1="6" y1="1" x2="6" y2="4" />
                <line x1="10" y1="1" x2="10" y2="4" />
                <line x1="14" y1="1" x2="14" y2="4" />
            </svg>
        ),
    },
];

export default function BottomTabBar() {
    const pathname = usePathname();

    return (
        <nav
            style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 50,
                background: 'rgba(10, 14, 26, 0.9)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                paddingBottom: 'env(safe-area-inset-bottom, 0px)',
            }}
        >
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-around',
                    alignItems: 'center',
                    maxWidth: 480,
                    margin: '0 auto',
                    padding: '8px 0',
                }}
            >
                {tabs.map((tab) => {
                    const isActive = pathname === tab.href || (tab.href === '/dashboard' && pathname === '/');
                    return (
                        <Link
                            key={tab.href}
                            href={tab.href}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 4,
                                padding: '6px 16px',
                                borderRadius: 12,
                                textDecoration: 'none',
                                transition: 'all 0.2s ease',
                                background: isActive ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                            }}
                        >
                            {tab.icon(isActive)}
                            <span
                                style={{
                                    fontSize: '0.65rem',
                                    fontWeight: isActive ? 600 : 400,
                                    color: isActive ? '#3b82f6' : '#64748b',
                                    letterSpacing: '0.02em',
                                }}
                            >
                                {tab.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
