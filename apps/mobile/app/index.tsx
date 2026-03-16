import { useEffect } from "react";
import { useRouter } from "expo-router";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useAuth } from "@/contexts/AuthContext";
import { Colors } from "@/constants/theme";

export default function Index() {
	const router = useRouter();
	const { authState } = useAuth();

	useEffect(() => {
		if (authState.isAuthenticated !== null) {
			const timeout = setTimeout(() => {
				if (authState.isAuthenticated) {
					console.log("[Index] Authenticated -> Tabs");
					router.replace("/(tabs)");
				} else {
					console.log("[Index] Not authenticated -> Auth");
					router.replace("/(authentication)/auth");
				}
			}, 1);

			return () => clearTimeout(timeout);
		}
	}, [authState.isAuthenticated]);

	return (
		<View style={styles.container}>
			<ActivityIndicator size="large" color={Colors.mainColorLight} />
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
});
