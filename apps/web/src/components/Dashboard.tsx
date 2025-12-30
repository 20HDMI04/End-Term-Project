import { useNavigate } from "react-router-dom";
import { signOut } from "supertokens-auth-react/recipe/session";
import { useSessionContext } from "supertokens-auth-react/recipe/session";
import "./Dashboard.css";
import Session from "supertokens-auth-react/recipe/session";
import { useEffect, useState } from "react";

async function checkUserRole() {
	if (await Session.doesSessionExist()) {
		const payload = await Session.getAccessTokenPayloadSecurely();
		const roles = payload["st-role"]?.v || [];
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

	return (
		<>
			<div className="dashboard-container">
				<div className="dashboard-card">
					<div className="dashboard-header">
						<h1>Welcome to Readsy! 📚</h1>
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
		</>
	);
}
