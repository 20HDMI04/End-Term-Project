import SuperTokens from "supertokens-react-native";

export function initSuperTokens() {
	SuperTokens.init({
		apiDomain: "http://192.168.1.121:3000",
		apiBasePath: "/auth",
	});
}
