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
} from "react-native";
import { useRouter } from "expo-router";
import { API_URL } from "@/config/api.config";
import Animated, { SlideInDown } from "react-native-reanimated";
import * as WebBrowser from "expo-web-browser";
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
	const colorScheme = useColorScheme();

	const handleGoogleSignIn = async () => {
		Alert.alert("Coming Soon", "Google Sign-In will be available soon!");
	};

	const handleAuth = async () => {
		if (!email || !password) {
			Alert.alert("Error", "Please fill in all fields");
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

			// Check if response is OK
			if (!response.ok) {
				const text = await response.text();
				console.error("Server error:", text);
				Alert.alert("Error", `Server error: ${response.status}`);
				return;
			}

			// Get response as text first to debug
			const responseText = await response.text();
			console.log("Response:", responseText);

			// Try to parse JSON
			let data;
			try {
				data = JSON.parse(responseText);
			} catch (parseError) {
				console.error("JSON parse error. Response was:", responseText);
				Alert.alert(
					"Error",
					"Invalid response from server. Please check your backend URL."
				);
				return;
			}

			if (data.status === "OK") {
				if (isSignUp) {
					Alert.alert("Success", "Account created successfully!");
				}
				router.replace("/(tabs)");
			} else if (data.status === "WRONG_CREDENTIALS_ERROR") {
				Alert.alert("Error", "Invalid email or password");
			} else if (data.status === "FIELD_ERROR") {
				Alert.alert("Error", data.formFields[0].error);
			} else {
				Alert.alert("Error", "Something went wrong");
			}
		} catch (error: any) {
			console.error("Auth error:", error);
			Alert.alert("Error", error.message || "Network error");
		} finally {
			setLoading(false);
		}
	};
	return (
		<Animated.View style={styles.form}>
			<View style={styles.inputContainer}>
				<Text style={styles.label}>Email</Text>
				<TextInput
					style={styles.input}
					placeholder="Enter your email"
					placeholderTextColor="#999"
					value={email}
					onChangeText={setEmail}
					autoCapitalize="none"
					keyboardType="email-address"
					editable={!loading}
					onTouchStart={() => {
						stopBounce();
					}}
				/>
			</View>

			<View style={styles.inputContainer}>
				<Text style={styles.label}>Password</Text>
				<TextInput
					style={styles.input}
					placeholder="Enter your password"
					placeholderTextColor="#999"
					value={password}
					onChangeText={setPassword}
					secureTextEntry
					editable={!loading}
					onTouchStart={() => {
						stopBounce();
					}}
				/>
			</View>

			<TouchableOpacity
				style={[styles.button, loading && styles.buttonDisabled]}
				onPress={() => {
					handleAuth();
					stopBounce();
				}}
				disabled={loading}
			>
				{loading ? (
					<ActivityIndicator color="#fff" />
				) : (
					<Text style={styles.buttonText}>
						{isSignUp ? "Sign Up" : "Sign In"}
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
				<Text style={styles.googleIcon}>G</Text>
				<Text style={styles.googleButtonText}>Continue with Google</Text>
			</TouchableOpacity>

			<TouchableOpacity
				style={styles.switchButton}
				onPress={() => setIsSignUp(!isSignUp)}
				disabled={loading}
			>
				<Text style={styles.switchText}>
					{isSignUp
						? "Already have an account? Sign In"
						: "Don't have an account? Sign Up"}
				</Text>
			</TouchableOpacity>
		</Animated.View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#F7F4EB",
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
		// full-bleed sheet appearance: no rounding or shadow
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
		backgroundColor: "#597127",
		borderRadius: 8,
		paddingVertical: 14,
		alignItems: "center",
		marginTop: 8,
	},
	buttonDisabled: {
		opacity: 0.6,
	},
	buttonText: {
		color: "#fff",
		fontSize: 16,
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
		fontSize: 14,
		fontWeight: "500",
	},
	googleButton: {
		backgroundColor: "#fff",
		borderWidth: 1,
		borderColor: "#ddd",
		borderRadius: 8,
		paddingVertical: 14,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		marginBottom: 8,
	},
	googleIcon: {
		fontSize: 20,
		fontWeight: "bold",
		marginRight: 8,
		color: "#4285F4",
	},
	googleButtonText: {
		color: "#333",
		fontSize: 16,
		fontWeight: "600",
	},
	switchButton: {
		marginTop: 16,
		alignItems: "center",
	},
	switchText: {
		color: "#667eea",
		fontSize: 14,
		fontWeight: "500",
	},
});
