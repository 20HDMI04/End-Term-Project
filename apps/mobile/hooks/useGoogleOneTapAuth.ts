import { GoogleSignin } from "@react-native-google-signin/google-signin";
// eslint-disable-next-line import/no-extraneous-dependencies
// @ts-ignore
import { WEB_CLIENT_ID } from "react-native-dotenv";
import type { GoogleUserInfo } from "@/constants/interfaces";

const WEB_CLIENTID = WEB_CLIENT_ID;

if (!WEB_CLIENTID) {
	throw new Error(
		"Google Web Client ID is not defined in environment variables."
	);
} else {
	GoogleSignin.configure({
		webClientId: WEB_CLIENTID,
		offlineAccess: false,
		scopes: ["openid", "profile", "email"],
	});
}

export const googleSignInAndSuperTokensAuth = async () => {
	try {
		await GoogleSignin.hasPlayServices();
		const userInfo = await GoogleSignin.signIn();
		//profile picture
		const photo = (userInfo as GoogleUserInfo).data.user.photo;
		// 2. Google ID Token
		const idToken = (userInfo as GoogleUserInfo).data?.idToken;

		if (!idToken) {
			throw new Error("Google ID Token hiányzik.");
		}

		// 3. ID Token send to SuperTokens backend
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
					clientType: "android",
				}),
			}
		);

		const data = await supertokensResponse.json();

		// 4. Session handling based on SuperTokens response
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
