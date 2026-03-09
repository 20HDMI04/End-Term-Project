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

export interface ProfileData {
	biggerProfilePic: string;
	createdAt: string;
	email: string;
	nickname: any;
	smallerProfilePic: string;
	updatedAt: string;
}

export default function TabThreeScreen() {
	const [profileData, setProfileData] = useState<ProfileData | null>(null);
	useEffect(() => {
		async function fetchProfileData() {
			const data = await Storage.getItem("user");
			setProfileData(data);
		}
		fetchProfileData();
	}, []);

	return (
		<>
			<ProfileScreen
				biggerProfilePic={profileData?.biggerProfilePic}
				createdAt={profileData?.createdAt}
				email={profileData?.email}
				nickname={profileData?.nickname}
				smallerProfilePic={profileData?.smallerProfilePic}
				updatedAt={profileData?.updatedAt}
			/>
		</>
	);
}
