import React, { useRef, useState } from "react";
import { StyleSheet, View, Text, Modal, TouchableOpacity } from "react-native";
import PagerView from "react-native-pager-view";
import { useColorScheme } from "react-native";
import { Colors } from "@/constants/theme";
import LottieView from "lottie-react-native";
import ArrowRight from "@/assets/svgs/arrow-circle-right.svg";

interface MultiPageOverlayProps {
	visible: boolean;
	onClose: () => void;
}

const MultiPageOverlay = ({ visible, onClose }: MultiPageOverlayProps) => {
	const [currentPage, setCurrentPage] = useState(0);
	const isDarkMode = useColorScheme() === "dark";
	const animationRef = useRef<LottieView>(null);
	const pagerRef = useRef<PagerView>(null);

	const backgroundColors = isDarkMode
		? Colors.dark.background
		: Colors.light.background;
	const textColors = isDarkMode ? "#ffffff" : Colors.mainColorLight;
	const secondaryTextColors = isDarkMode ? "#ffffffee" : "#597127cc";

	const activeDotColor = isDarkMode ? "#ffffff" : Colors.mainColorLight;
	const inactiveDotColor = isDarkMode ? "#ffffff6c" : "#C4C4C4";

	const getLottieSource = () => {
		try {
			let source = require("@/assets/lottie/searchingGirlLight.json");
			if (isDarkMode) {
				source = require("@/assets/lottie/girlSearchingDark.json");
			}
			return source;
		} catch (err) {
			console.error("Error loading Lottie file:", err);
			return;
		}
	};

	const lottieSource = getLottieSource();
	return (
		<Modal visible={visible} animationType="slide" transparent={true}>
			<View style={styles.container}>
				<PagerView
					style={styles.pagerView}
					initialPage={0}
					onPageSelected={(e) => setCurrentPage(e.nativeEvent.position)}
					ref={pagerRef}
				>
					<View
						key="1"
						style={[styles.page, { backgroundColor: backgroundColors }]}
					>
						<Text style={[styles.text, { color: textColors }]}>
							Your Journey Starts Here.
						</Text>
						<View style={styles.lottieViewHolder}>
							{lottieSource && (
								<LottieView
									autoPlay={true}
									ref={animationRef}
									loop={true}
									style={styles.lottie}
									source={lottieSource}
									onAnimationFailure={(error) => {
										console.error("Animation failed:", error);
									}}
									resizeMode="contain"
									speed={1.0}
								/>
							)}
						</View>
						<Text style={[styles.textSmall, { color: secondaryTextColors }]}>
							Join thousands of users who are leveling up their lives.
						</Text>
						<TouchableOpacity
							onPress={() => {
								pagerRef.current?.setPage(currentPage + 1);
							}}
							style={[
								isDarkMode ? Colors.buttonDark : Colors.button,
								styles.button,
								{
									flexDirection: "row",
									alignItems: "center",
									justifyContent: "space-between",
									paddingHorizontal: 10,
								},
							]}
						>
							<View style={{ width: 26 }} />
							<Text
								style={[
									styles.textStyle,
									{
										color: isDarkMode ? Colors.mainColorDark : "#ffffff",
									},
								]}
							>
								Next Step
							</Text>
							<ArrowRight
								style={{ width: 32, height: 32 }}
								fill={isDarkMode ? "#000000" : "#ffffff"}
							></ArrowRight>
						</TouchableOpacity>
					</View>
					<View
						key="2"
						style={[styles.page, { backgroundColor: backgroundColors }]}
					>
						<Text style={[styles.text, { color: textColors }]}>
							Own your reader profile.
						</Text>
					</View>
					<View
						key="3"
						style={[styles.page, { backgroundColor: backgroundColors }]}
					>
						<Text style={[styles.text, { color: textColors }]}>Done!</Text>
					</View>
					<View
						key="4"
						style={[styles.page, { backgroundColor: backgroundColors }]}
					>
						<Text style={[styles.text, { color: textColors }]}>Done!</Text>
						<TouchableOpacity onPress={onClose} style={styles.button}>
							<Text style={styles.buttonText}>Start</Text>
						</TouchableOpacity>
					</View>
				</PagerView>

				<View style={styles.indicatorContainer}>
					{[0, 1, 2, 3].map((index) => (
						<View
							key={index}
							style={[
								styles.dot,
								currentPage === index
									? [styles.activeDot, { backgroundColor: activeDotColor }]
									: { backgroundColor: inactiveDotColor },
							]}
						/>
					))}
				</View>
			</View>
		</Modal>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	lottieViewHolder: {
		alignItems: "center",
		justifyContent: "center",
		borderRadius: 90,
		width: 330,
		height: 330,
		overflow: "hidden",
		top: 16,
	},
	pagerView: {
		flex: 1,
	},
	page: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 20,
	},
	text: {
		fontSize: 56,
		width: "95%",
		marginLeft: 5,
		textAlign: "left",
		fontFamily: "Modern-No-20-Regular",
		bottom: 54,
	},
	textSmall: {
		fontSize: 20,
		marginLeft: 10,
		width: "94%",
		textAlign: "center",
		fontFamily: "Modern-No-20-Regular",
		top: 16,
	},
	indicatorContainer: {
		flexDirection: "row",
		position: "absolute",
		top: 20,
		alignSelf: "center",
	},
	textStyle: {
		fontSize: 16,
		fontFamily: "Poppins_300Light",
	},
	dot: {
		width: 70,
		height: 4,
		borderRadius: 5,
		marginHorizontal: 6,
	},
	activeDot: {
		width: 70,
	},
	button: {
		width: "94%",
		height: 50,
		marginBottom: 10,
		justifyContent: "center",
		alignItems: "center",
		borderRadius: 30,
		top: 88,
	},
	buttonText: {
		color: "white",
		fontWeight: "bold",
		fontSize: 16,
	},
	lottie: {
		width: 400,
		height: 400,
	},
});

export default MultiPageOverlay;
