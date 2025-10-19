import { whopSdk } from "@/lib/whop-sdk";
import { headers } from "next/headers";
import { PulseTradesLeaderboard } from "./components/PulseTradesLeaderboard";
import { StockTicker } from "./components/StockTicker";

export default async function ExperiencePage({
	params,
}: {
	params: Promise<{ experienceId: string }>;
}) {
	// The headers contains the user token
	const headersList = await headers();

	// The experienceId is a path param
	const { experienceId } = await params;

	// The user token is in the headers
	const { userId } = await whopSdk.verifyUserToken(headersList);

	const result = await whopSdk.access.checkIfUserHasAccessToExperience({
		userId,
		experienceId,
	});

	const user = await whopSdk.users.getUser({ userId });
	const experience = await whopSdk.experiences.getExperience({ experienceId });

	// Either: 'admin' | 'customer' | 'no_access';
	// 'admin' means the user is an admin of the whop, such as an owner or moderator
	// 'customer' means the user is a common member in this whop
	// 'no_access' means the user does not have access to the whop
	const { accessLevel } = result;

	if (!result.hasAccess) {
		return (
			<div className="min-h-screen bg-[var(--robinhood-bg)] flex justify-center items-center px-8">
				<div className="text-center">
					<h1 className="text-2xl font-bold text-[var(--robinhood-text)] mb-4">
						Access Denied
					</h1>
					<p className="text-[var(--robinhood-muted)]">
						You do not have access to this trading community.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-[var(--robinhood-bg)]">
			{/* Stock Ticker */}
			<StockTicker />
			
			<div className="max-w-6xl mx-auto px-4 py-6">
				<div className="mb-6">
					<h1 className="text-3xl font-bold text-[var(--robinhood-text)] mb-2">
						Pulse Trades
					</h1>
					<p className="text-[var(--robinhood-muted)] text-lg">
						Welcome to <strong className="text-[var(--robinhood-text)]">{experience.name}</strong> trading leaderboard
					</p>
					<p className="text-sm text-[var(--robinhood-muted)] mt-2">
						Hi <strong className="text-[var(--robinhood-text)]">{user.name}</strong> (@{user.username}) • Access Level: <strong className="text-[var(--robinhood-green)]">{accessLevel}</strong>
					</p>
				</div>

				<PulseTradesLeaderboard 
					experienceId={experienceId}
					currentUserId={userId}
					isAdmin={accessLevel === 'admin'}
				/>
			</div>
		</div>
	);
}
