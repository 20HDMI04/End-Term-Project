/**
 * ================================================================
 * READSY - DASHBOARD COMPONENT
 * Main Entry Point & Dashboard Page
 * ================================================================
 * File: src/components/Dashboard.tsx
 * Route: /
 * Protected: Yes (SessionAuth wrapper in src/App.tsx)
 * 
 * Purpose:
 * - Main landing page after user login
 * - Display user information and session data
 * - Role-based access control
 * - Navigation to other features
 * 
 * Key Features:
 * ✓ Display user ID, email, and roles
 * ✓ Fetch user data from backend (/user/me)
 * ✓ Check user roles from JWT token
 * ✓ Logout functionality
 * ✓ Navigation to other pages
 * \n * Related Files:
 * → src/components/Dashboard.css - Styling\n * → src/App.tsx (line ~102) - Route definition
 * \n * Backend API Calls:\n * GET http://localhost:3000/user/me\n * PATCH http://localhost:3000/user/me-the-first-time\n * \n * See: COMPONENT_GUIDE.md → Dashboard Component\n * ================================================================\n */
 import { useNavigate } from "react-router-dom";
import { signOut } from "supertokens-auth-react/recipe/session";
import { useSessionContext } from "supertokens-auth-react/recipe/session";
import "./Dashboard.css";
import Session from "supertokens-auth-react/recipe/session";
import { useEffect, useState } from "react";

async function checkUserRole() {
	if (await Session.doesSessionExist()) {
		const payload = await Session.getAccessTokenPayloadSecurely();
		console.log("Access token payload:", payload);
		const roles = payload["roles"].roles || payload["roles"] || [];
		return roles;
	}
	return [];
}

export default function Dashboard() {
	const navigate = useNavigate();
	const session = useSessionContext();

	const handleLogout = async () => {
		await signOut();
		navigate("/auth");
	};

	if (session.loading) {
		return <div className="loading">Loading...</div>;
	}
	const userId = session.userId;
	const email = session.accessTokenPayload.email as string | undefined;
	const [roles, setRoles] = useState<string[]>([]);

	useEffect(() => {
		const fetchRoles = async () => {
			const userRoles = await checkUserRole();
			setRoles(userRoles);
		};
		fetchRoles();
	}, []);

	useEffect(() => {
		const fetchUser = async () => {
			try {
				const response = await fetch(`http://localhost:3000/user/me`, {
					method: "GET",
					credentials: "include",
					headers: {
						"Content-Type": "application/json",
					},
				});
				const data = await response.json();
				console.log("User data from backend:", data);
			} catch (error) {
				console.error("Error fetching user data:", error);
			}
		};
		fetchUser();
	}, []);

	async function updateUserFirstTime() {
		const form = new FormData();
		form.append("nickname", "Lajos");
		try {
			const response = await fetch(
				`http://localhost:3000/user/me-the-first-time`,
				{
					method: "PATCH",
					credentials: "include",
					body: form,
				}
			);
			const data = await response.json();
			console.log("Update first time response:", data);
			await Session.attemptRefreshingSession();

			const updatedRoles = await checkUserRole();

			setRoles(updatedRoles);
		} catch (error) {
			console.error("Error updating first time flag:", error);
		}
	}
	return (
		<>
			<div className="dashboard-container">
				<div className="dashboard-card">
					<div className="dashboard-header">
						<h1>Welcome to Readsy! </h1>
						{email && <p className="user-email">{email}</p>}
						<p className="user-id">User ID: {userId}</p>
						{roles && roles.length > 0 && (
							<div className="user-roles">
								<span className="role-label">Roles: </span>
								{roles.map((role) => (
									<span key={role} className="role-badge">
										{role}
									</span>
								))}
							</div>
						)}
					</div>

					<div className="dashboard-content">
						<p className="welcome-message">
							You're successfully logged in! Start exploring your reading
							journey.
						</p>

						<div className="actions">
							<button
								className="btn-primary"
								onClick={() => navigate("/books")}
							>
								Browse Books
							</button>
							<button className="btn-secondary" onClick={handleLogout}>
								Logout
							</button>
						</div>
					</div>
				</div>
			</div>
			{/* Book Creator for testing purposes */}

			<button onClick={updateUserFirstTime}>Update First Time Flag</button>
		</>
	);
}
