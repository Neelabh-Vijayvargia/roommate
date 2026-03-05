'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useIdentity } from '@/lib/identity';
import type { User } from '@/types';

const HARDCODED_GROUP_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

export default function IdentityPage() {
  const router = useRouter();
  const { identity, isLoaded, setIdentity } = useIdentity();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);

  // If already identified, redirect to dashboard
  useEffect(() => {
    if (isLoaded && identity) {
      router.replace('/dashboard');
    }
  }, [isLoaded, identity, router]);

  // Fetch users
  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetch('/api/users');
        if (res.ok) {
          const data = await res.json();
          setUsers(data.users || []);
        }
      } catch {
        // Fallback hardcoded users for when Supabase is not configured
        setUsers([
          { id: '11111111-1111-1111-1111-111111111111', name: 'Neelabh', group_id: HARDCODED_GROUP_ID, phone_number: '' },
          { id: '22222222-2222-2222-2222-222222222222', name: 'Vignesh', group_id: HARDCODED_GROUP_ID, phone_number: '' },
          { id: '33333333-3333-3333-3333-333333333333', name: 'Aviral', group_id: HARDCODED_GROUP_ID, phone_number: '' },
          { id: '44444444-4444-4444-4444-444444444444', name: 'Vishanth', group_id: HARDCODED_GROUP_ID, phone_number: '' },
        ]);
      }
      setLoading(false);
    }
    fetchUsers();
  }, []);

  const handleSelect = (user: User) => {
    setSelected(user.id);
    setIdentity({
      userId: user.id,
      userName: user.name,
      groupId: user.group_id,
    });
    setTimeout(() => {
      router.push('/dashboard');
    }, 400);
  };

  if (!isLoaded || identity) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="skeleton" style={{ width: 40, height: 40, borderRadius: '50%' }} />
      </div>
    );
  }

  const avatarGradients = [
    'linear-gradient(135deg, #3b82f6, #6366f1)',
    'linear-gradient(135deg, #8b5cf6, #a855f7)',
    'linear-gradient(135deg, #ec4899, #f43f5e)',
    'linear-gradient(135deg, #14b8a6, #22c55e)',
  ];

  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 24px',
      }}
    >
      {/* Logo / Header */}
      <div
        style={{ marginBottom: 48, textAlign: 'center' }}
        className="animate-fade-in-up"
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 18,
            background: 'var(--gradient-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            fontSize: '1.6rem',
            boxShadow: 'var(--shadow-glow-blue)',
          }}
        >
          🏠
        </div>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 6 }}>
          Ion 1308
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Who are you?
        </p>
      </div>

      {/* Name Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 12,
          width: '100%',
          maxWidth: 340,
        }}
      >
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 110, borderRadius: 16 }} />
          ))
        ) : (
          users.map((user, i) => (
            <button
              key={user.id}
              onClick={() => handleSelect(user)}
              className={`glass-card animate-fade-in-up stagger-${i + 1}`}
              style={{
                padding: 20,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 10,
                cursor: 'pointer',
                border: selected === user.id ? '1px solid rgba(59, 130, 246, 0.5)' : undefined,
                background: selected === user.id ? 'rgba(59, 130, 246, 0.1)' : undefined,
                opacity: selected && selected !== user.id ? 0.4 : 1,
                transform: selected === user.id ? 'scale(0.95)' : undefined,
                transition: 'all 0.3s ease',
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  background: avatarGradients[i % avatarGradients.length],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  color: 'white',
                }}
              >
                {user.name.charAt(0)}
              </div>
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{user.name}</span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
