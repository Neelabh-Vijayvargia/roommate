import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function GET() {
    try {
        const { data: users, error } = await supabaseAdmin
            .from('users')
            .select('id, name, group_id')
            .order('name');

        if (error) throw error;

        return NextResponse.json({ users });
    } catch (err) {
        console.error('Failed to fetch users:', err);
        // Fallback hardcoded users
        return NextResponse.json({
            users: [
                { id: '11111111-1111-1111-1111-111111111111', name: 'Neelabh', group_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' },
                { id: '22222222-2222-2222-2222-222222222222', name: 'Vignesh', group_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' },
                { id: '33333333-3333-3333-3333-333333333333', name: 'Aviral', group_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' },
                { id: '44444444-4444-4444-4444-444444444444', name: 'Vishanth', group_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' },
            ],
        });
    }
}
