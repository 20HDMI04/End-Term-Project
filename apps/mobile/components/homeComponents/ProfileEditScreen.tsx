import React, { useState, useEffect, useCallback } from "react";
import {
	StyleSheet,
	View,
	Text,
	TextInput,
	TouchableOpacity,
	Image,
	ScrollView,
	Keyboard,
	Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/theme";
import { useKeyboardVisible } from "@/hooks/use-keyboard-visible";

const ProfileEditScreen: React.FC<{ isDarkMode: boolean }> = ({
	isDarkMode,
}) => {
	const [image, setImage] = useState<string | null>(null);
	const [nickname, setNickname] = useState<string>("");
	const keyboardVisible = useKeyboardVisible();

	useEffect(() => {
		loadUserData();
	}, []);

	const loadUserData = async () => {
		try {
			const savedImage = await AsyncStorage.getItem("user_image");
			const savedNickname = await AsyncStorage.getItem("user_nickname");
			if (savedImage) setImage(savedImage);
			if (savedNickname) setNickname(savedNickname);
		} catch (e) {
			console.error(e);
		}
	};

	const handleNicknameChange = (text: string) => {
		setNickname(text);
	};

	const saveNicknameToStorage = async () => {
		try {
			await AsyncStorage.setItem("user_nickname", nickname);
		} catch (e) {
			console.error("Save error:", e);
		}
	};

	const pickImage = async () => {
		const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
		if (status !== "granted") return;

		let result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: "images",
			allowsEditing: true,
			aspect: [1, 1],
			quality: 0.7,
		});

		if (!result.canceled) {
			const uri = result.assets[0].uri;
			setImage(uri);
			await AsyncStorage.setItem("user_image", uri);
		}
	};

	return (
		<View style={{ flex: 1, width: "100%" }}>
			<ScrollView
				style={[styles.container]}
				contentContainerStyle={styles.scrollContent}
				showsVerticalScrollIndicator={false}
			>
				{!keyboardVisible && (
					<View style={styles.imageContainer}>
						<TouchableOpacity onPress={pickImage} activeOpacity={0.85}>
							<View style={styles.imageWrapper}>
								{image ? (
									<Image
										source={{ uri: image }}
										style={[
											styles.profileImage,
											{
												borderColor: isDarkMode
													? Colors.thirdColorDark
													: Colors.mainColorLight,
											},
										]}
									/>
								) : (
									<View
										style={[
											styles.profileImage,
											styles.placeholder,
											{
												backgroundColor: isDarkMode
													? Colors.thirdColorDark
													: Colors.thirdColorLight,
											},
										]}
									>
										<Ionicons
											name="person-outline"
											size={50}
											color={
												isDarkMode
													? Colors.loginTextDark
													: Colors.darkerTextLight
											}
										/>
									</View>
								)}
								<View
									style={[
										styles.editIconBadge,
										{
											backgroundColor: isDarkMode
												? Colors.thirdColorDark
												: Colors.mainColorLight,
											borderColor: isDarkMode
												? Colors.thirdColorDark
												: Colors.mainColorLight,
										},
									]}
								>
									<Ionicons name="camera" size={18} color="#ffffff" />
								</View>
							</View>
						</TouchableOpacity>
					</View>
				)}

				<View style={styles.inputWrapper}>
					<Text
						style={[
							styles.label,
							{
								color: isDarkMode
									? Colors.loginTextDark
									: Colors.darkerTextLight,
							},
						]}
					>
						Nickname
					</Text>
					<View
						style={[
							styles.inputContainer,
							{
								backgroundColor: isDarkMode ? Colors.thirdColorDark : "#ffffff",
							},
						]}
					>
						<Ionicons
							name="person-outline"
							size={20}
							color={isDarkMode ? "#ffffff" : Colors.mainColorLight}
							style={styles.inputIcon}
						/>
						<TextInput
							style={[
								styles.input,
								{ color: isDarkMode ? "#ffffff" : Colors.mainColorLight },
							]}
							value={nickname}
							onChangeText={handleNicknameChange}
							onBlur={saveNicknameToStorage}
							placeholder="Your unique nickname"
							placeholderTextColor={
								isDarkMode ? Colors.loginTextDark : Colors.darkerTextLight
							}
							onSubmitEditing={() => {
								Keyboard.dismiss();
							}}
							blurOnSubmit={false}
							disableFullscreenUI={true}
							underlineColorAndroid="transparent"
						/>
					</View>
				</View>
			</ScrollView>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		marginTop: 60,
		width: "100%",
	},
	scrollContent: {
		alignItems: "center",
	},
	imageContainer: {
		alignItems: "center",
		marginBottom: 20,
	},
	imageWrapper: {
		position: "relative",
	},
	profileImage: {
		width: 200,
		height: 200,
		borderRadius: 100,
		borderWidth: 2,
	},
	placeholder: {
		justifyContent: "center",
		alignItems: "center",
	},
	editIconBadge: {
		position: "absolute",
		bottom: 5,
		right: 5,
		width: 36,
		height: 36,
		borderRadius: 18,
		justifyContent: "center",
		alignItems: "center",
		borderWidth: 3,
	},
	inputWrapper: {
		width: 300,
		marginTop: 10,
	},
	label: {
		fontSize: 18,
		marginBottom: 8,
		fontFamily: "modern_no_20_regular",
	},
	inputContainer: {
		flexDirection: "row",
		alignItems: "center",
		borderRadius: 30,
		paddingHorizontal: 20,
		height: 55,
		borderWidth: 1,
		borderColor: "rgba(0,0,0,0.05)",
	},
	inputIcon: {
		marginRight: 10,
	},
	input: {
		flex: 1,
		fontFamily: "Poppins_300Light",
		fontSize: 16,
	},
});

export default React.memo(ProfileEditScreen);
