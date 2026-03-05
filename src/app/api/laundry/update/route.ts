import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
    try {
        const { sessionId, newState } = await request.json();

        if (!sessionId || !newState) {
            return NextResponse.json({ error: 'sessionId and newState required' }, { status: 400 });
        }

        const validStates = ['in_use', 'ready_to_transfer', 'done'];
        if (!validStates.includes(newState)) {
            return NextResponse.json({ error: 'Invalid state' }, { status: 400 });
        }

        const { data: session, error } = await supabaseAdmin
            .from('laundry_sessions')
            .update({ state: newState })
            .eq('id', sessionId)
            .is('checked_out_at', null)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ session });
    } catch (err) {
        console.error('Update error:', err);
        return NextResponse.json({ error: 'Failed to update session' }, { status: 500 });
    }
}
