import React, { useState, memo, useEffect } from "react";
import {
	StyleSheet,
	View,
	Text,
	Image,
	TouchableOpacity,
	Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/theme";
import { Author } from "@/constants/interfaces";
import { useToast } from "@/contexts/ToastContext";
import { useApi } from "@/contexts/ApiContext";

interface AuthorResultItemProps {
	item: Author;
	isDarkMode: boolean;
}

const AuthorResultItem = ({ item, isDarkMode }: AuthorResultItemProps) => {
	const [hasError, setHasError] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [isSelected, setIsSelected] = useState(false);
	const api = useApi();
	const { showToast } = useToast();
	useEffect(() => {
		console.log(item);
		if (item.isFavorited !== undefined && item.isFavorited !== false) {
			setIsSelected(true);
		}
	}, []);
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
	const accentColor = "#4A5D45";

	return (
		<View style={styles.container}>
			<View style={[styles.imageWrapper, { backgroundColor: fallbackBg }]}>
				<View style={styles.absolutePlaceholder}>
					<Ionicons name="person" size={24} color={iconColor} />
				</View>

				{item.biggerProfilePic && !hasError && (
					<Image
						source={{ uri: item.biggerProfilePic }}
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
				<Text style={[styles.name, { color: titleColor }]} numberOfLines={1}>
					{item.name || "Unknown Author"}
				</Text>
				<Text style={[styles.role, { color: subtitleColor }]}>Author</Text>
			</View>

			<TouchableOpacity
				activeOpacity={0.6}
				hitSlop={40}
				onPress={() => {
					setIsSelected(!isSelected);
					if (!isSelected) {
						api.likeAuthor(item.id);
					} else {
						api.unlikeAuthor(item.id);
					}
					showToast(
						isSelected
							? "Author removed from favorites."
							: "Author added to favorites.",
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
		paddingHorizontal: 14,
		backgroundColor: "transparent",
	},
	imageWrapper: {
		width: 50,
		height: 50,
		borderRadius: 25,
		overflow: "hidden",
		position: "relative",
		marginRight: 15,
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
	name: {
		fontSize: 18,
		fontFamily: "modern_no_20_regular",
		fontWeight: "600",
	},
	role: {
		fontSize: 14,
		fontFamily: "modern_no_20_regular",
		opacity: 0.6,
		marginTop: 2,
	},
	actionButton: {
		padding: 5,
	},
});

export default memo(AuthorResultItem);
