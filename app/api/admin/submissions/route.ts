import { whopSdk } from "@/lib/whop-sdk";
import { supabaseAdmin } from "@/lib/supabase";
import { getTradingDayString } from "@/lib/utils/timezone";
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

    // Get today's submissions with user info
    const { data: submissions } = await supabaseAdmin
      .from('submissions')
      .select(`
        *,
        user:users(username, name)
      `)
      .eq('experience_id', experienceId)
      .eq('submission_date', today)
      .order('percentage_gain', { ascending: false });

    return Response.json({ submissions: submissions || [] });

  } catch (error) {
    console.error('Admin submissions error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
