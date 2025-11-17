import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import SuperTokens from "supertokens-react-native";

const BACKEND_URL = "https://chloroplastic-crumbly-dominic.ngrok-free.dev";

export default function OAuthCallbackScreen() {
	const router = useRouter();
	const params = useLocalSearchParams();
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		handleCallback();
	}, []);

	const handleCallback = async () => {
		try {
			console.log("OAuth callback params:", params);

			// Check if there's an error
			if (params.error) {
				console.error("OAuth error:", params.error);
				setError("Authentication failed. Please try again.");
				setTimeout(() => router.replace("/auth"), 2000);
				return;
			}

			// Check if we have a token from the backend
			if (params.token) {
				console.log("Received token from backend:", params.token);

				// Exchange the token for a session
				const response = await fetch(
					`${BACKEND_URL}/auth-mobile/mobile-session?token=${params.token}`,
					{
						method: "GET",
						credentials: "include",
					}
				);

				console.log("Mobile session response status:", response.status);

				if (response.ok) {
					const data = await response.json();
					console.log("Mobile session response:", data);

					if (data.status === "OK") {
						// Verify session was created
						const sessionExists = await SuperTokens.doesSessionExist();
						console.log("Session exists after token exchange:", sessionExists);

						if (sessionExists) {
							console.log("Successfully authenticated!");
							router.replace("/(tabs)");
							return;
						}
					}
				}

				setError("Failed to create session");
				setTimeout(() => router.replace("/auth"), 2000);
				return;
			}

			// No token received - something went wrong
			console.error("No token in callback params");
			setError("Authentication incomplete");
			setTimeout(() => router.replace("/auth"), 2000);
		} catch (error: any) {
			console.error("OAuth callback error:", error);
			setError(error.message || "Authentication failed");
			setTimeout(() => router.replace("/auth"), 2000);
		}
	};

	return (
		<View style={styles.container}>
			<ActivityIndicator size="large" color="#667eea" />
			<Text style={styles.text}>{error ? error : "Completing sign in..."}</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "#fff",
	},
	text: {
		marginTop: 16,
		fontSize: 16,
		color: "#666",
	},
});
