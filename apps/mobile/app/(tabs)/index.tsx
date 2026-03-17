import {
	StyleSheet,
	TouchableOpacity,
	View,
	ScrollView,
	RefreshControl,
	useColorScheme,
	ActivityIndicator,
} from "react-native";
import { ThemedText } from "@/components/themed-text";
import { SafeAreaView } from "react-native-safe-area-context";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { AnimatedCarousel } from "@/components/homeComponents/AnimatedCarousel";
import DashboardAdCarousel from "@/components/homeComponents/DashboardAdCarousel";
import { useAuth } from "@/contexts/AuthContext";
import { Stack } from "expo-router";
import FirstSignInTaste from "@/components/homeComponents/FirstSignInTaste";
import React, { useCallback, useEffect, useState } from "react";
import { useApi } from "@/contexts/ApiContext";
import { MainPageData } from "@/constants/interfaces";
import BookCarousel from "@/components/homeComponents/BookCarousel";
import AuthorCarousel from "@/components/homeComponents/AuthorCarousel";
import { Colors } from "@/constants/theme";
import { HomeSkeleton } from "@/components/homeComponents/HomeSkeleton";
import BookOfBookCard from "@/components/homeComponents/BookOfBookCard";

export default function HomeScreen() {
	const api = useApi();
	const isDarkMode = useColorScheme() === "dark";
	const { authState } = useAuth();
	const [modalVisibility, setModalVisibility] = useState(false);
	const [mainList, setMainList] = useState<MainPageData | null>(null);
	const [refreshing, setRefreshing] = useState(false);
	const { refreshUserSession } = useAuth();

	const onRefresh = useCallback(async () => {
		setRefreshing(true);
		await refreshUserSession();
		const fetchData = async () => {
			try {
				const mainPageData = await api.getMainPageAnyWay();
				setMainList(mainPageData);
			} catch (error) {
				console.error("Error fetching main page data in HomeScreen:", error);
			} finally {
				setRefreshing(false);
			}
		};
		fetchData();
	}, []);

	useEffect(() => {
		console.log("User roles:", authState.roles);
		if (authState.roles.includes("new_user")) {
			setModalVisibility(true);
		}
		const fetchData = async () => {
			try {
				const mainPageData = await api.getMainPageData();
				setMainList(mainPageData);
			} catch (error) {
				console.error("Error fetching main page data in HomeScreen:", error);
			}
		};

		fetchData();
	}, []);

	const handleSavePress = async () => {
		try {
			await api.syncProfileWithServer(true);
		} catch (e) {
			console.error("Error syncing profile with server:", e);
		}
		await api.getMe();
		await refreshUserSession();
	};
	// Temporary hardcoded book data for testing purposes, TODO: get it from api
	const bookData = {
		title: "The Old Man and The Sea",
		author: "Ernest Hemingway",
		genres: [
			"Classics",
			"Romance",
			"Science fiction",
			"Fantasy",
			"Mystery",
			"Thriller",
		],
		description:
			"Santiago, an aging Cuban fisherman who breaks an 84-day streak of bad luck by hooking a giant marlin. The novella explores themes of perseverance, pride, and the human spirit as Santiago battles the marlin and reflects on his life and struggles.",
		coverUrl:
			"https://m.media-amazon.com/images/M/MV5BNGQ0OWNlYTQtZjBlYy00NDJlLTk2ZDEtYzdkMzYxZmU3OWM2XkEyXkFqcGc@._V1_.jpg",
	};

	return (
		<>
			<View style={{ flex: 1, position: "relative" }}>
				<FirstSignInTaste
					visible={modalVisibility}
					onClose={async () => {
						setModalVisibility(false);
						await handleSavePress();
					}}
					isDarkMode={isDarkMode}
				></FirstSignInTaste>
				<SafeAreaView style={{ flex: 1 }}>
					<ScrollView
						keyboardShouldPersistTaps="handled"
						showsVerticalScrollIndicator={false}
						refreshControl={
							<RefreshControl
								refreshing={refreshing}
								onRefresh={onRefresh}
								style={{ position: "absolute", zIndex: 999, top: -50 }}
								colors={
									isDarkMode
										? [Colors.secondaryColorDark]
										: [Colors.mainColorLight]
								}
								progressBackgroundColor={
									isDarkMode ? Colors.thirdColorDark : "#ffffff"
								}
							/>
						}
					>
						{bookData && (
							<BookOfBookCard
								data={bookData}
								isDarkMode={isDarkMode}
								onPress={() => {
									console.log("Book card pressed");
								}}
							/>
						)}
						{mainList ? (
							<>
								{(() => {
									let bookPointer = 0;

									return mainList.authors.map((authorSection, index) => {
										const countToTake = index + 1;
										const currentBooks = mainList.books.slice(
											bookPointer,
											bookPointer + countToTake,
										);

										bookPointer += countToTake;

										return (
											<React.Fragment
												key={`group-${authorSection.title || index}`}
											>
												<AuthorCarousel
													section={authorSection}
													isDarkMode={isDarkMode}
												/>

												{currentBooks.map((bookSection, bIndex) => (
													<BookCarousel
														key={`book-${bookSection.title || bIndex}-${bookPointer}`}
														section={bookSection}
														isDarkMode={isDarkMode}
													/>
												))}

												{index === mainList.authors.length - 1 &&
													bookPointer < mainList.books.length &&
													mainList.books
														.slice(bookPointer)
														.map((remainingBook, rIndex) => (
															<BookCarousel
																key={`rem-${rIndex}`}
																section={remainingBook}
																isDarkMode={isDarkMode}
															/>
														))}
											</React.Fragment>
										);
									});
								})()}
							</>
						) : (
							<HomeSkeleton darkmode={isDarkMode} />
						)}
						<View style={{ height: 100 }}></View>
					</ScrollView>
				</SafeAreaView>
			</View>
		</>
	);
}

const styles = StyleSheet.create({
	logoutButton: {
		marginHorizontal: 16,
		marginTop: 20,
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
		shadowOpacity: 0.3,
		shadowRadius: 4,
		elevation: 3,
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
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
});
