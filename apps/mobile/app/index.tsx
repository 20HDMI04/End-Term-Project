import { useEffect, useState } from "react";
import { useRouter, useRootNavigationState, useSegments } from "expo-router";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import SuperTokens from "supertokens-react-native";
import "expo-router/entry";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
const WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;

GoogleSignin.configure({
	webClientId: WEB_CLIENT_ID,
	offlineAccess: true,
	scopes: ["profile", "email"],
});

export default function Index() {
	const router = useRouter();
	const segments = useSegments();
	const navigationState = useRootNavigationState();
	const [hasNavigated, setHasNavigated] = useState(false);

	useEffect(() => {
		// Wait for navigation to be ready
		if (!navigationState?.key || hasNavigated) return;

		// Navigate immediately without delay
		checkAuth();
	}, [navigationState?.key, hasNavigated]);

	const checkAuth = async () => {
		if (hasNavigated) return;

		try {
			const sessionExists = await SuperTokens.doesSessionExist();
			console.log("Index: Session exists:", sessionExists);

			setHasNavigated(true);

			if (sessionExists) {
				router.replace("/(tabs)");
			} else {
				router.replace("/auth");
			}
		} catch (error) {
			console.error("Index: Error checking session:", error);
			setHasNavigated(true);
			router.replace("/auth");
		}
	};

	// Return empty view instead of loading indicator
	return <View style={styles.container} />;
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "#fff",
	},
});
