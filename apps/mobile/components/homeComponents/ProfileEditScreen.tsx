import React, { useState, useEffect } from "react";
import {
	StyleSheet,
	View,
	Text,
	TextInput,
	TouchableOpacity,
	Image,
	ScrollView,
	Keyboard,
	Dimensions,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/theme";
import { useKeyboardVisible } from "@/hooks/use-keyboard-visible";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

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

	const handleNicknameChange = async (text: string) => {
		setNickname(text);
		await AsyncStorage.setItem("user_nickname", text);
	};

	const pickImage = async () => {
		const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
		if (status !== "granted") return;

		let result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
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
		<View style={styles.outerContainer}>
			<ScrollView
				style={styles.container}
				contentContainerStyle={styles.scrollContent}
				showsVerticalScrollIndicator={false}
				keyboardShouldPersistTaps="handled"
			>
				<View
					style={[
						styles.imageContainer,
						keyboardVisible && styles.imageContainerHidden,
					]}
				>
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
											isDarkMode ? Colors.loginTextDark : Colors.darkerTextLight
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
										borderColor: themeBackground(isDarkMode),
									},
								]}
							>
								<Ionicons name="camera" size={18} color="#ffffff" />
							</View>
						</View>
					</TouchableOpacity>
				</View>

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
							placeholder="Your unique nickname"
							placeholderTextColor={
								isDarkMode ? Colors.loginTextDark : Colors.darkerTextLight
							}
							onSubmitEditing={Keyboard.dismiss}
							underlineColorAndroid="transparent"
						/>
					</View>
				</View>
			</ScrollView>
		</View>
	);
};

const themeBackground = (isDark: boolean) =>
	isDark ? Colors.dark.background : Colors.light.background;

const styles = StyleSheet.create({
	outerContainer: {
		flex: 1,
		width: "100%",
	},
	container: {
		flex: 1,
	},
	scrollContent: {
		alignItems: "center",
		paddingTop: 40,
		paddingBottom: 20,
	},
	imageContainer: {
		alignItems: "center",
		marginBottom: 30,
	},
	imageContainerHidden: {
		transform: [{ scale: 0.8 }],
		marginBottom: 10,
	},
	imageWrapper: {
		position: "relative",
	},
	profileImage: {
		width: SCREEN_WIDTH * 0.45,
		height: SCREEN_WIDTH * 0.45,
		borderRadius: (SCREEN_WIDTH * 0.45) / 2,
		borderWidth: 2,
	},
	placeholder: {
		justifyContent: "center",
		alignItems: "center",
	},
	editIconBadge: {
		position: "absolute",
		bottom: 8,
		right: 8,
		width: 40,
		height: 40,
		borderRadius: 20,
		justifyContent: "center",
		alignItems: "center",
		borderWidth: 3,
	},
	inputWrapper: {
		width: "85%", // Fix 300 helyett rugalmas 85%
		marginTop: 10,
	},
	label: {
		fontSize: 18,
		marginBottom: 8,
		fontFamily: "modern_no_20_regular",
		textAlign: "left",
		width: "100%",
	},
	inputContainer: {
		flexDirection: "row",
		alignItems: "center",
		borderRadius: 25,
		paddingHorizontal: 15,
		height: 56,
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
		height: "100%",
	},
});

export default React.memo(ProfileEditScreen);
