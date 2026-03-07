import axios from "axios";
import SuperTokens from "supertokens-react-native";

const API_URL = "https://koax-hoax-readsy.loca.lt";

const apiClient = axios.create({
	baseURL: API_URL,
	headers: {
		"Content-Type": "application/json",
	},
});

SuperTokens.addAxiosInterceptors(apiClient);

export default apiClient;
