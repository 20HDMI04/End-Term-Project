import React, { useEffect, useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	Image,
	Pressable,
	ScrollView,
	TouchableOpacity,
	useColorScheme,
	Modal,
	SafeAreaView,
	Linking,
	Alert,
	Keyboard,
	ActivityIndicator,
	DeviceEventEmitter,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import ProfileEditScreen from "../homeComponents/ProfileEditScreen";
import { useApi } from "@/contexts/ApiContext";
import { CommentHistoryResponse } from "@/constants/interfaces";
import { useChangePicUrlToPipline } from "@/hooks/use-change-pic-url-to-pipline";
import { useGetRelativeTime } from "@/hooks/use-get-realtive-time";

const FAQModal = ({
	visible,
	onClose,
	isDarkMode,
}: {
	visible: boolean;
	onClose: () => void;
	isDarkMode: boolean;
}) => {
	const theme = {
		background: isDarkMode ? Colors.mainColorDark : "#F9F9F7",
		textPrimary: isDarkMode ? "#E0E0E0" : Colors.mainColorLight,
		textSecondary: isDarkMode ? Colors.loginTextDark : Colors.darkerTextLight,
		card: isDarkMode ? Colors.mainColorDarker : "#FFFFFF",
		border: isDarkMode ? Colors.thirdColorDark : "#E8E8E3",
		accent: isDarkMode ? Colors.secondaryColorDark : Colors.mainColorLight,
	};

	const faqs = [
		{
			q: "How does Readsy work?",
			a: "Readsy is a digital library and social platform where you can discover your favorite books and authors.",
		},
		{
			q: "Is the app free to use?",
			a: "Yes, the basic features are available free of charge for all registered users.",
		},
		{
			q: "How can I add a book to my favorites?",
			a: "You can save a book to your list by clicking the heart icon located in the top right corner of the book's details page.",
		},
		{
			q: "Where can I see my comments?",
			a: "You can find all your previous posts in your profile under the 'Comment History' menu item.",
		},
		{
			q: "How can I rate a book?",
			a: "Scroll down to the 'Rate this book' section in the book details and select the number of stars.",
		},
		{
			q: "Can I change my profile picture?",
			a: "Yes, you can edit your personal information and your picture in the 'Manage Profile' menu.",
		},
		{
			q: "Is dark mode available?",
			a: "The app automatically follows your phone's system settings (Light/Dark mode).",
		},
		{
			q: "How can I search by genre?",
			a: "You can filter by categories in the search bar or under the 'Expertise In' section on the authors' profile pages.",
		},
		{
			q: "What should I do if I find a bug?",
			a: "Please contact us through the Support option found in the Settings menu.",
		},
		{
			q: "How can I delete my account?",
			a: "You can initiate the removal of your data using the account deletion button at the bottom of the Manage Profile section.",
		},
	];

	return (
		<Modal visible={visible} animationType="slide" transparent>
			<SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
				<View style={[styles.header, { borderBottomColor: theme.border }]}>
					<TouchableOpacity onPress={onClose}>
						<Ionicons name="close" size={26} color={theme.textPrimary} />
					</TouchableOpacity>
					<Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
						FAQs
					</Text>
					<View style={{ width: 26 }} />
				</View>

				<ScrollView contentContainerStyle={{ padding: 20 }}>
					{faqs.map((faq, index) => (
						<View
							key={index}
							style={[
								styles.faqCard,
								{ backgroundColor: theme.card, borderColor: theme.border },
							]}
						>
							<Text style={[styles.faqQuestion, { color: theme.accent }]}>
								{faq.q}
							</Text>
							<Text style={[styles.faqAnswer, { color: theme.textSecondary }]}>
								{faq.a}
							</Text>
						</View>
					))}
				</ScrollView>
			</SafeAreaView>
		</Modal>
	);
};

const ManageProfile = ({
	visibleProfile,
	onCloseProfile,
	isDarkMode,
	syncProfile,
}: {
	visibleProfile: boolean;
	onCloseProfile: () => void;
	isDarkMode: boolean;
	syncProfile?: () => Promise<void>;
}) => {
	const api = useApi();
	const { refreshUserSession } = useAuth();
	const theme = {
		background: isDarkMode ? Colors.mainColorDark : "#F9F9F7",
		textPrimary: isDarkMode ? "#E0E0E0" : Colors.mainColorLight,
		textSecondary: isDarkMode ? Colors.loginTextDark : Colors.darkerTextLight,
		card: isDarkMode ? Colors.mainColorDarker : "#FFFFFF",
		border: isDarkMode ? Colors.thirdColorDark : "#E8E8E3",
		accent: isDarkMode ? Colors.secondaryColorDark : Colors.mainColorLight,
	};

	const handleSavePress = async () => {
		try {
			const syncResult = await api.syncProfileWithServer(false);
			syncProfile && (await syncProfile());
			Keyboard.dismiss();
			await refreshUserSession();
			DeviceEventEmitter.emit("profilePictureUpdated");
		} catch (e) {
			console.error("Error syncing profile with server:", e);
		}

		onCloseProfile();
	};

	return (
		<Modal visible={visibleProfile} animationType="slide" transparent>
			<SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
				<View style={[styles.header, { borderBottomColor: theme.border }]}>
					<TouchableOpacity onPress={onCloseProfile}>
						<Ionicons name="close" size={26} color={theme.textPrimary} />
					</TouchableOpacity>
					<Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
						MANAGE PROFILE
					</Text>
					<View style={{ width: 26 }} />
				</View>
				<ProfileEditScreen isDarkMode={isDarkMode} />
				<View style={styles.saveButtonContainer}>
					<TouchableOpacity
						style={[styles.saveButton, { backgroundColor: theme.card }]}
						onPress={handleSavePress}
					>
						<Text style={[styles.saveButtonText, { color: theme.textPrimary }]}>
							Save Changes
						</Text>
					</TouchableOpacity>
				</View>
			</SafeAreaView>
		</Modal>
	);
};

const CommentHistory = ({
	visible,
	onClose,
	isDarkMode,
}: {
	visible: boolean;
	onClose: () => void;
	isDarkMode: boolean;
}) => {
	const api = useApi();
	const [commentHistory, setCommentHistory] = useState<
		CommentHistoryResponse[]
	>([]);
	const [loading, setLoading] = useState(true);

	const theme = {
		background: isDarkMode ? Colors.mainColorDark : "#F9F9F7",
		textPrimary: isDarkMode ? "#E0E0E0" : Colors.mainColorLight,
		textSecondary: isDarkMode ? Colors.loginTextDark : Colors.darkerTextLight,
		card: isDarkMode ? Colors.mainColorDarker : "#FFFFFF",
		border: isDarkMode ? Colors.thirdColorDark : "#E8E8E3",
		danger: "#E74C3C",
		fallbackBg: isDarkMode ? Colors.thirdColorDark : "#E8E8E3",
	};

	const fetchCommentHistory = async () => {
		try {
			setLoading(true);
			const response = await api.getUserCommentHistory();
			setCommentHistory(response);
		} catch (e) {
			console.error("Error fetching comment history:", e);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (visible) {
			fetchCommentHistory();
		}
	}, [visible]);

	const handleDeleteComment = (commentId: string) => {
		Alert.alert(
			"Delete Comment",
			"Are you sure you want to delete this comment from your history?",
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Delete",
					style: "destructive",
					onPress: async () => {
						try {
							await api.deleteComment(commentId);
							setCommentHistory((prev) =>
								prev.filter((c) => c.id !== commentId),
							);
						} catch (error) {
							console.error("Error deleting comment:", error);
							Alert.alert("Error", "Could not delete the comment.");
						}
					},
				},
			],
		);
	};

	return (
		<Modal visible={visible} animationType="slide" transparent>
			<SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
				{/* Header */}
				<View
					style={[stylesForComment.header, { borderBottomColor: theme.border }]}
				>
					<TouchableOpacity
						onPress={onClose}
						style={stylesForComment.headerButton}
					>
						<Ionicons name="close" size={26} color={theme.textPrimary} />
					</TouchableOpacity>
					<Text
						style={[stylesForComment.headerTitle, { color: theme.textPrimary }]}
					>
						MY COMMENTS
					</Text>
					<View style={{ width: 40 }} />
				</View>

				{loading ? (
					<View style={stylesForComment.center}>
						<ActivityIndicator size="large" color={theme.textPrimary} />
					</View>
				) : (
					<ScrollView
						contentContainerStyle={stylesForComment.scrollContent}
						showsVerticalScrollIndicator={false}
					>
						{commentHistory.length === 0 ? (
							<View style={stylesForComment.center}>
								<Text
									style={[
										stylesForComment.emptyText,
										{ color: theme.textSecondary },
									]}
								>
									No comment history found.
								</Text>
							</View>
						) : (
							commentHistory.map((item) => (
								<View
									key={item.id}
									style={[
										stylesForComment.commentCard,
										{ backgroundColor: theme.card },
									]}
								>
									<View style={stylesForComment.row}>
										{/* Book Cover Thumbnail */}
										<View
											style={[
												stylesForComment.bookThumbWrapper,
												{ backgroundColor: theme.fallbackBg },
											]}
										>
											<Image
												source={{
													uri: useChangePicUrlToPipline(
														item.book.smallerCoverPic,
													),
												}}
												style={stylesForComment.bookThumb}
											/>
										</View>

										{/* Content Area */}
										<View style={stylesForComment.contentArea}>
											<View style={stylesForComment.cardHeader}>
												<Text
													numberOfLines={1}
													style={[
														stylesForComment.bookTitle,
														{ color: theme.textPrimary },
													]}
												>
													{item.book.title}
												</Text>
												<TouchableOpacity
													onPress={() => handleDeleteComment(item.id)}
												>
													<Ionicons
														name="trash-outline"
														size={20}
														color={theme.danger}
													/>
												</TouchableOpacity>
											</View>

											<Text
												style={[
													stylesForComment.dateText,
													{ color: theme.textSecondary },
												]}
											>
												{useGetRelativeTime(item.createdAt.toLocaleString())}
											</Text>

											<Text
												style={[
													stylesForComment.commentText,
													{ color: theme.textSecondary },
												]}
											>
												{item.text}
											</Text>

											<View style={stylesForComment.voteRow}>
												<Ionicons
													name="thumbs-up-outline"
													size={14}
													color={theme.textSecondary}
												/>
												<Text
													style={[
														stylesForComment.voteText,
														{ color: theme.textSecondary },
													]}
												>
													{item._count.votes} votes
												</Text>
											</View>
										</View>
									</View>
								</View>
							))
						)}
					</ScrollView>
				)}
			</SafeAreaView>
		</Modal>
	);
};

const stylesForComment = StyleSheet.create({
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: 15,
		height: 60,
		borderBottomWidth: 0.5,
	},
	headerButton: { padding: 5 },
	headerTitle: {
		fontSize: 14,
		fontFamily: "modern_no_20_regular",
		letterSpacing: 2,
	},
	scrollContent: {
		padding: 15,
		paddingBottom: 40,
	},
	center: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingTop: 50,
	},
	commentCard: {
		borderRadius: 12,
		padding: 12,
		marginBottom: 15,
		elevation: 2,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.1,
		shadowRadius: 2,
	},
	row: {
		flexDirection: "row",
	},
	bookThumbWrapper: {
		width: 60,
		height: 90,
		borderRadius: 6,
		overflow: "hidden",
	},
	bookThumb: {
		width: "100%",
		height: "100%",
		resizeMode: "cover",
	},
	contentArea: {
		flex: 1,
		marginLeft: 12,
	},
	cardHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	bookTitle: {
		fontSize: 16,
		fontFamily: "modern_no_20_regular",
		flex: 1,
		marginRight: 10,
	},
	dateText: {
		fontSize: 12,
		fontFamily: "modern_no_20_regular",
		marginBottom: 6,
	},
	commentText: {
		fontSize: 14,
		fontFamily: "modern_no_20_regular",
		lineHeight: 18,
	},
	voteRow: {
		flexDirection: "row",
		alignItems: "center",
		marginTop: 8,
	},
	voteText: {
		fontSize: 12,
		marginLeft: 4,
		fontFamily: "modern_no_20_regular",
	},
	emptyText: {
		fontFamily: "modern_no_20_regular",
		fontSize: 16,
	},
});

const openUrlForTerms = async () => {
	const urlfortermly = "https://20hdmi04.github.io/ReadsyTermlySite/";
	const supported = await Linking.canOpenURL(urlfortermly);
	if (supported) {
		await Linking.openURL(urlfortermly);
	} else {
		Alert.alert(`Error during try to open URL: ${urlfortermly}`);
	}
};

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

export default function ProfileScreen({
	biggerProfilePic,
	email,
	nickname,
	syncProfile,
}: any) {
	const { onLogout } = useAuth();
	const [faqVisible, setFaqVisible] = useState(false);
	const [profileVisible, setProfileVisible] = useState(false);
	const [commentHistoryVisible, setCommentHistoryVisible] = useState(false);

	const isDarkMode = useColorScheme() === "dark";

	const handlePress = (item: string) => {
		if (item === "Policy") openUrlForTerms();
		if (item === "FAQs") setFaqVisible(true);
		if (item === "Manage") setProfileVisible(true);
		if (item === "Comments") setCommentHistoryVisible(true);
		console.log(`${item} pressed`);
	};

	const mainColor = isDarkMode
		? Colors.secondaryColorDark
		: Colors.mainColorLight;
	const secondaryColor = isDarkMode
		? Colors.loginTextDark
		: Colors.darkerTextLight;

	return (
		<>
			<ScrollView
				style={[styles.container]}
				contentContainerStyle={styles.content}
			>
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

				{/* Account Section */}
				<View
					style={[
						styles.menuBlock,
						{ borderColor: isDarkMode ? Colors.thirdColorDark : "#F0F0F0" },
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
								backgroundColor: isDarkMode ? Colors.thirdColorDark : "#F0F0F0",
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
								backgroundColor: isDarkMode ? Colors.thirdColorDark : "#F0F0F0",
							},
						]}
					/>
					<ProfileMenuItem
						icon="person-outline"
						label="Manage Profile"
						onPress={() => handlePress("Manage")}
					/>
				</View>

				{/* Support Section */}
				<View
					style={[
						styles.menuBlock,
						{ borderColor: isDarkMode ? Colors.thirdColorDark : "#F0F0F0" },
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
								backgroundColor: isDarkMode ? Colors.thirdColorDark : "#F0F0F0",
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
					onPress={() => onLogout()}
				>
					<Ionicons name="log-out-outline" size={24} color="#A52A2A" />
					<Text style={styles.logoutText}>Log out</Text>
				</Pressable>
			</ScrollView>

			<FAQModal
				visible={faqVisible}
				onClose={() => setFaqVisible(false)}
				isDarkMode={isDarkMode}
			/>
			<ManageProfile
				visibleProfile={profileVisible}
				onCloseProfile={() => setProfileVisible(false)}
				isDarkMode={isDarkMode}
				syncProfile={syncProfile}
			/>
			<CommentHistory
				visible={commentHistoryVisible}
				onClose={() => setCommentHistoryVisible(false)}
				isDarkMode={isDarkMode}
			/>
		</>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1 },
	content: { padding: 20, paddingTop: 60 },
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: 20,
		height: 60,
		borderBottomWidth: 0.5,
	},
	headerTitle: {
		fontSize: 14,
		fontFamily: "modern_no_20_regular",
		letterSpacing: 2,
	},
	userInfoContainer: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 40,
	},
	profileImage: { width: 100, height: 100, borderRadius: 50, marginRight: 20 },
	userName: { fontSize: 24, fontFamily: "modern_no_20_regular" },
	userEmail: { fontSize: 18, fontFamily: "modern_no_20_regular" },
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
	menuItemLeft: { flexDirection: "row", alignItems: "center" },
	iconPlaceholder: { marginRight: 10 },
	menuItemLabel: { fontSize: 16, fontFamily: "modern_no_20_regular" },
	separator: { height: 1, marginHorizontal: 15 },
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
	faqCard: {
		padding: 20,
		borderRadius: 16,
		marginBottom: 15,
		borderWidth: 1,
	},
	faqQuestion: {
		fontSize: 18,
		fontFamily: "modern_no_20_regular",
		marginBottom: 8,
		fontWeight: "600",
	},
	faqAnswer: {
		fontSize: 15,
		fontFamily: "modern_no_20_regular",
		lineHeight: 20,
	},
	saveButtonContainer: {
		padding: 20,
	},
	saveButton: {
		paddingVertical: 20,
		borderRadius: 25,
		marginBottom: 30,
	},
	saveButtonText: {
		fontSize: 18,
		fontFamily: "modern_no_20_regular",
		textAlign: "center",
	},
});
