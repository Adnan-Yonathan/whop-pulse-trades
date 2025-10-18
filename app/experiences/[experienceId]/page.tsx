import { whopSdk } from "@/lib/whop-sdk";
import { headers } from "next/headers";
import { PulseTradesLeaderboard } from "./components/PulseTradesLeaderboard";

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
			<div className="flex justify-center items-center h-screen px-8">
				<div className="text-center">
					<h1 className="text-2xl font-bold text-gray-9 mb-4">
						Access Denied
					</h1>
					<p className="text-gray-6">
						You do not have access to this trading community.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-a12">
			<div className="max-w-6xl mx-auto px-4 py-8">
				<div className="text-center mb-8">
					<h1 className="text-4xl font-bold text-gray-9 mb-2">
						Pulse Trades
					</h1>
					<p className="text-gray-6">
						Welcome to <strong>{experience.name}</strong> trading leaderboard
					</p>
					<p className="text-sm text-gray-5 mt-2">
						Hi <strong>{user.name}</strong> (@{user.username}) • Access Level: <strong>{accessLevel}</strong>
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
