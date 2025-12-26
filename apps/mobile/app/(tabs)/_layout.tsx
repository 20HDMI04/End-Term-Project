import { Tabs, useSegments } from "expo-router";
import React, { useEffect, memo } from "react";
import {
	View,
	Text,
	StyleSheet,
	useWindowDimensions,
	Platform,
} from "react-native";
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withSpring,
} from "react-native-reanimated";

import { HapticTab } from "@/components/haptic-tab";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";

import BookMarks from "@/assets/svgs/bookmarks-simple-light.svg";
import Compass from "@/assets/svgs/compass-light.svg";
import House from "@/assets/svgs/house-light.svg";
import MagnifyGlass from "@/assets/svgs/magnifying-glass-light.svg";
import User from "@/assets/svgs/user-light.svg";

const ROUTE_INDEX_MAP: Record<string, number> = {
	"(tabs)": 0,
	index: 0,
	explore: 1,
	search: 2,
	collections: 3,
	settings: 4,
};

export default function TabLayout() {
	const segments = useSegments();
	const colorScheme = useColorScheme();
	const { width } = useWindowDimensions();

	const isDarkMode = colorScheme === "dark";
	const activeColor = isDarkMode ? "#ffffff" : Colors.mainColorLight;
	const tabBackgroundColor = isDarkMode ? Colors.thirdColorDark : "#ffffff";

	const tabIndex = useSharedValue(0);

	useEffect(() => {
		const currentRoute = segments[segments.length - 1] || "index";
		tabIndex.value = ROUTE_INDEX_MAP[currentRoute] ?? 0;
	}, [segments]);

	const TAB_BAR_PADDING = 24;
	const totalTabArea = width - TAB_BAR_PADDING * 2;
	const tabWidth = totalTabArea / 5;

	const animatedIndicatorStyle = useAnimatedStyle(() => {
		return {
			transform: [
				{
					translateX: withSpring(
						tabIndex.value * tabWidth + TAB_BAR_PADDING + (tabWidth - 50) / 2,
						{ damping: 20, stiffness: 150, mass: 1 }
					),
				},
			],
		};
	});

	return (
		<Tabs
			screenOptions={{
				headerShown: false,
				tabBarButton: HapticTab,
				tabBarShowLabel: false,
				tabBarActiveTintColor: activeColor,
				tabBarInactiveTintColor: isDarkMode
					? "rgba(255,255,255,0.5)"
					: "rgba(0,0,0,0.4)",
				tabBarStyle: {
					height: 90,
					paddingTop: 10,
					backgroundColor: tabBackgroundColor,
					borderTopLeftRadius: 25,
					borderTopRightRadius: 25,
					borderTopWidth: 0,
					elevation: 0,
					paddingHorizontal: TAB_BAR_PADDING,
					position: "absolute",
					shadowColor: "#000",
					shadowOffset: { width: 0, height: -4 },
					shadowOpacity: 0.1,
					shadowRadius: 10,
				},
				tabBarBackground: () => (
					<View style={StyleSheet.absoluteFill}>
						<Animated.View
							style={[
								styles.activeIndicator,
								{ backgroundColor: activeColor },
								animatedIndicatorStyle,
							]}
						/>
					</View>
				),
			}}
		>
			<Tabs.Screen
				name="index"
				options={{
					tabBarIcon: (props) => (
						<TabIcon {...props} Icon={House} label="Home" />
					),
				}}
			/>
			<Tabs.Screen
				name="explore"
				options={{
					tabBarIcon: (props) => (
						<TabIcon {...props} Icon={Compass} label="Explore" />
					),
				}}
			/>
			<Tabs.Screen
				name="search"
				options={{
					tabBarIcon: (props) => (
						<TabIcon {...props} Icon={MagnifyGlass} label="Search" />
					),
				}}
			/>
			<Tabs.Screen
				name="collections"
				options={{
					tabBarIcon: (props) => (
						<TabIcon {...props} Icon={BookMarks} label="Collections" />
					),
				}}
			/>
			<Tabs.Screen
				name="settings"
				options={{
					tabBarIcon: (props) => (
						<TabIcon {...props} Icon={User} label="Account" />
					),
				}}
			/>
		</Tabs>
	);
}

const TabIcon = memo(({ Icon, label, focused, color }: any) => {
	return (
		<View style={styles.tabItemContainer}>
			<Icon width={focused ? 28 : 24} height={focused ? 28 : 24} fill={color} />
			<Text
				numberOfLines={1}
				style={[
					styles.tabLabel,
					{
						color,
						fontSize: focused ? 11 : 10,
						fontWeight: focused ? "600" : "400",
						opacity: focused ? 1 : 0.8,
					},
				]}
			>
				{label}
			</Text>
		</View>
	);
});

const styles = StyleSheet.create({
	tabItemContainer: {
		alignItems: "center",
		justifyContent: "center",
		top: 10,
	},
	activeIndicator: {
		position: "absolute",
		top: 0,
		height: 3,
		width: 50,
		borderBottomLeftRadius: 3,
		borderBottomRightRadius: 3,
	},
	tabLabel: {
		marginTop: 4,
		textAlign: "center",
		minWidth: 60,
	},
});
