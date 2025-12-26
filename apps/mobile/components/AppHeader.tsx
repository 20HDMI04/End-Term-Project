import React, { useEffect } from "react";
import { View, StyleSheet, TouchableOpacity, Appearance } from "react-native";
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withTiming, // Időalapú animáció a spring helyett
	interpolate,
	Easing, // A mozgás görbéjéhez
} from "react-native-reanimated";
import { useColorScheme } from "@/hooks/use-color-scheme";
import ReadsyLightSvg from "@/assets/svgs/readsyWithoutTop.svg";
import ReadsyDarkSvg from "@/assets/svgs/readsyWithoutTopDark.svg";
import Moon from "@/assets/svgs/moon-stars.svg";
import Sun from "@/assets/svgs/sun-dim.svg";
import { Colors } from "@/constants/theme";
import { SafeAreaView } from "react-native-safe-area-context";

interface AppHeaderProps {}

export function AppHeader(props: AppHeaderProps) {
	const isDarkMode = useColorScheme() === "dark";
	const iconBackgroundColor = isDarkMode ? Colors.thirdColorDark : "#ffffff";

	const transition = useSharedValue(isDarkMode ? 1 : 0);

	useEffect(() => {
		transition.value = withTiming(isDarkMode ? 1 : 0, {
			duration: 1000,
			easing: Easing.bezier(0.4, 0, 0.2, 1),
		});
	}, [isDarkMode]);

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
				},
			]}
		>
			<View style={styles.content}>
				<View style={styles.logoWrapper}>
					{isDarkMode ? (
						<ReadsyDarkSvg height={45} width={153} />
					) : (
						<ReadsyLightSvg height={45} width={153} />
					)}
				</View>

				<TouchableOpacity
					activeOpacity={0.7}
					onPress={() => {
						Appearance.setColorScheme(isDarkMode ? "light" : "dark");
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
		height: 20,
	},
	logoWrapper: {
		marginTop: 52,
		justifyContent: "center",
	},
	darkLightButton: {
		marginTop: 32,
		width: 50,
		height: 50,
		borderRadius: 25,
		justifyContent: "center",
		alignItems: "center",
	},
});
