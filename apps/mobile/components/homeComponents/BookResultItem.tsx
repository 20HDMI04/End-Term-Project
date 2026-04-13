import React, { useState, memo, useEffect } from "react";
import { StyleSheet, View, Text, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/theme";
import { BookData } from "@/constants/interfaces";
import { useToast } from "@/contexts/ToastContext";
import { useApi } from "@/contexts/ApiContext";
import { useChangePicUrlToPipline } from "@/hooks/use-change-pic-url-to-pipline";
import { Storage } from "@/utils/storage";

interface BookResultItemProps {
	item: BookData;
	isDarkMode: boolean;
	onPress?: (bookId: string) => void;
}

const BookResultItem = ({ item, isDarkMode, onPress }: BookResultItemProps) => {
	const [hasError, setHasError] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [isSelected, setIsSelected] = useState(false);
	const api = useApi();
	const { showToast } = useToast();

	useEffect(() => {
		if (item.isFavorited !== undefined) {
			setIsSelected(item.isFavorited);
		}
	}, [item.isFavorited]);

	const titleColor = isDarkMode
		? Colors.secondaryColorDark
		: Colors.mainColorLight;
	const subtitleColor = isDarkMode
		? Colors.loginTextDark
		: Colors.darkerTextLight;
	const fallbackBg = isDarkMode
		? Colors.thirdColorDark
		: Colors.thirdColorLight;
	const iconColor = isDarkMode ? Colors.loginTextDark : Colors.darkerTextLight;

	return (
		<View style={styles.container}>
			<TouchableOpacity
				activeOpacity={0.7}
				style={{ flexDirection: "row", flex: 1 }}
				onPress={() => onPress && onPress(item.id)}
			>
				<View style={[styles.imageWrapper, { backgroundColor: fallbackBg }]}>
					<View style={styles.absolutePlaceholder}>
						<Ionicons name="book-outline" size={24} color={iconColor} />
					</View>

					{item.smallerCoverPic && !hasError && (
						<Image
							source={{ uri: useChangePicUrlToPipline(item.smallerCoverPic) }}
							style={styles.image}
							onLoadStart={() => setIsLoading(true)}
							onLoadEnd={() => setIsLoading(false)}
							onError={() => {
								setHasError(true);
								setIsLoading(false);
							}}
						/>
					)}
				</View>

				<View style={styles.infoContainer}>
					<Text style={[styles.title, { color: titleColor }]} numberOfLines={1}>
						{item.title || "Unknown Title"}
					</Text>

					<Text
						style={[styles.subtitle, { color: subtitleColor }]}
						numberOfLines={1}
					>
						Book • {item.author?.name || "Unknown Author"}
					</Text>

					<View style={styles.genreContainer}>
						{item.genres?.slice(0, 2).map((g, index) => (
							<View
								key={index}
								style={[
									styles.genreBadge,
									{ borderColor: subtitleColor + "40" },
								]}
							>
								<Text style={[styles.genreText, { color: subtitleColor }]}>
									{g.genre.name}
								</Text>
							</View>
						))}
					</View>
				</View>
			</TouchableOpacity>
			<TouchableOpacity
				activeOpacity={0.6}
				hitSlop={40}
				onPress={() => {
					const newState = !isSelected;
					setIsSelected(newState);

					if (newState) {
						api.likeBook(item.id);
						Storage.updateFavoriteStatus(item.id, true);
					} else {
						api.unlikeBook(item.id);
						Storage.updateFavoriteStatus(item.id, false);
					}

					showToast(
						newState
							? "Book added to favorites."
							: "Book removed from favorites.",
					);
				}}
				style={styles.actionButton}
			>
				<Ionicons
					name={isSelected ? "checkmark-circle" : "add-circle-outline"}
					size={28}
					color={
						isSelected
							? isDarkMode
								? "#FFFFFF"
								: "#277130"
							: isDarkMode
								? Colors.loginTextDark
								: Colors.mainColorLight
					}
				/>
			</TouchableOpacity>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 12,
		paddingHorizontal: 10,
		backgroundColor: "transparent",
	},
	imageWrapper: {
		width: 65,
		height: 100,
		borderEndEndRadius: 10,
		borderEndStartRadius: 10,
		overflow: "hidden",
		position: "relative",
		marginRight: 16,
		elevation: 2,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.2,
		shadowRadius: 2,
	},
	absolutePlaceholder: {
		...StyleSheet.absoluteFillObject,
		justifyContent: "center",
		alignItems: "center",
		zIndex: 1,
	},
	image: {
		width: "100%",
		height: "100%",
		zIndex: 2,
		resizeMode: "cover",
	},
	infoContainer: {
		flex: 1,
		justifyContent: "center",
	},
	title: {
		fontSize: 18,
		fontFamily: "modern_no_20_regular",
		marginBottom: 2,
	},
	subtitle: {
		fontSize: 16,
		fontFamily: "modern_no_20_regular",
		opacity: 0.7,
		marginBottom: 8,
	},
	genreContainer: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 6,
	},
	genreBadge: {
		paddingHorizontal: 10,
		paddingVertical: 2,
		borderRadius: 15,
		borderWidth: 1,
	},
	genreText: {
		fontSize: 14,
		fontFamily: "modern_no_20_regular",
	},
	actionButton: {
		paddingLeft: 10,
	},
});

export default memo(BookResultItem);
