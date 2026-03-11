import React, { useState, memo } from "react";
import {
	StyleSheet,
	View,
	Text,
	Image,
	FlatList,
	Dimensions,
	useColorScheme,
	Modal,
	TouchableOpacity,
	SafeAreaView,
	ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/theme";
import { Book, BookSection } from "@/constants/interfaces";

const { width } = Dimensions.get("window");

const SPACING = 16;
const CONTAINER_PADDING = 20;
const ITEM_WIDTH = (width - CONTAINER_PADDING * 2 - SPACING * 2) / 2;

interface BookCarouselProps {
	section: BookSection;
	isDarkMode: boolean;
}

function BookCarousel({ section, isDarkMode }: BookCarouselProps) {
	const [selectedBook, setSelectedBook] = useState<Book | null>(null);

	const titleColor = isDarkMode
		? Colors.secondaryColorDark
		: Colors.mainColorLight;

	const badgeBackgroundColor = isDarkMode
		? Colors.mainColorDark
		: Colors.mainColorLight;

	const fallbackBg = isDarkMode
		? Colors.thirdColorDark
		: Colors.thirdColorLight;
	const iconColor = isDarkMode ? Colors.loginTextDark : Colors.darkerTextLight;

	const BookCard = memo(
		({ item, onPress }: { item: Book; onPress: (book: Book) => void }) => {
			const [hasError, setHasError] = useState(false);

			return (
				<TouchableOpacity
					style={[styles.card, { width: ITEM_WIDTH }]}
					onPress={() => onPress(item)}
					activeOpacity={0.8}
				>
					<View
						style={[styles.imageContainer, { backgroundColor: fallbackBg }]}
					>
						<View style={styles.absolutePlaceholder}>
							<Ionicons name="book" size={ITEM_WIDTH * 0.3} color={iconColor} />
						</View>

						{!hasError && (
							<Image
								source={{ uri: item.biggerCoverPic }}
								style={styles.image}
								fadeDuration={500}
								onError={() => setHasError(true)}
							/>
						)}
					</View>

					<View
						style={[styles.badge, { backgroundColor: badgeBackgroundColor }]}
					>
						<Text style={styles.badgeText}>
							{item.statistics.averageRating}
						</Text>
						<Ionicons
							name="star"
							size={14}
							color="#FFD700"
							style={styles.starIcon}
						/>
					</View>
				</TouchableOpacity>
			);
		},
	);

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
				snapToAlignment="start"
				renderItem={({ item }) => (
					<BookCard
						item={item}
						onPress={(book: Book) => setSelectedBook(book)}
					/>
				)}
			/>

			<Modal
				visible={selectedBook !== null}
				animationType="slide"
				transparent={true}
				onRequestClose={() => setSelectedBook(null)}
			>
				<SafeAreaView style={styles.fullModalContainer}>
					<View style={styles.modalHeader}>
						<TouchableOpacity onPress={() => setSelectedBook(null)}>
							<Ionicons name="close-outline" size={32} color="#3E4A35" />
						</TouchableOpacity>
						<Text style={styles.headerTitle}>Details</Text>
						<View style={{ width: 32 }} />
					</View>
					<ScrollView
						contentContainerStyle={styles.scrollContent}
						showsVerticalScrollIndicator={false}
					>
						{selectedBook && (
							<>
								<View
									style={[
										styles.fullModalImageContainer,
										{ backgroundColor: fallbackBg },
									]}
								>
									<Ionicons
										name="book"
										size={100}
										color={iconColor}
										style={styles.modalPlaceholderIcon}
									/>
									<Image
										source={{ uri: selectedBook.biggerCoverPic }}
										style={styles.fullModalImage}
									/>
								</View>

								<View style={styles.infoSection}>
									<Text style={styles.detailTitle}>{selectedBook.title}</Text>
									<Text style={styles.detailAuthor}>
										by {selectedBook.authorId}
									</Text>
									<View style={styles.divider} />
									<Text style={styles.description}>
										{selectedBook.description}
									</Text>
								</View>
							</>
						)}
					</ScrollView>
				</SafeAreaView>
			</Modal>
		</View>
	);
}

export default React.memo(BookCarousel);

const styles = StyleSheet.create({
	container: {
		flex: 1,
		marginBottom: 24,
	},
	headerContainer: {
		paddingHorizontal: CONTAINER_PADDING,
		marginBottom: 8,
	},
	title: {
		fontSize: 26,
		fontFamily: "modern_no_20_regular",
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
		height: 250,
		borderRadius: 16,
		marginRight: SPACING,
		overflow: "hidden",
	},
	imageContainer: {
		flex: 1,
		width: "100%",
		height: "100%",
		position: "relative",
	},
	absolutePlaceholder: {
		...StyleSheet.absoluteFillObject,
		justifyContent: "center",
		alignItems: "center",
		zIndex: 0,
	},
	image: {
		width: "100%",
		height: "100%",
		resizeMode: "cover",
		zIndex: 1,
	},
	badge: {
		position: "absolute",
		top: 8,
		right: 8,
		opacity: 0.9,
		paddingVertical: 3,
		paddingHorizontal: 7,
		borderRadius: 10,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		zIndex: 2,
	},
	badgeText: {
		color: "white",
		fontSize: 18,
		fontFamily: "modern_no_20_regular",
		marginRight: 2,
	},
	starIcon: {
		marginLeft: 1,
	},
	fullModalContainer: {
		flex: 1,
		backgroundColor: "#F5F5F1",
	},
	modalHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: 20,
		paddingVertical: 15,
		borderBottomWidth: 1,
		borderBottomColor: "#E0E0E0",
	},
	headerTitle: {
		fontSize: 18,
		fontWeight: "bold",
		color: "#3E4A35",
	},
	scrollContent: {
		alignItems: "center",
		paddingBottom: 40,
	},
	fullModalImageContainer: {
		width: width * 0.6,
		height: width * 0.9,
		borderRadius: 20,
		marginTop: 30,
		justifyContent: "center",
		alignItems: "center",
		overflow: "hidden",
		shadowColor: "#000",
		shadowOpacity: 0.3,
		shadowRadius: 15,
		elevation: 10,
	},
	fullModalImage: {
		...StyleSheet.absoluteFillObject,
		width: "100%",
		height: "100%",
		borderRadius: 20,
	},
	modalPlaceholderIcon: {
		zIndex: -1,
	},
	infoSection: {
		width: "100%",
		padding: 30,
	},
	detailTitle: {
		fontSize: 28,
		fontWeight: "bold",
		color: "#3E4A35",
		textAlign: "center",
	},
	detailAuthor: {
		fontSize: 18,
		color: "#707A65",
		textAlign: "center",
		marginTop: 5,
	},
	divider: {
		height: 1,
		backgroundColor: "#D1D1D1",
		marginVertical: 20,
		width: "100%",
	},
	description: {
		fontSize: 16,
		lineHeight: 24,
		color: "#4A4A4A",
		textAlign: "justify",
	},
});
