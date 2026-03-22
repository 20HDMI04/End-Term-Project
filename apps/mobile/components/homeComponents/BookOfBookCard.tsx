import React, { useState, useEffect } from "react";
import {
	StyleSheet,
	View,
	Text,
	Image,
	ImageBackground,
	Pressable,
	Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withRepeat,
	withTiming,
	Easing,
} from "react-native-reanimated";
import { Colors } from "@/constants/theme";
import { useChangePicUrlToPipline } from "@/hooks/use-change-pic-url-to-pipline";
import { Book, GenreInstance } from "@/constants/interfaces";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const BookCard = ({
	data,
	isDarkMode,
	onPress,
}: {
	data: Book;
	isDarkMode: boolean;
	onPress: () => void;
}) => {
	const scrollX = useSharedValue(0);
	const [singleListWidth, setSingleListWidth] = useState(0);
	const [hasError, setHasError] = useState(false);

	useEffect(() => {
		if (singleListWidth > 0) {
			scrollX.value = 0;
			scrollX.value = withRepeat(
				withTiming(-singleListWidth, {
					duration: 200000,
					easing: Easing.linear,
				}),
				-1,
				false,
			);
		}
	}, [singleListWidth]);

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ translateX: scrollX.value }],
	}));

	const theme = {
		cardBg: isDarkMode ? Colors.thirdColorDark : "#FFFFFF",
		title: isDarkMode ? "#FFFFFF" : Colors.mainColorLight,
		author: isDarkMode ? Colors.loginTextDark : Colors.darkerTextLight,
		text: isDarkMode ? "#CCCCCC" : "#777777",
		tagBg: isDarkMode ? Colors.mainColorDark : Colors.mainColorLight,
		fallbackBg: isDarkMode ? Colors.thirdColorDark : "#E8E8E3",
		iconColor: isDarkMode ? Colors.loginTextDark : Colors.darkerTextLight,
		pressOverlay: isDarkMode ? Colors.loginTextDark : Colors.darkerTextLight,
	};

	const truncatedDescription =
		data.description?.length > 100
			? data.description.substring(0, 100) + "..."
			: data.description || "";

	const imageUrl = useChangePicUrlToPipline(
		data.biggerCoverPic || data.smallerCoverPic,
	);

	return (
		<View style={styles.container}>
			<View
				style={[styles.backgroundHeader, { backgroundColor: theme.fallbackBg }]}
			>
				{!hasError && (
					<ImageBackground
						source={{ uri: imageUrl }}
						style={StyleSheet.absoluteFill}
						blurRadius={10}
						onError={() => setHasError(true)}
					>
						<View
							style={[
								styles.backgroundOverlay,
								{
									backgroundColor: isDarkMode
										? "rgba(0,0,0,0.6)"
										: "rgba(0,0,0,0.3)",
								},
							]}
						/>
					</ImageBackground>
				)}
			</View>

			<View style={styles.absoluteCoverWrapper} pointerEvents="none">
				<View
					style={[
						styles.mainCover,
						{ backgroundColor: theme.fallbackBg, overflow: "hidden" },
					]}
				>
					<View style={styles.absolutePlaceholder}>
						<Ionicons name="book" size={60} color={theme.iconColor} />
					</View>
					{!hasError && (
						<Image
							source={{ uri: imageUrl }}
							style={styles.mainCoverImage}
							onError={() => setHasError(true)}
						/>
					)}
				</View>
			</View>

			<Pressable
				onPress={onPress}
				style={({ pressed }) => [
					styles.contentCard,
					{ backgroundColor: theme.cardBg },
				]}
			>
				{({ pressed }) => (
					<>
						{pressed && (
							<View
								style={[
									styles.pressOverlay,
									{ backgroundColor: theme.pressOverlay },
								]}
							>
								<Ionicons name="book" size={64} color="#FFFFFF" />
							</View>
						)}

						<View style={styles.spacer} />

						<View style={styles.textContainer}>
							<Text style={[styles.title, { color: theme.title }]}>
								{data.title}
							</Text>
							<Text style={[styles.author, { color: theme.author }]}>
								{data.author?.name || "Unknown Author"}
							</Text>

							<View
								style={[
									styles.divider,
									{
										backgroundColor: isDarkMode
											? Colors.loginTextDark
											: Colors.mainColorLight,
									},
								]}
							/>

							<View style={styles.marqueeWrapper}>
								<Animated.View style={[styles.tagContainer, animatedStyle]}>
									<View
										style={styles.row}
										onLayout={(e) =>
											setSingleListWidth(e.nativeEvent.layout.width)
										}
									>
										{data.genres?.map((genre: GenreInstance, index: number) => (
											<Tag
												key={`orig-${index}`}
												genre={genre.genre.name}
												isFirst={index === 0}
												theme={theme}
											/>
										))}
									</View>
									<View style={styles.row}>
										{data.genres?.map((genre: GenreInstance, index: number) => (
											<Tag
												key={`copy-${index}`}
												genre={genre.genre.name}
												isFirst={index === 0}
												theme={theme}
											/>
										))}
									</View>
								</Animated.View>
							</View>

							<Text
								numberOfLines={3}
								style={[styles.description, { color: theme.text }]}
							>
								{truncatedDescription}{" "}
								<Text style={[styles.readMore, { color: theme.title }]}>
									Read more...
								</Text>
							</Text>
						</View>
					</>
				)}
			</Pressable>
		</View>
	);
};

const Tag = ({ genre, isFirst, theme }: any) => (
	<View
		style={[
			styles.tag,
			isFirst
				? {
						backgroundColor: "#FFFFFF",
						borderWidth: 1,
						borderColor: theme.tagBg,
					}
				: { backgroundColor: theme.tagBg },
		]}
	>
		<Text
			style={[
				styles.tagText,
				isFirst ? { color: theme.tagBg } : { color: "#FFFFFF" },
			]}
		>
			{genre}
		</Text>
	</View>
);

const styles = StyleSheet.create({
	backgroundHeader: {
		height: 220,
		width: "100%",
		borderTopLeftRadius: 30,
		borderTopRightRadius: 30,
		overflow: "hidden",
		position: "relative",
	},
	absolutePlaceholder: {
		...StyleSheet.absoluteFillObject,
		justifyContent: "center",
		alignItems: "center",
		zIndex: 0,
	},
	mainCover: {
		width: 150,
		height: 220,
		borderRadius: 15,
	},
	mainCoverImage: {
		width: "100%",
		height: "100%",
		borderRadius: 15,
		zIndex: 1,
	},
	container: {
		width: SCREEN_WIDTH * 0.9,
		alignSelf: "center",
		borderRadius: 30,
		marginVertical: 20,
	},
	backgroundOverlay: { flex: 1 },
	absoluteCoverWrapper: {
		position: "absolute",
		top: 60,
		alignSelf: "center",
		zIndex: 100,
	},
	contentCard: {
		marginTop: -60,
		borderTopLeftRadius: 40,
		borderTopRightRadius: 40,
		borderBottomLeftRadius: 30,
		borderBottomRightRadius: 30,
		paddingHorizontal: 20,
		paddingBottom: 30,
		overflow: "hidden",
	},
	spacer: { height: 140 },
	pressOverlay: {
		...StyleSheet.absoluteFillObject,
		zIndex: 50,
		opacity: 0.6,
		justifyContent: "center",
		alignItems: "center",
	},
	textContainer: { alignItems: "center" },
	title: {
		fontSize: 26,
		textAlign: "center",
		fontFamily: "modern_no_20_regular",
	},
	author: { fontSize: 22, marginTop: 5, fontFamily: "modern_no_20_regular" },
	divider: { width: "80%", height: 1, marginVertical: 15 },
	marqueeWrapper: { width: "100%", overflow: "hidden", marginBottom: 15 },
	tagContainer: { flexDirection: "row" },
	row: { flexDirection: "row" },
	tag: {
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 20,
		marginHorizontal: 4,
	},
	tagText: { fontSize: 12, fontWeight: "600" },
	description: {
		textAlign: "left",
		lineHeight: 22,
		fontSize: 16,
		fontFamily: "modern_no_20_regular",
	},
	readMore: { fontFamily: "modern_no_20_regular", fontSize: 18 },
});

export default BookCard;
