import { whopSdk } from "@/lib/whop-sdk";
import { supabaseAdmin } from "@/lib/supabase";
import { getTradingDayString, getWeekStartString } from "@/lib/utils/timezone";
import { headers } from "next/headers";
import type { NextRequest } from "next/server";

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const headersList = await headers();
    const { userId } = await whopSdk.verifyUserToken(headersList);
    
    const body = await request.json();
    const { experienceId, percentageGain, proofImage } = body;

    // Validate input
    if (!experienceId || typeof percentageGain !== 'number') {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if user has access to experience
    const accessResult = await whopSdk.access.checkIfUserHasAccessToExperience({
      userId,
      experienceId,
    });

    if (!accessResult.hasAccess) {
      return Response.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get or create user in database
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('whop_user_id', userId)
      .single();

    if (!user) {
      // User doesn't exist in database, create them
      const whopUser = await whopSdk.users.getUser({ userId });
      
      const { data: newUser, error: insertError } = await supabaseAdmin
        .from('users')
        .insert({
          whop_user_id: userId,
          username: whopUser.username,
          name: whopUser.name,
        })
        .select('id')
        .single();

      if (insertError) {
        console.error('Failed to create user:', insertError);
        return Response.json({ error: 'Failed to create user' }, { status: 500 });
      }

      user.id = newUser.id;
    }

    // Check if user already submitted today
    const today = getTradingDayString();
    const { data: existingSubmission } = await supabaseAdmin
      .from('submissions')
      .select('id')
      .eq('user_id', user.id)
      .eq('experience_id', experienceId)
      .eq('submission_date', today)
      .single();

    if (existingSubmission) {
      return Response.json({ error: 'Already submitted for today' }, { status: 400 });
    }

    // Upload proof image if provided
    let proofImageUrl: string | null = null;
    if (proofImage) {
      try {
        const fileName = `${user.id}/${today}-${Date.now()}.jpg`;
        const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
          .from('proof-images')
          .upload(fileName, proofImage, {
            contentType: 'image/jpeg',
            upsert: false,
          });

        if (uploadError) {
          console.error('Failed to upload image:', uploadError);
          return Response.json({ error: 'Failed to upload proof image' }, { status: 500 });
        }

        proofImageUrl = uploadData.path;
      } catch (error) {
        console.error('Error processing image upload:', error);
        return Response.json({ error: 'Failed to process image' }, { status: 500 });
      }
    }

    // Create submission
    const weekStart = getWeekStartString();
    const { data: submission, error: submissionError } = await supabaseAdmin
      .from('submissions')
      .insert({
        user_id: user.id,
        experience_id: experienceId,
        percentage_gain: percentageGain,
        proof_image_url: proofImageUrl,
        submission_date: today,
        week_start_date: weekStart,
      })
      .select()
      .single();

    if (submissionError) {
      console.error('Failed to create submission:', submissionError);
      return Response.json({ error: 'Failed to submit' }, { status: 500 });
    }

    return Response.json({ 
      success: true, 
      submission,
      message: 'Submission successful' 
    });

  } catch (error) {
    console.error('Submission error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest): Promise<Response> {
  try {
    const headersList = await headers();
    const { userId } = await whopSdk.verifyUserToken(headersList);
    
    const { searchParams } = new URL(request.url);
    const experienceId = searchParams.get('experienceId');

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

    // Get user's submissions
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('whop_user_id', userId)
      .single();

    if (!user) {
      return Response.json({ submissions: [] });
    }

    const { data: submissions } = await supabaseAdmin
      .from('submissions')
      .select('*')
      .eq('user_id', user.id)
      .eq('experience_id', experienceId)
      .order('submitted_at', { ascending: false })
      .limit(30);

    return Response.json({ submissions: submissions || [] });

  } catch (error) {
    console.error('Get submissions error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
