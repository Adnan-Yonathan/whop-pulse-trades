import { WhopApp } from "@whop/react/components";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Pulse Trades",
	description: "Trading community gamification system with daily leaderboards and prestige badges",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
		>
			{process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_WHOP_APP_ID ? (
				<WhopApp>{children}</WhopApp>
			) : (
				children
			)}
		</body>
		</html>
	);
}
