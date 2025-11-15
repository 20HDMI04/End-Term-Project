import { useEffect, useState } from "react";
import { useRouter, useRootNavigationState, useSegments } from "expo-router";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import SuperTokens from "supertokens-react-native";

export default function Index() {
	const router = useRouter();
	const segments = useSegments();
	const navigationState = useRootNavigationState();
	const [hasNavigated, setHasNavigated] = useState(false);

	useEffect(() => {
		// Wait for navigation to be ready
		if (!navigationState?.key || hasNavigated) return;

		const timer = setTimeout(() => {
			checkAuth();
		}, 300);

		return () => clearTimeout(timer);
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

	return (
		<View style={styles.container}>
			<ActivityIndicator size="large" color="#667eea" />
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
});
