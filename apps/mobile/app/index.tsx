import { useEffect } from "react";
import { useRouter } from "expo-router";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useAuth } from "@/contexts/AuthContext";

export default function Index() {
	const router = useRouter();
	const { authState } = useAuth();

	useEffect(() => {
		if (authState.isAuthenticated !== null) {
			if (authState.isAuthenticated) {
				console.log("[Index] User is authenticated, redirecting to Tabs...");
				router.replace("/(tabs)");
			} else {
				console.log(
					"[Index] User is not authenticated, redirecting to Auth..."
				);
				router.replace("/(authentication)/auth");
			}
		}
	}, [authState.isAuthenticated]);
	return (
		<View style={styles.container}>
			<ActivityIndicator size="large" color="#0000ff" />
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
