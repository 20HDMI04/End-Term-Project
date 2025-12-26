import { createContext, useState, useEffect, useContext } from "react";
import SuperTokens from "supertokens-react-native";
import { googleSignInAndSuperTokensAuth } from "@/hooks/useGoogleOneTapAuth";

interface ResponseData {
	error: boolean;
	msg: string;
}

interface AuthProps {
	authState: { isAuthenticated: boolean | null; userId: string | null };
	onRegister: (email: string, password: string) => Promise<ResponseData>;
	onLogin: (email: string, password: string) => Promise<ResponseData>;
	onLoginWithThirdParty: () => Promise<ResponseData>;
	onLogout: () => Promise<void>;
}

const Api_URL = "http://192.168.1.121:3000";
const AuthContext = createContext<AuthProps>(null as any);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
	const [authState, setAuthState] = useState<{
		isAuthenticated: boolean | null;
		userId: string | null;
	}>({
		isAuthenticated: null,
		userId: null,
	});

	useEffect(() => {
		const checkSession = async () => {
			try {
				const sessionExists = await SuperTokens.doesSessionExist();
				if (sessionExists) {
					const userId = await SuperTokens.getUserId();
					setAuthState({ isAuthenticated: true, userId });
				} else {
					setAuthState({ isAuthenticated: false, userId: null });
				}
			} catch (e) {
				setAuthState({ isAuthenticated: false, userId: null });
			}
		};
		checkSession();
	}, []);

	const updateAuthStateAfterLogin = async () => {
		const userId = await SuperTokens.getUserId();
		setAuthState({ isAuthenticated: true, userId });
	};

	const onRegister = async (
		email: string,
		password: string
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
				await updateAuthStateAfterLogin();
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
		password: string
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
				await updateAuthStateAfterLogin();
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
				await updateAuthStateAfterLogin();
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
			await SuperTokens.signOut();
			setAuthState({ isAuthenticated: false, userId: null });
		} catch (error) {
			console.error("[AuthContext] Logout error:", error);
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
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};
