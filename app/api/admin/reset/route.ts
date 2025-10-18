import { whopSdk } from "@/lib/whop-sdk";
import { supabaseAdmin } from "@/lib/supabase";
import { getTradingDayString } from "@/lib/utils/timezone";
import { headers } from "next/headers";
import type { NextRequest } from "next/server";

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const headersList = await headers();
    const { userId } = await whopSdk.verifyUserToken(headersList);
    
    const body = await request.json();
    const { experienceId, resetType = 'daily' } = body;

    if (!experienceId) {
      return Response.json({ error: 'Missing experienceId' }, { status: 400 });
    }

    // Check if user has admin access to experience
    const accessResult = await whopSdk.access.checkIfUserHasAccessToExperience({
      userId,
      experienceId,
    });

    if (!accessResult.hasAccess || accessResult.accessLevel !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    let yesterdayWinner = null;

    // Award prestige to yesterday's winner if daily reset
    if (resetType === 'daily') {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = getTradingDayString(yesterday);

      // Find yesterday's winner
      const { data: winner } = await supabaseAdmin
        .from('submissions')
        .select(`
          user_id,
          user:users(id, prestige_level)
        `)
        .eq('experience_id', experienceId)
        .eq('submission_date', yesterdayStr)
        .order('percentage_gain', { ascending: false })
        .limit(1)
        .single();

      if (winner && winner.user_id) {
        // Increment prestige level
        await supabaseAdmin
          .from('users')
          .update({
            prestige_level: winner.user.prestige_level + 1,
            updated_at: new Date().toISOString(),
          })
          .eq('id', winner.user_id);

        console.log(`Awarded prestige to user ${winner.user_id}`);
        yesterdayWinner = winner;
      }
    }

    // Log the reset
    await supabaseAdmin
      .from('leaderboard_resets')
      .insert({
        experience_id: experienceId,
        reset_type: resetType,
        admin_user_id: userId,
      });

    return Response.json({ 
      success: true, 
      message: `${resetType} leaderboard reset completed`,
      prestigeAwarded: resetType === 'daily' && yesterdayWinner ? true : false
    });

  } catch (error) {
    console.error('Admin reset error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
