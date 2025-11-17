import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TabThreeScreen() {
	return (
		<SafeAreaView>
			<ThemedText style={{ margin: 16, fontSize: 18, fontWeight: "500" }}>
				Settings Screen
			</ThemedText>
			<ThemedView style={{ margin: 16 }}>
				<ThemedText>
					This is where you can put settings for your app. Customize it to fit
					your needs!
				</ThemedText>
			</ThemedView>
		</SafeAreaView>
	);
}
