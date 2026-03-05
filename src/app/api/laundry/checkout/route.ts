import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
    try {
        const { sessionId } = await request.json();

        if (!sessionId) {
            return NextResponse.json({ error: 'sessionId required' }, { status: 400 });
        }

        const { data: session, error } = await supabaseAdmin
            .from('laundry_sessions')
            .update({ checked_out_at: new Date().toISOString() })
            .eq('id', sessionId)
            .is('checked_out_at', null)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ session });
    } catch (err) {
        console.error('Checkout error:', err);
        return NextResponse.json({ error: 'Failed to check out' }, { status: 500 });
    }
}
