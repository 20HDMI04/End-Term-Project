import { JSX, useState, useEffect } from "react";
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	StyleSheet,
	KeyboardAvoidingView,
	Platform,
	ActivityIndicator,
	Alert,
	useColorScheme,
	Image,
	Modal,
	Pressable,
} from "react-native";
import { useRouter } from "expo-router";
import { API_URL } from "@/config/api.config";
import Animated, { SlideInDown } from "react-native-reanimated";
import * as WebBrowser from "expo-web-browser";
import CustomEmailInput from "./emailInput";
import CustomPasswordInput from "./passwordInput";
import GoogleIcon from "@/assets/svgs/googleIcon.svg";
import { Colors } from "@/constants/theme";

WebBrowser.maybeCompleteAuthSession();

interface AuthFormProps {
	isSignUp: boolean;
	stopBounce: () => void;
}

export default function AuthForm({
	isSignUp: isSignUpProp,
	stopBounce,
}: AuthFormProps): JSX.Element {
	const router = useRouter();
	const [isSignUp, setIsSignUp] = useState(isSignUpProp);
	useEffect(() => {
		setIsSignUp(isSignUpProp);
	}, [isSignUpProp]);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [confirmPassword, setConfirmPassword] = useState("");
	const [modalVisible, setModalVisible] = useState(false);
	const [modalMessage, setModalMessage] = useState<string | null>(null);

	const colorScheme = useColorScheme();
	const isDarkMode = colorScheme === "dark";

	const handleGoogleSignIn = async () => {
		Alert.alert("Coming Soon", "Google Sign-In will be available soon!");
	};

	const handleAuth = async () => {
		// Client-side validation first. Show alerts for validation errors and don't
		// open the modal until we start the network request.
		if (!email || !password) {
			setModalMessage("Please fill in all fields!");
			setModalVisible(true);
			return;
		}
		if (isSignUp && password !== confirmPassword) {
			setModalMessage("Confirm password must match the password!");
			setModalVisible(true);
			return;
		}

		// Validation passed — show modal and start loading
		setModalVisible(true);
		setLoading(true);
		try {
			const endpoint = isSignUp ? "/signup" : "/signin";
			const url = `${API_URL}/auth${endpoint}`;
			console.log("Calling API:", url);

			const response = await fetch(url, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					formFields: [
						{ id: "email", value: email },
						{ id: "password", value: password },
					],
				}),
			});

			if (!response.ok) {
				const text = await response.text();
				console.error("Server error:", text);
				setModalMessage(`Server error: ${response.status}`);
				setModalVisible(true);
				return;
			}

			const responseText = await response.text();
			console.log("Response:", responseText);

			let data;
			try {
				data = JSON.parse(responseText);
			} catch (parseError) {
				console.error("JSON parse error. Response was:", responseText);
				setModalMessage(
					"Invalid response from server. Please check your backend URL."
				);
				setModalVisible(true);
				return;
			}

			if (data.status === "OK") {
				if (isSignUp) {
					Alert.alert("Success", "Account created successfully!");
				}
				router.replace("/(tabs)");
			} else if (data.status === "WRONG_CREDENTIALS_ERROR") {
				setModalMessage("Invalid email or password");
				setModalVisible(true);
			} else if (data.status === "FIELD_ERROR") {
				setModalMessage(data.formFields[0].error);
				setModalVisible(true);
			} else {
				setModalMessage("Something went wrong");
				setModalVisible(true);
			}
		} catch (error: any) {
			console.error("Auth error:", error);
			setModalMessage(error?.message || "Network error");
			setModalVisible(true);
		} finally {
			setLoading(false);
		}
	};
	return (
		<>
			<Animated.View style={styles.form}>
				{isSignUp ? (
					<Text
						style={[
							styles.headText,
							{
								color: isDarkMode
									? Colors.mainColorDark
									: Colors.mainColorLight,
							},
						]}
					>
						Sign up
					</Text>
				) : (
					<Text
						style={[
							styles.headText,
							{
								color: isDarkMode
									? Colors.mainColorDark
									: Colors.mainColorLight,
							},
						]}
					>
						Login
					</Text>
				)}
				<CustomEmailInput
					backgroundColor={
						isDarkMode
							? Colors.loginBackgroundDark
							: Colors.loginBackgroundLight
					}
					value={email}
					setValue={setEmail}
					fontAndIconColor={
						isDarkMode ? Colors.loginTextDark : Colors.loginTextLight
					}
					isDarkMode={isDarkMode}
					loading={loading}
					stopBounce={() => {
						stopBounce();
					}}
				/>
				<CustomPasswordInput
					backgroundColor={
						isDarkMode
							? Colors.loginBackgroundDark
							: Colors.loginBackgroundLight
					}
					value={password}
					setValue={setPassword}
					fontAndIconColor={
						isDarkMode ? Colors.loginTextDark : Colors.loginTextLight
					}
					isDarkMode={isDarkMode}
					loading={loading}
					stopBounce={() => {
						stopBounce();
					}}
				/>

				{isSignUp ? (
					<CustomPasswordInput
						backgroundColor={
							isDarkMode
								? Colors.loginBackgroundDark
								: Colors.loginBackgroundLight
						}
						value={confirmPassword}
						setValue={setConfirmPassword}
						fontAndIconColor={
							isDarkMode ? Colors.loginTextDark : Colors.loginTextLight
						}
						loading={loading}
						placeholder="Confirm password"
						stopBounce={() => {
							stopBounce();
						}}
						isDarkMode={isDarkMode}
					/>
				) : (
					""
				)}

				<TouchableOpacity
					style={[
						styles.button,
						(loading ||
							!email ||
							!password ||
							(isSignUp && password !== confirmPassword)) &&
							styles.buttonDisabled,
						{
							backgroundColor: isDarkMode
								? Colors.mainColorDark
								: Colors.mainColorLight,
						},
					]}
					onPress={() => {
						handleAuth();
						stopBounce();
					}}
					disabled={
						loading ||
						!email ||
						!password ||
						(isSignUp && password !== confirmPassword)
					}
				>
					{loading ? (
						<ActivityIndicator color="#fff" />
					) : (
						<Text style={styles.buttonText}>
							{isSignUp ? "Sign Up" : "Log In"}
						</Text>
					)}
				</TouchableOpacity>

				<View style={styles.dividerContainer}>
					<View style={styles.divider} />
					<Text style={styles.dividerText}>OR</Text>
					<View style={styles.divider} />
				</View>

				<TouchableOpacity
					style={styles.googleButton}
					onPress={() => {
						handleGoogleSignIn();
						stopBounce();
					}}
					disabled={loading}
				>
					<GoogleIcon />
					<Text style={styles.googleButtonText}>Continue with Google</Text>
				</TouchableOpacity>

				<TouchableOpacity
					style={styles.switchButton}
					onPress={() => setIsSignUp(!isSignUp)}
					disabled={loading}
				>
					{isSignUp ? (
						<Text
							style={[
								styles.switchText,
								{
									color: isDarkMode
										? Colors.mainColorDark
										: Colors.mainColorLight,
								},
							]}
						>
							Already have an account?{" "}
							<Text style={{ fontWeight: "bold" }}>Log In</Text>
						</Text>
					) : (
						<Text
							style={[
								styles.switchText,
								{
									color: isDarkMode
										? Colors.mainColorDark
										: Colors.mainColorLight,
								},
							]}
						>
							Don't have an account?{" "}
							<Text style={{ fontWeight: "bold" }}>Sign Up</Text>
						</Text>
					)}
				</TouchableOpacity>
			</Animated.View>
		</>
	);
}

const styles = StyleSheet.create({
	centeredView: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	modal: {
		position: "absolute",
		left: 0,
		right: 0,
		bottom: 0,
		justifyContent: "center",
		zIndex: 1002,
		elevation: 1002,
	},
	modalView: {
		margin: 20,
		backgroundColor: "white",
		borderRadius: 20,
		padding: 35,
		alignItems: "center",
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 4,
	},
	buttonModal: {
		borderRadius: 20,
		padding: 10,
		elevation: 2,
	},
	buttonOpen: {
		backgroundColor: "#F194FF",
	},
	buttonClose: {
		backgroundColor: "#2196F3",
	},
	textStyle: {
		color: "white",
		fontWeight: "bold",
		textAlign: "center",
	},
	modalText: {
		marginBottom: 15,
		textAlign: "center",
	},
	container: {
		flex: 1,
		backgroundColor: "#F7F4EB",
	},
	headText: {
		fontFamily: "Poppins_300Light",
		fontSize: 30,
		marginLeft: 10,
		marginBottom: 10,
	},
	keyboardView: {
		flex: 1,
	},
	content: {
		flex: 1,
		justifyContent: "center",
		paddingHorizontal: 24,
	},
	header: {
		alignItems: "center",
	},
	logo: {
		width: 400,
		marginTop: 20,
		resizeMode: "contain",
	},
	subtitle: {
		fontSize: 16,
		color: "#fff",
		opacity: 0.9,
	},
	form: {
		backgroundColor: "#fff",
		borderRadius: 45,
		borderBottomStartRadius: 0,
		borderBottomEndRadius: 0,
		padding: 24,
		paddingTop: 45,
		width: "100%",
		height: "100%",
	},
	inputContainer: {
		marginBottom: 20,
	},
	label: {
		fontSize: 14,
		fontWeight: "600",
		color: "#333",
		marginBottom: 8,
	},
	input: {
		borderWidth: 1,
		borderColor: "#ddd",
		borderRadius: 8,
		paddingHorizontal: 16,
		paddingVertical: 12,
		fontSize: 16,
		color: "#333",
		backgroundColor: "#f9f9f9",
	},
	button: {
		marginTop: 20,
		borderRadius: 50,
		paddingVertical: 14,
		alignItems: "center",
	},
	buttonDisabled: {
		opacity: 0.6,
	},
	buttonText: {
		color: "#fff",
		fontSize: 16,
		fontFamily: "Poppins_300Light",
		fontWeight: "600",
	},
	dividerContainer: {
		flexDirection: "row",
		alignItems: "center",
		marginVertical: 20,
	},
	divider: {
		flex: 1,
		height: 1,
		backgroundColor: "#ddd",
	},
	dividerText: {
		marginHorizontal: 12,
		color: "#999",
		fontFamily: "Poppins_300Light",
		fontSize: 16,
		fontWeight: "500",
	},
	googleButton: {
		backgroundColor: "#fff",
		borderWidth: 1,
		borderColor: "#ddd",
		borderRadius: 50,
		paddingVertical: 14,
		height: 52,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		marginBottom: 8,
	},
	googleButtonText: {
		marginLeft: 20,
		marginRight: 20,
		color: "#333",
		fontFamily: "Poppins_300Light",
		fontSize: 16,
	},
	switchButton: {
		marginTop: 16,
		alignItems: "center",
	},
	switchText: {
		color: "#222E3A",
		fontSize: 14,
		fontFamily: "Poppins_300Light",
	},
});
