import {
	Platform,
	StyleSheet,
	TouchableOpacity,
	Alert,
	View,
	ScrollView,
} from "react-native";
import SuperTokens from "supertokens-react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { SafeAreaView } from "react-native-safe-area-context";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useRouter } from "expo-router";
import { AnimatedCarousel } from "@/components/homeComponents/AnimatedCarousel";
import DashboardAdCarousel from "@/components/homeComponents/DashboardAdCarousel";
import { AppHeader } from "@/components/AppHeader";
import { use, useEffect } from "react";

export default function HomeScreen() {
	const router = useRouter();

	const handleLogout = async () => {
		try {
			await SuperTokens.signOut();
			console.log("User signed out successfully");
			router.replace("/auth");
		} catch (error) {
			console.error("Logout error:", error);
			Alert.alert("Error", "Failed to log out. Please try again.");
		}
	};

	return (
		<View style={{ flex: 1, position: "relative" }}>
			<SafeAreaView style={{ flex: 1 }}>
				<ScrollView showsVerticalScrollIndicator={false}>
					<DashboardAdCarousel />
					<AnimatedCarousel />

					<TouchableOpacity
						style={{
							marginHorizontal: 16,
							marginBottom: 16,
							flexDirection: "row",
							gap: 8,
							alignItems: "center",
							justifyContent: "center",
							paddingVertical: 8,
							paddingHorizontal: 12,
							borderRadius: 8,
							backgroundColor: "#ffffffff",
							shadowColor: "#960303ff",
							shadowOffset: { width: 0, height: 2 },
							shadowOpacity: 0.8,
							shadowRadius: 4,
						}}
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
					<ThemedText>
						You are logged in! Explore the app and enjoy your experience.
					</ThemedText>
					<ThemedText>
						You are logged in! Explore the app and enjoy your experience.
					</ThemedText>
					<ThemedText>
						You are logged in! Explore the app and enjoy your experience.
					</ThemedText>
					<ThemedText>
						You are logged in! Explore the app and enjoy your experience.
					</ThemedText>
				</ScrollView>
			</SafeAreaView>
		</View>
	);
}

const styles = StyleSheet.create({
	titleContainer: {
		flexDirection: "row",
		alignItems: "center",
		gap: 16,
		fontSize: 20,
		fontWeight: "600",
		textAlign: "center",
		marginTop: 12,
		marginBottom: 12,
	},
});
