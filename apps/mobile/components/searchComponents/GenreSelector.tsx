import React, { useEffect, useMemo, useState } from "react";
import {
	StyleSheet,
	View,
	Text,
	TouchableOpacity,
	Modal,
	SafeAreaView,
	ScrollView,
	Dimensions,
	FlatList,
	Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/theme";
import { useApi } from "@/contexts/ApiContext";
import BookCarousel from "../homeComponents/BookCarousel";
import { Book, BookSection } from "@/constants/interfaces";
import { HomeSkeleton } from "../homeComponents/HomeSkeleton";

const { width } = Dimensions.get("window");
const COLUMN_WIDTH = (width - 60) / 2;

const GENRES = [
	"History",
	"Fiction",
	"Romance",
	"Young Adult",
	"Fantasy",
	"Just Science",
	"Thriller",
	"Social Science",
];

const GENRE_IMAGES: { [key: string]: { first: any; second: any } } = {
	History: {
		first: require("../../assets/images/history1.webp"),
		second: require("../../assets/images/history2.webp"),
	},
	Fiction: {
		first: require("../../assets/images/fiction1.webp"),
		second: require("../../assets/images/fiction2.webp"),
	},
	Romance: {
		first: require("../../assets/images/romance1.webp"),
		second: require("../../assets/images/romance2.webp"),
	},
	"Young Adult": {
		first: require("../../assets/images/young_adult1.webp"),
		second: require("../../assets/images/young_adult2.webp"),
	},
	Fantasy: {
		first: require("../../assets/images/fantasy1.webp"),
		second: require("../../assets/images/fantasy2.webp"),
	},
	"Just Science": {
		first: require("../../assets/images/science1.webp"),
		second: require("../../assets/images/science2.webp"),
	},
	Thriller: {
		first: require("../../assets/images/thriller1.webp"),
		second: require("../../assets/images/thriller2.webp"),
	},
	"Social Science": {
		first: require("../../assets/images/social_science1.webp"),
		second: require("../../assets/images/social_science2.webp"),
	},
};

const StackedImages = ({
	theme,
	genreName,
}: {
	theme: any;
	genreName: string;
}) => {
	return (
		<View style={styles.stackContainer}>
			<Image
				style={[
					styles.fillerLayer,

					{
						backgroundColor: theme.filler,
						transform: [
							{ rotate: "10deg" },
							{ translateX: 15 },
							{ translateY: 0 },
						],
						width: 60,
						height: 88,
						resizeMode: "cover",
					},
				]}
				source={GENRE_IMAGES[genreName].first}
			/>
			<Image
				style={[
					styles.fillerLayer,
					{
						backgroundColor: theme.filler,
						resizeMode: "cover",
						transform: [
							{ rotate: "-10deg" },
							{ translateX: -36 },
							{ translateY: 5 },
						],
						width: 54,
						height: 78,
					},
				]}
				source={GENRE_IMAGES[genreName].second}
			/>
		</View>
	);
};

interface GenreSelectorProps {
	isDarkMode: boolean;
}

const GenreSelector = ({ isDarkMode }: GenreSelectorProps) => {
	const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
	const [selectedGenreForSearch, setSelectedGenreForSearch] = useState<
		string | null
	>(null);
	const [selectedGenreForFiltering, setSelectedGenreForFiltering] = useState<
		string | null
	>(null);
	const [modalVisible, setModalVisible] = useState(false);
	const api = useApi();
	const [sectionsGenre, setSectionsGenre] = useState<BookSection[] | null>(
		null,
	);

	const theme = {
		background: isDarkMode ? Colors.mainColorDark : "#F9F9F7",
		card: isDarkMode ? Colors.mainColorDarker : "#FFFFFF",
		textPrimary: isDarkMode ? "#E0E0E0" : Colors.darkerTextLight,
		border: isDarkMode ? "#404040" : "#E8E8E3",
		accent: isDarkMode ? Colors.thirdColorDark : Colors.mainColorLight,
		filler: isDarkMode ? "#2C2C2C" : "#E2E2DE",
		title: isDarkMode ? "#FFFFFF" : Colors.mainColorLight,
	};

	const handleOpenGenre = async (genre: string) => {
		const searchGenre = genre.toLowerCase().replace(/\s/g, "-");
		setSelectedGenre(genre);
		setSelectedGenreForSearch(searchGenre);
		setModalVisible(true);
	};

	useEffect(() => {
		const fetchGenreSections = async () => {
			try {
				const response = await api.getBooksByGenre(
					selectedGenreForSearch || "history",
					15,
				);
				setSectionsGenre(response);
			} catch (error) {
				console.error("Error fetching genre books:", error);
			}
		};
		fetchGenreSections();
	}, [selectedGenreForSearch]);

	const getBackgroundColorForGenre = (genre: string) => {
		switch (genre) {
			case "History":
				return "#277167";
			case "Fiction":
				return "#702771";
			case "Romance":
				return "#71274E";
			case "Young Adult":
				return "#714527";
			case "Fantasy":
				return "#276071";
			case "Just Science":
				return "#712728";
			case "Thriller":
				return "#716827";
			case "Social Science":
				return "#412771";
			default:
				return theme.card;
		}
	};

	const allGenres = useMemo(() => {
		const genres = new Set<string>();
		sectionsGenre?.[2].data.forEach((book) =>
			book.genres?.forEach((g) => genres.add(g.genre.name)),
		);
		return Array.from(genres).slice(0, 30);
	}, [sectionsGenre]);

	const filteredBooks: Book[] = useMemo(() => {
		if (!selectedGenreForFiltering) return sectionsGenre?.[2]?.data || [];
		return (
			sectionsGenre?.[2]?.data.filter((book) =>
				book.genres?.some((g) => g.genre.name === selectedGenreForFiltering),
			) || []
		);
	}, [selectedGenreForFiltering, sectionsGenre]);

	const renderItem = ({ item }: { item: string }) => (
		<TouchableOpacity
			style={[
				styles.genreCard,
				{
					backgroundColor: getBackgroundColorForGenre(item) || theme.card,
					overflow: "hidden",
				},
			]}
			onPress={() => {
				handleOpenGenre(item);
			}}
		>
			<View style={styles.titleContainer}>
				<Text style={[styles.genreTitle, { color: "#FFFFFF" }]}>{item}</Text>
			</View>
			<View
				style={[
					styles.topSection,
					{ transform: [{ translateY: 14 }, { translateX: 20 }] },
				]}
			>
				<StackedImages theme={theme} genreName={item} />
			</View>
		</TouchableOpacity>
	);

	return (
		<View style={styles.container}>
			<Text
				style={[
					styles.title,
					{
						color: theme.title,
						marginBottom: 10,
					},
				]}
			>
				Explore by Genre
			</Text>
			<FlatList
				data={GENRES}
				renderItem={renderItem}
				keyExtractor={(item) => item}
				numColumns={2}
				scrollEnabled={false}
				columnWrapperStyle={styles.row}
			/>

			<Modal
				visible={modalVisible}
				animationType="slide"
				transparent={true}
				onRequestClose={() => setModalVisible(false)}
			>
				<SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
					<View style={[styles.header, { borderBottomColor: theme.border }]}>
						<TouchableOpacity
							onPress={() => {
								setModalVisible(false);
								setSectionsGenre(null);
							}}
						>
							<Ionicons name="close" size={26} color={theme.textPrimary} />
						</TouchableOpacity>
						<Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
							GENRE EXPLORE
						</Text>
						<View style={{ width: 26 }} />
					</View>

					<ScrollView contentContainerStyle={styles.modalContent}>
						<View style={styles.heroSection}>
							<Text
								style={[styles.modalMainTitle, { color: theme.textPrimary }]}
							>
								{selectedGenre?.toUpperCase()}
							</Text>
							<View
								style={[styles.underline, { backgroundColor: theme.accent }]}
							/>
						</View>

						<Text
							style={[
								styles.description,
								{ color: theme.textPrimary, opacity: 0.7 },
							]}
						>
							Exploring books in the {selectedGenre} category...
						</Text>

						{sectionsGenre && sectionsGenre.length > 0 && (
							<>
								<BookCarousel
									isDarkMode={isDarkMode}
									section={sectionsGenre[0]}
									key="section0"
								/>
								<BookCarousel
									isDarkMode={isDarkMode}
									section={sectionsGenre[1]}
									key="section1"
								/>
								<BookCarousel
									isDarkMode={isDarkMode}
									section={{
										title: selectedGenreForFiltering
											? `${selectedGenreForFiltering} Books`
											: "All Books",
										subtitle: `Total: ${filteredBooks?.length || 0} titles`,
										data: filteredBooks,
									}}
								/>
								<View style={styles.section}>
									<Text
										style={[styles.sectionTitle, { color: theme.textPrimary }]}
									>
										Genre Tags
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
							</>
						)}
						{sectionsGenre?.length === 0 ||
							(sectionsGenre == null && (
								<HomeSkeleton darkmode={isDarkMode} justBooks={true} />
							))}
					</ScrollView>
				</SafeAreaView>
			</Modal>
		</View>
	);
};

const styles = StyleSheet.create({
	container: { padding: 26, bottom: 24 },
	row: { justifyContent: "space-between", marginBottom: 10 },
	genreCard: {
		width: COLUMN_WIDTH,
		height: 100,
		borderRadius: 16,
		padding: 10,
		alignItems: "center",
		justifyContent: "center",
	},
	section: { paddingHorizontal: 20 },
	sectionTitle: {
		fontSize: 22,
		fontFamily: "modern_no_20_regular",
		marginBottom: 12,
	},
	genreScroll: { flexDirection: "row" },
	genreChip: {
		paddingHorizontal: 16,
		paddingVertical: 8,
		borderRadius: 20,
		marginRight: 10,
		borderWidth: 1,
		height: 36,
		justifyContent: "center",
		alignItems: "center",
	},
	genreText: { fontSize: 14, fontFamily: "modern_no_20_regular" },
	topSection: {
		flex: 2,
		justifyContent: "center",
		alignItems: "center",
		width: "100%",
	},
	titleContainer: {
		flex: 1,
		width: "90%",
		textAlign: "left",
	},
	genreTitle: {
		fontSize: 18,
		fontFamily: "modern_no_20_regular",
		textAlign: "left",
	},
	stackContainer: {
		width: 60,
		height: 80,
		justifyContent: "center",
		alignItems: "center",
	},
	fillerLayer: {
		position: "absolute",
		borderRadius: 6,
		borderWidth: 0.5,
		borderColor: "rgba(0,0,0,0.1)",
	},
	mainImageLayer: {
		width: 55,
		height: 75,
		borderRadius: 6,
		justifyContent: "center",
		alignItems: "center",
		elevation: 4,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.2,
		shadowRadius: 3,
	},
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
		letterSpacing: 2,
		fontFamily: "modern_no_20_regular",
	},
	modalHero: { flex: 1, justifyContent: "center", alignItems: "center" },
	modalMainTitle: { fontSize: 32, fontFamily: "modern_no_20_regular" },
	title: {
		fontSize: 26,
		fontFamily: "modern_no_20_regular",
	},
	imageFiller: {
		flex: 2,
		justifyContent: "center",
		alignItems: "center",
	},
	modalContent: {
		paddingBottom: 40,
		alignItems: "center",
	},
	heroSection: {
		paddingVertical: 40,
		alignItems: "center",
	},
	underline: {
		height: 2,
		width: 60,
		marginTop: 10,
	},
	description: {
		fontSize: 18,
		fontFamily: "modern_no_20_regular",
		marginTop: 10,
		textAlign: "center",
		marginBottom: 20,
		marginHorizontal: "5%",
	},
});

export default GenreSelector;
