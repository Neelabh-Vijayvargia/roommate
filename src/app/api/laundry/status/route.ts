import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
    const groupId = request.nextUrl.searchParams.get('groupId');

    if (!groupId) {
        return NextResponse.json({ error: 'groupId required' }, { status: 400 });
    }

    try {
        // Get active sessions (not checked out)
        const { data: sessions, error } = await supabaseAdmin
            .from('laundry_sessions')
            .select('*, user:users(id, name)')
            .eq('group_id', groupId)
            .is('checked_out_at', null);

        if (error) throw error;

        const machines: Array<{
            machine: string;
            state: string;
            session?: typeof sessions[0];
            occupant?: string;
            elapsedMinutes?: number;
            lastNotification?: { sent_at: string };
        }> = [];

        for (const machineType of ['washer', 'dryer']) {
            const session = sessions?.find((s) => s.machine === machineType);

            if (session) {
                const checkedInAt = new Date(session.checked_in_at).getTime();
                const elapsedMinutes = (Date.now() - checkedInAt) / 60000;

                // Get last notification for this session
                const { data: notifications } = await supabaseAdmin
                    .from('laundry_notifications')
                    .select('*')
                    .eq('session_id', session.id)
                    .order('sent_at', { ascending: false })
                    .limit(1);

                const userName = Array.isArray(session.user) ? session.user[0]?.name : (session.user as { name: string } | null)?.name;

                machines.push({
                    machine: machineType,
                    state: session.state,
                    session,
                    occupant: userName || 'Unknown',
                    elapsedMinutes,
                    lastNotification: notifications?.[0] || undefined,
                });
            } else {
                machines.push({ machine: machineType, state: 'free' });
            }
        }

        return NextResponse.json({ machines });
    } catch (err) {
        console.error('Laundry status error:', err);
        return NextResponse.json({
            machines: [
                { machine: 'washer', state: 'free' },
                { machine: 'dryer', state: 'free' },
            ],
        });
    }
}
