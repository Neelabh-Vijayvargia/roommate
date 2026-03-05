import { createClient, SupabaseClient } from '@supabase/supabase-js';

let _client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
    if (_client) return _client;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        console.warn('⚠️  Missing Supabase server env vars. API routes will use fallback data.');
        _client = createClient('https://placeholder.supabase.co', 'placeholder-key', {
            auth: { persistSession: false },
        });
        return _client;
    }

    _client = createClient(supabaseUrl, supabaseServiceKey, {
        auth: { persistSession: false },
    });
    return _client;
}

export const supabaseAdmin = new Proxy({} as SupabaseClient, {
    get(_target, prop) {
        const client = getClient();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const value = (client as any)[prop];
        if (typeof value === 'function') {
            return value.bind(client);
        }
        return value;
    },
});
