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

	useEffect(() => {
		if (!isAdmin) return;

		const fetchPendingCount = async () => {
			try {
				const response = await fetch(
					"http://localhost:3002/books/pending/list?page=1&limit=1",
					{
						method: "GET",
						credentials: "include",
						headers: {
							"Content-Type": "application/json",
						},
					}
				);

				if (response.ok) {
					const data = await response.json();
					setPendingCount(data.pagination?.total || 0);
				} else {
					console.error("Failed to fetch pending books count");
				}
			} catch (error) {
				console.error("Error fetching pending books:", error);
			}
		};

		fetchPendingCount();

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
