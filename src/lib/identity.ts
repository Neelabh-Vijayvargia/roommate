'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Identity } from '@/types';

const STORAGE_KEY = 'ion1308_identity';

export function useIdentity() {
    const [identity, setIdentityState] = useState<Identity | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                setIdentityState(JSON.parse(stored));
            }
        } catch {
            // localStorage not available
        }
        setIsLoaded(true);
    }, []);

    const setIdentity = useCallback((id: Identity) => {
        setIdentityState(id);
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(id));
        } catch {
            // localStorage not available
        }
    }, []);

    const clearIdentity = useCallback(() => {
        setIdentityState(null);
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch {
            // localStorage not available
        }
    }, []);

    return { identity, isLoaded, setIdentity, clearIdentity };
}
