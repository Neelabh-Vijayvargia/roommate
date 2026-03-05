import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { sendNotification } from '@/lib/notify';

export async function POST(request: NextRequest) {
    try {
        const { sessionId } = await request.json();

        if (!sessionId) {
            return NextResponse.json({ error: 'sessionId required' }, { status: 400 });
        }

        // Get the session with user details
        const { data: session, error: sessionError } = await supabaseAdmin
            .from('laundry_sessions')
            .select('*, user:users(id, name, email)')
            .eq('id', sessionId)
            .is('checked_out_at', null)
            .single();

        if (sessionError || !session) {
            return NextResponse.json({ error: 'Session not found' }, { status: 404 });
        }

        // Check 60-minute cooldown
        const { data: lastNotification } = await supabaseAdmin
            .from('laundry_notifications')
            .select('*')
            .eq('session_id', sessionId)
            .order('sent_at', { ascending: false })
            .limit(1);

        if (lastNotification && lastNotification.length > 0) {
            const sentAt = new Date(lastNotification[0].sent_at).getTime();
            const elapsedMin = (Date.now() - sentAt) / 60000;
            if (elapsedMin < 60) {
                return NextResponse.json(
                    { error: 'Cooldown active', cooldownMinutes: Math.floor(elapsedMin) },
                    { status: 429 }
                );
            }
        }

        // Build notification
        const user = Array.isArray(session.user) ? session.user[0] : session.user;
        const userName = user?.name || 'Roommate';
        const email = user?.email || '';
        const checkedInAt = new Date(session.checked_in_at).getTime();
        const minutes = Math.floor((Date.now() - checkedInAt) / 60000);

        const isWasher = session.machine === 'washer';
        const subject = isWasher
            ? '🧺 Your laundry is ready to move'
            : '🌀 Your laundry is ready to take out';
        const message = isWasher
            ? `Hey ${userName}, your laundry has been in the washer for ${minutes} minutes. Time to move it to the dryer!`
            : `Hey ${userName}, your laundry has been in the dryer for ${minutes} minutes. Time to take it out!`;

        // Send notification
        const result = await sendNotification({ to: email, subject, message });

        // Record notification regardless of delivery success
        await supabaseAdmin
            .from('laundry_notifications')
            .insert({ session_id: sessionId });

        return NextResponse.json({
            success: true,
            notified: result.success,
            message: result.success ? 'Notification sent!' : 'Notification recorded (email not configured)',
        });
    } catch (err) {
        console.error('Notify error:', err);
        return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 });
    }
}
