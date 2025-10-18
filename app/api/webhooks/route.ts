import { waitUntil } from "@vercel/functions";
import { makeWebhookValidator } from "@whop/api";
import { whopSdk } from "@/lib/whop-sdk";
import { supabaseAdmin } from "@/lib/supabase";
import type { NextRequest } from "next/server";

const validateWebhook = makeWebhookValidator({
	webhookSecret: process.env.WHOP_WEBHOOK_SECRET ?? "fallback",
});

export async function POST(request: NextRequest): Promise<Response> {
	// Validate the webhook to ensure it's from Whop
	const webhookData = await validateWebhook(request);

	// Handle the webhook event
	if (webhookData.action === "payment.succeeded") {
		const { id, final_amount, amount_after_fees, currency, user_id } =
			webhookData.data;

		console.log(
			`Payment ${id} succeeded for ${user_id} with amount ${final_amount} ${currency}`,
		);

		waitUntil(
			potentiallyLongRunningHandler(
				user_id,
				final_amount,
				currency,
				amount_after_fees,
			),
		);
	}

	// Handle membership events for user sync
	if (webhookData.action === "membership.went_valid") {
		const { user_id } = webhookData.data;
		
		if (user_id) {
			console.log(`Membership went valid for user ${user_id}`);
			waitUntil(syncUserToDatabase(user_id));
		}
	}

	if (webhookData.action === "membership.went_invalid") {
		const { user_id } = webhookData.data;
		
		if (user_id) {
			console.log(`Membership went invalid for user ${user_id}`);
		}
		
		// Note: We don't delete user data, just log the event
		// User data is preserved for historical leaderboard records
	}

	// Make sure to return a 2xx status code quickly. Otherwise the webhook will be retried.
	return new Response("OK", { status: 200 });
}

async function potentiallyLongRunningHandler(
	_user_id: string | null | undefined,
	_amount: number,
	_currency: string,
	_amount_after_fees: number | null | undefined,
) {
	// This is a placeholder for a potentially long running operation
	// In a real scenario, you might need to fetch user data, update a database, etc.
}

async function syncUserToDatabase(whopUserId: string) {
	try {
		// Fetch user data from Whop API
		const user = await whopSdk.users.getUser({ userId: whopUserId });
		
		// Check if user already exists in database
		const { data: existingUser } = await supabaseAdmin
			.from('users')
			.select('id')
			.eq('whop_user_id', whopUserId)
			.single();

		if (existingUser) {
			// Update existing user
			await supabaseAdmin
				.from('users')
				.update({
					username: user.username,
					name: user.name,
					updated_at: new Date().toISOString(),
				})
				.eq('whop_user_id', whopUserId);
			
			console.log(`Updated user ${whopUserId} in database`);
		} else {
			// Create new user
			await supabaseAdmin
				.from('users')
				.insert({
					whop_user_id: whopUserId,
					username: user.username,
					name: user.name,
				});
			
			console.log(`Created new user ${whopUserId} in database`);
		}
	} catch (error) {
		console.error(`Failed to sync user ${whopUserId}:`, error);
	}
}
