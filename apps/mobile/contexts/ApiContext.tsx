import { createContext, useState, useEffect, useContext } from "react";
import SuperTokens from "supertokens-react-native";
import { googleSignInAndSuperTokensAuth } from "@/hooks/useGoogleOneTapAuth";
import { UserService } from "@/services/user.service";
import { MainPageService } from "@/services/mainpage.service";
import { Storage } from "@/utils/storage";
import {
	FindOneAuthorResponse,
	MainPageData,
	SearchEverythingResponse,
} from "@/constants/interfaces";
import { AuthorsService } from "@/services/authors.service";
import { BooksService } from "@/services/books.service";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "./AuthContext";
import { Comment } from "@/constants/interfaces";

export interface Me {
	biggerProfilePic: string;
	createdAt: string;
	email: string;
	nickname: string;
	smallerProfilePic: string;
	updatedAt: string;
}

interface ApiProps {
	getMe: () => Promise<Me | { error: boolean; msg: string }>;
	getMainPageData: () => Promise<MainPageData>;
	getMainPageAnyWay: () => Promise<MainPageData>;
	getDiscoverPageData: () => Promise<MainPageData>;
	getDiscoverPageDataAnyWay: () => Promise<MainPageData>;
	getSearchPageData: () => Promise<MainPageData>;
	getSearchPageDataAnyWay: () => Promise<MainPageData>;
	searchAuthors: (query: string, page?: number, limit?: number) => Promise<any>;
	likeAuthor: (authorId: string) => Promise<void>;
	unlikeAuthor: (authorId: string) => Promise<void>;
	searchBooks: (query: string, page?: number, limit?: number) => Promise<any>;
	likeBook: (bookId: string) => Promise<void>;
	unlikeBook: (bookId: string) => Promise<void>;
	syncProfileWithServer: (isFirstTime?: boolean) => Promise<void>;
	getABookById: (bookId: string) => Promise<any>;
	rateBook: (bookId: string, rating: number) => Promise<void>;
	rateUpdateBook: (bookId: string, rating: number) => Promise<void>;
	markAsRead: (bookId: string) => Promise<void>;
	addComment: (bookId: string, comment: string) => Promise<Comment>;
	updateComment: (commentId: string, comment: string) => Promise<void>;
	deleteComment: (commentId: string) => Promise<void>;
	getRandomBook: () => Promise<any>;
	likeComment: (commentId: string) => Promise<void>;
	unlikeComment: (commentId: string) => Promise<void>;
	findOneAuthor: (authorId: string) => Promise<FindOneAuthorResponse>;
	searchEverything: (
		query: string,
		take?: number,
	) => Promise<SearchEverythingResponse>;
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

	const getSearchPageData = async (): Promise<MainPageData> => {
		try {
			const data = await MainPageService.fetchSearchPageData();
			return data;
		} catch (error) {
			console.error("Error fetching search page data:", error);
			throw error;
		}
	};

	const getDiscoverPageData = async (): Promise<MainPageData> => {
		try {
			const data = await MainPageService.fetchDiscoverPageData();
			return data;
		} catch (error) {
			console.error("Error fetching discover page data:", error);
			throw error;
		}
	};

	const getRandomBook = async () => {
		try {
			const data = await BooksService.getRandomBooks();
			return data;
		} catch (error) {
			console.error("Error fetching random book:", error);
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

	const getSearchPageDataAnyWay = async (): Promise<MainPageData> => {
		try {
			const data = await MainPageService.getSearchPageDataAnyWay();
			return data;
		} catch (error) {
			console.error("Error fetching search page data:", error);
			throw error;
		}
	};

	const getDiscoverPageDataAnyWay = async (): Promise<MainPageData> => {
		try {
			const data = await MainPageService.getDiscoverPageDataAnyWay();
			return data;
		} catch (error) {
			console.error("Error fetching discover page data:", error);
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
	): Promise<SearchEverythingResponse> => {
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

	const getABookById = async (bookId: string) => {
		try {
			const data = await BooksService.getBookDetails(bookId);
			return data;
		} catch (error) {
			console.error("Error fetching book details:", error);
			throw error;
		}
	};

	const rateBook = async (bookId: string, rating: number) => {
		try {
			await BooksService.rateBook(bookId, rating);
		} catch (error) {
			console.error("Error rating book:", error);
			throw error;
		}
	};

	const rateUpdateBook = async (bookId: string, rating: number) => {
		try {
			await BooksService.rateUpdateBook(bookId, rating);
		} catch (error) {
			console.error("Error updating book rating:", error);
			throw error;
		}
	};

	const markAsRead = async (bookId: string) => {
		try {
			await BooksService.markAsRead(bookId);
		} catch (error) {
			console.error("Error marking book as read:", error);
			throw error;
		}
	};

	const addComment = async (bookId: string, comment: string) => {
		try {
			return await BooksService.addComment(bookId, comment);
		} catch (error) {
			console.error("Error adding comment to book:", error);
			throw error;
		}
	};

	const updateComment = async (commentId: string, comment: string) => {
		try {
			return await BooksService.updateComment(commentId, comment);
		} catch (error) {
			console.error("Error updating comment:", error);
			throw error;
		}
	};

	const deleteComment = async (commentId: string) => {
		try {
			return await BooksService.deleteComment(commentId);
		} catch (error) {
			console.error("Error deleting comment:", error);
			throw error;
		}
	};

	const likeComment = async (commentId: string) => {
		try {
			return await BooksService.likeComment(commentId);
		} catch (error) {
			console.error("Error liking comment:", error);
			throw error;
		}
	};

	const unlikeComment = async (commentId: string) => {
		try {
			return await BooksService.unlikeComment(commentId);
		} catch (error) {
			console.error("Error unliking comment:", error);
			throw error;
		}
	};

	const findOneAuthor = async (authorId: string) => {
		try {
			const data = await AuthorsService.findOneAuthor(authorId);
			return data;
		} catch (error) {
			console.error("Error fetching author details:", error);
			throw error;
		}
	};

	const searchEverything = async (query: string, take: number = 10) => {
		try {
			const data = await MainPageService.searchForEverything(query, take);
			return data;
		} catch (error) {
			console.error("Error searching for everything:", error);
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
				findOneAuthor,
				searchBooks,
				likeBook,
				unlikeBook,
				syncProfileWithServer,
				getABookById,
				rateBook,
				rateUpdateBook,
				markAsRead,
				addComment,
				updateComment,
				deleteComment,
				getRandomBook,
				likeComment,
				unlikeComment,
				searchEverything,
				getDiscoverPageData,
				getDiscoverPageDataAnyWay,
				getSearchPageData,
				getSearchPageDataAnyWay,
			}}
		>
			{children}
		</ApiContext.Provider>
	);
};
