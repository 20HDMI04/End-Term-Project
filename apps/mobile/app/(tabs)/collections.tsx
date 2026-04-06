import { Image } from "expo-image";
import {
	Dimensions,
	Platform,
	SafeAreaView,
	StyleSheet,
	Text,
	View,
} from "react-native";

import { Collapsible } from "@/components/ui/collapsible";
import { ExternalLink } from "@/components/external-link";
import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors, Fonts } from "@/constants/theme";
import { runOnJS } from "react-native-reanimated";
import {
	Directions,
	Gesture,
	GestureDetector,
	RefreshControl,
	ScrollView,
	TouchableOpacity,
} from "react-native-gesture-handler";
import { router } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
	FindOneBookResponse,
	MainPageData,
	Book,
	MyCollectionsData,
} from "@/constants/interfaces";
import { ProfileData } from "./settings";
import { useApi } from "@/contexts/ApiContext";
import { useColorScheme } from "react-native";
import AuthorDetailModal from "@/components/AuthorDetailModal";
import BookDetailModal from "@/components/BookDetailModal";
import { Storage } from "@/utils/storage";
import BookCarousel from "@/components/homeComponents/BookCarousel";
import { HomeSkeleton } from "@/components/homeComponents/HomeSkeleton";
import AuthorCarousel from "@/components/homeComponents/AuthorCarousel";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

export default function BookmarksScreen() {
	const api = useApi();
	const isDarkMode = useColorScheme() === "dark";
	const [profileData, setProfileData] = useState<ProfileData | null>(null);
	const [mainListFav, setMainListFav] = useState<MyCollectionsData | null>(
		null,
	);
	const [refreshing, setRefreshing] = useState(false);
	const [historyList, setHistoryList] = useState<Book[] | null>(null);
	const [selectedGenreForFiltering, setSelectedGenreForFiltering] = useState<
		string | null
	>(null);
	const [bookList, setBookList] = useState<Book[] | null>(null);

	const onRefresh = useCallback(async () => {
		setRefreshing(true);
		await handleGettingPageData();
	}, []);

	useEffect(() => {
		async function fetchEverything() {
			await handleGettingPageData();
		}
		fetchEverything();
	}, []);

	const handleGettingPageData = async () => {
		const fetchData = async () => {
			try {
				const data = await api.getMyCollectionsData();
				setMainListFav(data);
			} catch (error) {
				console.error("Error fetching main page data in HomeScreen:", error);
			} finally {
				setRefreshing(false);
			}
		};
		fetchData();
		const fetchProfileData = async () => {
			try {
				const data = await Storage.getItem("user");
				setProfileData(data);
			} catch (error) {
				console.error("Error fetching profile data in BookmarksScreen:", error);
				setProfileData(null);
			}
		};
		fetchProfileData();
		const fetchHistoryData = async () => {
			try {
				const data: FindOneBookResponse[] = await Storage.getHistory();
				const books = data.map((item) => item.foundBook);
				setHistoryList(books);
			} catch (error) {
				console.error("Error fetching history data in BookmarksScreen:", error);
				setHistoryList(null);
			}
		};
		fetchHistoryData();
	};

	const goToNext = () => router.replace("/settings");
	const goToPrevious = () => router.replace("/search");
	const goToHome = () => router.replace("/");

	const swipeLeft = Gesture.Fling()
		.direction(Directions.LEFT)
		.onEnd(() => {
			runOnJS(goToNext)();
		});

	const swipeRight = Gesture.Fling()
		.direction(Directions.RIGHT)
		.onEnd(() => {
			runOnJS(goToPrevious)();
		});

	const [bookDetailVisible, setBookDetailVisible] = useState(false);
	const [selectedBookId, setSelectedBookId] = useState<string | null>(null);

	const handleBookPress = (bookId: string) => {
		setSelectedBookId(bookId);
		setBookDetailVisible(true);
	};
	const handleCloseBookDetail = () => {
		setBookDetailVisible(false);
		setSelectedBookId(null);
	};

	const [authorDetailVisible, setAuthorDetailVisible] = useState(false);
	const [selectedAuthorId, setSelectedAuthorId] = useState<string | null>(null);
	const handleAuthorPress = (authorId: string) => {
		setSelectedAuthorId(authorId);
		setAuthorDetailVisible(true);
	};
	const handleCloseAuthorDetail = () => {
		setAuthorDetailVisible(false);
		setSelectedAuthorId(null);
	};

	useEffect(() => {
		console.log("Main List Fav Data:", mainListFav);
	}, [mainListFav]);

	const theme = {
		card: isDarkMode ? Colors.mainColorDarker : "#FFFFFF",
		textPrimary: isDarkMode ? "#E0E0E0" : Colors.darkerTextLight,
		border: isDarkMode ? "#404040" : "#E8E8E3",
		accent: isDarkMode ? Colors.thirdColorDark : Colors.mainColorLight,
	};

	const allGenres = useMemo(() => {
		const genres = new Set<string>();
		mainListFav?.books.data.forEach((book) =>
			book.genres?.forEach((g) => genres.add(g.genre.name)),
		);
		return Array.from(genres).slice(0, 30);
	}, [mainListFav]);

	const filteredBooks: Book[] = useMemo(() => {
		if (!selectedGenreForFiltering) return mainListFav?.books.data || [];
		return (
			mainListFav?.books.data.filter((book) =>
				book.genres?.some((g) => g.genre.name === selectedGenreForFiltering),
			) || []
		);
	}, [selectedGenreForFiltering, mainListFav]);

	const titleColor = isDarkMode
		? Colors.secondaryColorDark
		: Colors.mainColorLight;
	const fallbackBg = isDarkMode
		? Colors.thirdColorDark
		: Colors.thirdColorLight;
	const iconColor = isDarkMode ? Colors.loginTextDark : Colors.darkerTextLight;

	const SPACING = 16;
	const CONTAINER_PADDING = 20;
	const ITEM_WIDTH = (width - CONTAINER_PADDING * 2 - SPACING * 2) / 3;
	return (
		<GestureDetector gesture={Gesture.Exclusive(swipeLeft, swipeRight)}>
			<ScrollView
				style={{
					flex: 1,
					marginTop: 42,
				}}
				keyboardShouldPersistTaps="handled"
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={onRefresh}
						style={{ position: "absolute", zIndex: 999, top: -50 }}
						colors={
							isDarkMode ? [Colors.secondaryColorDark] : [Colors.mainColorLight]
						}
						progressBackgroundColor={
							isDarkMode ? Colors.thirdColorDark : "#ffffff"
						}
					/>
				}
			>
				<SafeAreaView>
					{selectedBookId && profileData && profileData.smallerProfilePic && (
						<BookDetailModal
							bookId={selectedBookId}
							email={profileData.email || null}
							isDarkMode={isDarkMode}
							onClose={handleCloseBookDetail}
							visible={bookDetailVisible}
							profilePic={profileData.smallerProfilePic}
						/>
					)}
					{selectedAuthorId && (
						<AuthorDetailModal
							authorId={selectedAuthorId}
							isDarkMode={isDarkMode}
							onClose={handleCloseAuthorDetail}
							visible={authorDetailVisible}
						/>
					)}
					<Text
						style={{
							fontSize: 30,
							color: isDarkMode ? "#FFFFFF" : Colors.mainColorDark,
							textAlign: "center",
							fontFamily: "modern_no_20_regular",
							marginTop: 50,
							marginHorizontal: 20,
							marginBottom: 10,
						}}
					>
						YOUR COLLECTION
					</Text>
					<View
						style={[
							styles.underline,
							{
								backgroundColor: isDarkMode
									? Colors.secondaryColorDark
									: Colors.mainColorLight,
							},
						]}
					/>
					<View style={{ marginTop: 40 }}>
						{historyList ? (
							<BookCarousel
								isDarkMode={isDarkMode}
								section={{
									data: historyList,
									title: "Recently Viewed",
									subtitle: `Here is your collection: ${historyList.length} titles`,
								}}
							/>
						) : (
							<>
								<View style={styles.headerContainer}>
									<Text style={[styles.title, { color: titleColor }]}>
										Recently Viewed
									</Text>

									<Text style={[styles.subtitle, { color: titleColor }]}>
										Your recently viewed books will appear here.
									</Text>
								</View>
								<HomeSkeleton
									darkmode={isDarkMode}
									justBooks={true}
									justBookCovers={true}
								/>
							</>
						)}
					</View>
					{mainListFav && mainListFav.authors.data.length > 0 ? (
						<AuthorCarousel
							isDarkMode={isDarkMode}
							section={mainListFav.authors}
						/>
					) : (
						<>
							<View style={styles.headerContainer}>
								<Text style={[styles.title, { color: titleColor }]}>
									Your Favorite Authors
								</Text>

								<Text style={[styles.subtitle, { color: titleColor }]}>
									Your favorite authors will appear here.
								</Text>
							</View>
							<TouchableOpacity
								style={[
									styles.card,
									{
										width: 90,
										height: 90,
										borderRadius: 45,
									},
								]}
								activeOpacity={0.7}
								onPress={() => {
									goToHome();
								}}
							>
								<View
									style={[
										styles.imageContainer,
										{ backgroundColor: fallbackBg, borderRadius: 45 },
									]}
								>
									<View style={styles.fallbackContainer}>
										<Ionicons
											name="add"
											size={ITEM_WIDTH * 0.4}
											color={iconColor}
										/>
									</View>
								</View>
							</TouchableOpacity>
						</>
					)}

					{mainListFav && mainListFav.books.data.length > 0 ? (
						<>
							<View style={styles.section}>
								<Text
									style={[styles.sectionTitle, { color: theme.textPrimary }]}
								>
									Your Loved Genres
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
												setSelectedGenreForFiltering(
													selectedGenreForFiltering === genre ? null : genre,
												)
											}
											style={[
												styles.genreChip,
												{
													backgroundColor:
														selectedGenreForFiltering === genre
															? theme.accent
															: theme.card,
													borderColor: theme.border,
												},
											]}
										>
											<Text
												style={[
													styles.genreText,
													{
														color:
															selectedGenreForFiltering === genre
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
							<View style={{ height: 20 }}></View>
							<BookCarousel
								isDarkMode={isDarkMode}
								section={{
									title: selectedGenreForFiltering
										? `Favorited by You - ${selectedGenreForFiltering}`
										: "Your Most Loved Books",
									subtitle: `Total: ${filteredBooks?.length || 0} titles`,
									data: filteredBooks,
								}}
							/>
						</>
					) : (
						<>
							<View style={{ height: 20 }}></View>

							<View style={styles.headerContainer}>
								<Text style={[styles.title, { color: titleColor }]}>
									Your Favourite Books
								</Text>

								<Text style={[styles.subtitle, { color: titleColor }]}>
									Your favorite books will appear here.
								</Text>
							</View>
							<TouchableOpacity
								style={[
									styles.card,
									{
										width: 155,
										height: 250,
									},
								]}
								activeOpacity={0.7}
								onPress={() => {
									goToHome();
								}}
							>
								<View
									style={[
										styles.imageContainer,
										{ backgroundColor: fallbackBg, borderRadius: 20 },
									]}
								>
									<View style={styles.fallbackContainer}>
										<Ionicons
											name="add"
											size={ITEM_WIDTH * 0.4}
											color={iconColor}
										/>
									</View>
								</View>
							</TouchableOpacity>
						</>
					)}

					<View style={{ height: 100 }}></View>
				</SafeAreaView>
			</ScrollView>
		</GestureDetector>
	);
}

const styles = StyleSheet.create({
	underline: {
		height: 2,
		width: 120,
		marginTop: 20,
		margin: "auto",
	},
	genreChip: {
		paddingHorizontal: 16,
		paddingVertical: 8,
		borderRadius: 20,
		marginRight: 4,
		borderWidth: 1,
		height: 36,
		justifyContent: "center",
		alignItems: "center",
	},
	genreText: { fontSize: 14, fontFamily: "modern_no_20_regular" },
	section: { paddingHorizontal: 20, marginTop: 12 },
	sectionTitle: {
		fontSize: 26,
		fontFamily: "modern_no_20_regular",
		marginBottom: 12,
	},
	genreScroll: { flexDirection: "row" },
	container: {
		flex: 1,
		marginBottom: 24,
	},
	headerContainer: {
		marginBottom: 8,
		marginHorizontal: 20,
	},
	title: {
		fontSize: 26,
		fontFamily: "modern_no_20_regular",
	},
	subtitle: {
		fontSize: 18,
		fontFamily: "modern_no_20_regular",
		marginTop: 4,
		opacity: 0.7,
	},
	subsubtitle: {
		fontSize: 14,
		fontFamily: "modern_no_20_regular",
		marginTop: 40,
		opacity: 0.7,
		textAlign: "center",
	},
	card: {
		alignItems: "center",
		marginTop: 8,
		marginLeft: 20,
	},
	fallbackContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	imageContainer: {
		flex: 1,
		width: "100%",
		height: "100%",
		position: "relative",
	},
	absolutePlaceholder: {
		...StyleSheet.absoluteFillObject,
		justifyContent: "center",
		alignItems: "center",
		zIndex: 0,
	},
	image: {
		width: "100%",
		height: "100%",
		resizeMode: "cover",
		zIndex: 1,
	},

	fullModalContainer: {
		flex: 1,
		backgroundColor: "#F5F5F1",
	},
	modalHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: 20,
		paddingVertical: 15,
		borderBottomWidth: 1,
		borderBottomColor: "#E0E0E0",
	},
});
