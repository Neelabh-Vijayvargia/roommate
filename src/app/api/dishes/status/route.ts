import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
    const groupId = request.nextUrl.searchParams.get('groupId');

    if (!groupId) {
        return NextResponse.json({ error: 'groupId required' }, { status: 400 });
    }

    try {
        // Get all users in the group
        const { data: users, error: usersError } = await supabaseAdmin
            .from('users')
            .select('id, name')
            .eq('group_id', groupId)
            .order('name');

        if (usersError) throw usersError;

        const now = Date.now();
        const COOLDOWN_MS = 12 * 60 * 60 * 1000; // 12 hours

        const cooldowns = await Promise.all(
            (users || []).map(async (user) => {
                // Get the most recent dish report for this user
                const { data: reports } = await supabaseAdmin
                    .from('dish_reports')
                    .select('sent_at')
                    .eq('reported_user_id', user.id)
                    .eq('group_id', groupId)
                    .order('sent_at', { ascending: false })
                    .limit(1);

                let cooldownRemaining: string | null = null;

                if (reports && reports.length > 0) {
                    const sentAt = new Date(reports[0].sent_at).getTime();
                    const elapsed = now - sentAt;
                    const remaining = COOLDOWN_MS - elapsed;

                    if (remaining > 0) {
                        const hours = Math.floor(remaining / 3600000);
                        const minutes = Math.floor((remaining % 3600000) / 60000);
                        cooldownRemaining = `${hours}h ${minutes}m`;
                    }
                }

                return {
                    userId: user.id,
                    name: user.name,
                    cooldownRemaining,
                };
            })
        );

        return NextResponse.json({ cooldowns });
    } catch (err) {
        console.error('Dishes status error:', err);
        // Fallback
        return NextResponse.json({
            cooldowns: [
                { userId: '11111111-1111-1111-1111-111111111111', name: 'Neelabh', cooldownRemaining: null },
                { userId: '22222222-2222-2222-2222-222222222222', name: 'Vignesh', cooldownRemaining: null },
                { userId: '33333333-3333-3333-3333-333333333333', name: 'Aviral', cooldownRemaining: null },
                { userId: '44444444-4444-4444-4444-444444444444', name: 'Vishanth', cooldownRemaining: null },
            ],
        });
    }
}
