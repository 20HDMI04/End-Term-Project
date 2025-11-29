import AuthForm from "@/components/forms";
import React, { use, useEffect, useRef, useState } from "react";
import {
	Image,
	StyleSheet,
	KeyboardAvoidingView,
	Platform,
	View,
	useColorScheme,
	TouchableOpacity,
	Text,
	Pressable,
	Easing,
} from "react-native";
import LottieView from "lottie-react-native";
import { Colors } from "@/constants/theme";
import Animated, {
	SlideInDown,
	SlideOutDown,
	useAnimatedStyle,
	useSharedValue,
	withRepeat,
	withTiming,
} from "react-native-reanimated";

export default function AuthScreen() {
	const animationRef = useRef<LottieView>(null);
	const colorScheme = useColorScheme();
	const [error, setError] = React.useState<string | null>(null);
	const isDarkMode = colorScheme === "dark";
	const [isShown, setIsShown] = useState(false);
	const [isSignUp, setIsSignUp] = useState(false);
	const bounceY = useSharedValue(0);

	const startBounce = () => {
		setTimeout(() => {
			bounceY.value = withRepeat(withTiming(-15, { duration: 1000 }), -1, true);
		}, 6000);
	};

	const stopBounce = () => {
		bounceY.value = withTiming(0, {
			duration: 1000,
		});
	};

	const getLottieSource = () => {
		try {
			let source = require("../assets/lottie/EndTermAnimationLogin-Light.json");
			if (colorScheme == "dark") {
				source = require("../assets/lottie/EndTermAnimationLogin.json");
			}
			return source;
		} catch (err) {
			console.error("Error loading Lottie file:", err);
			setError("Failed to load animation");
			return;
		}
	};

	useEffect(() => {
		if (!isShown) setIsSignUp(false);
	}, [isShown]);

	useEffect(() => {
		stopBounce();
		setTimeout(() => {
			startBounce();
		}, 1000);
	}, [setIsSignUp]);

	const getImageSource = () => {
		try {
			let source = require("../assets/images/LogoWithAndroid.png");
			if (colorScheme == "dark") {
				source = require("../assets/images/LogoWithAndroidDark.png");
			}
			return source;
		} catch (err) {
			console.error("Error loading image file:", err);
			setError("Failed to load image");
			return;
		}
	};

	const lottieSource = getLottieSource();

	const bounceStyle = useAnimatedStyle(() => {
		return {
			transform: [{ translateY: bounceY.value }],
		};
	});

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === "ios" ? "padding" : "height"}
			style={[
				styles.keyboardView,
				{
					backgroundColor: isDarkMode
						? Colors.mainColorDark
						: Colors.secondaryColorLight,
				},
			]}
		>
			<View style={styles.content}>
				<View style={styles.content}>
					<View style={styles.header}>
						<Image source={getImageSource()} style={styles.logo} />
						{lottieSource && (
							<LottieView
								autoPlay={true}
								ref={animationRef}
								loop={true}
								style={styles.lottie}
								source={lottieSource}
								onAnimationFailure={(error) => {
									console.error("Animation failed:", error);
									setError("Animation playback failed");
								}}
								resizeMode="contain"
								speed={1.0}
							/>
						)}
						<TouchableOpacity
							style={[
								isDarkMode ? Colors.buttonDark : Colors.button,
								styles.button,
							]}
							onPress={() => {
								setIsSignUp(true);
								setIsShown(true);
								startBounce();
							}}
						>
							<Text
								style={[
									styles.textStyle,
									{
										color: isDarkMode
											? Colors.mainColorDark
											: Colors.secondaryColorLight,
									},
								]}
							>
								Create Account
							</Text>
						</TouchableOpacity>
						<TouchableOpacity
							onPress={() => {
								startBounce();
								setIsShown(true);
							}}
							style={[
								isDarkMode ? Colors.inverseButtonDark : Colors.inverseButton,
								styles.button,
							]}
						>
							<Text
								style={[
									styles.textStyle,
									{
										color: isDarkMode
											? Colors.secondaryColorDark
											: Colors.mainColorLight,
									},
								]}
							>
								Sign In
							</Text>
						</TouchableOpacity>
					</View>
				</View>
			</View>
			{isShown && (
				<Animated.View style={styles.overlay} pointerEvents="box-none">
					<View style={styles.overlayContent}>
						{/* formWrapper constrains width and centers the form */}
						<Pressable
							style={styles.pressable}
							onPress={() => {
								setIsShown(false);
							}}
						/>
						<Animated.View
							style={[styles.formWrapper, bounceStyle]}
							entering={SlideInDown.springify().damping(85).delay(100)}
							exiting={SlideOutDown}
						>
							<AuthForm isSignUp={isSignUp} stopBounce={stopBounce} />
						</Animated.View>
					</View>
				</Animated.View>
			)}
		</KeyboardAvoidingView>
	);
}

const styles = StyleSheet.create({
	keyboardView: {
		flex: 1,
		zIndex: 2,
	},
	content: {
		justifyContent: "center",
	},
	header: {
		alignItems: "center",
	},
	logo: {
		width: 380,
		marginTop: -50,
		resizeMode: "contain",
	},
	lottie: {
		width: 400,
		height: 350,
		marginTop: -140,
	},
	button: {
		width: "84%",
		height: 54,
		marginBottom: 10,
		justifyContent: "center",
		alignItems: "center",
		borderRadius: 30,
	},
	textStyle: {
		fontSize: 18,
		fontFamily: "Poppins_300Light",
	},
	overlay: {
		position: "absolute",
		left: 0,
		right: 0,
		bottom: -70,
		width: "100%",
		height: "113%",
		justifyContent: "center",
		alignItems: "stretch",
		zIndex: 1000,
		elevation: 1000,
	},
	overlayContent: {
		width: "100%",
		height: "100%",
		paddingHorizontal: 0,
		justifyContent: "flex-end",
		alignItems: "stretch",
		zIndex: 1001,
		elevation: 1001,
	},
	// wrapper constrains the form width; adjust maxWidth to taste
	formWrapper: {
		width: "100%",
		height: "65%",
		alignSelf: "stretch",
		justifyContent: "flex-end",
	},
	pressable: {
		height: "35%",
		backgroundColor: "transparent",
	},
});
