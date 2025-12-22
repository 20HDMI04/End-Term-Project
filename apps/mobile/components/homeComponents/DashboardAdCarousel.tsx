import React from "react";
import {
	View,
	Text,
	StyleSheet,
	Animated,
	Dimensions,
	FlatList,
} from "react-native";
import { CarouselItem } from "./DashboardAdCarouselItem";

// TODO: Replace with real content and replace indicator styling and opacity issues

const { width } = Dimensions.get("window");
const ITEM_WIDTH = width * 0.85;
const ITEM_MARGIN = 10;
const INTERVAL_SIZE = ITEM_WIDTH + ITEM_MARGIN * 2;

const carouselData = [
	{
		key: "1",
		title: "Trending Now",
		quote: "The perfect books are just an arm's length away.",
		imageKey: "none",
	},
	{
		key: "2",
		title: "New Releases",
		quote:
			"Discover your next favorite story. Ez a szöveg hosszabb, hogy teszteljük a kipontozást.",
		imageKey: "none",
	},
	{
		key: "3",
		title: "Summer Reads",
		quote:
			"Dive into these exciting new stories and enjoy the long, lazy days.",
		imageKey: "none",
	},
];

export default function HomeScreen() {
	const scrollX = React.useRef(new Animated.Value(0)).current;
	const dotPosition = Animated.divide(scrollX, INTERVAL_SIZE);

	const renderItem = ({
		item,
		index,
	}: {
		item: (typeof carouselData)[0];
		index: number;
	}) => {
		const inputRange = [
			(index - 1) * INTERVAL_SIZE,
			index * INTERVAL_SIZE,
			(index + 1) * INTERVAL_SIZE,
		];

		const opacity = scrollX.interpolate({
			inputRange,
			outputRange: [0, 1, 0],
			extrapolate: "clamp",
		});

		const scale = scrollX.interpolate({
			inputRange,
			outputRange: [1, 1, 1],
			extrapolate: "clamp",
		});
		const translateX = scrollX.interpolate({
			inputRange,
			outputRange: [0, 0, 0],
			extrapolate: "clamp",
		});

		return (
			<View style={{ width: ITEM_WIDTH + ITEM_MARGIN * 2 }}>
				<Animated.View
					style={{
						transform: [{ scale }, { translateX }],
						opacity,
						marginHorizontal: ITEM_MARGIN,
					}}
				>
					<CarouselItem item={item} scrollX={scrollX} index={index} />
				</Animated.View>
			</View>
		);
	};

	const renderDots = () => {
		return (
			<View style={styles.dotContainer}>
				{carouselData.map((_, index) => {
					const opacity = dotPosition.interpolate({
						inputRange: [index - 1, index, index + 1],
						outputRange: [0.4, 1, 0.4],
						extrapolate: "clamp",
					});

					const scale = dotPosition.interpolate({
						inputRange: [index - 1, index, index + 1],
						outputRange: [1, 1.4, 1],
						extrapolate: "clamp",
					});

					return (
						<Animated.View
							key={index.toString()}
							style={[
								styles.dot,
								{
									opacity,
									transform: [{ scale }],
								},
							]}
						/>
					);
				})}
			</View>
		);
	};

	return (
		<View style={styles.screenContainer}>
			<Animated.FlatList
				data={carouselData}
				keyExtractor={(item) => item.key}
				renderItem={renderItem}
				horizontal
				showsHorizontalScrollIndicator={false}
				onScroll={Animated.event(
					[{ nativeEvent: { contentOffset: { x: scrollX } } }],
					{ useNativeDriver: false }
				)}
				snapToInterval={INTERVAL_SIZE}
				decelerationRate="fast"
				contentContainerStyle={{
					paddingHorizontal: (width - ITEM_WIDTH) / 2 - ITEM_MARGIN,
				}}
			/>

			{renderDots()}
		</View>
	);
}

const styles = StyleSheet.create({
	screenContainer: {
		paddingTop: 30,
	},
	dotContainer: {
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center",
		marginTop: 20,
		marginBottom: 10,
	},
	dot: {
		height: 8,
		width: 8,
		borderRadius: 4,
		backgroundColor: "#333",
		marginHorizontal: 4,
	},
});
