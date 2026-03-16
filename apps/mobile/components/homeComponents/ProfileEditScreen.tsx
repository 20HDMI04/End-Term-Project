import React, { useState, useEffect } from "react";
import {
	StyleSheet,
	View,
	Text,
	TextInput,
	TouchableOpacity,
	Image,
	Alert,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	TouchableWithoutFeedback,
	Keyboard,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/theme";

const ProfileEditScreen: React.FC<{ isDarkMode: boolean }> = ({
	isDarkMode,
}) => {
	const [image, setImage] = useState<string | null>(null);
	const [nickname, setNickname] = useState<string>("");

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

	const pickImage = async () => {
		const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
		if (status !== "granted") {
			Alert.alert("Error", "Permission required!");
			return;
		}

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

	const handleNicknameChange = async (text: string) => {
		setNickname(text);
		await AsyncStorage.setItem("user_nickname", text);
	};

	return (
		<KeyboardAvoidingView style={{ flex: 1 }}>
			<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
				<ScrollView
					style={styles.container}
					showsVerticalScrollIndicator={false}
				>
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
									backgroundColor: isDarkMode
										? Colors.thirdColorDark
										: "#ffffff",
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
									{
										color: isDarkMode ? "#ffffff" : Colors.mainColorLight,
									},
								]}
								value={nickname}
								onChangeText={handleNicknameChange}
								placeholder="Your unique nickname"
								placeholderTextColor={
									isDarkMode ? Colors.loginTextDark : Colors.darkerTextLight
								}
							/>
						</View>
					</View>
				</ScrollView>
			</TouchableWithoutFeedback>
		</KeyboardAvoidingView>
	);
};

const styles = StyleSheet.create({
	container: {
		flexGrow: 1,
		width: "100%",
		height: "100%",
		marginTop: 100,
		marginBottom: 10,
	},
	imageContainer: {
		alignItems: "center",
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
		marginTop: 10,
		width: "100%",
	},
	label: {
		fontSize: 20,
		marginBottom: 8,
		marginLeft: 5,
		fontFamily: "modern_no_20_regular",
	},
	inputContainer: {
		flexDirection: "row",
		alignItems: "center",
		borderRadius: 30,
		width: 300,
		paddingHorizontal: 20,
		height: 55,
		borderWidth: 1,
		borderColor: "rgba(0,0,0,0.05)",
		marginBottom: 0,
	},
	inputIcon: {
		marginRight: 10,
	},
	input: {
		flex: 1,
		fontFamily: "Poppins_300Light",
		fontSize: 16,
		width: "100%",
	},
});

export default ProfileEditScreen;
