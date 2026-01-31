import { createContext, useState, useEffect, useContext } from "react";
import SuperTokens from "supertokens-react-native";
import { googleSignInAndSuperTokensAuth } from "@/hooks/useGoogleOneTapAuth";

interface ResponseData {
	error: boolean;
	msg: string;
}

interface Book {
	id: string;
	title: string;
	// TODO: add other book properties
}

interface ApiProps {
	getTopBooks: () => Promise<ResponseData | Book[]>;
}

const Api_URL = "https://koax-hoax-readsy.loca.lt";
const ApiContext = createContext<ApiProps>(null as any);

export const useApi = () => useContext(ApiContext);

export const ApiProvider = ({ children }: { children: React.ReactNode }) => {
	useEffect(() => {
		const checkSession = async () => {
			try {
				const sessionExists = await SuperTokens.doesSessionExist();
				if (sessionExists) {
					const userId = await SuperTokens.getUserId();
					const payload = await SuperTokens.getAccessTokenPayloadSecurely();
					const roles = payload["st-role"]?.v || [];
				} else {
					await SuperTokens.signOut();
				}
			} catch (e) {
				await SuperTokens.signOut();
				console.error("Session check error:", e);
			}
		};
		checkSession();
	}, []);

	const getTopBooks = async (): Promise<ResponseData | Book[]> => {
		try {
			// TODO: api call to get top books
			return [];
		} catch (e) {
			console.error("Get books error:", e);
			return { error: true, msg: "Failed to fetch top books." };
		}
	};

	return (
		<ApiContext.Provider
			value={{
				getTopBooks,
			}}
		>
			{children}
		</ApiContext.Provider>
	);
};
