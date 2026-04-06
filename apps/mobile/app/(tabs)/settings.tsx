import ProfileScreen from "@/components/profileComponents/ProfileScreen";
import {
	View,
	Text,
	StyleSheet,
	Image,
	Pressable,
	ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Storage } from "@/utils/storage";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { runOnJS } from "react-native-reanimated";
import {
	Directions,
	Gesture,
	GestureDetector,
	TouchableOpacity,
} from "react-native-gesture-handler";
import { router } from "expo-router";
import { G } from "react-native-svg";
import { useApi } from "@/contexts/ApiContext";

export interface ProfileData {
	biggerProfilePic: string;
	createdAt: string;
	email: string;
	nickname: any;
	smallerProfilePic: string;
	updatedAt: string;
}

export default function TabThreeScreen() {
	const api = useApi();
	const goToPrevious = () => router.replace("/collections");

	const swipeRight = Gesture.Fling()
		.direction(Directions.RIGHT)
		.onEnd(() => {
			runOnJS(goToPrevious)();
		});
	const [profileData, setProfileData] = useState<ProfileData | null>(null);
	useEffect(() => {
		fetchProfileData();
	}, []);
	async function fetchProfileData() {
		await api.getMe();
		const data = await Storage.getItem("user");
		setProfileData(data);
	}
	return (
		<GestureDetector gesture={swipeRight}>
			<ProfileScreen
				biggerProfilePic={profileData?.biggerProfilePic}
				createdAt={profileData?.createdAt}
				email={profileData?.email}
				nickname={profileData?.nickname}
				smallerProfilePic={profileData?.smallerProfilePic}
				updatedAt={profileData?.updatedAt}
				syncProfile={fetchProfileData}
			/>
		</GestureDetector>
	);
}
