import {
	StyleSheet,
	TouchableOpacity,
	View,
	ScrollView,
	RefreshControl,
	useColorScheme,
	ActivityIndicator,
	Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/contexts/AuthContext";
import FirstSignInTaste from "@/components/homeComponents/FirstSignInTaste";
import React, { useCallback, useEffect, useState } from "react";
import { useApi } from "@/contexts/ApiContext";
import { Book, MainPageData } from "@/constants/interfaces";
import BookCarousel from "@/components/homeComponents/BookCarousel";
import AuthorCarousel from "@/components/homeComponents/AuthorCarousel";
import { Colors } from "@/constants/theme";
import { HomeSkeleton } from "@/components/homeComponents/HomeSkeleton";
import BookOfBookCard from "@/components/homeComponents/BookOfBookCard";
import BookDetailModal from "@/components/BookDetailModal";
import { Storage } from "@/utils/storage";
import { useRouter } from "expo-router";
import {
	Directions,
	Gesture,
	GestureDetector,
} from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";

export default function HomeScreen() {
	const api = useApi();
	const router = useRouter();
	const isDarkMode = useColorScheme() === "dark";
	const { authState } = useAuth();
	const [modalVisibility, setModalVisibility] = useState(false);
	const [mainList, setMainList] = useState<MainPageData | null>(null);
	const [refreshing, setRefreshing] = useState(false);
	const { refreshUserSession } = useAuth();
	const [randomBook, setRandomBook] = useState<Book | null>(null);
	const [randomBookModalVisible, setRandomBookModalVisible] = useState(false);
	const [profilePic, setProfilePic] = useState("");
	const [email, setEmail] = useState<string | null>(null);

	const onRefresh = useCallback(async () => {
		setRefreshing(true);
		await refreshUserSession();
		fetchData();
	}, []);

	useEffect(() => {
		if (authState.isAuthenticated && authState.roles !== undefined) {
			//@ts-ignore
			let isNewUser = Array.from(authState.roles.roles || []).includes(
				"new_user",
			);
			if (isNewUser) {
				setModalVisibility(true);
			}
		}
		fetchData();
	}, []);

	const fetchData = async () => {
		try {
			await api.getMe();
			const meData = await Storage.getItem("user");
			if (meData && meData.biggerProfilePic) {
				setProfilePic(meData.biggerProfilePic);
			}
			if (meData && meData.email) {
				setEmail(meData.email);
			}
			const mainPageData = await api.getMainPageData();
			const randomBookData = await api.getRandomBook();
			setRandomBook(randomBookData);
			setMainList(mainPageData);
		} catch (error) {
			console.error("Error fetching main page data in HomeScreen:", error);
		}
	};

	const handleSavePress = async () => {
		try {
			await api.syncProfileWithServer(true);
		} catch (e) {
			console.error("Error syncing profile with server:", e);
		}
		fetchData();
		await refreshUserSession();
	};

	const goToExplore = () => router.replace("/explore");
	const swipeLeft = Gesture.Fling()
		.direction(Directions.LEFT)
		.onEnd(() => {
			runOnJS(goToExplore)();
		});

	return (
		<>
			<FirstSignInTaste
				visible={modalVisibility}
				onClose={async () => {
					setModalVisibility(false);
					await handleSavePress();
				}}
				isDarkMode={isDarkMode}
			></FirstSignInTaste>
			<GestureDetector gesture={Gesture.Exclusive(swipeLeft)}>
				<View style={{ flex: 1, position: "relative" }}>
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
							{randomBook && (
								<>
									<BookOfBookCard
										data={randomBook}
										isDarkMode={isDarkMode}
										onPress={() => {
											setRandomBookModalVisible(true);
										}}
									/>

									<Modal
										visible={randomBookModalVisible}
										animationType="slide"
										transparent
									>
										<SafeAreaView
											style={{
												flex: 1,
												backgroundColor: isDarkMode
													? Colors.mainColorDark
													: Colors.secondaryColorLight,
											}}
										>
											<BookDetailModal
												bookId={randomBook?.id}
												isDarkMode={isDarkMode}
												onClose={() => setRandomBookModalVisible(false)}
												profilePic={profilePic}
												visible={randomBookModalVisible}
												email={email}
											/>
										</SafeAreaView>
									</Modal>
								</>
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
			</GestureDetector>
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
