import {
	Platform,
	StyleSheet,
	TouchableOpacity,
	View,
	ScrollView,
} from "react-native";
import { ThemedText } from "@/components/themed-text";
import { SafeAreaView } from "react-native-safe-area-context";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { AnimatedCarousel } from "@/components/homeComponents/AnimatedCarousel";
import DashboardAdCarousel from "@/components/homeComponents/DashboardAdCarousel";
import { useAuth } from "@/contexts/AuthContext";
import { Stack } from "expo-router";

export default function HomeScreen() {
	const { onLogout, authState } = useAuth();

	const handleLogout = async () => {
		await onLogout();
	};

	return (
		<>
			<Stack.Screen
				options={{
					title: "Search",
					headerTitle: "Search for items",
				}}
			/>
			<View style={{ flex: 1, position: "relative" }}>
				<SafeAreaView style={{ flex: 1 }}>
					<ScrollView showsVerticalScrollIndicator={false}>
						{authState.roles.includes("new_user") && (
							<ThemedText style={styles.adminBadge}>New User Mode</ThemedText>
						)}

						<DashboardAdCarousel />
						<AnimatedCarousel />

						<TouchableOpacity
							style={styles.logoutButton}
							onPress={handleLogout}
						>
							<ThemedText style={{ fontSize: 16, fontWeight: "500" }}>
								Log out
							</ThemedText>
							<IconSymbol
								color={"#960303ff"}
								name="arrow.right.square"
								size={18}
								style={{
									marginBottom: Platform.OS === "ios" ? 2 : 0,
								}}
							/>
						</TouchableOpacity>

						<ThemedText style={styles.welcomeText}>
							Welcome back! Your User ID: {authState.userId}
						</ThemedText>
						<ThemedText style={styles.welcomeText}>
							Welcome back! Your User ID: {authState.userId}
						</ThemedText>
						<ThemedText style={styles.welcomeText}>
							Welcome back! Your User ID: {authState.userId}
						</ThemedText>
						<ThemedText style={styles.welcomeText}>
							Welcome back! Your User ID: {authState.userId}
						</ThemedText>
					</ScrollView>
				</SafeAreaView>
			</View>
		</>
	);
}

const styles = StyleSheet.create({
	logoutButton: {
		marginHorizontal: 16,
		marginBottom: 16,
		flexDirection: "row",
		gap: 8,
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: 8,
		paddingHorizontal: 12,
		borderRadius: 8,
		backgroundColor: "#ffffff",
		shadowColor: "#960303",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.3, // Kicsit visszavettem, hogy ne legyen túl erős
		shadowRadius: 4,
		elevation: 3, // Androidra kell a shadow helyett
	},
	adminBadge: {
		textAlign: "center",
		backgroundColor: "#ffcccc",
		color: "#960303",
		padding: 4,
		fontWeight: "bold",
	},
	welcomeText: {
		textAlign: "center",
		marginVertical: 10,
	},
});
