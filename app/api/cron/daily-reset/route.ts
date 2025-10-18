import { supabaseAdmin } from "@/lib/supabase";
import { getTradingDayString } from "@/lib/utils/timezone";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest): Promise<Response> {
  // Verify this is a legitimate cron request
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = getTradingDayString(yesterday);

    console.log(`Starting daily reset for ${yesterdayStr}`);

    // Get all experiences that had submissions yesterday
    const { data: experiences } = await supabaseAdmin
      .from('submissions')
      .select('experience_id')
      .eq('submission_date', yesterdayStr);

    const uniqueExperiences = [...new Set(experiences?.map(exp => exp.experience_id) || [])];

    let totalPrestigeAwarded = 0;

    // Process each experience
    for (const experienceId of uniqueExperiences) {
      try {
        // Find yesterday's winner for this experience
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
          // Award prestige
          const { error: updateError } = await supabaseAdmin
            .from('users')
            .update({
              prestige_level: winner.user.prestige_level + 1,
              updated_at: new Date().toISOString(),
            })
            .eq('id', winner.user_id);

          if (updateError) {
            console.error(`Failed to award prestige to user ${winner.user_id}:`, updateError);
          } else {
            console.log(`Awarded prestige to user ${winner.user_id} in experience ${experienceId}`);
            totalPrestigeAwarded++;
          }
        }

        // Log the reset
        await supabaseAdmin
          .from('leaderboard_resets')
          .insert({
            experience_id: experienceId,
            reset_type: 'daily',
            admin_user_id: 'system', // System-initiated reset
          });

      } catch (error) {
        console.error(`Error processing experience ${experienceId}:`, error);
      }
    }

    console.log(`Daily reset completed. Prestige awarded to ${totalPrestigeAwarded} users.`);

    return Response.json({ 
      success: true, 
      message: 'Daily reset completed',
      prestigeAwarded: totalPrestigeAwarded,
      experiencesProcessed: uniqueExperiences.length
    });

  } catch (error) {
    console.error('Daily reset error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
