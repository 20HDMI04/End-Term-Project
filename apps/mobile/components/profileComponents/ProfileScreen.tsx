import React from "react";
import {
	View,
	Text,
	StyleSheet,
	Image,
	Pressable,
	ScrollView,
	TouchableOpacity,
	useColorScheme,
	BackHandler,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";

const ProfileMenuItem = ({
	icon,
	label,
	onPress,
}: {
	icon: string;
	label: string;
	onPress: () => void;
}) => {
	const isDarkMode = useColorScheme() === "dark";
	return (
		<Pressable
			style={({ pressed }) => [
				styles.menuItem,
				{ backgroundColor: isDarkMode ? Colors.mainColorDark : "#fff" },
				pressed && { backgroundColor: "rgba(0,0,0,0.05)" },
			]}
			onPress={onPress}
		>
			<View style={styles.menuItemLeft}>
				<View style={styles.iconPlaceholder}>
					<Ionicons
						name={icon as any}
						size={24}
						color={isDarkMode ? "#ffffff" : Colors.mainColorLight}
					/>
				</View>
				<Text
					style={[
						styles.menuItemLabel,
						{ color: isDarkMode ? "#ffffff" : Colors.mainColorLight },
					]}
				>
					{label}
				</Text>
			</View>
			<Ionicons
				name="chevron-forward"
				size={20}
				color={isDarkMode ? "#ffffff" : Colors.mainColorLight}
			/>
		</Pressable>
	);
};

interface ProfileScreenProps {
	biggerProfilePic?: string;
	createdAt?: string;
	email?: string;
	nickname?: any;
	smallerProfilePic?: string;
	updatedAt?: string;
}

export default function ProfileScreen({
	biggerProfilePic,
	createdAt,
	email,
	nickname,
	smallerProfilePic,
	updatedAt,
}: ProfileScreenProps) {
	const { onLogout } = useAuth();
	const handleLogout = async () => {
		await onLogout();
	};
	const handlePress = (item: string) => {
		console.log(`${item} pressed - ide jöhet az overlay`);
	};
	const isDarkMode = useColorScheme() === "dark";
	const mainColor = isDarkMode
		? Colors.secondaryColorDark
		: Colors.mainColorLight;
	const secondaryColor = isDarkMode
		? Colors.loginTextDark
		: Colors.darkerTextLight;

	return (
		<ScrollView style={styles.container} contentContainerStyle={styles.content}>
			<View style={styles.userInfoContainer}>
				<Image
					source={{
						uri: biggerProfilePic || "https://via.placeholder.com/100",
					}}
					style={styles.profileImage}
				/>
				<View>
					<Text style={[styles.userName, { color: mainColor }]}>
						{nickname || email || "Your Nickname"}
					</Text>
					<Text style={[styles.userEmail, { color: secondaryColor }]}>
						{email || "Email"}
					</Text>
				</View>
			</View>

			<View
				style={[
					styles.menuBlock,
					{ borderColor: isDarkMode ? "#ffffff" : "#F0F0F0" },
				]}
			>
				<ProfileMenuItem
					icon="time-outline"
					label="Comment History"
					onPress={() => handlePress("Comments")}
				/>
				<View
					style={[
						styles.separator,
						{
							backgroundColor: isDarkMode ? "#ffffff" : "#F0F0F0",
						},
					]}
				/>
				<ProfileMenuItem
					icon="settings-outline"
					label="Settings"
					onPress={() => handlePress("Settings")}
				/>
				<View
					style={[
						styles.separator,
						{
							backgroundColor: isDarkMode ? "#ffffff" : "#F0F0F0",
						},
					]}
				/>
				<ProfileMenuItem
					icon="person-outline"
					label="Manage Profile"
					onPress={() => handlePress("Manage")}
				/>
			</View>

			<View
				style={[
					styles.menuBlock,
					{ borderColor: isDarkMode ? "#ffffff" : "#F0F0F0" },
				]}
			>
				<ProfileMenuItem
					icon="help-circle-outline"
					label="FAQs"
					onPress={() => handlePress("FAQs")}
				/>
				<View
					style={[
						styles.separator,
						{
							backgroundColor: isDarkMode ? "#ffffff" : "#F0F0F0",
						},
					]}
				/>
				<ProfileMenuItem
					icon="shield-checkmark-outline"
					label="Our Policy"
					onPress={() => handlePress("Policy")}
				/>
			</View>

			<Pressable
				style={({ pressed }) => [
					styles.logoutButton,
					pressed && { opacity: 0.7 },
				]}
				onPress={() => handleLogout()}
			>
				<Ionicons name="log-out-outline" size={24} color="#A52A2A" />
				<Text style={styles.logoutText}>Log out</Text>
			</Pressable>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	content: {
		padding: 20,
		paddingTop: 60,
	},
	userInfoContainer: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 40,
	},
	profileImage: {
		width: 100,
		height: 100,
		borderRadius: 50,
		marginRight: 20,
	},
	userName: {
		fontSize: 24,
		fontFamily: "modern_no_20_regular",
	},
	userEmail: {
		fontSize: 18,
		fontFamily: "modern_no_20_regular",
	},
	menuBlock: {
		borderRadius: 20,
		marginBottom: 20,
		overflow: "hidden",
		borderWidth: 1,
	},
	menuItem: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		padding: 18,
	},
	menuItemLeft: {
		flexDirection: "row",
		alignItems: "center",
	},
	iconPlaceholder: {
		marginRight: 10,
	},
	menuItemLabel: {
		fontSize: 18,
		fontFamily: "modern_no_20_regular",
	},
	separator: {
		height: 1,
		marginHorizontal: 15,
	},
	logoutButton: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#FFF",
		borderRadius: 20,
		padding: 18,
		marginTop: 10,
		borderWidth: 1,
		borderColor: "#FFC0CB",
	},
	logoutText: {
		marginLeft: 10,
		fontSize: 18,
		color: "#A52A2A",
		fontFamily: "modern_no_20_regular",
		fontWeight: "600",
	},
});
