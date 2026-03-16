import { createContext, useState, useEffect, useContext } from "react";
import SuperTokens from "supertokens-react-native";
import { googleSignInAndSuperTokensAuth } from "@/hooks/useGoogleOneTapAuth";
import { UserService } from "@/services/user.service";
import { MainPageService } from "@/services/mainpage.service";
import { Storage } from "@/utils/storage";
import { MainPageData } from "@/constants/interfaces";

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
	getMainPageData: () => Promise<MainPageData>;
	getMainPageAnyWay: () => Promise<MainPageData>;
}

const Api_URL = "https://chloroplastic-crumbly-dominic.ngrok-free.dev";
const S3_URL = "https://readsys3.share.zrok.io/";
const ApiContext = createContext<ApiProps>(null as any);

export const useApi = () => useContext(ApiContext);

export const ApiProvider = ({ children }: { children: React.ReactNode }) => {
	const getMe = async () => {
		try {
			const data = await UserService.getCurrentUser();
			const userData: Me = {
				...data,
				smallerProfilePic: data.smallerProfilePic.replace(
					"http://localhost:4566",
					S3_URL,
				),
				biggerProfilePic: data.biggerProfilePic.replace(
					"http://localhost:4566",
					S3_URL,
				),
			} as Me;
			await Storage.setItem("user", userData);
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

	const getMainPageData = async (): Promise<MainPageData> => {
		try {
			const data = await MainPageService.fetchMainPageData();
			return data;
		} catch (error) {
			console.error("Error fetching main page data:", error);
			throw error;
		}
	};

	const getMainPageAnyWay = async (): Promise<MainPageData> => {
		try {
			const data = await MainPageService.fetchMainPageAnyWay();
			return data;
		} catch (error) {
			console.error("Error fetching main page data:", error);
			throw error;
		}
	};

	return (
		<ApiContext.Provider
			value={{
				getMe,
				getMainPageData,
				getMainPageAnyWay,
			}}
		>
			{children}
		</ApiContext.Provider>
	);
};
