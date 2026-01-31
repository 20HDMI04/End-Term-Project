import { GoogleSignin } from "@react-native-google-signin/google-signin";
import SuperTokens from "supertokens-react-native";

export interface GoogleAuthResult {
	success: boolean;
	user: any | null;
	errors: string | null;
	roles?: string[];
}

export const googleSignInAndSuperTokensAuth =
	async (): Promise<GoogleAuthResult> => {
		try {
			// Ensure Google Play Services are available (Android only)
			await GoogleSignin.hasPlayServices();

			// Login with Google
			const userInfo = await GoogleSignin.signIn();

			// Get the ID token from Google
			const idToken = userInfo.data?.idToken;

			if (!idToken) {
				return {
					success: false,
					user: null,
					errors: "Google ID Token is missing. Please try again.",
				};
			}

			// Send the ID token to your backend for SuperTokens authentication
			const response = await fetch("http://192.168.1.121:3000/auth/signinup", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					rid: "thirdparty",
				},
				body: JSON.stringify({
					thirdPartyId: "google",
					oAuthTokens: {
						id_token: idToken,
					},
					clientType: "android",
				}),
			});

			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(`Server error: ${response.status} - ${errorText}`);
			}

			const data = await response.json();

			// Response details from backend
			if (data.status === "OK") {
				const sessionExists = await SuperTokens.doesSessionExist();
				console.log(
					"[Google Auth] SuperTokens session established:",
					sessionExists,
				);

				return {
					success: true,
					user: data.user,
					errors: null,
					roles: data.roles || [],
				};
			} else {
				return {
					success: false,
					user: null,
					errors: data.message || "Backend authentication failed.",
				};
			}
		} catch (error: any) {
			console.error("[Google Auth Error]:", error);

			// Specific error message if the user simply closed the modal
			if (error.code === "7") {
				// SIGN_IN_CANCELLED
				return {
					success: false,
					user: null,
					errors: "Sign-in cancelled by user.",
				};
			}

			return {
				success: false,
				user: null,
				errors:
					error.message ||
					"An unexpected error occurred during Google Sign-In.",
			};
		}
	};
