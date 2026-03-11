import { Colors } from "@/constants/theme";
import React, { useEffect, useRef } from "react";
import {
	View,
	StyleSheet,
	Animated,
	Dimensions,
	ScrollView,
} from "react-native";

const { width } = Dimensions.get("window");
const ITEM_WIDTH_BOOK = (width - 40 - 32) / 2;
const ITEM_WIDTH_AUTHOR = (width - 40 - 32) / 3;

export const HomeSkeleton = ({ darkmode }: { darkmode: boolean }) => {
	const opacity = useRef(new Animated.Value(0.3)).current;
	const bgColor = darkmode ? Colors.thirdColorDark : Colors.thirdColorLight;
	useEffect(() => {
		Animated.loop(
			Animated.sequence([
				Animated.timing(opacity, {
					toValue: 0.7,
					duration: 800,
					useNativeDriver: true,
				}),
				Animated.timing(opacity, {
					toValue: 0.3,
					duration: 800,
					useNativeDriver: true,
				}),
			]),
		).start();
	}, []);

	const SkeletonItem = ({ style }: { style: any }) => (
		<Animated.View style={[style, { opacity, backgroundColor: bgColor }]} />
	);

	const Section = ({ type }: { type: "book" | "author" }) => (
		<View style={styles.section}>
			<SkeletonItem style={styles.titleSkeleton} />
			<SkeletonItem style={styles.subtitleSkeleton} />
			<ScrollView
				horizontal
				showsHorizontalScrollIndicator={false}
				style={{ paddingLeft: 20 }}
			>
				{[1, 2, 3].map((i) => (
					<SkeletonItem
						key={i}
						style={type === "book" ? styles.bookCard : styles.authorCard}
					/>
				))}
			</ScrollView>
		</View>
	);

	return (
		<View style={{ flex: 1, paddingTop: 20 }}>
			<Section type="author" />
			<Section type="book" />
			<Section type="book" />
		</View>
	);
};

const styles = StyleSheet.create({
	section: { marginBottom: 30 },
	titleSkeleton: {
		height: 26,
		width: "50%",
		marginLeft: 20,
		marginBottom: 8,
		borderRadius: 4,
	},
	subtitleSkeleton: {
		height: 18,
		width: "30%",
		marginLeft: 20,
		marginBottom: 16,
		borderRadius: 4,
	},
	bookCard: {
		width: ITEM_WIDTH_BOOK,
		height: 250,
		borderRadius: 16,
		marginRight: 16,
	},
	authorCard: {
		width: ITEM_WIDTH_AUTHOR * 0.9,
		height: ITEM_WIDTH_AUTHOR * 0.9,
		borderRadius: (ITEM_WIDTH_AUTHOR * 0.9) / 2,
		marginRight: 16,
		marginTop: 16,
	},
});
