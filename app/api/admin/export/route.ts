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
    const type = searchParams.get('type') || 'daily'; // 'daily' or 'weekly'

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

    let submissions;
    let filename;

    if (type === 'weekly') {
      const weekStart = getWeekStartString();
      
      const { data: weekSubmissions } = await supabaseAdmin
        .from('submissions')
        .select(`
          percentage_gain,
          submission_date,
          submitted_at,
          user:users(username, name)
        `)
        .eq('experience_id', experienceId)
        .eq('week_start_date', weekStart)
        .order('percentage_gain', { ascending: false });

      submissions = weekSubmissions || [];
      filename = `pulse-trades-weekly-${weekStart}.csv`;
    } else {
      const today = getTradingDayString();
      
      const { data: dailySubmissions } = await supabaseAdmin
        .from('submissions')
        .select(`
          percentage_gain,
          submitted_at,
          user:users(username, name)
        `)
        .eq('experience_id', experienceId)
        .eq('submission_date', today)
        .order('percentage_gain', { ascending: false });

      submissions = dailySubmissions || [];
      filename = `pulse-trades-daily-${today}.csv`;
    }

    // Convert to CSV
    const csvHeaders = type === 'weekly' 
      ? 'Rank,Username,Name,Percentage Gain,Date,Submitted At'
      : 'Rank,Username,Name,Percentage Gain,Submitted At';
    
    const csvRows = submissions.map((submission: any, index: number) => {
      const rank = index + 1;
      const username = submission.user?.username || '';
      const name = submission.user?.name || '';
      const gain = submission.percentage_gain;
      const submittedAt = new Date(submission.submitted_at).toLocaleString();
      
      if (type === 'weekly') {
        const date = submission.submission_date;
        return `${rank},"${username}","${name}",${gain},${date},"${submittedAt}"`;
      } else {
        return `${rank},"${username}","${name}",${gain},"${submittedAt}"`;
      }
    });

    const csvContent = [csvHeaders, ...csvRows].join('\n');

    return new Response(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });

  } catch (error) {
    console.error('Admin export error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
