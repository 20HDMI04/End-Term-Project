import { useEffect } from "react";
import { useRouter, useRootNavigationState } from "expo-router";
import {
	View,
	ActivityIndicator,
	StyleSheet,
	useColorScheme,
} from "react-native";
import { useAuth } from "@/contexts/AuthContext";
import { Colors } from "@/constants/theme";

export default function Index() {
	const router = useRouter();
	const { authState } = useAuth();
	const isDarkMode = useColorScheme() === "dark";
	const rootNavigationState = useRootNavigationState();

	useEffect(() => {
		const isNavigationReady = rootNavigationState?.key;
		const isAuthLoaded = authState.isAuthenticated !== null;

		if (isAuthLoaded && isNavigationReady) {
			if (authState.isAuthenticated) {
				console.log("[Index] Redirecting to Tabs");
				router.replace("/(tabs)");
			} else {
				console.log("[Index] Redirecting to Auth");
				router.replace("/(authentication)/auth");
			}
		}
	}, [authState.isAuthenticated, rootNavigationState?.key]);

	return (
		<View
			style={[
				styles.container,
				{ backgroundColor: isDarkMode ? Colors.mainColorDark : "#FFFFFF" },
			]}
		>
			<ActivityIndicator
				size="large"
				color={isDarkMode ? "#FFFFFF" : Colors.mainColorLight}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, justifyContent: "center", alignItems: "center" },
});
