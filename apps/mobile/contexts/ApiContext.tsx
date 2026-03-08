import { createContext, useState, useEffect, useContext, use } from "react";
import SuperTokens from "supertokens-react-native";
import { googleSignInAndSuperTokensAuth } from "@/hooks/useGoogleOneTapAuth";
import { UserService } from "@/services/user.service";
import { Storage } from "@/utils/storage";

export interface Me {
	biggerProfilePic: string;
	createdAt: string;
	email: string;
	nickname: any;
	smallerProfilePic: string;
	updatedAt: string;
}

interface ApiProps {
	getMe: () => Promise<Me | { error: boolean; msg: string }>;
}

const Api_URL = "https://chloroplastic-crumbly-dominic.ngrok-free.dev";
const ApiContext = createContext<ApiProps>(null as any);

export const useApi = () => useContext(ApiContext);

export const ApiProvider = ({ children }: { children: React.ReactNode }) => {
	const getMe = async () => {
		try {
			const data = await UserService.getCurrentUser();
			await Storage.setItem("user", data);
			return data;
		} catch (e: any) {
			return {
				error: true,
				msg:
					e.response?.data?.message ||
					"An error occurred while fetching user data.",
			};
		}
	};

	return (
		<ApiContext.Provider
			value={{
				getMe,
			}}
		>
			{children}
		</ApiContext.Provider>
	);
};
