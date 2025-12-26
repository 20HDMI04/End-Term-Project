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
	Poppins_300Light,
	Poppins_400Regular,
	Poppins_600SemiBold,
} from "@expo-google-fonts/poppins";
import { useFonts } from "expo-font";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { initSuperTokens } from "../config/supertokens.config";
import * as SplashScreenRN from "expo-splash-screen";
import AnimatedSplashScreen from "@/components/splash-screen";
import { AppHeader } from "@/components/AppHeader";
import { AuthProvider } from "@/contexts/AuthContext";
import { GoogleSignin } from "@react-native-google-signin/google-signin";

const WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;

GoogleSignin.configure({
	webClientId: WEB_CLIENT_ID,
	offlineAccess: true,
	scopes: ["profile", "email"],
});

initSuperTokens();

SplashScreenRN.preventAutoHideAsync();

export default function RootLayout() {
	const colorScheme = useColorScheme();
	const [appIsReady, setAppIsReady] = useState(false);

	const [fontsLoaded] = useFonts({
		"Modern-No-20-Regular": require("../assets/fonts/Modern-No-20-Regular.otf"),
		Poppins_300Light,
		Poppins_400Regular,
		Poppins_600SemiBold,
	});

	const CustomDarkTheme = {
		...DarkTheme,
		colors: { ...DarkTheme.colors, background: Colors.mainColorDark },
	};

	const CustomDefaultTheme = {
		...DefaultTheme,
		colors: { ...DefaultTheme.colors, background: Colors.secondaryColorLight },
	};

	if (!fontsLoaded || !appIsReady) {
		return <AnimatedSplashScreen onFinish={() => setAppIsReady(true)} />;
	}

	return (
		<AuthProvider>
			<ThemeProvider
				value={colorScheme === "dark" ? CustomDarkTheme : CustomDefaultTheme}
			>
				<Stack
					screenOptions={{
						headerShown: true,
						animation: "none",
						header: (props) => <AppHeader {...props} />,
					}}
				>
					<Stack.Screen name="index" options={{ headerShown: false }} />
					<Stack.Screen
						name="(authentication)/auth"
						options={{ headerShown: false }}
					/>
					<Stack.Screen name="(tabs)" options={{ headerShown: true }} />
				</Stack>
				<StatusBar style="auto" />
			</ThemeProvider>
		</AuthProvider>
	);
}
