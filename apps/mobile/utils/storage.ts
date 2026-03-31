import AsyncStorage from "@react-native-async-storage/async-storage";

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
			console.log("AsyncStorage successfully cleared.");
		} catch (e) {
			console.error("Error occurred while clearing AsyncStorage:", e);
		}
	},
};
