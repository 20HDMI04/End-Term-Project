import React, { useState, useEffect, useMemo } from "react";
import {
	StyleSheet,
	View,
	Text,
	Image,
	ScrollView,
	TouchableOpacity,
	Modal,
	SafeAreaView,
	ActivityIndicator,
	Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/theme";
import { Author, Book } from "@/constants/interfaces";
import { useChangePicUrlToPipline } from "@/hooks/use-change-pic-url-to-pipline";
import { useApi } from "@/contexts/ApiContext";
import BookCarousel from "./homeComponents/BookCarousel";

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
	const [loading, setLoading] = useState(true);
	const [authorData, setAuthorData] = useState<Author | null>(null);
	const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
	const [profileError, setProfileError] = useState(false);
	const [topBookError, setTopBookError] = useState(false);
	const [isFavorited, setIsFavorited] = useState(false);

	const theme = {
		background: isDarkMode ? Colors.mainColorDark : "#F9F9F7",
		card: isDarkMode ? Colors.mainColorDarker : "#FFFFFF",
		textPrimary: isDarkMode ? "#E0E0E0" : "#4A4A40",
		textSecondary: isDarkMode ? "#A0A0A0" : "#707060",
		border: isDarkMode ? "#404040" : "#E8E8E3",
		accent: isDarkMode ? Colors.thirdColorDark : Colors.mainColorLight,
		fallbackBg: isDarkMode ? Colors.thirdColorDark : Colors.thirdColorLight,
	};

	useEffect(() => {
		async function fetchAuthor() {
			if (!visible) return;
			try {
				setLoading(true);
				const response: Author = await api.findOneAuthor(authorId);
				setAuthorData(response);
				setIsFavorited(!!response.isFavoritedbyCurrentUser);
			} catch (error) {
				console.error("Error fetching author:", error);
			} finally {
				setLoading(false);
			}
		}
		fetchAuthor();
	}, [authorId, visible]);

	const topBook = useMemo(() => {
		if (!authorData?.books?.length) return null;
		return [...authorData.books].sort(
			(a, b) =>
				(b.statistics?.averageRating || 0) - (a.statistics?.averageRating || 0),
		)[0];
	}, [authorData]);

	const allGenres = useMemo(() => {
		const genres = new Set<string>();
		authorData?.books?.forEach((book) =>
			book.genres?.forEach((g) => genres.add(g.genre.name)),
		);
		return Array.from(genres).slice(0, 30);
	}, [authorData]);

	const filteredBooks = useMemo(() => {
		if (!selectedGenre) return authorData?.books || [];
		return (
			authorData?.books?.filter((book) =>
				book.genres?.some((g) => g.genre.name === selectedGenre),
			) || []
		);
	}, [selectedGenre, authorData]);

	const handleToggleFavorite = async () => {
		const newStatus = !isFavorited;
		setIsFavorited(newStatus);
		try {
			if (newStatus) await api.likeAuthor(authorId);
			else await api.unlikeAuthor(authorId);
		} catch (e) {
			setIsFavorited(!newStatus);
		}
	};

	if (!visible) return null;

	return (
		<Modal
			visible={visible}
			animationType="slide"
			onRequestClose={onClose}
			transparent
		>
			<SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
				{loading || !authorData ? (
					<View style={styles.center}>
						<ActivityIndicator size="large" color={theme.accent} />
					</View>
				) : (
					<>
						{/* Header */}
						<View style={[styles.header, { borderBottomColor: theme.border }]}>
							<TouchableOpacity onPress={onClose}>
								<Ionicons name="close" size={26} color={theme.textPrimary} />
							</TouchableOpacity>
							<Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
								AUTHOR PROFILE
							</Text>
							<TouchableOpacity onPress={handleToggleFavorite}>
								<Ionicons
									name={isFavorited ? "heart" : "heart-outline"}
									size={26}
									color={
										isFavorited
											? isDarkMode
												? "#FFFFFF"
												: Colors.mainColorLight
											: theme.textPrimary
									}
								/>
							</TouchableOpacity>
						</View>

						<ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
							{/* Hero Section */}
							<View style={styles.heroSection}>
								<View
									style={[
										styles.profileImageContainer,
										{ backgroundColor: theme.fallbackBg },
									]}
								>
									<Ionicons
										name="person"
										size={50}
										color={
											isDarkMode ? Colors.loginTextDark : Colors.darkerTextLight
										}
										style={styles.placeholder}
									/>
									{!profileError && (
										<Image
											source={{
												uri: useChangePicUrlToPipline(
													authorData.biggerProfilePic,
												),
											}}
											style={styles.profileImage}
											onError={() => setProfileError(true)}
										/>
									)}
								</View>
								<Text style={[styles.name, { color: theme.textPrimary }]}>
									{authorData.name}
								</Text>
								<Text
									style={[styles.nationality, { color: theme.textSecondary }]}
								>
									{authorData.nationality || "International Author"} •{" "}
									{authorData.birthDate
										? new Date(authorData.birthDate).getFullYear()
										: "N/A"}
								</Text>
								<View
									style={[styles.countBadge, { backgroundColor: theme.accent }]}
								>
									<Text style={styles.countText}>
										{authorData._count?.favoritedBy || 0} fans
									</Text>
								</View>
							</View>

							{/* Bio Section */}
							<View style={styles.section}>
								<Text
									style={[styles.sectionTitle, { color: theme.textPrimary }]}
								>
									Biography
								</Text>
								<Text
									style={[styles.description, { color: theme.textSecondary }]}
								>
									{authorData.bio || "No biography available for this author."}
								</Text>
							</View>

							{/* TOP BOOK SECTION */}
							{topBook && (
								<View style={styles.section}>
									<Text
										style={[styles.sectionTitle, { color: theme.textPrimary }]}
									>
										Masterpiece
									</Text>
									<View
										style={[
											styles.topBookCard,
											{ backgroundColor: theme.card },
										]}
									>
										<View
											style={[
												styles.topBookImageContainer,
												{ backgroundColor: theme.fallbackBg },
											]}
										>
											{!topBookError && (
												<Image
													source={{
														uri: useChangePicUrlToPipline(
															topBook.smallerCoverPic,
														),
													}}
													style={styles.topBookImage}
													onError={() => setTopBookError(true)}
												/>
											)}
										</View>
										<View style={styles.topBookInfo}>
											<Text
												style={[styles.topBookTag, { color: theme.accent }]}
											>
												BEST RATED
											</Text>
											<Text
												style={[
													styles.topBookTitle,
													{ color: theme.textPrimary },
												]}
												numberOfLines={2}
											>
												{topBook.title}
											</Text>
											<View style={styles.ratingRow}>
												<Ionicons name="star" size={16} color="#F1C40F" />
												<Text
													style={[
														styles.ratingText,
														{ color: theme.textPrimary },
													]}
												>
													{topBook.statistics?.averageRating?.toFixed(2) ||
														"N/A"}
												</Text>
											</View>
										</View>
									</View>
								</View>
							)}

							{/* GENRE FILTER SECTION */}
							<View style={styles.section}>
								<Text
									style={[styles.sectionTitle, { color: theme.textPrimary }]}
								>
									Expertise In
								</Text>
								<ScrollView
									horizontal
									showsHorizontalScrollIndicator={false}
									style={styles.genreScroll}
								>
									{allGenres.map((genre) => (
										<TouchableOpacity
											key={genre}
											onPress={() =>
												setSelectedGenre(selectedGenre === genre ? null : genre)
											}
											style={[
												styles.genreChip,
												{
													backgroundColor:
														selectedGenre === genre ? theme.accent : theme.card,
													borderColor: theme.border,
												},
											]}
										>
											<Text
												style={[
													styles.genreText,
													{
														color:
															selectedGenre === genre
																? "#FFF"
																: theme.textPrimary,
													},
												]}
											>
												{genre}
											</Text>
										</TouchableOpacity>
									))}
								</ScrollView>
							</View>

							{/* BOOKS LIST */}
							<BookCarousel
								isDarkMode={isDarkMode}
								section={{
									title: selectedGenre ? `${selectedGenre} Books` : "All Works",
									subtitle: `Total: ${filteredBooks.length} titles`,
									data: filteredBooks,
								}}
							/>
						</ScrollView>
					</>
				)}
			</SafeAreaView>
		</Modal>
	);
};

const styles = StyleSheet.create({
	center: { flex: 1, justifyContent: "center", alignItems: "center" },
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: 20,
		height: 60,
		borderBottomWidth: 0.5,
	},
	headerTitle: {
		fontSize: 13,
		fontFamily: "modern_no_20_regular",
		letterSpacing: 2,
	},
	heroSection: { alignItems: "center", paddingVertical: 30 },
	profileImageContainer: {
		width: 120,
		height: 120,
		borderRadius: 60,
		overflow: "hidden",
		justifyContent: "center",
		alignItems: "center",
		marginBottom: 15,
		elevation: 5,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.2,
		shadowRadius: 4,
	},
	profileImage: { width: "100%", height: "100%", resizeMode: "cover" },
	placeholder: { position: "absolute" },
	name: {
		fontSize: 32,
		fontFamily: "modern_no_20_regular",
		textAlign: "center",
	},
	nationality: {
		fontSize: 16,
		fontFamily: "modern_no_20_regular",
		marginTop: 5,
	},
	countBadge: {
		backgroundColor: Colors.mainColorLight,
		paddingHorizontal: 12,
		paddingVertical: 4,
		borderRadius: 15,
		marginTop: 10,
	},
	countText: { color: "white", fontSize: 12, fontWeight: "600" },
	section: { paddingHorizontal: 20, marginBottom: 25 },
	sectionTitle: {
		fontSize: 22,
		fontFamily: "modern_no_20_regular",
		marginBottom: 12,
	},
	description: {
		fontSize: 16,
		fontFamily: "modern_no_20_regular",
		lineHeight: 22,
		textAlign: "justify",
	},
	topBookCard: {
		flexDirection: "row",
		borderRadius: 16,
		padding: 12,
		alignItems: "center",
		elevation: 2,
		shadowOpacity: 0.1,
	},
	topBookImageContainer: {
		width: 70,
		height: 100,
		borderRadius: 8,
		overflow: "hidden",
	},
	topBookImage: { width: "100%", height: "100%" },
	topBookInfo: { flex: 1, marginLeft: 15 },
	topBookTag: { fontSize: 10, fontWeight: "bold", marginBottom: 4 },
	topBookTitle: { fontSize: 18, fontFamily: "modern_no_20_regular" },
	ratingRow: { flexDirection: "row", alignItems: "center", marginTop: 5 },
	ratingText: { marginLeft: 5, fontSize: 16, fontWeight: "600" },
	genreScroll: { flexDirection: "row", marginBottom: 10 },
	genreChip: {
		paddingHorizontal: 16,
		paddingVertical: 8,
		borderRadius: 20,
		marginRight: 10,
		borderWidth: 1,
	},
	genreText: { fontSize: 14, fontFamily: "modern_no_20_regular" },
});

export default AuthorDetailModal;
