import { createContext, useState, useEffect, useContext } from "react";
import SuperTokens from "supertokens-react-native";
import { googleSignInAndSuperTokensAuth } from "@/hooks/useGoogleOneTapAuth";
import { ApiProvider } from "./ApiContext";
import { UserService } from "@/services/user.service";
import { Storage } from "@/utils/storage";

interface ResponseData {
	error: boolean;
	msg: string;
}

interface AuthState {
	isAuthenticated: boolean | null;
	userId: string | null;
	roles: string[] | null;
}

interface AuthProps {
	authState: AuthState;
	onRegister: (email: string, password: string) => Promise<ResponseData>;
	onLogin: (email: string, password: string) => Promise<ResponseData>;
	onLoginWithThirdParty: () => Promise<ResponseData>;
	onLogout: () => Promise<void>;
	finalizeLogin: () => Promise<void>;
	refreshUserSession: () => Promise<void>;
}

const Api_URL = "https://chloroplastic-crumbly-dominic.ngrok-free.dev";
const AuthContext = createContext<AuthProps>(null as any);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
	const [authState, setAuthState] = useState<AuthState>({
		isAuthenticated: null,
		userId: null,
		roles: [],
	});

	useEffect(() => {
		const checkSession = async () => {
			try {
				const sessionExists = await SuperTokens.doesSessionExist();
				if (sessionExists) {
					const userId = await SuperTokens.getUserId();
					const payload = await SuperTokens.getAccessTokenPayloadSecurely();
					const roles =
						payload.roles || payload["st-role"]?.v || payload["roles"] || [];

					setAuthState({ isAuthenticated: true, userId, roles: roles });
				} else {
					setAuthState({ isAuthenticated: false, userId: null, roles: [] });
				}
			} catch (e) {
				setAuthState({ isAuthenticated: false, userId: null, roles: [] });
			}
		};
		checkSession();
	}, []);

	const refreshUserSession = async () => {
		try {
			const didRefresh = await SuperTokens.attemptRefreshingSession();

			if (didRefresh) {
				const userId = await SuperTokens.getUserId();
				const payload = await SuperTokens.getAccessTokenPayloadSecurely();
				const roles =
					payload.roles || payload["st-role"]?.v || payload["roles"] || [];
				setAuthState({
					isAuthenticated: true,
					userId,
					roles: roles,
				});
			} else {
				console.log("[AuthContext] Refresh not needed or failed.");
			}
		} catch (e: any) {
			if (e.status === 401) {
				onLogout();
			}
			console.error("[AuthContext] Refresh error:", e);
		}
	};

	const onRegister = async (
		email: string,
		password: string,
	): Promise<ResponseData> => {
		try {
			const response = await fetch(`${Api_URL}/auth/signup`, {
				method: "POST",
				headers: { "Content-Type": "application/json", rid: "emailpassword" },
				body: JSON.stringify({
					formFields: [
						{ id: "email", value: email },
						{ id: "password", value: password },
					],
				}),
			});

			const data = await response.json();
			if (data.status === "OK") {
				return { error: false, msg: "Registration successful." };
			} else {
				return { error: true, msg: data.message || "Registration failed" };
			}
		} catch (error) {
			return { error: true, msg: "Network error during registration" };
		}
	};

	const onLogin = async (
		email: string,
		password: string,
	): Promise<ResponseData> => {
		try {
			const response = await fetch(`${Api_URL}/auth/signin`, {
				method: "POST",
				headers: { "Content-Type": "application/json", rid: "emailpassword" },
				body: JSON.stringify({
					formFields: [
						{ id: "email", value: email },
						{ id: "password", value: password },
					],
				}),
			});

			const data = await response.json();
			if (data.status === "OK") {
				return { error: false, msg: "Login successful." };
			} else {
				return { error: true, msg: data.message || "Invalid credentials" };
			}
		} catch (error) {
			return { error: true, msg: "Network error during login" };
		}
	};

	const onLoginWithThirdParty = async (): Promise<ResponseData> => {
		try {
			const result = await googleSignInAndSuperTokensAuth();

			if (result.success) {
				return { error: false, msg: "Google Sign-In successful." };
			} else {
				return { error: true, msg: result.errors || "Google Sign-In failed" };
			}
		} catch (error) {
			return { error: true, msg: "An unexpected error occurred" };
		}
	};

	const onLogout = async (): Promise<void> => {
		try {
			console.log("[AuthContext] Attempting logout...");
			await SuperTokens.signOut();
			await Storage.clearAllItem();
			console.log("[AuthContext] Logout successful.");
		} catch (error) {
			console.error("[AuthContext] Logout error (Server unreachable):", error);
		} finally {
			console.log("[AuthContext] Logout instantiation...");
			setAuthState({
				isAuthenticated: false,
				userId: null,
				roles: [],
			});
		}
	};

	const finalizeLogin = async () => {
		try {
			const userId = await SuperTokens.getUserId();
			const payload = await SuperTokens.getAccessTokenPayloadSecurely();
			console.log("Access token payload on finalizeLogin:", payload);
			const roles =
				payload.roles.roles || payload["st-role"]?.v || payload["roles"] || [];
			setAuthState({
				isAuthenticated: true,
				userId,
				roles: Array.isArray(roles) ? roles : [],
			});
		} catch (e) {
			console.error("Finalize error:", e);
		}
	};

	return (
		<AuthContext.Provider
			value={{
				authState,
				onRegister,
				onLogin,
				onLoginWithThirdParty,
				onLogout,
				finalizeLogin,
				refreshUserSession,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};
