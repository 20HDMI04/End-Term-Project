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
};
