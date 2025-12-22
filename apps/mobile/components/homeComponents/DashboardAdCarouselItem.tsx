import React from "react";
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	Dimensions,
	Animated,
} from "react-native";

const { width } = Dimensions.get("window");
const ITEM_WIDTH = width * 0.85;
const SPACING = 60;

interface CarouselItemProps {
	item: { title: string; quote: string };
	scrollX: Animated.Value;
	index: number;
}

export function CarouselItem({ item, scrollX, index }: CarouselItemProps) {
	const opacity = scrollX.interpolate({
		inputRange: [
			(index - 1) * (ITEM_WIDTH + SPACING),
			index * (ITEM_WIDTH + SPACING),
			(index + 1) * (ITEM_WIDTH + SPACING),
		],
		outputRange: [0, 1, 0],
		extrapolate: "clamp",
	});

	return (
		<Animated.View style={[styles.itemWrapper, { opacity }]}>
			<View style={[styles.backgroundView, { backgroundColor: "#F5F5F5" }]}>
				<View style={styles.contentOverlay}>
					<Text style={styles.title}>{item.title}</Text>
					<Text style={styles.quote}>"{item.quote}"</Text>

					<TouchableOpacity style={styles.button}>
						<Text style={styles.buttonText}>Read more</Text>
					</TouchableOpacity>
				</View>

				<View style={styles.illustrationPlaceholder}>
					<Text style={{ color: "green", fontSize: 14 }}>
						Illusztráció helye
					</Text>
				</View>
			</View>
		</Animated.View>
	);
}

const styles = StyleSheet.create({
	itemWrapper: {
		width: ITEM_WIDTH,
		height: 190,
		justifyContent: "center",
		alignItems: "center",
	},
	backgroundView: {
		width: "100%",
		height: "100%",
		borderRadius: 30,
		overflow: "hidden",
		padding: 20,
		flexDirection: "row",
		justifyContent: "space-between",
	},
	contentOverlay: {
		flex: 2,
		justifyContent: "space-between",
		paddingRight: 15,
	},
	illustrationPlaceholder: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "rgba(0, 128, 0, 0.1)",
		borderRadius: 10,
	},
	title: {
		fontSize: 28,
		fontWeight: "bold",
		color: "#333",
	},
	quote: {
		fontSize: 18,
		fontStyle: "italic",
		color: "#555",
		marginTop: 5,
		marginBottom: 20,
	},
	button: {
		backgroundColor: "white",
		paddingVertical: 10,
		paddingHorizontal: 20,
		borderRadius: 50,
		alignSelf: "flex-start",
	},
	buttonText: {
		color: "#333",
		fontWeight: "600",
	},
});
