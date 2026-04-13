import { Image } from "expo-image";
import { Platform, StyleSheet, Text, useColorScheme, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { runOnJS } from "react-native-reanimated";
import {
	Directions,
	Gesture,
	GestureDetector,
	RefreshControl,
	ScrollView,
} from "react-native-gesture-handler";
import { router } from "expo-router";
import UniversalSearch from "@/components/UniversalSearch";
import BookDetailModal from "@/components/BookDetailModal";
import { useCallback, useEffect, useState } from "react";
import { Storage } from "@/utils/storage";
import { ProfileData } from "./settings";
import AuthorDetailModal from "@/components/AuthorDetailModal";
import { MainPageData } from "@/constants/interfaces";
import { useApi } from "@/contexts/ApiContext";
import { Colors } from "@/constants/theme";
import AuthorCarousel from "@/components/homeComponents/AuthorCarousel";
import BookCarousel from "@/components/homeComponents/BookCarousel";
import { HomeSkeleton } from "@/components/homeComponents/HomeSkeleton";

export default function TabTwoScreen() {
	const api = useApi();
	const isDarkMode = useColorScheme() === "dark";
	const goToNext = () => router.replace("/search");
	const goToPrevious = () => router.replace("/(tabs)");
	const [profileData, setProfileData] = useState<ProfileData | null>(null);
	const [mainListDiscover, setMainListDiscover] = useState<MainPageData | null>(
		null,
	);
	const [refreshing, setRefreshing] = useState(false);

	const onRefresh = useCallback(async () => {
		setRefreshing(true);
		const fetchData = async () => {
			try {
				const mainPageData = await api.getDiscoverPageDataAnyWay();
				setMainListDiscover(mainPageData);
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
		async function prefetchDiscoverPageData() {
			try {
				const data = await api.getDiscoverPageData();
				setMainListDiscover(data);
			} catch (error) {
				console.error("Error prefetching discover page data:", error);
			}
		}
		prefetchDiscoverPageData();
	}, []);

	useEffect(() => {
		console.log("Main list discover data updated:", mainListDiscover);
	}, [mainListDiscover]);

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
				keyboardShouldPersistTaps="handled"
				style={{ flex: 1, marginTop: 40 }}
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
				<SafeAreaView style={{ flex: 1, bottom: 40 }}>
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
					{mainListDiscover ? (
						<>
							{mainListDiscover.authors.map((section) => (
								<AuthorCarousel
									key={section.title}
									section={section}
									isDarkMode={isDarkMode}
								/>
							))}
							{mainListDiscover.books.map((section) => (
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
				</SafeAreaView>
				<View style={{ height: 40 }}></View>
			</ScrollView>
		</GestureDetector>
	);
}

const styles = StyleSheet.create({});
