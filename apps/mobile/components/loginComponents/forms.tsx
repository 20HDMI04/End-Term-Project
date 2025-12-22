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
	Pressable,
} from "react-native";
import { useRouter } from "expo-router";
import { API_URL } from "@/config/api.config";
import Animated, { SlideInDown } from "react-native-reanimated";
import * as WebBrowser from "expo-web-browser";
import CustomEmailInput from "./emailInput";
import CustomPasswordInput from "./passwordInput";
import AuthModal from "./AuthModal";
import SuccessOverlay from "./SuccessOverlay";
import GoogleIcon from "@/assets/svgs/googleIcon.svg";
import { Colors } from "@/constants/theme";
import { formsStyles as styles } from "./styles/formsStyles";
import { googleSignInAndSuperTokensAuth } from "@/hooks/useGoogleOneTapAuth";
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
	const [isSuccess, setIsSuccess] = useState(false);

	const colorScheme = useColorScheme();
	const isDarkMode = colorScheme === "dark";

	const handleGoogleSignIn = async () => {
		setLoading(true);
		const data = await googleSignInAndSuperTokensAuth();
		console.log("Google sign-in data:", data);
		if (data.errors !== null) {
			setModalMessage(data.errors);
			setIsSuccess(false);
			setModalVisible(true);
		}
		setIsSuccess(true);
		setModalVisible(true);
		setTimeout(() => {
			setModalVisible(false);
			router.replace("/(tabs)");
		}, 2500);
		setLoading(false);
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
					setModalMessage("Account created successfully!");
				} else {
					setModalMessage("Login successful!");
				}
				setIsSuccess(true);
				setModalVisible(true);
				setTimeout(() => {
					setModalVisible(false);
					router.replace("/(tabs)");
				}, 2500);
			} else if (data.status === "WRONG_CREDENTIALS_ERROR") {
				setModalMessage("Invalid email or password");
				setModalVisible(true);
			} else if (data.status === "FIELD_ERROR") {
				const error: string = data.formFields[0].error;
				setModalMessage(
					error.includes("Email") ? "Invalid email or password" : error
				);
				setModalVisible(true);
			} else {
				setModalMessage("Something went wrong");
				setModalVisible(true);
			}
		} catch (error: any) {
			console.error("Auth error:", error);
			setModalMessage(error?.message || "Network error");
			setIsSuccess(false);
			setModalVisible(true);
		} finally {
			setLoading(false);
		}
	};
	return (
		<>
			{isSuccess && (
				<SuccessOverlay
					visible={modalVisible}
					message={modalMessage}
					onFinish={() => {
						setModalVisible(false);
						setIsSuccess(false);
						router.replace("/(tabs)");
					}}
				/>
			)}

			<AuthModal
				visible={modalVisible && !isSuccess}
				loading={loading}
				message={modalMessage}
				onClose={() => {
					setModalVisible(false);
					setIsSuccess(false);
				}}
			/>

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
