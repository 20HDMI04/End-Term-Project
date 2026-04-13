import React, { useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, View, Text, Modal, TouchableOpacity } from "react-native";
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
				<View style={[styles.container]}>
					<PagerView
						style={styles.pagerView}
						initialPage={0}
						ref={ref}
						onPageSelected={(e) => {
							setCurrentPage(e.nativeEvent.position);
						}}
						keyboardDismissMode="none"
						scrollEnabled={true}
						offscreenPageLimit={3}
					>
						<View
							key="1"
							style={[styles.page, { backgroundColor: theme.background }]}
						>
							<Text style={[styles.text, { color: theme.text }]}>
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
							<Text style={[styles.textSmall, { color: theme.secondaryText }]}>
								Join thousands of users who are leveling up their lives.
							</Text>
							<TouchableOpacity
								onPress={goToNextPage}
								style={[
									isDarkMode ? Colors.buttonDark : Colors.button,
									styles.button,
									{
										flexDirection: "row",
										alignItems: "center",
										justifyContent: "space-between",
										paddingHorizontal: 10,
										top: 88,
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
							style={[styles.page, { backgroundColor: theme.background }]}
						>
							<Text style={[styles.textSection2, { color: theme.text }]}>
								Own your reader profile.
							</Text>
							<ProfileEditScreen isDarkMode={isDarkMode} />
							{!keyboardVisible && (
								<TouchableOpacity
									onPress={goToNextPage}
									style={[
										isDarkMode ? Colors.buttonDark : Colors.button,
										styles.button,
										{
											flexDirection: "row",
											alignItems: "center",
											justifyContent: "space-between",
											paddingHorizontal: 10,
											bottom: 2,
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
							)}
						</View>
						<View
							key="3"
							style={[styles.page, { backgroundColor: theme.background }]}
						>
							<Text
								style={[
									styles.text,
									{
										color: theme.text,
										bottom: 0,
										paddingBottom: 20,
										marginTop: 40,
									},
								]}
							>
								Stay close to your favorites
							</Text>
							<SearchBarForFirstTaste isDarkMode={isDarkMode} />
							{!keyboardVisible && (
								<TouchableOpacity
									onPress={goToNextPage}
									style={[
										isDarkMode ? Colors.buttonDark : Colors.button,
										styles.button,
										{
											flexDirection: "row",
											alignItems: "center",
											justifyContent: "space-between",
											paddingHorizontal: 10,
											bottom: 2,
											transitionDuration: "300ms",
											transitionProperty: "top, opacity",
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
							)}
						</View>
						<View
							key="4"
							style={[styles.page, { backgroundColor: theme.background }]}
						>
							<Text
								style={[
									styles.text,
									{
										color: theme.text,
										bottom: 0,
										paddingBottom: 20,
										marginTop: 40,
									},
								]}
							>
								Help us know you better.
							</Text>
							<SearchBarForFirstTasteBook isDarkMode={isDarkMode} />
							{!keyboardVisible && (
								<TouchableOpacity
									onPress={onClose}
									style={[
										isDarkMode ? Colors.buttonDark : Colors.button,
										styles.button,
										{
											flexDirection: "row",
											alignItems: "center",
											justifyContent: "space-between",
											paddingHorizontal: 10,
											bottom: 2,
											transitionDuration: "300ms",
											transitionProperty: "top, opacity",
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
										Start Your Journey
									</Text>
									<ArrowRight
										style={{ width: 32, height: 32 }}
										fill={isDarkMode ? "#000000" : "#ffffff"}
									></ArrowRight>
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
									currentPage === index
										? [styles.activeDot, { backgroundColor: theme.activeDot }]
										: { backgroundColor: theme.inactiveDot },
								]}
							/>
						))}
					</View>
				</View>
			</ToastProvider>
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
		fontFamily: "modern_no_20_regular",
		bottom: 54,
	},
	textSection2: {
		fontSize: 56,
		width: "95%",
		marginLeft: 5,
		textAlign: "left",
		fontFamily: "modern_no_20_regular",
		marginTop: 40,
	},
	textSmall: {
		fontSize: 20,
		marginLeft: 10,
		width: "94%",
		textAlign: "center",
		fontFamily: "modern_no_20_regular",
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
