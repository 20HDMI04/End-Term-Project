import { Image } from "expo-image";
import { Platform, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { runOnJS } from "react-native-reanimated";
import {
	Directions,
	Gesture,
	GestureDetector,
} from "react-native-gesture-handler";
import { router } from "expo-router";

export default function TabTwoScreen() {
	const goToNext = () => router.replace("/search");
	const goToPrevious = () => router.replace("/(tabs)");

	const swipeLeft = Gesture.Fling()
		.direction(Directions.LEFT)
		.onEnd(() => {
			runOnJS(goToNext)();
		});

	const swipeRight = Gesture.Fling()
		.direction(Directions.RIGHT)
		.onEnd(() => {
			runOnJS(goToPrevious)();
		});
	return (
		<GestureDetector gesture={Gesture.Exclusive(swipeLeft, swipeRight)}>
			<SafeAreaView>
				<Text>Explore Screen</Text>
			</SafeAreaView>
		</GestureDetector>
	);
}

const styles = StyleSheet.create({});
