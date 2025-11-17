import { useRef, useEffect, useState } from "react";
import { StyleSheet, View, useColorScheme, Text, Image } from "react-native";
import LottieView from "lottie-react-native";

interface AnimatedSplashScreenProps {
	onFinish?: () => void;
}

export default function AnimatedSplashScreen({
	onFinish,
}: AnimatedSplashScreenProps) {
	const animationRef = useRef<LottieView>(null);
	const colorScheme = useColorScheme();
	const isDark = colorScheme === "dark";
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		console.log("Splash screen mounted, colorScheme:", colorScheme);

		// Fallback: if animation doesn't finish in 5 seconds, call onFinish anyway
		const fallbackTimer = setTimeout(() => {
			console.log("Animation timeout, forcing transition");
			onFinish?.();
		}, 5000);

		try {
			// Start playing immediately
			animationRef.current?.play();
			console.log("Lottie animation play triggered");
		} catch (err) {
			console.error("Error playing animation:", err);
			onFinish?.();
		}

		return () => clearTimeout(fallbackTimer);
	}, [onFinish]);

	const getLottieSource = () => {
		try {
			const source = isDark
				? require("../assets/lottie/compressed_compressed-readsy-splash-dark.json")
				: require("../assets/lottie/compressed_readsy-splash.json");
			console.log(
				"Loaded Lottie source for",
				isDark ? "dark" : "light",
				"mode"
			);
			return source;
		} catch (err) {
			console.error("Error loading Lottie file:", err);
			setError("Failed to load animation");
			return;
		}
	};

	const lottieSource = getLottieSource();

	return (
		<View
			style={[
				styles.animationContainer,
				{ backgroundColor: isDark ? "#222E3A" : "#F7F4EB" },
			]}
		>
			{/* Fallback logo/text while animation loads or if it fails */}
			<View style={styles.fallbackContainer}>
				{isDark ? (
					<Image
						source={require("../assets/images/splash-icon-dark.png")}
						style={styles.tinyLogo}
					/>
				) : (
					<Image
						source={require("../assets/images/splash-icon-light.png")}
						style={styles.tinyLogo}
					/>
				)}
			</View>

			{error && <Text style={styles.errorText}>Animation Error: {error}</Text>}
			{lottieSource && (
				<LottieView
					autoPlay={true}
					ref={animationRef}
					onAnimationFinish={() => {
						console.log("Lottie animation finished");
						onFinish?.();
					}}
					loop={false}
					style={styles.lottie}
					source={lottieSource}
					onAnimationFailure={(error) => {
						console.error("Animation failed:", error);
						setError("Animation playback failed");
						onFinish?.();
					}}
					resizeMode="contain"
					speed={1.0}
				/>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	animationContainer: {
		alignItems: "center",
		justifyContent: "center",
		flex: 1,
	},
	fallbackContainer: {
		position: "absolute",
		alignItems: "center",
		justifyContent: "center",
	},
	appName: {
		fontSize: 48,
		fontWeight: "bold",
	},
	lottie: {
		width: "100%",
		height: "100%",
	},
	tinyLogo: {
		width: 100,
		height: 100,
	},
	errorText: {
		color: "red",
		fontSize: 14,
		padding: 20,
		textAlign: "center",
	},
});
