import { whopSdk } from "@/lib/whop-sdk";
import { headers } from "next/headers";
import { AdminDashboard } from "./components/AdminDashboard";

export default async function DashboardPage({
	params,
}: {
	params: Promise<{ companyId: string }>;
}) {
	// The headers contains the user token
	const headersList = await headers();

	// The companyId is a path param
	const { companyId } = await params;

	// The user token is in the headers
	const { userId } = await whopSdk.verifyUserToken(headersList);

	const result = await whopSdk.access.checkIfUserHasAccessToCompany({
		userId,
		companyId,
	});

	const user = await whopSdk.users.getUser({ userId });
	const company = await whopSdk.companies.getCompany({ companyId });

	// Either: 'admin' | 'no_access';
	// 'admin' means the user is an admin of the company, such as an owner or moderator
	// 'no_access' means the user is not an authorized member of the company
	const { accessLevel } = result;

	if (!result.hasAccess || accessLevel !== 'admin') {
		return (
			<div className="flex justify-center items-center h-screen px-8">
				<div className="text-center">
					<h1 className="text-2xl font-bold text-gray-9 mb-4">
						Access Denied
					</h1>
					<p className="text-gray-6">
						Admin access required to view this dashboard.
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
						Admin Dashboard
					</h1>
					<p className="text-gray-6">
						Manage <strong>{company.title}</strong> trading community
					</p>
					<p className="text-sm text-gray-5 mt-2">
						Welcome <strong>{user.name}</strong> (@{user.username})
					</p>
				</div>

				<AdminDashboard companyId={companyId} />
			</div>
		</div>
	);
}
