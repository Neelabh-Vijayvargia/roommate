import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { sendNotification } from '@/lib/notify';

export async function POST(request: NextRequest) {
    try {
        const { reportedUserId, groupId } = await request.json();

        if (!reportedUserId || !groupId) {
            return NextResponse.json({ error: 'reportedUserId and groupId required' }, { status: 400 });
        }

        // Check 12-hour cooldown (group-wide, not per-reporter)
        const COOLDOWN_MS = 12 * 60 * 60 * 1000;

        const { data: recentReports } = await supabaseAdmin
            .from('dish_reports')
            .select('sent_at')
            .eq('reported_user_id', reportedUserId)
            .eq('group_id', groupId)
            .order('sent_at', { ascending: false })
            .limit(1);

        if (recentReports && recentReports.length > 0) {
            const sentAt = new Date(recentReports[0].sent_at).getTime();
            const elapsed = Date.now() - sentAt;
            if (elapsed < COOLDOWN_MS) {
                const remainingMs = COOLDOWN_MS - elapsed;
                const hours = Math.floor(remainingMs / 3600000);
                const minutes = Math.floor((remainingMs % 3600000) / 60000);
                return NextResponse.json(
                    { error: 'Cooldown active', remaining: `${hours}h ${minutes}m` },
                    { status: 429 }
                );
            }
        }

        // Get user info for notification
        const { data: user } = await supabaseAdmin
            .from('users')
            .select('name, email')
            .eq('id', reportedUserId)
            .single();

        const userName = user?.name || 'Roommate';
        const email = user?.email || '';

        // Send notification
        const result = await sendNotification({
            to: email,
            subject: '🍽️ Dishes reminder',
            message: `Hey ${userName}, someone noticed your dishes are in the sink. Time to clean up!`,
        });

        // Log the report regardless of delivery success
        await supabaseAdmin
            .from('dish_reports')
            .insert({ group_id: groupId, reported_user_id: reportedUserId });

        return NextResponse.json({
            success: true,
            notified: result.success,
            message: result.success ? 'Notification sent!' : 'Notification recorded (email not configured)',
        });
    } catch (err) {
        console.error('Dishes notify error:', err);
        return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 });
    }
}
