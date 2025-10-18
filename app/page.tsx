export default function Page() {
	return (
		<div className="min-h-screen bg-gray-a12 py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-4xl mx-auto">
				<div className="text-center mb-12">
					<h1 className="text-8 font-bold text-gray-9 mb-4">
						Pulse Trades
					</h1>
					<p className="text-4 text-gray-6">
						Trading community gamification system with daily leaderboards and prestige badges
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
					<div className="bg-white p-6 rounded-lg shadow-md">
						<h2 className="text-5 font-semibold text-gray-9 mb-4">
							🏆 Daily Leaderboards
						</h2>
						<p className="text-gray-6">
							Submit your daily P&L percentage and compete for the top spot. 
							Leaderboards reset every trading day at midnight ET.
						</p>
					</div>

					<div className="bg-white p-6 rounded-lg shadow-md">
						<h2 className="text-5 font-semibold text-gray-9 mb-4">
							💎 Prestige System
						</h2>
						<p className="text-gray-6">
							Win daily first place to earn platinum prestige badges that stay on your profile forever.
						</p>
					</div>

					<div className="bg-white p-6 rounded-lg shadow-md">
						<h2 className="text-5 font-semibold text-gray-9 mb-4">
							📊 Community Stats
						</h2>
						<p className="text-gray-6">
							Track community performance with average returns, total submissions, and member participation.
						</p>
					</div>

					<div className="bg-white p-6 rounded-lg shadow-md">
						<h2 className="text-5 font-semibold text-gray-9 mb-4">
							🛡️ Proof Verification
						</h2>
						<p className="text-gray-6">
							Submit proof images of your trading results for admin verification and transparency.
						</p>
					</div>
				</div>

				<div className="space-y-8">
					<div className="bg-white p-6 rounded-lg shadow-md">
						<h2 className="text-5 font-semibold text-gray-9 mb-4 flex items-center">
							<span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-accent-9 text-white mr-3">
								1
							</span>
							Set up your Supabase database
						</h2>
						<p className="text-gray-6 ml-11 mb-4">
							Create a Supabase project and run the SQL schema from <code>supabase-schema.sql</code>.
							Add your Supabase credentials to your environment variables.
						</p>
					</div>

					<div className="bg-white p-6 rounded-lg shadow-md">
						<h2 className="text-5 font-semibold text-gray-9 mb-4 flex items-center">
							<span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-accent-9 text-white mr-3">
								2
							</span>
							Configure environment variables
						</h2>
						<p className="text-gray-6 ml-11 mb-4">
							Copy <code>env.example</code> to <code>.env.local</code> and fill in your Whop and Supabase credentials.
						</p>
					</div>

					<div className="bg-white p-6 rounded-lg shadow-md">
						<h2 className="text-5 font-semibold text-gray-9 mb-4 flex items-center">
							<span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-accent-9 text-white mr-3">
								3
							</span>
							Install and deploy
						</h2>
						<p className="text-gray-6 ml-11">
							{process.env.NEXT_PUBLIC_WHOP_APP_ID ? (
								<a
									href={`https://whop.com/apps/${process.env.NEXT_PUBLIC_WHOP_APP_ID}/install`}
									target="_blank"
									rel="noopener noreferrer"
									className="text-accent-9 hover:text-accent-10 underline"
								>
									Click here to install your app
								</a>
							) : (
								<span className="text-amber-600">
									Please set your environment variables to see the installation link
								</span>
							)}
						</p>
					</div>
				</div>

				<div className="mt-12 text-center text-2 text-gray-5">
					<p>
						Built with Next.js, Supabase, and Whop SDK • 
						<a
							href="https://dev.whop.com"
							target="_blank"
							rel="noopener noreferrer"
							className="text-accent-9 hover:text-accent-10 underline ml-1"
						>
							Whop Documentation
						</a>
					</p>
				</div>
			</div>
		</div>
	);
}
