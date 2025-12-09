// eslint-disable-next-line import/no-extraneous-dependencies
import { WEB_CLIENT_ID } from "react-native-dotenv";
import { Platform } from "react-native";

export default ({ config }: { config: any }) => ({
	...config,
	extra: {
		googleWebClientId: WEB_CLIENT_ID,
	},
});
/**
 * Get the API base URL based on the current environment
 */
function getApiUrl(): string {
	// If running on a physical device, replace this with your computer's IP address
	// You can find it by running `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
	const LOCAL_IP = "192.168.1.121";

	// Check if running on Android irl device
	if (Platform.OS === "android") {
		// Android irl device
		return "http://192.168.1.121:3000";
	}

	// Check if running on iOS simulator or web
	if (Platform.OS === "ios" || Platform.OS === "web") {
		return "http://localhost:3000";
	}

	// For physical devices, use the local network IP
	return `http://${LOCAL_IP}:3000`;
}

export const API_URL = getApiUrl();

// API endpoints
export const API_ENDPOINTS = {
	AUTH: {
		SIGNIN: "/auth/signin",
		SIGNUP: "/auth/signup",
		SIGNOUT: "/auth/signout",
	},
	BOOKS: {
		LIST: "/books",
		DETAILS: (id: string) => `/books/${id}`,
	},
};
