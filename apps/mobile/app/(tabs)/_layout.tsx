import { Tabs } from "expo-router";
import React, { useEffect } from "react";
import { View, Text, StyleSheet, useWindowDimensions } from "react-native";
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withSpring,
} from "react-native-reanimated";
import { useSegments } from "expo-router";

import { HapticTab } from "@/components/haptic-tab";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";

// SVGs
import BookMarks from "@/assets/svgs/bookmarks-simple-light.svg";
import Compass from "@/assets/svgs/compass-light.svg";
import House from "@/assets/svgs/house-light.svg";
import MagnifyGlass from "@/assets/svgs/magnifying-glass-light.svg";
import User from "@/assets/svgs/user-light.svg";

export default function TabLayout() {
	const segments = useSegments();
	const colorScheme = useColorScheme();
	const { width } = useWindowDimensions();
	const activeColor =
		colorScheme === "dark" ? "#ffffff" : Colors.mainColorLight;
	const tabBackgroundColor =
		colorScheme === "dark" ? Colors.thirdColorDark : "#ffffff";

	const tabIndex = useSharedValue(0);

	useEffect(() => {
		const currentTab = segments[segments.length - 1] || "index";
		const routes: Record<string, number> = {
			"(tabs)": 0,
			index: 0,
			explore: 1,
			search: 2,
			bookmarks: 3,
			settings: 4,
		};
		const index = routes[currentTab] ?? 0;
		tabIndex.value = index;
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
						{ damping: 100, stiffness: 300, mass: 2 }
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
				tabBarInactiveTintColor: activeColor,
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
					tabBarIcon: ({ color, focused }) => (
						<TabIcon
							Icon={House}
							label="Home"
							focused={focused}
							color={color}
							index={0}
							tabIndex={tabIndex}
						/>
					),
				}}
			/>
			<Tabs.Screen
				name="explore"
				options={{
					tabBarIcon: ({ color, focused }) => (
						<TabIcon
							Icon={Compass}
							label="Explore"
							focused={focused}
							color={color}
							index={1}
							tabIndex={tabIndex}
						/>
					),
				}}
			/>
			<Tabs.Screen
				name="search"
				options={{
					tabBarIcon: ({ color, focused }) => (
						<TabIcon
							Icon={MagnifyGlass}
							label="Search"
							focused={focused}
							color={color}
							index={2}
							tabIndex={tabIndex}
						/>
					),
				}}
			/>
			<Tabs.Screen
				name="bookmarks"
				options={{
					tabBarIcon: ({ color, focused }) => (
						<TabIcon
							Icon={BookMarks}
							label="Saved"
							focused={focused}
							color={color}
							index={3}
							tabIndex={tabIndex}
						/>
					),
				}}
			/>
			<Tabs.Screen
				name="settings"
				options={{
					tabBarIcon: ({ color, focused }) => (
						<TabIcon
							Icon={User}
							label="Account"
							focused={focused}
							color={color}
							index={4}
							tabIndex={tabIndex}
						/>
					),
				}}
			/>
		</Tabs>
	);
}

function TabIcon({ Icon, label, focused, color, index, tabIndex }: any) {
	useEffect(() => {
		if (focused) {
			tabIndex.value = index;
		}
	}, [focused]);

	return (
		<View style={styles.tabItemContainer}>
			<Icon width={focused ? 30 : 24} height={focused ? 30 : 24} fill={color} />
			<Text
				style={[
					styles.tabLabel,
					{
						color,
						fontSize: focused ? 12 : 10,
						fontWeight: focused ? "600" : "400",
					},
				]}
			>
				{label}
			</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	tabItemContainer: {
		alignItems: "center",
		justifyContent: "center",
		top: 14,
	},
	activeIndicator: {
		position: "absolute",
		top: 0,
		height: 2,
		width: 50,
		borderBottomLeftRadius: 3,
		borderBottomRightRadius: 3,
	},
	tabLabel: {
		marginTop: 4,
		marginBottom: 2,
		width: 70,
		textAlign: "center",
	},
});
