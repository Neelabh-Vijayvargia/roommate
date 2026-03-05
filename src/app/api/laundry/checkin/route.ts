import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
    try {
        const { machine, userId, groupId } = await request.json();

        if (!machine || !userId || !groupId) {
            return NextResponse.json({ error: 'machine, userId, and groupId required' }, { status: 400 });
        }

        // Check if machine is currently free
        const { data: existing } = await supabaseAdmin
            .from('laundry_sessions')
            .select('id')
            .eq('group_id', groupId)
            .eq('machine', machine)
            .is('checked_out_at', null)
            .limit(1);

        if (existing && existing.length > 0) {
            return NextResponse.json({ error: 'Machine is already in use' }, { status: 409 });
        }

        // Create new session
        const { data: session, error } = await supabaseAdmin
            .from('laundry_sessions')
            .insert({
                group_id: groupId,
                machine,
                user_id: userId,
                state: 'in_use',
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ session });
    } catch (err) {
        console.error('Check-in error:', err);
        return NextResponse.json({ error: 'Failed to check in' }, { status: 500 });
    }
}
