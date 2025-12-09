// Expo entry for expo-router
import "expo-router/entry";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import Index from "./app/index";
const WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;

GoogleSignin.configure({
	webClientId: WEB_CLIENT_ID,
	offlineAccess: true,
	scopes: ["profile", "email"],
});
const App = () => {
	return Index();
};
export default App;
