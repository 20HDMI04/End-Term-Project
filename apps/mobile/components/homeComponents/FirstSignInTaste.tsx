import React, { useEffect, useMemo, useRef, useState } from "react";
import {
	StyleSheet,
	View,
	Text,
	Modal,
	TouchableOpacity,
	Dimensions,
	SafeAreaView,
	DeviceEventEmitter,
} from "react-native";
import PagerView from "react-native-pager-view";
import { useColorScheme } from "react-native";
import { Colors } from "@/constants/theme";
import LottieView from "lottie-react-native";
import ArrowRight from "@/assets/svgs/arrow-circle-right.svg";
import ProfileEditScreen from "./ProfileEditScreen";
import SearchBarForFirstTaste from "./SearchbarForFirstTaste";
import { useKeyboardVisible } from "@/hooks/use-keyboard-visible";
import { ToastProvider } from "@/contexts/ToastContext";
import SearchBarForFirstTasteBook from "./SearchBarForFirstTasteBook";
import { useApi } from "@/contexts/ApiContext";
import { StatusBar } from "expo-status-bar";

interface MultiPageOverlayProps {
	visible: boolean;
	onClose: () => void;
	isDarkMode: boolean;
}

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const MultiPageOverlay = ({
	visible,
	onClose,
	isDarkMode,
}: MultiPageOverlayProps) => {
	const [currentPage, setCurrentPage] = useState(0);
	const animationRef = useRef<LottieView>(null);
	const ref = useRef<PagerView>(null);
	const keyboardVisible = useKeyboardVisible();

	const goToNextPage = () => {
		if (ref.current) {
			ref.current.setPage(currentPage + 1);
		}
	};

	const theme = useMemo(
		() => ({
			background: isDarkMode ? Colors.dark.background : Colors.light.background,
			text: isDarkMode ? "#ffffff" : Colors.mainColorLight,
			secondaryText: isDarkMode ? "#ffffffee" : "#597127cc",
			activeDot: isDarkMode ? "#ffffff" : Colors.mainColorLight,
			inactiveDot: isDarkMode ? "#ffffff6c" : "#C4C4C4",
		}),
		[isDarkMode],
	);

	const lottieSource = useMemo(() => {
		try {
			return isDarkMode
				? require("@/assets/lottie/girlSearchingDark.json")
				: require("@/assets/lottie/searchingGirlLight.json");
		} catch (err) {
			return null;
		}
	}, [isDarkMode]);
	return (
		<Modal
			visible={visible}
			animationType="slide"
			transparent={true}
			onRequestClose={() => {}}
			statusBarTranslucent={false}
		>
			<ToastProvider>
				<SafeAreaView style={[styles.container]}>
					<PagerView
						style={styles.pagerView}
						initialPage={0}
						ref={ref}
						onPageSelected={(e) => setCurrentPage(e.nativeEvent.position)}
						keyboardDismissMode="on-drag"
						offscreenPageLimit={1}
					>
						<View
							key="1"
							style={[styles.page, { backgroundColor: theme.background }]}
						>
							<View style={styles.contentContainer}>
								<Text style={[styles.text, { color: theme.text, bottom: 30 }]}>
									Your Journey Starts Here.
								</Text>
								<View style={styles.lottieViewHolder}>
									{lottieSource && (
										<LottieView
											autoPlay
											loop
											style={styles.lottie}
											source={lottieSource}
											resizeMode="contain"
										/>
									)}
								</View>
								<Text
									style={[styles.textSmall, { color: theme.secondaryText }]}
								>
									Join thousands of users who are leveling up their lives.
								</Text>
							</View>

							<TouchableOpacity
								onPress={goToNextPage}
								style={[
									isDarkMode ? Colors.buttonDark : Colors.button,
									styles.button,
								]}
							>
								<View style={{ width: 26 }} />
								<Text
									style={[
										styles.textStyle,
										{ color: isDarkMode ? Colors.mainColorDark : "#ffffff" },
									]}
								>
									Next Step
								</Text>
								<ArrowRight
									style={{ width: 32, height: 32 }}
									fill={isDarkMode ? "#000000" : "#ffffff"}
								/>
							</TouchableOpacity>
						</View>
						<View
							key="2"
							style={[styles.page, { backgroundColor: theme.background }]}
						>
							<View style={[styles.contentContainer, { top: 50 }]}>
								<Text style={[styles.text, { color: theme.text }]}>
									Own your reader profile.
								</Text>
								<ProfileEditScreen isDarkMode={isDarkMode} />
							</View>
							{!keyboardVisible && (
								<TouchableOpacity
									onPress={goToNextPage}
									style={[
										isDarkMode ? Colors.buttonDark : Colors.button,
										styles.button,
									]}
								>
									<View style={{ width: 26 }} />
									<Text
										style={[
											styles.textStyle,
											{ color: isDarkMode ? Colors.mainColorDark : "#ffffff" },
										]}
									>
										Next Step
									</Text>
									<ArrowRight
										style={{ width: 32, height: 32 }}
										fill={isDarkMode ? "#000000" : "#ffffff"}
									/>
								</TouchableOpacity>
							)}
						</View>
						<View
							key="3"
							style={[styles.page, { backgroundColor: theme.background }]}
						>
							<View style={[styles.contentContainer, { top: 10 }]}>
								<Text style={[styles.text, { color: theme.text }]}>
									Stay close to your favorites
								</Text>
								<SearchBarForFirstTaste isDarkMode={isDarkMode} />
							</View>
							{!keyboardVisible && (
								<TouchableOpacity
									onPress={goToNextPage}
									style={[
										isDarkMode ? Colors.buttonDark : Colors.button,
										styles.button,
									]}
								>
									<View style={{ width: 26 }} />
									<Text
										style={[
											styles.textStyle,
											{ color: isDarkMode ? Colors.mainColorDark : "#ffffff" },
										]}
									>
										Next Step
									</Text>
									<ArrowRight
										style={{ width: 32, height: 32 }}
										fill={isDarkMode ? "#000000" : "#ffffff"}
									/>
								</TouchableOpacity>
							)}
						</View>
						<View
							key="4"
							style={[styles.page, { backgroundColor: theme.background }]}
						>
							<View style={[styles.contentContainer, { top: 10 }]}>
								<Text style={[styles.text, { color: theme.text }]}>
									Help us know you better.
								</Text>
								<SearchBarForFirstTasteBook isDarkMode={isDarkMode} />
							</View>
							{!keyboardVisible && (
								<TouchableOpacity
									onPress={() => {
										onClose();
									}}
									style={[
										isDarkMode ? Colors.buttonDark : Colors.button,
										styles.button,
									]}
								>
									<View style={{ width: 26 }} />
									<Text
										style={[
											styles.textStyle,
											{ color: isDarkMode ? Colors.mainColorDark : "#ffffff" },
										]}
									>
										Start Your Journey
									</Text>
									<ArrowRight
										style={{ width: 32, height: 32 }}
										fill={isDarkMode ? "#000000" : "#ffffff"}
									/>
								</TouchableOpacity>
							)}
						</View>
					</PagerView>

					<View style={styles.indicatorContainer}>
						{[0, 1, 2, 3].map((index) => (
							<View
								key={index}
								style={[
									styles.dot,
									{
										backgroundColor:
											currentPage === index
												? theme.activeDot
												: theme.inactiveDot,
									},
								]}
							/>
						))}
					</View>
				</SafeAreaView>
			</ToastProvider>
		</Modal>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	pagerView: {
		flex: 1,
	},
	page: {
		flex: 1,
		padding: 20,
		justifyContent: "space-between",
		alignItems: "center",
	},
	contentContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		width: "100%",
	},
	lottieViewHolder: {
		alignItems: "center",
		justifyContent: "center",
		width: 300,
		height: 300,
		overflow: "hidden",
		marginVertical: 20,
	},
	text: {
		fontSize: 42,
		width: "90%",
		textAlign: "left",
		fontFamily: "modern_no_20_regular",
		marginBottom: 10,
	},
	textSmall: {
		fontSize: 18,
		textAlign: "center",
		fontFamily: "modern_no_20_regular",
		paddingHorizontal: 10,
	},
	indicatorContainer: {
		flexDirection: "row",
		position: "absolute",
		top: 20,
		alignSelf: "center",
	},
	button: {
		width: "100%",
		height: 56,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 20,
		borderRadius: 30,
		marginBottom: 20,
	},
	lottie: {
		width: "100%",
		height: "100%",
	},
	dot: {
		width: 70,
		height: 4,
		borderRadius: 5,
		marginHorizontal: 4,
	},

	textSection2: {
		fontSize: 50,
		width: "95%",
		marginLeft: 5,
		textAlign: "left",
		fontFamily: "modern_no_20_regular",
		marginTop: 40,
	},

	textStyle: {
		fontSize: 16,
		fontFamily: "Poppins_300Light",
	},

	activeDot: {
		width: 70,
	},

	buttonText: {
		color: "white",
		fontWeight: "bold",
		fontSize: 16,
	},
});

export default MultiPageOverlay;
