import React, { useEffect } from "react";
import {
	View,
	StyleSheet,
	TouchableOpacity,
	Appearance,
	Text,
	InteractionManager,
} from "react-native";
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withTiming,
	interpolate,
	Easing,
} from "react-native-reanimated";
import { useColorScheme } from "@/hooks/use-color-scheme";
import ReadsyLightSvg from "@/assets/svgs/readsyWithoutTop.svg";
import ReadsyDarkSvg from "@/assets/svgs/readsyWithoutTopDark.svg";
import Moon from "@/assets/svgs/moon-stars.svg";
import Sun from "@/assets/svgs/sun-dim.svg";
import { Colors } from "@/constants/theme";
import { SafeAreaView } from "react-native-safe-area-context";
import { getFocusedRouteNameFromRoute } from "@react-navigation/native";

interface AppHeaderProps {
	options: any;
	route: any;
}

export function AppHeader({ options, route }: AppHeaderProps) {
	const [loading, setLoading] = React.useState(false);
	const isDarkMode = useColorScheme() === "dark";
	const iconBackgroundColor = isDarkMode ? Colors.thirdColorDark : "#ffffff";
	const transition = useSharedValue(isDarkMode ? 1 : 0);

	const handleThemeChange = () => {
		if (loading) return;
		transition.value = withTiming(isDarkMode ? 1 : 0, {
			duration: 1000,
			easing: Easing.bezier(0.4, 0, 0.2, 1),
		});
		setLoading(true);
		const nextScheme = isDarkMode ? "light" : "dark";
		setTimeout(() => {
			Appearance.setColorScheme(nextScheme);
			setLoading(false);
		}, 100);
	};

	const getTitle = () => {
		if (options.headerTitle && typeof options.headerTitle === "string")
			return options.headerTitle;
		if (options.title) return options.title;

		const focusedRoute = getFocusedRouteNameFromRoute(route);

		const tabNames: Record<string, string> = {
			index: "Readsy",
			explore: "Explore",
			search: "Search",
			collections: "Favorites",
			settings: "Profile",
		};

		return tabNames[focusedRoute || ""] || tabNames["index"];
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
			style={[
				{
					backgroundColor: isDarkMode
						? Colors.mainColorDark
						: Colors.secondaryColorLight,
					marginBottom: 0,
					paddingBottom: 0,
					height: 70,
				},
			]}
		>
			<View style={styles.content}>
				<View>
					<Text
						style={[
							styles.logotext,
							{ color: isDarkMode ? "#ffffff" : Colors.mainColorLight },
						]}
					>
						{getTitle()}
					</Text>
				</View>
				<TouchableOpacity
					activeOpacity={0.7}
					onPress={() => {
						handleThemeChange();
					}}
				>
					<Animated.View
						style={[
							styles.darkLightButton,
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
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	content: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 20,
		height: 60,
	},
	logotext: {
		fontSize: 60,
		fontFamily: "modern_no_20_regular",
		lineHeight: 60,
	},
	darkLightButton: {
		width: 50,
		height: 50,
		marginTop: 10,
		borderRadius: 25,
		justifyContent: "center",
		alignItems: "center",
	},
});
