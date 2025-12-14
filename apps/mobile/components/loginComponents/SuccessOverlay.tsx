import { JSX, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import LottieView from "lottie-react-native";

interface SuccessOverlayProps {
	visible: boolean;
	message: string | null;
	onFinish: () => void;
}

export default function SuccessOverlay({
	visible,
	message,
	onFinish,
}: SuccessOverlayProps): JSX.Element | null {
	useEffect(() => {
		if (visible) {
			const timer = setTimeout(() => {
				onFinish();
			}, 2500);
			return () => clearTimeout(timer);
		}
	}, [visible, onFinish]);

	if (!visible) return null;

	return (
		<View style={styles.overlay}>
			<LottieView
				source={require("@/assets/lottie/success.json")}
				autoPlay
				loop={false}
				style={styles.animation}
				onAnimationFinish={() => onFinish()}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	overlay: {
		position: "absolute",
		top: -200,
		left: 0,
		right: 0,
		bottom: 200,
		justifyContent: "center",
		alignItems: "center",
		zIndex: 999,
		pointerEvents: "none",
	},
	animation: {
		width: 300,
		height: 300,
	},
});
