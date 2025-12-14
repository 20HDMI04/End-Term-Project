import React from "react";
import {
	Image,
	useColorScheme,
	ImageBackground,
	TouchableOpacity,
} from "react-native";
import { StyleSheet, View, Text, Animated, Dimensions } from "react-native";
import { Colors } from "@/constants/theme";
import StarFilled from "@/assets/svgs/star-fill.svg";

export function BookCard({
	item,
	index,
	emptyItemSize,
	item_size,
	scrollX,
}: {
	item: { key: string; title?: string };
	index: number;
	emptyItemSize: number;
	item_size: number;
	scrollX: Animated.Value;
}) {
	const isDarkMode = useColorScheme() === "dark";
	const mainColor = isDarkMode ? Colors.mainColorDark : Colors.mainColorLight;
	const secondaryBackgroundColor = isDarkMode
		? Colors.thirdColorDark
		: "#ffffff";
	const mainTextColor = isDarkMode ? "#ffffff" : Colors.mainColorLight;
	const buttonColor = isDarkMode
		? Colors.mainColorDark
		: Colors.thirdColorLight;
	const buttonTextColor = isDarkMode ? "#ffffff" : Colors.mainColorLight;
	if (item.key.startsWith("spacer")) {
		return <View style={{ width: emptyItemSize }} />;
	}

	const inputRange = [
		(index - 2) * item_size,
		(index - 1) * item_size,
		index * item_size,
	];

	// (Opacity) animation
	const opacity = scrollX.interpolate({
		inputRange,
		outputRange: [0.4, 1, 0.4], // 40% -> 100% -> 40%
		extrapolate: "clamp",
	});

	// Scale animation (highlights the item currently in the center)
	const scale = scrollX.interpolate({
		inputRange,
		outputRange: [0.8, 1, 0.8], // Smaller -> Full size -> Smaller
		extrapolate: "clamp",
	});

	// Horizontal translation animation (subtle left-right movement)
	const translateX = scrollX.interpolate({
		inputRange,
		outputRange: [0, -20, 0],
		extrapolate: "clamp",
	});
	// Book item
	return (
		<View style={{ width: item_size }}>
			<Animated.View
				style={{
					transform: [{ scale }, { translateX }],
					opacity,
					...styles.itemContainer,
					backgroundColor: secondaryBackgroundColor,
				}}
			>
				<View style={styles.imageContainer}>
					<ImageBackground
						source={require("@/assets/images/testBookCover.jpg")}
						style={[styles.image]}
					>
						<View
							style={[styles.ratingContainer, { backgroundColor: mainColor }]}
						>
							<Text style={styles.rating}>4.82</Text>
							<StarFilled
								width={10}
								height={10}
								fill={"#ffe11fff"}
								style={{ marginRight: 4 }}
							/>
						</View>
					</ImageBackground>
				</View>
				<View>
					<Text
						style={[styles.title, { color: mainTextColor }]}
						numberOfLines={2}
					>
						The Old Man and The Sea
					</Text>
					<Text
						style={[styles.subtitle, { color: mainTextColor }]}
						numberOfLines={1}
					>
						by Ernest Hemingway
					</Text>
					<View>
						<Text
							style={[styles.details, { color: mainTextColor }]}
							numberOfLines={4}
						>
							The Old Man and the Sea is about an aging Cuban fisherman,
							Santiago who endures a monumental struggle against a giant
						</Text>
					</View>
					<TouchableOpacity
						style={[styles.readButton, { backgroundColor: buttonColor }]}
					>
						<Text style={[styles.readButtonText, { color: buttonTextColor }]}>
							Read Now
						</Text>
					</TouchableOpacity>
				</View>
			</Animated.View>
		</View>
	);
}

const styles = StyleSheet.create({
	itemContainer: {
		borderRadius: 30,
		margin: 0,
		marginLeft: -20,
		height: 214,
		width: 280,
		padding: 20,
		justifyContent: "center",
		alignItems: "center",
		flexDirection: "row",
	},
	image: {
		width: 110,
		height: 170,
		resizeMode: "cover",
	},
	imageContainer: {
		marginTop: 10,
		marginBottom: 10,
		borderRadius: 10,
		overflow: "hidden",
	},
	title: {
		fontSize: 20,
		marginLeft: 10,
		fontFamily: "Modern-No-20-Regular",
		maxWidth: 120,
	},
	subtitle: {
		fontSize: 14,
		marginLeft: 10,
		fontFamily: "Modern-No-20-Regular",
		opacity: 0.5,
		maxWidth: 130,
	},
	details: {
		fontSize: 12,
		marginLeft: 10,
		marginTop: 10,
		fontFamily: "Modern-No-20-Regular",
		maxWidth: 110,
	},
	rating: {
		fontSize: 12,
		color: "#ffffff",
		fontFamily: "Modern-No-20-Regular",
		letterSpacing: 0,
		marginRight: 2,
		marginLeft: 4,
	},
	ratingContainer: {
		width: "auto",
		maxWidth: 50,
		height: 16,
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center",
		borderRadius: 5,
		opacity: 0.85,
		position: "absolute",
		top: 5,
		right: 5,
	},
	readButton: {
		marginTop: 20,
		marginLeft: 50,
		width: "auto",
		maxWidth: 78,
		height: 26,
		justifyContent: "center",
		alignItems: "center",
		borderRadius: 10,
		marginBottom: -4,
	},
	readButtonText: {
		fontSize: 12,
		fontFamily: "Modern-No-20-Regular",
	},
});
