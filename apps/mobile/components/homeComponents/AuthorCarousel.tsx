import React, { memo, useState } from "react"; // Ne felejtsd el a useState-et!
import {
	StyleSheet,
	View,
	Text,
	Image,
	FlatList,
	Dimensions,
	useColorScheme,
	TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/theme";
import { Author, AuthorSection } from "@/constants/interfaces";

const { width } = Dimensions.get("window");

const SPACING = 16;
const CONTAINER_PADDING = 20;
const ITEM_WIDTH = (width - CONTAINER_PADDING * 2 - SPACING * 2) / 3;

interface AuthorCarouselProps {
	section: AuthorSection;
	isDarkMode: boolean;
}

function AuthorCarousel({ section, isDarkMode }: AuthorCarouselProps) {
	const titleColor = isDarkMode
		? Colors.secondaryColorDark
		: Colors.mainColorLight;
	const fallbackBg = isDarkMode
		? Colors.thirdColorDark
		: Colors.thirdColorLight;
	const iconColor = isDarkMode ? Colors.loginTextDark : Colors.darkerTextLight;

	const AuthorCard = memo(({ item }: { item: Author }) => {
		const [hasError, setHasError] = useState(false);

		return (
			<TouchableOpacity
				style={[styles.card, { width: ITEM_WIDTH }]}
				activeOpacity={0.7}
				onPress={() => console.log("Author selected:", item.id)}
			>
				<Text
					style={[
						styles.authorName,
						{ color: titleColor, paddingHorizontal: 4, paddingBottom: 6 },
					]}
					numberOfLines={1}
				>
					{item.name}
				</Text>
				<View style={[styles.imageContainer, { backgroundColor: fallbackBg }]}>
					<View style={styles.absolutePlaceholder}>
						<Ionicons name="person" size={ITEM_WIDTH * 0.4} color={iconColor} />
					</View>
					{hasError || !item.biggerProfilePic ? (
						<View style={styles.fallbackContainer}>
							<Ionicons
								name="person"
								size={ITEM_WIDTH * 0.4}
								color={iconColor}
							/>
						</View>
					) : (
						<Image
							source={{ uri: item.biggerProfilePic }}
							style={styles.authorImage}
							fadeDuration={500}
							onError={() => setHasError(true)}
						/>
					)}
				</View>
			</TouchableOpacity>
		);
	});

	return (
		<View style={styles.container}>
			<View style={styles.headerContainer}>
				<Text style={[styles.title, { color: titleColor }]}>
					{section.title}
				</Text>

				<Text style={[styles.subtitle, { color: titleColor }]}>
					{section.subtitle}
				</Text>
			</View>

			<FlatList
				data={section.data}
				keyExtractor={(item) => item.id}
				horizontal
				showsHorizontalScrollIndicator={false}
				contentContainerStyle={styles.listContent}
				decelerationRate="normal"
				renderItem={({ item }) => <AuthorCard item={item} />}
			/>
		</View>
	);
}

export default React.memo(AuthorCarousel);

const styles = StyleSheet.create({
	container: {
		marginVertical: 8,
	},
	headerContainer: {
		paddingHorizontal: CONTAINER_PADDING,
		marginBottom: 0,
	},
	title: {
		fontSize: 26,
		fontFamily: "modern_no_20_regular",
	},
	absolutePlaceholder: {
		...StyleSheet.absoluteFillObject,
		justifyContent: "center",
		alignItems: "center",
		zIndex: 1,
	},
	subtitle: {
		fontSize: 18,
		fontFamily: "modern_no_20_regular",
		marginTop: 4,
		opacity: 0.7,
	},
	listContent: {
		paddingHorizontal: CONTAINER_PADDING,
	},
	card: {
		alignItems: "center",
		marginTop: 16,
		marginRight: SPACING,
	},
	imageContainer: {
		width: ITEM_WIDTH * 0.9,
		height: ITEM_WIDTH * 0.9,
		borderRadius: (ITEM_WIDTH * 0.9) / 2,
		overflow: "hidden",
		marginBottom: 12,
		alignItems: "center",
		justifyContent: "flex-start",
		position: "relative",
	},
	fallbackContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	authorImage: {
		width: "100%",
		height: "125%",
		resizeMode: "cover",
		zIndex: 2,
	},
	authorName: {
		fontSize: 16,
		fontFamily: "modern_no_20_regular",
		textAlign: "center",
		width: "100%",
	},
});
