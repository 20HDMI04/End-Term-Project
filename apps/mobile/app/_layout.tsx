import {
	DarkTheme,
	DefaultTheme,
	ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { useEffect, useState } from "react";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { initSuperTokens } from "../config/supertokens.config";
import * as SplashScreenRN from "expo-splash-screen";
import AnimatedSplashScreen from "@/components/splash-screen";

// Prevent auto-hiding the splash screen
SplashScreenRN.preventAutoHideAsync();

export default function RootLayout() {
	const colorScheme = useColorScheme();
	const [appIsReady, setAppIsReady] = useState(false);

	useEffect(() => {
		async function prepare() {
			try {
				console.log("Starting initialization...");
				await SplashScreenRN.hideAsync();
				await initSuperTokens();
			} catch (e) {
				console.warn("Init error:", e);
				await SplashScreenRN.hideAsync();
			}
		}
		prepare();
	}, []);

	if (!appIsReady) {
		return (
			<AnimatedSplashScreen
				onFinish={() => {
					setAppIsReady(true);
				}}
			/>
		);
	}

	return (
		<ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
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
