import React from "react";
import { StyleSheet, View, Animated, Dimensions } from "react-native";
import { BookCard } from "./BookCard";
// --- Konstansok és Alapvető Beállítások ---

// Képernyő szélessége
const { width } = Dimensions.get("window");

// Az egyes elemek szélessége (Az eredeti cikkben az item magassága volt, most a SZÉLESSÉG a fontos)
const ITEM_SIZE = width * 0.7;

const EMPTY_ITEM_SIZE = (width - ITEM_SIZE) / 2;

const DATA = [...Array(30).keys()].map((i) => ({
	key: String(i),
	title: `Tétel ${i + 1}`,
}));

const SPACER = { key: "spacer-left" };
const SPACER_RIGHT = { key: "spacer-right" };
const fullData = [SPACER, ...DATA, SPACER_RIGHT];

export function AnimatedCarousel() {
	const scrollX = React.useRef(new Animated.Value(0)).current;

	// Animated Carousel
	return (
		<View style={styles.container}>
			<Animated.FlatList
				data={fullData}
				keyExtractor={(item) => item.key}
				horizontal
				showsHorizontalScrollIndicator={false}
				onScroll={Animated.event(
					[{ nativeEvent: { contentOffset: { x: scrollX } } }],
					{ useNativeDriver: true }
				)}
				snapToInterval={ITEM_SIZE}
				renderItem={({ item, index }) => (
					<BookCard
						item={item}
						index={index}
						emptyItemSize={EMPTY_ITEM_SIZE}
						item_size={ITEM_SIZE}
						scrollX={scrollX}
					/>
				)}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		justifyContent: "center",
		paddingVertical: 50,
	},
});
