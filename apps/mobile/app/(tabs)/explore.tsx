import { Image } from "expo-image";
import { Platform, StyleSheet, Text, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { runOnJS } from "react-native-reanimated";
import {
	Directions,
	Gesture,
	GestureDetector,
	ScrollView,
} from "react-native-gesture-handler";
import { router } from "expo-router";
import UniversalSearch from "@/components/UniversalSearch";
import BookDetailModal from "@/components/BookDetailModal";
import { useEffect, useState } from "react";
import { Storage } from "@/utils/storage";
import { ProfileData } from "./settings";
import AuthorDetailModal from "@/components/AuthorDetailModal";

export default function TabTwoScreen() {
	const isDarkMode = useColorScheme() === "dark";
	const goToNext = () => router.replace("/search");
	const goToPrevious = () => router.replace("/(tabs)");
	const [profileData, setProfileData] = useState<ProfileData | null>(null);
	useEffect(() => {
		async function fetchProfileData() {
			const data = await Storage.getItem("user");
			setProfileData(data);
		}
		fetchProfileData();
	}, []);

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
			<ScrollView keyboardShouldPersistTaps="handled">
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
