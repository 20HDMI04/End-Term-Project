import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { getSuperTokensRoutesForReactRouterDom } from "supertokens-auth-react/ui";
import SuperTokens, { SuperTokensWrapper } from "supertokens-auth-react";
import EmailPassword from "supertokens-auth-react/recipe/emailpassword";
import ThirdParty from "supertokens-auth-react/recipe/thirdparty";
import Session from "supertokens-auth-react/recipe/session";
import { SessionAuth } from "supertokens-auth-react/recipe/session";
import * as reactRouterDom from "react-router-dom";
import { EmailPasswordPreBuiltUI } from "supertokens-auth-react/recipe/emailpassword/prebuiltui";
import { ThirdPartyPreBuiltUI } from "supertokens-auth-react/recipe/thirdparty/prebuiltui";
import Dashboard from "./components/Dashboard";
import { EmailPasswordComponentsOverrideProvider } from "supertokens-auth-react/recipe/emailpassword";
import { AuthRecipeComponentsOverrideContextProvider } from "supertokens-auth-react/ui";
import { ThirdpartyComponentsOverrideProvider } from "supertokens-auth-react/recipe/thirdparty";

SuperTokens.init({
	appInfo: {
		appName: "Readsy",
		apiDomain: "http://localhost:3000", // Backend API domain
		websiteDomain: "http://localhost:5173", // Frontend website domain
		apiBasePath: "/auth",
		websiteBasePath: "/auth",
	},
	clientType: "web",
	recipeList: [
		EmailPassword.init({}),
		ThirdParty.init({
			signInAndUpFeature: {
				providers: [ThirdParty.Google.init()],
			},
		}),
		Session.init({
			sessionTokenFrontendDomain: "localhost",
		}),
	],
});

export default function App() {
	return (
		<SuperTokensWrapper>
			<BrowserRouter>
				<Routes>
					{getSuperTokensRoutesForReactRouterDom(reactRouterDom, [
						ThirdPartyPreBuiltUI,
						EmailPasswordPreBuiltUI,
					])}

					<Route
						path="/"
						element={
							<SessionAuth>
								<Dashboard />
							</SessionAuth>
						}
					/>

					<Route path="/dashboard" element={<Navigate to="/" replace />} />
				</Routes>
			</BrowserRouter>
		</SuperTokensWrapper>
	);
}
