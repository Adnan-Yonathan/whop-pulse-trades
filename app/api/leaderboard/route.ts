import { whopSdk } from "@/lib/whop-sdk";
import { supabaseAdmin } from "@/lib/supabase";
import { calculateLeaderboard, calculateWeeklyLeaderboard } from "@/lib/utils/leaderboard";
import { getTradingDayString, getWeekStartString } from "@/lib/utils/timezone";
import { headers } from "next/headers";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest): Promise<Response> {
  try {
    const headersList = await headers();
    const { userId } = await whopSdk.verifyUserToken(headersList);
    
    const { searchParams } = new URL(request.url);
    const experienceId = searchParams.get('experienceId');
    const type = searchParams.get('type') || 'daily'; // 'daily' or 'weekly'

    if (!experienceId) {
      return Response.json({ error: 'Missing experienceId' }, { status: 400 });
    }

    // Check if user has access to experience
    const accessResult = await whopSdk.access.checkIfUserHasAccessToExperience({
      userId,
      experienceId,
    });

    if (!accessResult.hasAccess) {
      return Response.json({ error: 'Access denied' }, { status: 403 });
    }

    let submissions;
    let leaderboard;

    if (type === 'weekly') {
      const weekStart = getWeekStartString();
      
      // Get all submissions for this week
      const { data: weekSubmissions } = await supabaseAdmin
        .from('submissions')
        .select(`
          *,
          user:users(*)
        `)
        .eq('experience_id', experienceId)
        .eq('week_start_date', weekStart);

      if (!weekSubmissions || weekSubmissions.length === 0) {
        return Response.json({ 
          leaderboard: [], 
          userRank: null,
          type: 'weekly',
          weekStart 
        });
      }

      leaderboard = calculateWeeklyLeaderboard(weekSubmissions, weekStart);
    } else {
      const today = getTradingDayString();
      
      // Get today's submissions
      const { data: dailySubmissions } = await supabaseAdmin
        .from('submissions')
        .select(`
          *,
          user:users(*)
        `)
        .eq('experience_id', experienceId)
        .eq('submission_date', today);

      if (!dailySubmissions || dailySubmissions.length === 0) {
        return Response.json({ 
          leaderboard: [], 
          userRank: null,
          type: 'daily',
          date: today 
        });
      }

      leaderboard = calculateLeaderboard(dailySubmissions, userId);
    }

    // Get user's current rank
    const userRank = leaderboard.find(entry => entry.user_id === userId) || null;

    return Response.json({ 
      leaderboard,
      userRank,
      type,
      date: type === 'daily' ? getTradingDayString() : getWeekStartString()
    });

  } catch (error) {
    console.error('Leaderboard error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
