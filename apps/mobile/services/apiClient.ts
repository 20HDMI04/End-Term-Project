import axios from "axios";
import SuperTokens from "supertokens-react-native";

const API_URL = "https://chloroplastic-crumbly-dominic.ngrok-free.dev";

const apiClient = axios.create({
	baseURL: API_URL,
	headers: {
		"Content-Type": "application/json",
	},
});

SuperTokens.addAxiosInterceptors(apiClient);

export default apiClient;
