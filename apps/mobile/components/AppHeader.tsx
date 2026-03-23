import React, { useEffect } from "react";
import {
	View,
	StyleSheet,
	TouchableOpacity,
	Appearance,
	Text,
} from "react-native";
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withTiming,
	interpolate,
	Easing,
} from "react-native-reanimated";
import { useColorScheme } from "@/hooks/use-color-scheme";
import Moon from "@/assets/svgs/moon-stars.svg";
import Sun from "@/assets/svgs/sun-dim.svg";
import { Colors } from "@/constants/theme";
import { SafeAreaView } from "react-native-safe-area-context";
import { getFocusedRouteNameFromRoute } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons"; // Vonalkód ikonhoz

interface AppHeaderProps {
	options: any;
	route: any;
}

export function AppHeader({ options, route }: AppHeaderProps) {
	const [loading, setLoading] = React.useState(false);
	const isDarkMode = useColorScheme() === "dark";
	const iconBackgroundColor = isDarkMode ? Colors.thirdColorDark : "#ffffff";
	const transition = useSharedValue(isDarkMode ? 1 : 0);

	// Aktuális route lekérése
	const focusedRoute = getFocusedRouteNameFromRoute(route) || "index";

	// Ellenőrizzük, hogy az Explore vagy Search oldalon vagyunk-e
	const showBarcode = focusedRoute === "explore" || focusedRoute === "search";

	const handleThemeChange = () => {
		if (loading) return;
		transition.value = withTiming(isDarkMode ? 0 : 1, {
			// Fixált irány
			duration: 500,
			easing: Easing.bezier(0.4, 0, 0.2, 1),
		});
		setLoading(true);
		const nextScheme = isDarkMode ? "light" : "dark";
		setTimeout(() => {
			Appearance.setColorScheme(nextScheme);
			setLoading(false);
		}, 100);
	};

	const handleBarcodePress = () => {
		console.log("Barcode scanner megnyitása...");
		// Ide jön majd a navigáció a kamera/scanner oldalra:
		// router.push("/scanner");
	};

	const getTitle = () => {
		if (options.headerTitle && typeof options.headerTitle === "string")
			return options.headerTitle;
		if (options.title) return options.title;

		const tabNames: Record<string, string> = {
			index: "Readsy",
			explore: "Explore",
			search: "Search",
			collections: "Favorites",
			settings: "Profile",
		};

		return tabNames[focusedRoute] || tabNames["index"];
	};

	const animatedButtonStyle = useAnimatedStyle(() => {
		const rotation = interpolate(transition.value, [0, 1], [0, 360]);
		const scale = interpolate(transition.value, [0, 0.5, 1], [1, 1.25, 1]);
		return {
			transform: [{ rotate: `${rotation}deg` }, { scale: scale }],
		};
	});

	return (
		<SafeAreaView
			edges={["top"]}
			style={{
				backgroundColor: isDarkMode
					? Colors.mainColorDark
					: Colors.secondaryColorLight,
				height: 80,
			}}
		>
			<View style={styles.content}>
				{/* Bal oldal: Cím */}
				<View style={styles.leftContainer}>
					<Text
						style={[
							styles.logotext,
							{ color: isDarkMode ? "#ffffff" : Colors.mainColorLight },
						]}
					>
						{getTitle()}
					</Text>
				</View>

				{/* Jobb oldal: Ikonok egy sorban */}
				<View style={styles.rightIconsContainer}>
					{showBarcode && (
						<TouchableOpacity
							style={[
								styles.iconButton,
								{ backgroundColor: iconBackgroundColor, marginRight: 10 },
							]}
							onPress={handleBarcodePress}
							activeOpacity={0.7}
						>
							<MaterialCommunityIcons
								name="barcode-scan"
								size={24}
								color={isDarkMode ? "#ffffff" : Colors.mainColorLight}
							/>
						</TouchableOpacity>
					)}

					<TouchableOpacity activeOpacity={0.7} onPress={handleThemeChange}>
						<Animated.View
							style={[
								styles.iconButton,
								{ backgroundColor: iconBackgroundColor },
								animatedButtonStyle,
							]}
						>
							{isDarkMode ? (
								<Moon width={24} height={24} fill={"#ffffff"} />
							) : (
								<Sun width={24} height={24} fill={Colors.mainColorLight} />
							)}
						</Animated.View>
					</TouchableOpacity>
				</View>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	content: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 20,
		height: 80,
	},
	leftContainer: {
		flex: 1,
	},
	rightIconsContainer: {
		flexDirection: "row",
		alignItems: "center",
	},
	logotext: {
		fontSize: 50,
		fontFamily: "modern_no_20_regular",
		lineHeight: 55,
	},
	iconButton: {
		width: 45,
		height: 45,
		borderRadius: 22.5,
		justifyContent: "center",
		alignItems: "center",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 2,
		elevation: 2,
	},
});
