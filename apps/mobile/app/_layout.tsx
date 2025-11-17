import {
	DarkTheme,
	DefaultTheme,
	ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { useEffect } from "react";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { initSuperTokens } from "../config/supertokens.config";

export default function RootLayout() {
	const colorScheme = useColorScheme();

	// Initialize SuperTokens on app load
	useEffect(() => {
		initSuperTokens();
		console.log("SuperTokens initialized");
	}, []);

	return (
		<ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
			<Stack screenOptions={{ headerShown: false }}>
				<Stack.Screen name="index" options={{ headerShown: false }} />
				<Stack.Screen name="auth" options={{ headerShown: false }} />
				<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
				<Stack.Screen
					name="modal"
					options={{ presentation: "modal", title: "Modal", headerShown: true }}
				/>
				<Stack.Screen
					name="not-found"
					options={{ title: "Oops!", headerShown: true }}
				/>
			</Stack>
			<StatusBar style="auto" />
		</ThemeProvider>
	);
}
