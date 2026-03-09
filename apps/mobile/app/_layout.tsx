console.log("[_layout] Module loading started");

import {
	DarkTheme,
	DefaultTheme,
	ThemeProvider,
} from "@react-navigation/native";
console.log("[_layout] @react-navigation/native loaded");

import { Colors } from "@/constants/theme";
import { Stack, useRouter, useSegments } from "expo-router";
console.log("[_layout] expo-router loaded");

import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
console.log("[_layout] react-native-reanimated loaded");

import { StrictMode, useEffect, useState } from "react";
import {
	Poppins_300Light,
	Poppins_400Regular,
	Poppins_600SemiBold,
} from "@expo-google-fonts/poppins";
import { useFonts } from "expo-font";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { initSuperTokens } from "../config/supertokens.config";
import * as SplashScreenRN from "expo-splash-screen";
console.log("[_layout] Basic imports done");

import AnimatedSplashScreen from "@/components/splash-screen";
console.log("[_layout] splash-screen loaded (lottie-react-native)");

import { AppHeader } from "@/components/AppHeader";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
console.log("[_layout] AuthContext loaded (supertokens-react-native)");

import { GoogleSignin } from "@react-native-google-signin/google-signin";
console.log("[_layout] GoogleSignin loaded");

import { ApiProvider, useApi } from "@/contexts/ApiContext";

const WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;

try {
	GoogleSignin.configure({
		webClientId: WEB_CLIENT_ID,
		offlineAccess: true,
		scopes: ["profile", "email"],
	});
} catch (e) {
	console.warn("GoogleSignin.configure failed:", e);
}

try {
	initSuperTokens();
} catch (e) {
	console.warn("initSuperTokens failed:", e);
}

SplashScreenRN.preventAutoHideAsync();

function RootLayoutNav() {
	const { authState } = useAuth();
	const api = useApi();
	const segments = useSegments();
	const router = useRouter();
	const [isNavigationReady, setIsNavigationReady] = useState(false);

	useEffect(() => {
		setIsNavigationReady(true);
	}, []);

	useEffect(() => {
		if (authState.isAuthenticated === null || !isNavigationReady) return;

		const routeSegments = segments as string[];

		const inAuthGroup = routeSegments[0] === "(authentication)";
		const inTabsGroup = routeSegments[0] === "(tabs)";

		const timeout = setTimeout(() => {
			if (!authState.isAuthenticated && !inAuthGroup) {
				console.log("[LayoutNav] Redirecting to Auth");
				router.replace("/(authentication)/auth");
			} else if (authState.isAuthenticated && (inAuthGroup || !inTabsGroup)) {
				console.log("[LayoutNav] Redirecting to Tabs");
				router.replace("/(tabs)");
			}
		}, 0);

		return () => clearTimeout(timeout);
	}, [authState.isAuthenticated, segments, isNavigationReady]);

	useEffect(() => {
		if (authState.isAuthenticated) {
			api.getMe();
		}
	}, [authState.isAuthenticated]);

	return (
		<Stack
			screenOptions={{
				headerShown: true,
				animation: "none",
				header: (props) => <AppHeader {...props} />,
			}}
		>
			<Stack.Screen name="index" options={{ headerShown: true }} />
			<Stack.Screen
				name="(authentication)/auth"
				options={{ headerShown: false }}
			/>
			<Stack.Screen name="(tabs)" options={{ headerShown: true }} />
		</Stack>
	);
}

export default function RootLayout() {
	const colorScheme = useColorScheme();
	const [appIsReady, setAppIsReady] = useState(false);

	const [fontsLoaded, fontError] = useFonts({
		modern_no_20_regular: require("../assets/fonts/modern_no_20_regular.otf"),
		Poppins_300Light,
		Poppins_400Regular,
		Poppins_600SemiBold,
	});

	useEffect(() => {
		if (fontsLoaded || fontError) {
			SplashScreenRN.hideAsync();
		}
	}, [fontsLoaded, fontError]);

	if (!fontsLoaded && !fontError) {
		return null;
	}

	const CustomDarkTheme = {
		...DarkTheme,
		colors: { ...DarkTheme.colors, background: Colors.mainColorDark },
	};

	const CustomDefaultTheme = {
		...DefaultTheme,
		colors: { ...DefaultTheme.colors, background: Colors.secondaryColorLight },
	};

	return (
		<AuthProvider>
			<ApiProvider>
				<ThemeProvider
					value={colorScheme === "dark" ? CustomDarkTheme : CustomDefaultTheme}
				>
					{!appIsReady ? (
						<AnimatedSplashScreen onFinish={() => setAppIsReady(true)} />
					) : (
						<RootLayoutNav />
					)}
					<StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
				</ThemeProvider>
			</ApiProvider>
		</AuthProvider>
	);
}
