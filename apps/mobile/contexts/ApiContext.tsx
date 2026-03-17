import { createContext, useState, useEffect, useContext } from "react";
import SuperTokens from "supertokens-react-native";
import { googleSignInAndSuperTokensAuth } from "@/hooks/useGoogleOneTapAuth";
import { UserService } from "@/services/user.service";
import { MainPageService } from "@/services/mainpage.service";
import { Storage } from "@/utils/storage";
import { MainPageData } from "@/constants/interfaces";
import { AuthorsService } from "@/services/authors.service";
import { BooksService } from "@/services/books.service";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "./AuthContext";

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
	searchAuthors: (query: string, page?: number, limit?: number) => Promise<any>;
	likeAuthor: (authorId: string) => Promise<void>;
	unlikeAuthor: (authorId: string) => Promise<void>;
	searchBooks: (query: string, page?: number, limit?: number) => Promise<any>;
	likeBook: (bookId: string) => Promise<void>;
	unlikeBook: (bookId: string) => Promise<void>;
	syncProfileWithServer: (isFirstTime?: boolean) => Promise<void>;
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

	const syncProfileWithServer = async (isFirstTime: boolean = false) => {
		console.log("Syncing profile with server. isFirstTime:", isFirstTime);
		try {
			const savedImageUri = await AsyncStorage.getItem("user_image");
			const savedNickname = await AsyncStorage.getItem("user_nickname");

			if (!savedNickname) {
				console.warn("No nickname found in storage, skipping profile sync.");
				return;
			}

			let filePayload = null;
			if (savedImageUri) {
				const uriParts = savedImageUri.split(".");
				const fileType = uriParts[uriParts.length - 1];

				filePayload = {
					uri: savedImageUri,
					fileName: `profile_${Date.now()}.${fileType}`,
					type: `image/${fileType === "png" ? "png" : "jpeg"}`,
				};
			}
			const data = {
				nickname: savedNickname,
			};
			const result = await UserService.updateProfile(
				data,
				filePayload,
				isFirstTime,
			);

			return result;
		} catch (error) {
			console.error("Error syncing profile with server:", error);
			throw error;
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

	const searchAuthors = async (
		query: string,
		page: number = 1,
		limit: number = 15,
	) => {
		try {
			const data = await AuthorsService.searchAuthors(query, page, limit);
			return data;
		} catch (error) {
			console.error("Error searching authors:", error);
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

	const likeAuthor = async (authorId: string) => {
		try {
			await AuthorsService.likeAuthor(authorId);
		} catch (error) {
			console.error("Error liking author:", error);
			throw error;
		}
	};

	const unlikeAuthor = async (authorId: string) => {
		try {
			await AuthorsService.unlikeAuthor(authorId);
		} catch (error) {
			console.error("Error unliking author:", error);
			throw error;
		}
	};

	const searchBooks = async (
		query: string,
		page: number = 1,
		limit: number = 15,
	) => {
		try {
			const data = await BooksService.searchBooks(query, page, limit);
			return data;
		} catch (error) {
			console.error("Error searching books:", error);
			throw error;
		}
	};

	const likeBook = async (bookId: string) => {
		try {
			await BooksService.likeBook(bookId);
		} catch (error) {
			console.error("Error liking book:", error);
			throw error;
		}
	};

	const unlikeBook = async (bookId: string) => {
		try {
			await BooksService.unlikeBook(bookId);
		} catch (error) {
			console.error("Error unliking book:", error);
			throw error;
		}
	};

	return (
		<ApiContext.Provider
			value={{
				getMe,
				getMainPageData,
				getMainPageAnyWay,
				searchAuthors,
				likeAuthor,
				unlikeAuthor,
				searchBooks,
				likeBook,
				unlikeBook,
				syncProfileWithServer,
			}}
		>
			{children}
		</ApiContext.Provider>
	);
};
