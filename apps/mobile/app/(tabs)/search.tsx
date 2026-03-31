import { Image } from "expo-image";
import {
	Platform,
	SafeAreaView,
	StyleSheet,
	useColorScheme,
	View,
} from "react-native";
import { runOnJS } from "react-native-reanimated";
import {
	Directions,
	Gesture,
	RefreshControl,
	ScrollView,
} from "react-native-gesture-handler";
import { GestureDetector } from "react-native-gesture-handler";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ProfileData } from "./settings";
import { Storage } from "@/utils/storage";
import UniversalSearch from "@/components/UniversalSearch";
import BookDetailModal from "@/components/BookDetailModal";
import AuthorDetailModal from "@/components/AuthorDetailModal";
import { MainPageData } from "@/constants/interfaces";
import { useApi } from "@/contexts/ApiContext";
import { Colors } from "@/constants/theme";
import { HomeSkeleton } from "@/components/homeComponents/HomeSkeleton";
import BookCarousel from "@/components/homeComponents/BookCarousel";
import AuthorCarousel from "@/components/homeComponents/AuthorCarousel";
import GenreSelector from "@/components/searchComponents/GenreSelector";

export default function SearchScreen() {
	const api = useApi();
	const isDarkMode = useColorScheme() === "dark";
	const [profileData, setProfileData] = useState<ProfileData | null>(null);
	const [mainListSearch, setMainListSearch] = useState<MainPageData | null>(
		null,
	);
	const [refreshing, setRefreshing] = useState(false);

	const onRefresh = useCallback(async () => {
		setRefreshing(true);
		const fetchData = async () => {
			try {
				const mainPageData = await api.getSearchPageDataAnyWay();
				setMainListSearch(mainPageData);
			} catch (error) {
				console.error("Error fetching main page data in HomeScreen:", error);
			} finally {
				setRefreshing(false);
			}
		};
		fetchData();
	}, []);

	useEffect(() => {
		async function fetchProfileData() {
			const data = await Storage.getItem("user");
			setProfileData(data);
		}
		fetchProfileData();
		async function prefetchSearchPageData() {
			try {
				const data = await api.getSearchPageData();
				setMainListSearch(data);
			} catch (error) {
				console.error("Error prefetching search page data:", error);
			}
		}
		prefetchSearchPageData();
	}, []);

	const goToNext = () => router.replace("/collections");
	const goToPrevious = () => router.replace("/explore");

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
					<UniversalSearch
						isDarkMode={isDarkMode}
						onBookPress={handleBookPress}
						onAuthorPress={handleAuthorPress}
					/>

					{mainListSearch ? (
						<>
							{mainListSearch.authors.map((section) => (
								<AuthorCarousel
									key={section.title}
									section={section}
									isDarkMode={isDarkMode}
								/>
							))}
							{mainListSearch.books.map((section) => (
								<BookCarousel
									key={section.title}
									section={section}
									isDarkMode={isDarkMode}
								/>
							))}
						</>
					) : (
						<HomeSkeleton darkmode={isDarkMode} />
					)}
					<GenreSelector isDarkMode={isDarkMode} />
					<View style={{ height: 40 }}></View>
				</SafeAreaView>
			</ScrollView>
		</GestureDetector>
	);
}

const styles = StyleSheet.create({});
