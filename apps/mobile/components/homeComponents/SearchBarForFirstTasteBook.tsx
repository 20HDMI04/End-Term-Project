import React, { useState, useEffect, useRef } from "react";
import {
	StyleSheet,
	View,
	TextInput,
	TouchableOpacity,
	Animated,
	Platform,
	Keyboard,
	ScrollView,
	Pressable,
	Text,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/theme";
import X from "@/assets/svgs/x.svg";
import { useApi } from "@/contexts/ApiContext";
import AuthorResultComponent from "./AuthorResultComponent";
import LottieView from "lottie-react-native";
import { SearchResultBook } from "@/constants/interfaces";
import BookResultItem from "./BookResultItem";

const SearchBarForFirstTasteBook = ({
	isDarkMode,
}: {
	isDarkMode: boolean;
}) => {
	const api = useApi();
	const [query, setQuery] = useState("");
	const [isFocused, setIsFocused] = useState(false);
	const [searchResults, setSearchResults] = useState<SearchResultBook>();
	const animationRef = useRef<LottieView>(null);
	const animValue = useRef(new Animated.Value(0)).current;
	const inputRef = useRef<TextInput>(null);

	useEffect(() => {
		if (query.length == 0) {
			setSearchResults(undefined);
		}
		const delayDebounceFn = setTimeout(async () => {
			if (query.trim().length >= 3) {
				const res = await api.searchBooks(query);
				setSearchResults(res);
			}
		}, 500);
		return () => clearTimeout(delayDebounceFn);
	}, [query]);

	const handleOpen = () => {
		setIsFocused(true);
		inputRef.current?.focus();
		Animated.timing(animValue, {
			toValue: 1,
			duration: 250,
			useNativeDriver: false,
		}).start();
	};

	const handleClose = () => {
		if (query.length === 0) {
			Animated.timing(animValue, {
				toValue: 0,
				duration: 250,
				useNativeDriver: false,
			}).start(() => {
				setIsFocused(false);
			});
		}
	};

	const animatedWrapperStyle = {
		marginHorizontal: animValue.interpolate({
			inputRange: [0, 1],
			outputRange: [20, 0],
		}),
		borderRadius: animValue.interpolate({
			inputRange: [0, 1],
			outputRange: [30, 0],
		}),
	};

	const getLottieSource = () => {
		try {
			const source = require("@/assets/lottie/search_animation.json");
			return source;
		} catch (err) {
			console.error("Error loading Lottie file:", err);
			return;
		}
	};

	const lottieSource = getLottieSource();
	return (
		<>
			<View style={[styles.container]}>
				<Animated.View
					style={[
						styles.searchWrapper,
						animatedWrapperStyle,
						{ backgroundColor: isDarkMode ? Colors.thirdColorDark : "#FFFFFF" },
					]}
				>
					{!isFocused && (
						<TouchableOpacity
							style={[StyleSheet.absoluteFill, { zIndex: 11 }]}
							onPress={handleOpen}
						/>
					)}

					<Ionicons
						name="search-outline"
						size={22}
						color={isDarkMode ? "#FFFFFF" : Colors.mainColorLight}
						style={styles.icon}
					/>

					<TextInput
						ref={inputRef}
						style={[
							styles.input,
							{ color: isDarkMode ? "#FFFFFF" : Colors.mainColorLight },
						]}
						keyboardType="default"
						placeholder={
							isFocused ? "What are you looking for?" : "Search for books ..."
						}
						placeholderTextColor={
							isDarkMode ? Colors.loginTextDark : Colors.darkerTextLight
						}
						onBlur={handleClose}
						value={query}
						blurOnSubmit={false}
						onChangeText={setQuery}
						returnKeyType="search"
						onSubmitEditing={Keyboard.dismiss}
					/>

					{query.length > 0 && (
						<Pressable
							onPressIn={(e) => {
								e.preventDefault();
								setQuery("");
							}}
							onPressOut={() => inputRef.current?.focus()}
							style={({ pressed }) => [
								styles.clearBtn,
								{ opacity: pressed ? 0.5 : 1, zIndex: 999 },
							]}
							hitSlop={20}
						>
							<X fill={isDarkMode ? "#FFFFFF" : Colors.mainColorLight}></X>
						</Pressable>
					)}
				</Animated.View>
			</View>
			<ScrollView
				style={{ marginTop: 10, width: "100%" }}
				showsVerticalScrollIndicator={false}
			>
				{searchResults &&
					searchResults.data.length > 0 &&
					searchResults.data.map((book) => (
						<BookResultItem key={book.id} item={book} isDarkMode={isDarkMode} />
					))}
				{searchResults &&
					searchResults.meta.total === 0 &&
					query.length >= 3 && (
						<View style={{ padding: 20, alignItems: "center" }}>
							<Text
								style={[
									styles.errorText,
									{
										color: isDarkMode ? "#FFFFFF" : Colors.mainColorLight,
									},
								]}
							>
								No books found for "{query}"
							</Text>
							<Text
								style={[
									styles.errorSubText,
									{
										color: isDarkMode
											? Colors.loginTextDark
											: Colors.mainColorLight,
									},
								]}
							>
								Please try searching with a different name or check your
								spelling.
							</Text>
						</View>
					)}
				{(query.length < 3 &&
					searchResults &&
					searchResults.meta.total === 0) ||
					(searchResults === undefined && (
						<View style={{ padding: 20, alignItems: "center", bottom: 60 }}>
							<View style={styles.lottieViewHolder}>
								{lottieSource && (
									<LottieView
										autoPlay={true}
										ref={animationRef}
										loop={true}
										style={styles.lottie}
										source={lottieSource}
										onAnimationFailure={(error) => {
											console.error("Animation failed:", error);
										}}
										resizeMode="contain"
										speed={1.0}
									/>
								)}
							</View>
							<Text
								style={[
									styles.errorSubText,
									{
										color: isDarkMode
											? Colors.loginTextDark
											: Colors.mainColorLight,
										marginTop: 0,
										fontSize: 16,
										fontFamily: "Poppins_300Light",
										textAlign: "center",
										bottom: 50,
										paddingHorizontal: 20,
									},
								]}
							>
								Search for books to extend your taste profile.
							</Text>
						</View>
					))}
			</ScrollView>
		</>
	);
};

const styles = StyleSheet.create({
	container: {
		width: "100%",
		height: 70,
		justifyContent: "center",
	},
	lottieViewHolder: {
		alignItems: "center",
		justifyContent: "center",
		borderRadius: 90,
		width: 330,
		height: 330,
		top: 16,
	},
	lottie: {
		width: 200,
		height: 200,
	},
	searchWrapper: {
		flexDirection: "row",
		alignItems: "center",
		height: 56,
		paddingHorizontal: 15,
		borderBottomWidth: 1,
		borderBottomColor: "transparent",
		width: "98%",
		alignSelf: "center",
	},
	icon: {
		marginRight: 10,
	},
	input: {
		flex: 1,
		fontSize: 18,
		fontFamily: "Poppins_300Light",
	},
	clearBtn: {
		padding: 5,
	},
	errorText: {
		marginTop: 50,
		fontSize: 24,
		fontFamily: "Poppins_300Bold",
		textAlign: "center",
	},
	errorSubText: {
		marginTop: 24,
		fontSize: 16,
		fontFamily: "Poppins_300Light",
		textAlign: "center",
	},
});

export default React.memo(SearchBarForFirstTasteBook);
