import { JSX, useState, useEffect } from "react";
import {
	View,
	Text,
	TouchableOpacity,
	ActivityIndicator,
	useColorScheme,
} from "react-native";
import { useRouter } from "expo-router";
import Animated from "react-native-reanimated";
import * as WebBrowser from "expo-web-browser";

// Saját komponensek és konstansok
import CustomEmailInput from "./emailInput";
import CustomPasswordInput from "./passwordInput";
import AuthModal from "./AuthModal";
import SuccessOverlay from "./SuccessOverlay";
import GoogleIcon from "@/assets/svgs/googleIcon.svg";
import { Colors } from "@/constants/theme";
import { formsStyles as styles } from "./styles/formsStyles";
import { useAuth } from "@/contexts/AuthContext";

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
	const { onLogin, onRegister, onLoginWithThirdParty, finalizeLogin } =
		useAuth();

	const [isSignUp, setIsSignUp] = useState(isSignUpProp);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [modalVisible, setModalVisible] = useState(false);
	const [modalMessage, setModalMessage] = useState<string | null>(null);
	const [isSuccess, setIsSuccess] = useState(false);

	const colorScheme = useColorScheme();
	const isDarkMode = colorScheme === "dark";

	useEffect(() => {
		setIsSignUp(isSignUpProp);
	}, [isSignUpProp]);

	const handleGoogleSignIn = async () => {
		setLoading(true);
		const result = await onLoginWithThirdParty();

		if (result.error) {
			setModalMessage(result.msg);
			setIsSuccess(false);
			setModalVisible(true);
		} else {
			setModalMessage("Google Sign-In successful!");
			setIsSuccess(true);
			setModalVisible(true);
		}
		setLoading(false);
	};

	const handleAuth = async () => {
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

		const result = await (isSignUp
			? onRegister(email, password)
			: onLogin(email, password));

		if (!result.error) {
			setModalMessage(
				isSignUp ? "Account created successfully!" : "Login successful!"
			);
			setIsSuccess(true);
			setModalVisible(true);
		} else {
			setModalMessage(result.msg);
			setIsSuccess(false);
			setModalVisible(true);
		}

		setLoading(false);
	};

	return (
		<>
			{isSuccess && (
				<SuccessOverlay
					visible={modalVisible && isSuccess}
					message={modalMessage}
					onFinish={async () => {
						setModalVisible(false);
						setIsSuccess(false);

						await finalizeLogin();
					}}
				/>
			)}

			<AuthModal
				visible={modalVisible && !isSuccess}
				loading={loading}
				message={modalMessage}
				onClose={() => {
					setModalVisible(false);
				}}
			/>

			<Animated.View style={styles.form}>
				<Text
					style={[
						styles.headText,
						{
							color: isDarkMode ? Colors.mainColorDark : Colors.mainColorLight,
						},
					]}
				>
					{isSignUp ? "Sign up" : "Login"}
				</Text>

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
					stopBounce={stopBounce}
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
					stopBounce={stopBounce}
				/>

				{isSignUp && (
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
						stopBounce={stopBounce}
						isDarkMode={isDarkMode}
					/>
				)}

				<TouchableOpacity
					style={[
						styles.button,
						(loading || !email || !password) && styles.buttonDisabled,
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
					disabled={loading}
				>
					{loading ? (
						<ActivityIndicator color="#ffffff" />
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
						{isSignUp ? "Already have an account? " : "Don't have an account? "}
						<Text style={{ fontWeight: "bold" }}>
							{isSignUp ? "Log In" : "Sign Up"}
						</Text>
					</Text>
				</TouchableOpacity>
			</Animated.View>
		</>
	);
}
