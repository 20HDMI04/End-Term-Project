import SuperTokens from "supertokens-react-native";

export function initSuperTokens() {
	SuperTokens.init({
		apiDomain: "chloroplastic-crumbly-dominic.ngrok-free.dev",
		apiBasePath: "/auth",
	});
}
