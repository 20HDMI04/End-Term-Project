import AsyncStorage from "@react-native-async-storage/async-storage";
import type { FindOneBookResponse } from "@/constants/interfaces";

export const Storage = {
	setItem: async (key: string, value: any) => {
		await AsyncStorage.setItem(key, JSON.stringify(value));
	},
	getItem: async (key: string) => {
		const value = await AsyncStorage.getItem(key);
		return value ? JSON.parse(value) : null;
	},
	removeItem: async (key: string) => {
		await AsyncStorage.removeItem(key);
	},
	clearAllItem: async () => {
		try {
			await AsyncStorage.clear();
		} catch (e) {
			console.error("Error occurred while clearing AsyncStorage:", e);
		}
	},

	saveToHistory: async (newItem: any) => {
		try {
			const STORAGE_KEY = "@book_history";

			const existingHistory = await AsyncStorage.getItem(STORAGE_KEY);
			let history = existingHistory ? JSON.parse(existingHistory) : [];

			history = history.filter(
				//@ts-ignore
				(item) => item.foundBook.id !== newItem.foundBook.id,
			);

			history.unshift(newItem);

			if (history.length > 5) {
				history = history.slice(0, 5);
			}

			await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(history));
		} catch (error) {
			console.error("Error saving to history:", error);
		}
	},
	getHistory: async () => {
		try {
			const STORAGE_KEY = "@book_history";
			const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);

			return jsonValue != null ? JSON.parse(jsonValue) : [];
		} catch (error) {
			console.error("Error loading history:", error);
			return [];
		}
	},
	updateFavoriteStatus: async (bookId: string, isFavorited: boolean) => {
		try {
			const STORAGE_KEY = "@book_history";
			const existingHistory = await AsyncStorage.getItem(STORAGE_KEY);
			let history: FindOneBookResponse[] = existingHistory
				? JSON.parse(existingHistory)
				: [];

			history = history.map((item) => {
				if (item.foundBook.id === bookId) {
					return {
						foundBook: {
							...item.foundBook,
							isLikedByMe: isFavorited,
						},
						similarBooks: item.similarBooks,
					};
				}
				return item;
			});

			await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(history));
		} catch (error) {
			console.error("Error updating favorite status in history:", error);
		}
	},
};
