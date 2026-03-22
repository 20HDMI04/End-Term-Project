import React, { useState, useEffect } from "react";
import {
	StyleSheet,
	View,
	Text,
	Image,
	ScrollView,
	TouchableOpacity,
	Modal,
	SafeAreaView,
	Dimensions,
	TextInput,
	KeyboardAvoidingView,
	Platform,
	ActivityIndicator,
	Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/theme";
import { FindOneBookResponse } from "@/constants/interfaces";
import { useApi } from "@/contexts/ApiContext";
import { StatusBar } from "expo-status-bar";

const { width } = Dimensions.get("window");

interface AuthorDetailModalProps {
	isDarkMode: boolean;
	visible: boolean;
	onClose: () => void;
	authorId: string;
}

const AuthorDetailModal = ({
	isDarkMode,
	visible,
	onClose,
	authorId,
}: AuthorDetailModalProps) => {
	const api = useApi();
	const [liked, setLiked] = useState(false);
	const [rating, setRating] = useState(0);
	const [authorData, setAuthorData] = useState<any | null>(null);
	const [loading, setLoading] = useState(true);
	const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);

	const onLikeUpdate = async (isLiking: boolean) => {
		if (isLiking) {
			await api.likeAuthor(authorId);
		} else {
			await api.unlikeAuthor(authorId);
		}
	};

	useEffect(() => {
		async function fetchAuthorData() {
			if (!visible) return;
			try {
				const data = "lajos";
			} catch (error) {
				console.error("Error fetching author details:", error);
			} finally {
				setLoading(false);
			}
		}
		fetchAuthorData();
	}, [authorId, visible]);

	const theme = {
		background: isDarkMode ? Colors.mainColorDark : "#F9F9F7",
		card: isDarkMode ? Colors.mainColorDarker : "#FFFFFF",
		textPrimary: isDarkMode
			? Colors?.secondaryColorDark || "#E0E0E0"
			: Colors?.mainColorLight || "#4A4A40",
		textSecondary: isDarkMode ? "#A0A0A0" : Colors.darkerTextLight,
		border: isDarkMode ? Colors.loginTextDark : "#E8E8E3",
		fallbackBg: isDarkMode
			? Colors?.thirdColorDark || "#333"
			: Colors?.thirdColorLight || "#E8E8E3",
		iconColor: isDarkMode
			? Colors?.loginTextDark || "#CCC"
			: Colors?.darkerTextLight || "#666",
		tagBg: isDarkMode ? Colors.mainColorDarker : Colors.mainColorLight,
		danger: "#E74C3C",
	};

	if (!visible) return null;
	if (loading) {
		return (
			<Modal visible={visible} animationType="fade">
				<SafeAreaView
					style={{
						flex: 1,
						backgroundColor: theme.background,
						justifyContent: "center",
					}}
				>
					<ActivityIndicator size="large" color={theme.textPrimary} />
				</SafeAreaView>
			</Modal>
		);
	}

	const author = authorData?.foundAuthor;

	return (
		<Modal visible={visible} animationType="slide" transparent={true}>
			<SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
				<KeyboardAvoidingView
					behavior={Platform.OS === "ios" ? "padding" : "height"}
					style={{ flex: 1 }}
				>
					<View style={[styles.header, { borderBottomColor: theme.border }]}>
						<TouchableOpacity onPress={onClose} style={styles.headerButton}>
							<Ionicons name="close" size={26} color={theme.textPrimary} />
						</TouchableOpacity>
						<Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
							AUTHOR DETAILS
						</Text>
						<TouchableOpacity
							onPress={() => {
								const newLikedStatus = !liked;
								setLiked(newLikedStatus);
								onLikeUpdate(newLikedStatus);
							}}
							style={styles.headerButton}
						>
							<Ionicons
								name={liked ? "heart" : "heart-outline"}
								size={26}
								color={
									liked
										? isDarkMode
											? "#FFFFFF"
											: Colors.mainColorLight
										: theme.textSecondary
								}
							/>
						</TouchableOpacity>
					</View>

					<ScrollView
						showsVerticalScrollIndicator={false}
						contentContainerStyle={{ paddingBottom: 40 }}
					></ScrollView>
				</KeyboardAvoidingView>
			</SafeAreaView>
		</Modal>
	);
};

const styles = StyleSheet.create({
	commentLikeRow: { flexDirection: "row", alignItems: "center", padding: 5 },
	noCommentsContainer: {
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: 40,
		opacity: 0.8,
	},
	tagContainer: { flexDirection: "row" },
	marqueeWrapper: { width: "100%", overflow: "hidden", marginBottom: 15 },
	tag: {
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 20,
		marginHorizontal: 4,
	},
	tagText: { fontSize: 12, fontWeight: "600" },
	noCommentsText: {
		fontFamily: "modern_no_20_regular",
		fontSize: 16,
		marginTop: 10,
	},
	commentInputWrapper: {
		flexDirection: "row",
		alignItems: "flex-start",
		padding: 15,
		borderRadius: 20,
		marginBottom: 20,
	},
	inputBoxRow: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		borderRadius: 15,
		paddingHorizontal: 12,
		paddingVertical: 8,
		marginLeft: 10,
		minHeight: 45,
	},
	textInputMain: {
		flex: 1,
		fontSize: 17,
		fontFamily: "modern_no_20_regular",
		maxHeight: 100,
	},
	iconPostButton: {
		paddingLeft: 10,
		justifyContent: "center",
		alignItems: "center",
	},
	inputAvatarContainer: {
		width: 40,
		height: 40,
		borderRadius: 20,
		overflow: "hidden",
		position: "relative",
		justifyContent: "center",
		alignItems: "center",
		marginTop: 2,
	},
	inputAvatarImage: {
		width: "100%",
		height: "100%",
		resizeMode: "cover",
		zIndex: 2,
	},
	sectionTitle: {
		fontSize: 22,
		fontFamily: "modern_no_20_regular",
		marginBottom: 15,
		marginTop: 10,
	},
	commentCard: { padding: 15, borderRadius: 12, marginBottom: 12 },
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
	heroSection: { alignItems: "center", paddingVertical: 25 },
	coverContainer: {
		width: 180,
		height: 270,
		borderRadius: 12,
		overflow: "hidden",
		position: "relative",
	},
	coverImage: { width: "100%", height: "100%", resizeMode: "cover" },
	absolutePlaceholder: {
		...StyleSheet.absoluteFillObject,
		justifyContent: "center",
		alignItems: "center",
		zIndex: -1,
	},
	title: {
		fontSize: 28,
		fontFamily: "modern_no_20_regular",
		marginTop: 20,
		textAlign: "center",
	},
	authorSubtitle: {
		fontSize: 18,
		fontFamily: "modern_no_20_regular",
		marginBottom: 20,
	},
	statsRow: {
		flexDirection: "row",
		width: "85%",
		justifyContent: "space-around",
		borderTopWidth: 0.5,
		borderBottomWidth: 0.5,
		paddingVertical: 15,
	},
	statItem: { alignItems: "center" },
	statLabel: {
		fontSize: 11,
		fontFamily: "modern_no_20_regular",
		textTransform: "uppercase",
	},
	statValue: { fontSize: 26, fontFamily: "modern_no_20_regular" },
	section: { paddingHorizontal: 20, marginBottom: 30 },
	description: {
		lineHeight: 24,
		fontSize: 16,
		fontFamily: "modern_no_20_regular",
		textAlign: "justify",
	},
	authorCard: {
		marginHorizontal: 20,
		padding: 20,
		borderRadius: 16,
		flexDirection: "row",
		alignItems: "flex-start",
		marginBottom: 30,
	},
	authorImageWrapper: {
		width: 80,
		height: 80,
		borderRadius: 40,
		overflow: "hidden",
		marginRight: 15,
	},
	authorThumb: { width: "100%", height: "100%" },
	authorInfoText: { flex: 1, alignItems: "flex-start" },
	authorLabel: {
		fontSize: 10,
		fontFamily: "modern_no_20_regular",
		marginBottom: 4,
	},
	authorName: {
		fontSize: 22,
		fontFamily: "modern_no_20_regular",
		marginBottom: 6,
	},
	authorBio: {
		fontSize: 14,
		fontFamily: "modern_no_20_regular",
		lineHeight: 20,
	},
	ratingBox: {
		marginHorizontal: 20,
		padding: 25,
		borderRadius: 16,
		alignItems: "center",
		marginBottom: 35,
	},
	ratingTitle: {
		fontSize: 16,
		fontFamily: "modern_no_20_regular",
		marginBottom: 10,
	},
	starsRow: { flexDirection: "row" },
	commentHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: 8,
	},
	userRow: { flexDirection: "row", alignItems: "center" },
	commentAvatar: { width: 36, height: 36, borderRadius: 18, marginRight: 10 },
	commentUser: { fontFamily: "modern_no_20_regular", fontSize: 18 },
	commentTime: { fontSize: 10, fontFamily: "modern_no_20_regular" },
	commentText: {
		fontSize: 14,
		fontFamily: "modern_no_20_regular",
		lineHeight: 20,
	},
	row: { flexDirection: "row" },
});

export default AuthorDetailModal;
