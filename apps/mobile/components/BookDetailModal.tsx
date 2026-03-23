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
	Keyboard,
} from "react-native";
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withRepeat,
	withTiming,
	Easing,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/theme";
import { FindOneBookResponse } from "@/constants/interfaces";
import { useChangePicUrlToPipline } from "@/hooks/use-change-pic-url-to-pipline";
import { useApi } from "@/contexts/ApiContext";
import BookCarousel from "./homeComponents/BookCarousel";
import { GenreInstance } from "@/constants/interfaces";
import { Comment } from "@/constants/interfaces";
import { Storage } from "@/utils/storage";
import { useGetRelativeTime } from "@/hooks/use-get-realtive-time";

const { width } = Dimensions.get("window");

interface BookDetailModalProps {
	isDarkMode: boolean;
	visible: boolean;
	onClose: () => void;
	bookId: string;
	profilePic: string;
	email: string | null;
}

const BookDetailModal = ({
	isDarkMode,
	visible,
	onClose,
	bookId,
	profilePic,
	email,
}: BookDetailModalProps) => {
	const api = useApi();
	const scrollX = useSharedValue(0);
	const [singleListWidth, setSingleListWidth] = useState(0);
	const [userAvatarError, setUserAvatarError] = useState(false);
	const [liked, setLiked] = useState(false);
	const [rating, setRating] = useState(0);
	const [commentText, setCommentText] = useState("");
	const [coverError, setCoverError] = useState(false);
	const [authorError, setAuthorError] = useState(false);
	const [bookData, setBookData] = useState<FindOneBookResponse | null>(null);
	const [loading, setLoading] = useState(true);
	const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);

	useEffect(() => {
		setCurrentUserEmail(email);
	}, [email]);

	const similarBooksSection = {
		title: "Similar Books",
		subtitle: "If you liked this, you might enjoy these too",
		data: bookData?.similarBooks || [],
	};

	const onLikeUpdate = async (isLiking: boolean) => {
		if (isLiking) {
			await api.likeBook(bookId);
		} else {
			await api.unlikeBook(bookId);
		}
	};

	const onRateUpdate = async (newRating: number) => {
		if (rating > 0 && rating !== undefined) {
			await api.rateUpdateBook(bookId, newRating);
		} else {
			await api.rateBook(bookId, newRating);
		}
	};

	const handleDeleteComment = (commentId: string) => {
		Alert.alert(
			"Delete Comment",
			"Are you sure you want to delete this comment?",
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Delete",
					style: "destructive",
					onPress: async () => {
						try {
							await api.deleteComment(commentId);
							setBookData((prev) => {
								if (!prev) return null;
								return {
									...prev,
									foundBook: {
										...prev.foundBook,
										comments: prev.foundBook.comments.filter(
											(c) => c.id !== commentId,
										),
									},
								};
							});
						} catch (error) {
							console.error("Error deleting comment:", error);
							Alert.alert("Error", "Could not delete the comment.");
						}
					},
				},
			],
		);
	};

	const handleCommentSubmit = async () => {
		Keyboard.dismiss();
		if (commentText.trim().length > 0) {
			try {
				const newCommentResponse: Comment = await api.addComment(
					bookId,
					commentText,
				);
				if (bookData) {
					setBookData({
						...bookData,
						foundBook: {
							...bookData.foundBook,
							comments: [
								{
									id: newCommentResponse.id,
									text: newCommentResponse.text,
									createdAt: newCommentResponse.createdAt,
									userId: newCommentResponse.userId,
									bookId: newCommentResponse.bookId,
									user: {
										nickname: newCommentResponse.user.nickname,
										smallerProfilePic:
											newCommentResponse.user.smallerProfilePic,
										biggerProfilePic: newCommentResponse.user.biggerProfilePic,
									},
									likeCount: 0,
									isLikedByMe: false,
								},
								...(bookData.foundBook.comments || []),
							],
						},
					});
				}
				setCommentText("");
			} catch (error) {
				console.error("Error submitting comment:", error);
			}
		}
	};

	const toggleCommentLike = async (
		commentId: string,
		currentlyLiked: boolean,
	) => {
		try {
			if (currentlyLiked) {
				await api.unlikeComment(commentId);
			} else {
				await api.likeComment(commentId);
			}

			setBookData((prev) => {
				if (!prev) return null;
				const updatedComments = prev.foundBook.comments.map((c) => {
					if (c.id === commentId) {
						return {
							...c,
							isLikedByMe: !currentlyLiked,
							likeCount: currentlyLiked ? c.likeCount - 1 : c.likeCount + 1,
						};
					}
					return c;
				});
				return {
					...prev,
					foundBook: { ...prev.foundBook, comments: updatedComments },
				};
			});
		} catch (error) {
			console.error("Error toggling comment like:", error);
		}
	};

	useEffect(() => {
		if (singleListWidth > 0) {
			scrollX.value = 0;
			scrollX.value = withRepeat(
				withTiming(-singleListWidth, {
					duration: 200000,
					easing: Easing.linear,
				}),
				-1,
				false,
			);
		}
	}, [singleListWidth]);

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ translateX: scrollX.value }],
	}));

	useEffect(() => {
		async function fetchBookData() {
			if (!visible) return;
			try {
				setLoading(true);
				const response: FindOneBookResponse = await api.getABookById(bookId);
				setBookData(response);
				await api.markAsRead(bookId);
				if (
					response.foundBook.ratings &&
					response.foundBook.ratings.length > 0
				) {
					setRating(response.foundBook.ratings[0].score);
				} else {
					setRating(0);
				}
				setLiked(response.foundBook.isLikedByMe);
			} catch (error) {
				console.error("Error fetching book details:", error);
			} finally {
				setLoading(false);
			}
		}
		fetchBookData();
	}, [bookId, visible]);

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
		danger: "#E74C3C", // Univerzális piros
	};

	if (!visible) return null;
	if (loading || !bookData) {
		return (
			<Modal visible={visible}>
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

	const book = bookData.foundBook;

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
							DETAILS
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
						keyboardShouldPersistTaps="handled"
					>
						{/* Hero Section */}
						<View style={styles.heroSection}>
							<View
								style={[
									styles.coverContainer,
									{ backgroundColor: theme.fallbackBg },
								]}
							>
								<View style={styles.absolutePlaceholder}>
									<Ionicons name="book" size={60} color={theme.iconColor} />
								</View>
								{!coverError && (
									<Image
										source={{
											uri: useChangePicUrlToPipline(book.biggerCoverPic),
										}}
										style={styles.coverImage}
										onError={() => setCoverError(true)}
									/>
								)}
							</View>
							<Text style={[styles.title, { color: theme.textPrimary }]}>
								{book.title}
							</Text>
							<Text
								style={[styles.authorSubtitle, { color: theme.textSecondary }]}
							>
								{book.author?.name || "Unknown Author"}
							</Text>

							<View style={styles.marqueeWrapper}>
								<Animated.View style={[styles.tagContainer, animatedStyle]}>
									<View
										style={styles.row}
										onLayout={(e) =>
											setSingleListWidth(e.nativeEvent.layout.width)
										}
									>
										{book.genres?.map((genre: GenreInstance, index: number) => (
											<Tag
												key={`orig-${index}`}
												genre={genre.genre.name}
												isFirst={index === 0}
												theme={theme}
											/>
										))}
									</View>
									<View style={styles.row}>
										{book.genres?.map((genre: GenreInstance, index: number) => (
											<Tag
												key={`copy-${index}`}
												genre={genre.genre.name}
												isFirst={index === 0}
												theme={theme}
											/>
										))}
									</View>
								</Animated.View>
							</View>

							<View style={[styles.statsRow, { borderColor: theme.border }]}>
								<StatItem
									label="Rating"
									value={book.statistics?.averageRating?.toFixed(1) || "0.0"}
									theme={theme}
								/>
								<StatItem
									label="Year"
									value={
										book.originalPublicationYear ||
										book.latestPublicationYear ||
										"-"
									}
									theme={theme}
								/>
								<StatItem
									label="Pages"
									value={book.pageNumber || "-"}
									theme={theme}
								/>
							</View>
						</View>

						{/* Content sections */}
						<View style={styles.section}>
							<Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
								What's it about?
							</Text>
							<Text
								style={[styles.description, { color: theme.textSecondary }]}
							>
								{book.description}
							</Text>
						</View>

						{/* Author */}
						<View style={[styles.authorCard, { backgroundColor: theme.card }]}>
							<View
								style={[
									styles.authorImageWrapper,
									{ backgroundColor: theme.fallbackBg },
								]}
							>
								<Image
									source={{
										uri: useChangePicUrlToPipline(
											book.author?.biggerProfilePic,
										),
									}}
									style={styles.authorThumb}
									onError={() => setAuthorError(true)}
								/>
							</View>
							<View style={styles.authorInfoText}>
								<Text
									style={[styles.authorLabel, { color: theme.textSecondary }]}
								>
									ABOUT THE AUTHOR
								</Text>
								<Text style={[styles.authorName, { color: theme.textPrimary }]}>
									{book.author?.name || "Unknown Author"}
								</Text>
								<Text
									numberOfLines={5}
									style={[styles.authorBio, { color: theme.textSecondary }]}
								>
									{book.author?.bio || "No bio available."}
								</Text>
							</View>
						</View>

						<BookCarousel
							isDarkMode={isDarkMode}
							section={similarBooksSection}
						/>

						{/* Rating Box */}
						<View style={[styles.ratingBox, { backgroundColor: theme.card }]}>
							<Text
								style={[styles.ratingTitle, { color: theme.textSecondary }]}
							>
								Rate this book
							</Text>
							<View style={styles.starsRow}>
								{[1, 2, 3, 4, 5].map((i) => (
									<TouchableOpacity
										key={i}
										onPress={() => {
											setRating(i);
											onRateUpdate?.(i);
										}}
									>
										<Ionicons
											name={i <= rating ? "star" : "star-outline"}
											size={32}
											color={i <= rating ? "#F1C40F" : theme.textSecondary}
											style={{ marginHorizontal: 4 }}
										/>
									</TouchableOpacity>
								))}
							</View>
						</View>

						{/* Comments Section */}
						<View style={styles.section}>
							<Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
								Reader Insights
							</Text>
							<View
								style={[
									styles.commentInputWrapper,
									{ backgroundColor: theme.card },
								]}
							>
								<View
									style={[
										styles.inputAvatarContainer,
										{ backgroundColor: theme.fallbackBg },
									]}
								>
									{!userAvatarError && profilePic ? (
										<Image
											source={{ uri: profilePic }}
											style={styles.inputAvatarImage}
											onError={() => setUserAvatarError(true)}
										/>
									) : (
										<Ionicons name="person" size={20} color={theme.iconColor} />
									)}
								</View>
								<View
									style={[
										styles.inputBoxRow,
										{ backgroundColor: theme.fallbackBg },
									]}
								>
									<TextInput
										style={[styles.textInputMain, { color: theme.textPrimary }]}
										placeholder="Add a comment..."
										placeholderTextColor={theme.textSecondary}
										multiline
										value={commentText}
										onChangeText={setCommentText}
									/>
									<TouchableOpacity
										disabled={commentText.trim().length === 0}
										onPress={handleCommentSubmit}
										style={styles.iconPostButton}
									>
										<Ionicons
											name="send"
											size={22}
											color={
												isDarkMode
													? Colors.secondaryColorDark
													: Colors.mainColorLight
											}
										/>
									</TouchableOpacity>
								</View>
							</View>

							{book.comments?.map((comment: Comment) => (
								<View
									key={comment.id}
									style={[styles.commentCard, { backgroundColor: theme.card }]}
								>
									<View style={styles.commentHeader}>
										<View style={styles.userRow}>
											<Image
												source={{
													uri: useChangePicUrlToPipline(
														comment.user.smallerProfilePic ||
															comment.user.biggerProfilePic,
													),
												}}
												style={styles.commentAvatar}
											/>
											<View
												style={{
													justifyContent: "flex-start",
												}}
											>
												<Text
													style={[
														styles.commentUser,
														{ color: theme.textPrimary },
													]}
												>
													{comment.user.nickname || "Unknown User"}
												</Text>
												<Text
													style={[
														styles.commentTime,
														{ color: theme.textSecondary },
													]}
												>
													{useGetRelativeTime(
														comment.createdAt.toLocaleString(),
													)}
												</Text>
											</View>
										</View>

										<View style={styles.row}>
											<TouchableOpacity
												onPress={() =>
													toggleCommentLike(comment.id, comment.isLikedByMe)
												}
												style={styles.commentLikeRow}
											>
												<Ionicons
													name={
														comment.isLikedByMe
															? "thumbs-up"
															: "thumbs-up-outline"
													}
													size={20}
													color={
														comment.isLikedByMe
															? isDarkMode
																? "#FFF"
																: Colors.mainColorLight
															: theme.textSecondary
													}
												/>
												<Text
													style={[
														styles.commentTime,
														{ color: theme.textSecondary, marginLeft: 5 },
													]}
												>
													{comment.likeCount}
												</Text>
											</TouchableOpacity>
											{currentUserEmail === comment.userId && (
												<TouchableOpacity
													onPress={() => handleDeleteComment(comment.id)}
													style={[styles.commentLikeRow, { marginRight: 10 }]}
												>
													<Ionicons
														name="trash-outline"
														size={20}
														color={theme.danger}
													/>
												</TouchableOpacity>
											)}
										</View>
									</View>
									<Text
										style={[
											styles.commentText,
											{
												color: theme.textSecondary,
												padding: 4,
												marginLeft: 42,
											},
										]}
									>
										{comment.text}
									</Text>
								</View>
							))}
						</View>
					</ScrollView>
				</KeyboardAvoidingView>
			</SafeAreaView>
		</Modal>
	);
};

const StatItem = ({ label, value, theme }: any) => (
	<View style={styles.statItem}>
		<Text style={[styles.statLabel, { color: theme.textSecondary }]}>
			{label}
		</Text>
		<Text style={[styles.statValue, { color: theme.textPrimary }]}>
			{value}
		</Text>
	</View>
);

const Tag = ({ genre, isFirst, theme }: any) => (
	<View
		style={[
			styles.tag,
			isFirst
				? {
						backgroundColor: "#FFFFFF",
						borderWidth: 1,
						borderColor: theme.tagBg,
					}
				: { backgroundColor: theme.tagBg },
		]}
	>
		<Text
			style={[
				styles.tagText,
				isFirst ? { color: theme.tagBg } : { color: "#FFFFFF" },
			]}
		>
			{genre}
		</Text>
	</View>
);

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
	commentTime: { fontSize: 14, fontFamily: "modern_no_20_regular" },
	commentText: {
		fontSize: 16,
		fontFamily: "modern_no_20_regular",
		lineHeight: 20,
	},
	row: { flexDirection: "row" },
});

export default BookDetailModal;
