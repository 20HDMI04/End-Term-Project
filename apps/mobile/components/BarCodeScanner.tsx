import React, { useState, useEffect } from "react";
import {
	StyleSheet,
	Text,
	View,
	TouchableOpacity,
	useColorScheme,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import Animated, {
	useAnimatedStyle,
	withRepeat,
	withTiming,
	withSequence,
} from "react-native-reanimated";
import { Colors } from "@/constants/theme";

export default function BarcodeScanner({ onScan, onClose }: any) {
	const isDarkMode = useColorScheme() === "dark";
	const [permission, requestPermission] = useCameraPermissions();
	const [scanned, setScanned] = useState(false);

	const mainColor = isDarkMode ? Colors.mainColorDark : Colors.mainColorLight;
	const buttonColor = isDarkMode ? Colors.mainColorDark : "#ffffff";
	const buttonTextColor = isDarkMode ? "#ffffff" : Colors.mainColorLight;

	useEffect(() => {
		if (permission && !permission.granted && permission.canAskAgain) {
			requestPermission();
		}
	}, [permission]);

	if (!permission)
		return <View style={{ flex: 1, backgroundColor: "black" }} />;

	if (!permission.granted) {
		return (
			<View
				style={[
					styles.container,
					{ backgroundColor: isDarkMode ? "#000" : "#f5f5f5" },
				]}
			>
				<Text
					style={[styles.infoText, { color: isDarkMode ? "white" : "black" }]}
				>
					Camera access is required to scan barcodes. Please grant permission.
				</Text>
				<TouchableOpacity
					onPress={requestPermission}
					style={[styles.mainButton, { backgroundColor: mainColor }]}
				>
					<Text style={styles.mainButtonText}>Grant Permission</Text>
				</TouchableOpacity>
			</View>
		);
	}

	return (
		<View style={{ flex: 1, backgroundColor: "black" }}>
			<CameraView
				style={StyleSheet.absoluteFill}
				facing="back"
				onBarcodeScanned={
					scanned
						? undefined
						: (result) => {
								setScanned(true);
								onScan(result.data);
							}
				}
			>
				<View style={[StyleSheet.absoluteFill, styles.overlay]}>
					<View style={styles.unfocused} />

					<View style={styles.middleRow}>
						<View style={styles.unfocused} />

						<View style={styles.focused}>
							<ScanningLine color={mainColor} />

							<View
								style={[styles.corner, styles.tl, { borderColor: mainColor }]}
							/>
							<View
								style={[styles.corner, styles.tr, { borderColor: mainColor }]}
							/>
							<View
								style={[styles.corner, styles.bl, { borderColor: mainColor }]}
							/>
							<View
								style={[styles.corner, styles.br, { borderColor: mainColor }]}
							/>
						</View>

						<View style={styles.unfocused} />
					</View>

					<View style={styles.bottomSection}>
						<Text style={styles.instructionText}>
							Put the barcode inside the box to scan
						</Text>
						<TouchableOpacity
							onPress={onClose}
							style={[styles.closeButton, { backgroundColor: buttonColor }]}
						>
							<Text
								style={[styles.closeButtonText, { color: buttonTextColor }]}
							>
								Cancel
							</Text>
						</TouchableOpacity>
					</View>
				</View>
			</CameraView>
		</View>
	);
}

const ScanningLine = ({ color }: { color: string }) => {
	const animatedStyle = useAnimatedStyle(() => ({
		transform: [
			{
				translateY: withRepeat(
					withSequence(
						withTiming(0, { duration: 0 }),
						withTiming(220, { duration: 2500 }),
					),
					-1,
					false,
				),
			},
		],
		opacity: withRepeat(
			withSequence(withTiming(0.8), withTiming(0.2)),
			-1,
			true,
		),
	}));
	return (
		<Animated.View
			style={[
				styles.line,
				{ backgroundColor: color, shadowColor: color },
				animatedStyle,
			]}
		/>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	overlay: { backgroundColor: "transparent" },
	unfocused: {
		flex: 1,
		backgroundColor: "rgba(0, 0, 0, 0.7)",
	},
	middleRow: { flexDirection: "row", height: 220 },
	focused: {
		width: 220,
		height: 220,
		position: "relative",
		backgroundColor: "transparent",
	},
	line: {
		height: 3,
		width: "100%",
		shadowOffset: { width: 0, height: 0 },
		shadowOpacity: 0.8,
		shadowRadius: 10,
		elevation: 5,
	},
	bottomSection: {
		flex: 1,
		backgroundColor: "rgba(0, 0, 0, 0.7)",
		alignItems: "center",
		paddingTop: 20,
	},
	instructionText: {
		color: "white",
		fontFamily: "Modern-No-20-Regular",
		fontSize: 16,
		marginBottom: 30,
		opacity: 0.8,
	},
	mainButton: {
		paddingVertical: 12,
		paddingHorizontal: 30,
		borderRadius: 25,
	},
	mainButtonText: {
		color: "white",
		fontFamily: "Modern-No-20-Regular",
		fontSize: 16,
	},
	closeButton: {
		width: 120,
		height: 40,
		justifyContent: "center",
		alignItems: "center",
		borderRadius: 20,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		elevation: 5,
	},
	closeButtonText: {
		fontSize: 14,
		fontFamily: "Modern-No-20-Regular",
		fontWeight: "600",
	},
	infoText: {
		fontFamily: "Modern-No-20-Regular",
		fontSize: 18,
		marginBottom: 20,
	},
	corner: {
		position: "absolute",
		width: 30,
		height: 30,
		borderWidth: 3,
		borderRadius: 5,
	},
	tl: { top: -2, left: -2, borderRightWidth: 0, borderBottomWidth: 0 },
	tr: { top: -2, right: -2, borderLeftWidth: 0, borderBottomWidth: 0 },
	bl: { bottom: -2, left: -2, borderRightWidth: 0, borderTopWidth: 0 },
	br: { bottom: -2, right: -2, borderLeftWidth: 0, borderTopWidth: 0 },
});
