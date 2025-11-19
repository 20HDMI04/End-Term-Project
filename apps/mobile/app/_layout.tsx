import {
	DarkTheme,
	DefaultTheme,
	ThemeProvider,
} from "@react-navigation/native";
import { Colors } from "@/constants/theme";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { useEffect, useState } from "react";
import {
	useFonts,
	Poppins_300Light,
	Poppins_400Regular,
	Poppins_600SemiBold,
} from "@expo-google-fonts/poppins";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { initSuperTokens } from "../config/supertokens.config";
import * as SplashScreenRN from "expo-splash-screen";
import AnimatedSplashScreen from "@/components/splash-screen";

// Prevent auto-hiding the splash screen
SplashScreenRN.preventAutoHideAsync();

export default function RootLayout() {
	const colorScheme = useColorScheme();
	const [appIsReady, setAppIsReady] = useState(false);
	const [fontsLoaded] = useFonts({
		Poppins_300Light,
		Poppins_400Regular,
		Poppins_600SemiBold,
	});

	const CustomDarkTheme = {
		...DarkTheme,
		colors: {
			...DarkTheme.colors,
			background: Colors.mainAndsecondary.mainDark,
		},
	};

	const CustomDefaultTheme = {
		...DefaultTheme,
		colors: {
			...DefaultTheme.colors,
			background: Colors.mainAndsecondary.secondaryLight,
		},
	};

	useEffect(() => {
		async function prepare() {
			try {
				console.log("Starting initialization...");
				await SplashScreenRN.hideAsync();
				initSuperTokens();
			} catch (e) {
				console.warn("Init error:", e);
				await SplashScreenRN.hideAsync();
			}
		}
		prepare();
	}, []);

	if (!fontsLoaded || !appIsReady) {
		return (
			<AnimatedSplashScreen
				onFinish={() => {
					if (fontsLoaded) setAppIsReady(true);
				}}
			/>
		);
	}

	return (
		<ThemeProvider
			value={colorScheme === "dark" ? CustomDarkTheme : CustomDefaultTheme}
		>
			<Stack
				screenOptions={{
					headerShown: false,
					animation: "none",
				}}
			>
				<Stack.Screen
					name="index"
					options={{
						headerShown: false,
						animation: "none",
					}}
				/>
				<Stack.Screen
					name="auth"
					options={{
						headerShown: false,
						animation: "none",
					}}
				/>
				<Stack.Screen
					name="(tabs)"
					options={{
						headerShown: false,
						animation: "none",
					}}
				/>
				<Stack.Screen
					name="modal"
					options={{ presentation: "modal", title: "Modal", headerShown: true }}
				/>
			</Stack>
			<StatusBar style="auto" />
		</ThemeProvider>
	);
}
