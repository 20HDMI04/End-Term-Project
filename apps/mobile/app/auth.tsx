import { useState } from "react";
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
	Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";

// Warm up the browser for better OAuth performance
WebBrowser.maybeCompleteAuthSession();

export default function AuthScreen() {
	const router = useRouter();
	const [isSignUp, setIsSignUp] = useState(false);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);

	const handleAuth = async () => {
		if (!email || !password) {
			Alert.alert("Error", "Please fill in all fields");
			return;
		}

		setLoading(true);
		try {
			const endpoint = isSignUp ? "/signup" : "/signin";
			const response = await fetch(
				`https://chloroplastic-crumbly-dominic.ngrok-free.dev/auth${endpoint}`,
				{
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
				}
			);

			const data = await response.json();

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
			Alert.alert("Error", error.message || "Network error");
		} finally {
			setLoading(false);
		}
	};

	const handleGoogleSignIn = async () => {
		Alert.alert("Coming Soon", "Google Sign-In will be available soon!");
	};

	return (
		<SafeAreaView style={styles.container}>
			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : "height"}
				style={styles.keyboardView}
			>
				<View style={styles.content}>
					<View style={styles.header}>
						<Text style={styles.logo}>📚</Text>
						<Text style={styles.title}>Readsy</Text>
						<Text style={styles.subtitle}>
							{isSignUp ? "Create your account" : "Welcome back!"}
						</Text>
					</View>

					<View style={styles.form}>
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
							/>
						</View>

						<TouchableOpacity
							style={[styles.button, loading && styles.buttonDisabled]}
							onPress={handleAuth}
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
							onPress={handleGoogleSignIn}
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
					</View>
				</View>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#667eea",
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
		marginBottom: 48,
	},
	logo: {
		fontSize: 64,
		marginBottom: 16,
	},
	title: {
		fontSize: 32,
		fontWeight: "bold",
		color: "#fff",
		marginBottom: 8,
	},
	subtitle: {
		fontSize: 16,
		color: "#fff",
		opacity: 0.9,
	},
	form: {
		backgroundColor: "#fff",
		borderRadius: 16,
		padding: 24,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.1,
		shadowRadius: 8,
		elevation: 5,
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
		backgroundColor: "#667eea",
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
