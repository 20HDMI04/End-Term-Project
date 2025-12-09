import { GoogleSignin } from "@react-native-google-signin/google-signin";
// eslint-disable-next-line import/no-extraneous-dependencies
import { WEB_CLIENT_ID } from "react-native-dotenv";

const WEB_CLIENTID = WEB_CLIENT_ID;
console.log("WEB_CLIENT_ID:", WEB_CLIENTID);

if (!WEB_CLIENTID) {
	throw new Error(
		"Google Web Client ID is not defined in environment variables."
	);
} else {
	GoogleSignin.configure({
		webClientId: WEB_CLIENTID,
		offlineAccess: true,
		scopes: ["profile", "email"],
	});
}

export const googleSignInAndSuperTokensAuth = async () => {
	try {
		await GoogleSignin.hasPlayServices();
		const userInfo = await GoogleSignin.signIn();
		// 2. Kinyerjük a Google ID Tokent
		const idToken = userInfo.data?.idToken;

		if (!idToken) {
			throw new Error("Google ID Token hiányzik.");
		}

		// 3. ID Token küldése a SuperTokens Core-nak
		const supertokensResponse = await fetch(
			"http://192.168.1.121:3000/auth/signinup",
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					thirdPartyId: "google",
					oAuthTokens: {
						id_token: idToken,
					},
				}),
			}
		);

		const data = await supertokensResponse.json();

		// 4. Session kezelése
		if (data.status === "OK") {
			return { user: data.user, errors: null };
		} else {
			return {
				user: null,
				errors: "Authentication/Sign-in error: " + data.message,
			};
		}
	} catch (error) {
		return {
			user: null,
			errors: `"Authentication/Sign-in error: ", ${error}`,
		};
	}
};
