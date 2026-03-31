import { Image } from "expo-image";
import {
	Platform,
	SafeAreaView,
	StyleSheet,
	useColorScheme,
} from "react-native";
import { runOnJS } from "react-native-reanimated";
import { Directions, Gesture, ScrollView } from "react-native-gesture-handler";
import { GestureDetector } from "react-native-gesture-handler";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ProfileData } from "./settings";
import { Storage } from "@/utils/storage";
import UniversalSearch from "@/components/UniversalSearch";
import BookDetailModal from "@/components/BookDetailModal";
import AuthorDetailModal from "@/components/AuthorDetailModal";

export default function SearchScreen() {
	const isDarkMode = useColorScheme() === "dark";
	const [profileData, setProfileData] = useState<ProfileData | null>(null);
	useEffect(() => {
		async function fetchProfileData() {
			const data = await Storage.getItem("user");
			setProfileData(data);
		}
		fetchProfileData();
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
				</SafeAreaView>
			</ScrollView>
		</GestureDetector>
	);
}

const styles = StyleSheet.create({});
