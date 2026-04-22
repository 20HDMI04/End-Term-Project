import { useEffect, useState } from "react";
import { IconBell } from "@tabler/icons-react";
import AdminPanel from "./AdminPanel";
import "./css/NotificationBell.css";

interface NotificationBellProps {
	isAdmin: boolean;
}

export function NotificationBell({ isAdmin }: NotificationBellProps) {
	const [pendingCount, setPendingCount] = useState(0);
	const [showPanel, setShowPanel] = useState(false);
	const [refreshTrigger, setRefreshTrigger] = useState(0);

	// Fetch pending books + authors count
	useEffect(() => {
		if (!isAdmin) return;

		const fetchPendingCount = async () => {
			try {
				const [booksRes, authorsRes] = await Promise.all([
					fetch("http://localhost:3002/books/pending/list?page=1&limit=1", {
						method: "GET",
						credentials: "include",
						headers: { "Content-Type": "application/json" },
					}),
					fetch("http://localhost:3002/authors/pending-approvals?page=1&limit=1", {
						method: "GET",
						credentials: "include",
						headers: { "Content-Type": "application/json" },
					}),
				]);

				let total = 0;
				if (booksRes.ok) {
					const booksData = await booksRes.json();
					total += booksData.pagination?.total || 0;
				}
				if (authorsRes.ok) {
					const authorsData = await authorsRes.json();
					total += authorsData.pagination?.total || authorsData.meta?.total || 0;
				}
				setPendingCount(total);
			} catch (error) {
				console.error("Error fetching pending count:", error);
			}
		};

		fetchPendingCount();

		// Refresh every 30 seconds
		const interval = setInterval(fetchPendingCount, 30000);
		return () => clearInterval(interval);
	}, [isAdmin, refreshTrigger]);

	const handleRefreshCount = () => {
		setRefreshTrigger(prev => prev + 1);
	};

	if (!isAdmin) return null;

	return (
		<>
			<button
				className="notification-bell"
				onClick={() => setShowPanel(true)}
				title="Pending book approvals"
				aria-label="Show pending books"
			>
				<IconBell size={20} stroke={2} />
				{pendingCount > 0 && (
					<span className="notification-badge">{pendingCount}</span>
				)}
			</button>

			{showPanel && (
			<AdminPanel 
				onClose={() => setShowPanel(false)}
				onCountUpdate={handleRefreshCount}
			/>
		)}
		</>
	);
}
