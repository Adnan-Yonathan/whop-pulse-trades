import { whopSdk } from "@/lib/whop-sdk";
import { supabaseAdmin } from "@/lib/supabase";
import { getTradingDayString, getWeekStartString } from "@/lib/utils/timezone";
import { headers } from "next/headers";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest): Promise<Response> {
  try {
    const headersList = await headers();
    const { userId } = await whopSdk.verifyUserToken(headersList);
    
    const { searchParams } = new URL(request.url);
    const experienceId = searchParams.get('experienceId');

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

    const today = getTradingDayString();
    const weekStart = getWeekStartString();

    // Get today's stats
    const { data: todaySubmissions } = await supabaseAdmin
      .from('submissions')
      .select('percentage_gain')
      .eq('experience_id', experienceId)
      .eq('submission_date', today);

    // Get weekly stats
    const { data: weekSubmissions } = await supabaseAdmin
      .from('submissions')
      .select('percentage_gain')
      .eq('experience_id', experienceId)
      .eq('week_start_date', weekStart);

    // Get total members (users who have ever submitted)
    const { data: totalMembers } = await supabaseAdmin
      .from('submissions')
      .select('user_id')
      .eq('experience_id', experienceId);

    const uniqueMembers = new Set(totalMembers?.map(sub => sub.user_id) || []);

    // Calculate averages
    const todayAvg = todaySubmissions && todaySubmissions.length > 0 
      ? todaySubmissions.reduce((sum, sub) => sum + sub.percentage_gain, 0) / todaySubmissions.length 
      : 0;

    const weekAvg = weekSubmissions && weekSubmissions.length > 0
      ? weekSubmissions.reduce((sum, sub) => sum + sub.percentage_gain, 0) / weekSubmissions.length
      : 0;

    // Get best and worst performers today
    const { data: todayRankings } = await supabaseAdmin
      .from('submissions')
      .select(`
        percentage_gain,
        user:users(username, name)
      `)
      .eq('experience_id', experienceId)
      .eq('submission_date', today)
      .order('percentage_gain', { ascending: false });

    const stats = {
      daily: {
        submissions: todaySubmissions?.length || 0,
        averageGain: Number(todayAvg.toFixed(2)),
        bestGain: todayRankings?.[0]?.percentage_gain || 0,
        bestUser: todayRankings?.[0]?.user || null,
        worstGain: todayRankings?.[todayRankings.length - 1]?.percentage_gain || 0,
        worstUser: todayRankings?.[todayRankings.length - 1]?.user || null,
      },
      weekly: {
        submissions: weekSubmissions?.length || 0,
        averageGain: Number(weekAvg.toFixed(2)),
      },
      totalMembers: uniqueMembers.size,
      date: today,
      weekStart: weekStart,
    };

    return Response.json(stats);

  } catch (error) {
    console.error('Admin stats error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
