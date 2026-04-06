import React, {
	useState,
	useEffect,
	useRef,
	useCallback,
	useImperativeHandle,
	forwardRef,
} from "react";
import {
	StyleSheet,
	View,
	TextInput,
	Modal,
	Pressable,
	Text,
	SafeAreaView,
	Keyboard,
	FlatList,
	ActivityIndicator,
	TouchableOpacity,
	StatusBar,
} from "react-native";
import Animated, {
	Easing,
	FadeInLeft,
	FadeOutLeft,
	FadeOutRight,
	LinearTransition,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/theme";
import X from "@/assets/svgs/x.svg";
import Caret from "@/assets/svgs/caret.svg";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useApi } from "@/contexts/ApiContext";
import {
	Book,
	FindOneBookResponse,
	SearchEverythingResponse,
} from "@/constants/interfaces";
import AuthorResultItem from "@/components/homeComponents/AuthorResultComponent";
import BookResultItem from "@/components/homeComponents/BookResultItem";
import { ToastProvider } from "@/contexts/ToastContext";
import { Storage } from "@/utils/storage";
import { ScrollView } from "react-native-gesture-handler";

const SEARCH_HISTORY_KEY = "@search_history";

interface UniversalSearchProps {
	isDarkMode: boolean;
	initialQuery?: string;
	onBookPress?: (bookId: string) => void;
	onAuthorPress?: (authorId: string) => void;
	externalVisible?: boolean;
	onClose?: () => void;
}

const UniversalSearch = ({
	isDarkMode,
	initialQuery = "",
	onBookPress,
	onAuthorPress,
	externalVisible = false,
	onClose,
}: UniversalSearchProps) => {
	const api = useApi();
	const [modalVisible, setModalVisible] = useState(false);
	const [query, setQuery] = useState(initialQuery);
	const [history, setHistory] = useState<string[]>([]);
	const [previouslyOpened, setPreviouslyOpened] = useState<
		FindOneBookResponse[]
	>([]);
	const [activeFilter, setActiveFilter] = useState<string>("all");

	const [results, setResults] = useState<SearchEverythingResponse | null>(null);
	const [loading, setLoading] = useState(false);

	const inputRef = useRef<TextInput>(null);

	const theme = {
		background: isDarkMode ? Colors.mainColorDark : "#F9F9F7",
		card: isDarkMode ? Colors.mainColorDark : "#FFFFFF",
		textPrimary: isDarkMode ? "#E0E0E0" : Colors.mainColorLight,
		textSecondary: isDarkMode ? "#A0A0A0" : Colors.darkerTextLight,
		iconColor: isDarkMode ? "#FFFFFF" : Colors?.mainColorLight,
	};

	useEffect(() => {
		loadHistory();
	}, []);

	useEffect(() => {
		if (externalVisible) {
			setModalVisible(true);
			if (initialQuery) setQuery(initialQuery);
		}
	}, [externalVisible, initialQuery]);

	const loadHistory = async () => {
		try {
			const savedHistory = await AsyncStorage.getItem(SEARCH_HISTORY_KEY);
			if (savedHistory) setHistory(JSON.parse(savedHistory));
			const prevHistory = await Storage.getHistory();
			console.log("Loaded history:", prevHistory);
			setPreviouslyOpened(prevHistory);
		} catch (e) {
			console.error("Failed to load history", e);
		}
	};

	const handleBookPress = (bookId: string) => {
		onBookPress?.(bookId);
		handleClose();
	};

	const handleAuthorPress = (authorId: string) => {
		onAuthorPress?.(authorId);
		handleClose();
	};

	useEffect(() => {
		if (query.trim().length < 3) {
			setResults(null);
			setLoading(false);
			return;
		}

		const delayDebounceFn = setTimeout(async () => {
			setLoading(true);
			try {
				const data = await api.searchEverything(query, 10);
				setResults(data);
			} catch (error) {
				console.error("Search error:", error);
			} finally {
				setLoading(false);
			}
		}, 500);

		return () => clearTimeout(delayDebounceFn);
	}, [query]);

	const gracefulLayout = LinearTransition.duration(600).easing(
		// @ts-ignore
		Easing.in(Easing.bezier(0.25, 0.1, 0.25, 1)),
	);

	const renderFilterPills = () => {
		if (!results || loading) return null;

		const availableFilters = [
			{ id: "genre", label: "Genres", data: results.genres },
			{ id: "author", label: "Authors", data: results.authors },
			{ id: "book", label: "Books", data: results.books },
		].filter((f) => f.data && f.data.length > 0);

		if (availableFilters.length === 0) return null;

		return (
			<View style={styles.pillContainer}>
				{activeFilter !== "all" && (
					<Animated.View
						entering={FadeInLeft.duration(400).delay(50)}
						layout={gracefulLayout}
					>
						<Pressable
							onPress={() => setActiveFilter("all")}
							style={[
								styles.pill,
								{
									backgroundColor: theme.iconColor,
									marginRight: 8,
									paddingHorizontal: 8,
								},
							]}
						>
							<Ionicons
								name="close"
								size={16}
								color={isDarkMode ? "#000" : "#fff"}
							/>
						</Pressable>
					</Animated.View>
				)}

				{availableFilters.map((f) => {
					if (activeFilter !== "all" && activeFilter !== f.id) return null;

					return (
						<Animated.View
							key={f.id}
							layout={gracefulLayout}
							entering={FadeInLeft.delay(100)}
						>
							<Pressable
								onPress={() => setActiveFilter(f.id)}
								style={[
									styles.pill,
									{
										backgroundColor:
											activeFilter === f.id ? theme.iconColor : "transparent",
										borderColor: theme.iconColor,
										borderWidth: 1,
										marginRight: 8,
									},
								]}
							>
								<Text
									style={[
										styles.pillText,
										{
											color:
												activeFilter === f.id
													? isDarkMode
														? "#000"
														: "#fff"
													: theme.textPrimary,
										},
									]}
								>
									{f.label}
								</Text>
							</Pressable>
						</Animated.View>
					);
				})}
			</View>
		);
	};

	const saveSearch = async (searchTerm: string) => {
		const trimmed = searchTerm.trim();
		if (!trimmed || trimmed.length < 2) return;

		try {
			const newHistory = [
				trimmed,
				...history.filter(
					(item) => item.toLowerCase() !== trimmed.toLowerCase(),
				),
			].slice(0, 10);
			setHistory(newHistory);
			await AsyncStorage.setItem(
				SEARCH_HISTORY_KEY,
				JSON.stringify(newHistory),
			);
		} catch (e) {
			console.error("Failed to save history", e);
		}
	};

	const handleOpen = () => {
		setModalVisible(true);
		loadHistory();
		setTimeout(() => inputRef.current?.focus(), 150);
	};

	const handleClose = () => {
		Keyboard.dismiss();
		setQuery("");
		setResults(null);
		setModalVisible(false);
		if (onClose) onClose();
	};

	const selectHistoryItem = (item: string) => {
		setQuery(item);
	};

	const filteredHistory = history
		.filter(
			(item) =>
				item.toLowerCase().includes(query.toLowerCase()) &&
				item.toLowerCase() !== query.toLowerCase(),
		)
		.slice(0, 3);

	const renderListData = () => {
		if (!results) return [];
		const data = [];

		if (
			results.genres?.length > 0 &&
			(activeFilter === "all" || activeFilter === "genre")
		) {
			if (activeFilter === "all") {
				data.push({ type: "header", title: "Genres" });
				data.push(
					...results.genres.slice(0, 5).map((g) => ({ ...g, type: "genre" })),
				);
			} else if (activeFilter === "genre") {
				data.push(...results.genres.map((g) => ({ ...g, type: "genre" })));
			}
		}

		if (
			results.authors?.length > 0 &&
			(activeFilter === "all" || activeFilter === "author")
		) {
			if (activeFilter === "all")
				data.push({ type: "header", title: "Authors" });
			data.push(...results.authors.map((a) => ({ ...a, type: "author" })));
		}

		if (
			results.books?.length > 0 &&
			(activeFilter === "all" || activeFilter === "book")
		) {
			if (activeFilter === "all") data.push({ type: "header", title: "Books" });
			data.push(...results.books.map((b) => ({ ...b, type: "book" })));
		}

		return data;
	};

	const renderItem = useCallback(
		({ item }: any) => {
			if (item.type === "header") {
				return (
					<Text style={[styles.sectionHeader, { color: theme.textSecondary }]}>
						{item.title}
					</Text>
				);
			}

			if (item.type === "author") {
				return (
					<AuthorResultItem
						item={item}
						isDarkMode={isDarkMode}
						onPress={handleAuthorPress}
					/>
				);
			}

			if (item.type === "book") {
				return (
					<BookResultItem
						item={item}
						isDarkMode={isDarkMode}
						onPress={handleBookPress}
					/>
				);
			}

			if (item.type === "genre") {
				return (
					<TouchableOpacity
						style={styles.genreItem}
						onPress={() => {
							console.log("Genre selected:", item.name);
						}}
					>
						<Ionicons
							name="pricetag-outline"
							size={18}
							color={theme.textSecondary}
						/>
						<Text style={[styles.genreText, { color: theme.textPrimary }]}>
							{item.name}
						</Text>
					</TouchableOpacity>
				);
			}

			return null;
		},
		[isDarkMode, theme],
	);

	return (
		<View style={styles.container}>
			<Pressable
				onPress={handleOpen}
				style={[
					styles.searchTrigger,
					{ backgroundColor: isDarkMode ? Colors.thirdColorDark : "#FFFFFF" },
				]}
			>
				<Ionicons name="search-outline" size={20} color={theme.textPrimary} />
				<Text style={[styles.triggerText, { color: theme.textSecondary }]}>
					{query || "Search for authors, books, genres ..."}
				</Text>
			</Pressable>

			<Modal
				animationType="slide"
				transparent
				visible={modalVisible}
				onRequestClose={handleClose}
			>
				<ToastProvider>
					<SafeAreaView
						style={[
							styles.modalContainer,
							{ backgroundColor: theme.background },
						]}
					>
						<View
							style={[
								styles.header,
								{
									backgroundColor: isDarkMode
										? Colors.mainColorDarker
										: "#FFFFFF",
								},
							]}
						>
							<TouchableOpacity
								onPress={handleClose}
								style={styles.backButton}
								hitSlop={26}
							>
								<Caret width={24} height={24} fill={theme.textPrimary} />
							</TouchableOpacity>

							<TextInput
								ref={inputRef}
								style={[styles.input, { color: theme.textPrimary }]}
								placeholder="Search..."
								placeholderTextColor={theme.textSecondary}
								value={query}
								onChangeText={setQuery}
								returnKeyType="search"
								onSubmitEditing={() => saveSearch(query)}
								autoFocus={true}
								autoCapitalize="none"
							/>

							{query.length > 0 && (
								<Pressable
									onPress={() => setQuery("")}
									style={styles.clearButton}
									hitSlop={15}
								>
									<X width={18} height={18} fill={theme.iconColor} />
								</Pressable>
							)}
						</View>

						<View style={styles.content}>
							{renderFilterPills()}
							<ScrollView
								style={{ flex: 1 }}
								contentContainerStyle={{ paddingBottom: 40 }}
								showsVerticalScrollIndicator={false}
							>
								{filteredHistory.length > 0 && !loading && !results && (
									<View style={styles.historySection}>
										<Text
											style={[
												styles.sectionTitle,
												{ color: theme.textSecondary },
											]}
										>
											Recent Searches
										</Text>
										{filteredHistory.map((item, index) => (
											<TouchableOpacity
												key={index}
												style={styles.historyItem}
												onPress={() => selectHistoryItem(item)}
											>
												<Ionicons
													name="time-outline"
													size={20}
													color={theme.textSecondary}
												/>
												<Text
													style={[
														styles.historyText,
														{ color: theme.textPrimary },
													]}
												>
													{item}
												</Text>
												<Ionicons
													name="arrow-up-outline"
													size={18}
													color={theme.textSecondary}
													style={{ transform: [{ rotate: "-45deg" }] }}
												/>
											</TouchableOpacity>
										))}
									</View>
								)}
								{previouslyOpened.length > 0 && !loading && !results && (
									<View style={styles.historySection}>
										<Text
											style={[
												styles.sectionTitle,
												{ color: theme.textSecondary },
											]}
										>
											Bookmarked Memories
										</Text>
										{previouslyOpened.map((book, index) => (
											<BookResultItem
												/*@ts-ignore*/
												item={{
													...book.foundBook,
													isFavorited: book.foundBook.isLikedByMe,
													commentCount: book.foundBook.statistics.reviewCount,
													favoriteCount:
														book.foundBook.statistics.wantToReadCount,
												}}
												isDarkMode={isDarkMode}
												onPress={handleBookPress}
											/>
										))}
									</View>
								)}
							</ScrollView>

							{loading && (
								<View style={styles.centerContainer}>
									<ActivityIndicator size="small" color={theme.iconColor} />
								</View>
							)}

							{results && !loading && (
								<Animated.FlatList
									keyboardShouldPersistTaps="handled"
									data={renderListData()}
									itemLayoutAnimation={FadeInLeft.duration(400)}
									entering={FadeInLeft.duration(300)}
									keyExtractor={(item, index) => index.toString()}
									renderItem={renderItem}
									contentContainerStyle={{ paddingBottom: 40 }}
									showsVerticalScrollIndicator={false}
									ListEmptyComponent={() => (
										<View style={styles.centerContainer}>
											<Text style={{ color: theme.textSecondary }}>
												No results found.
											</Text>
										</View>
									)}
								/>
							)}
						</View>
					</SafeAreaView>
				</ToastProvider>
			</Modal>
		</View>
	);
};

export default UniversalSearch;

const styles = StyleSheet.create({
	container: { width: "100%", paddingHorizontal: 20, marginVertical: 10 },
	searchTrigger: {
		flexDirection: "row",
		alignItems: "center",
		height: 50,
		borderRadius: 25,
		paddingHorizontal: 15,
		elevation: 1,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.1,
		shadowRadius: 2,
	},
	pillContainer: {
		flexDirection: "row",
		paddingVertical: 4,
		gap: 0,
		alignItems: "center",
	},
	pill: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 16,
		paddingVertical: 8,
		borderRadius: 20,
	},
	pillText: {
		fontSize: 14,
		fontFamily: "modern_no_20_regular",
		fontWeight: "600",
	},
	triggerText: {
		marginLeft: 10,
		fontSize: 16,
		fontFamily: "modern_no_20_regular",
		opacity: 0.6,
	},
	modalContainer: { flex: 1 },
	header: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 10,
		height: 70,
	},
	backButton: { padding: 10 },
	input: { flex: 1, fontSize: 18, fontFamily: "modern_no_20_regular" },
	clearButton: { padding: 12 },
	content: { flex: 1, paddingHorizontal: 10 },
	sectionHeader: {
		fontSize: 14,
		fontFamily: "modern_no_20_regular",
		textTransform: "uppercase",
		marginTop: 20,
		marginBottom: 10,
		marginLeft: 14,
		letterSpacing: 1,
	},
	historySection: { marginTop: 20, paddingHorizontal: 10 },
	sectionTitle: {
		fontSize: 12,
		fontFamily: "Poppins_600SemiBold",
		marginBottom: 10,
		textTransform: "uppercase",
	},
	historyItem: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 12,
	},
	historyText: {
		flex: 1,
		marginLeft: 15,
		fontSize: 16,
		fontFamily: "modern_no_20_regular",
	},
	centerContainer: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		marginTop: 40,
	},
	genreItem: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 12,
		paddingHorizontal: 14,
	},
	genreText: {
		marginLeft: 15,
		fontSize: 16,
		fontFamily: "modern_no_20_regular",
	},
});
