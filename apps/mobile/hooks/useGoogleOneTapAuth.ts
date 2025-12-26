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
			// 1. Ellenőrizzük a Google Play szolgáltatásokat (főleg Androidon fontos)
			await GoogleSignin.hasPlayServices();

			// 2. Bejelentkezés indítása
			// Ez megnyitja a Google modalját
			const userInfo = await GoogleSignin.signIn();

			// Az idToken a legfontosabb, ezt küldjük a backendnek
			const idToken = userInfo.data?.idToken;

			if (!idToken) {
				return {
					success: false,
					user: null,
					errors: "Google ID Token is missing. Please try again.",
				};
			}

			// 3. Küldés a SuperTokens backendnek
			// FONTOS: Az URL-nek egyeznie kell a SuperTokens init apiDomain-nel!
			const response = await fetch("http://192.168.1.121:3000/auth/signinup", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					// A "rid" segít a SuperTokens-nek beazonosítani a kérést
					rid: "thirdparty",
				},
				body: JSON.stringify({
					thirdPartyId: "google",
					oAuthTokens: {
						id_token: idToken,
					},
					clientType: "android", // vagy "ios", de a backend általában a Web Client ID-t nézi
				}),
			});

			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(`Server error: ${response.status} - ${errorText}`);
			}

			const data = await response.json();

			// 4. Válasz kezelése
			if (data.status === "OK") {
				// Megerősítjük a SuperTokens SDK-nak, hogy a session aktív
				const sessionExists = await SuperTokens.doesSessionExist();
				console.log(
					"[Google Auth] SuperTokens session established:",
					sessionExists
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

			// Specifikus hibaüzenet, ha a felhasználó egyszerűen bezárta a modalt
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
