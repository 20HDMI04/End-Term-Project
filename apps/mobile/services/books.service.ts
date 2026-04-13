import { Storage } from "@/utils/storage";
import apiClient from "./apiClient";

export const BooksService = {
	// GET /books?search=QUERY&page=1&limit=15
	searchBooks: async (query: string, page: number = 1, limit: number = 15) => {
		const response = await apiClient.get("/books", {
			params: {
				search: query,
				page,
				limit,
			},
		});
		return response.data;
	},

	//GET /books/{bookId}
	getBookDetails: async (bookId: string) => {
		const response = await apiClient.get(`/books/${bookId}`);
		Storage.saveToHistory(response.data);
		return response.data;
	},

	// POST /social/book/{bookId}/like
	likeBook: async (bookId: string) => {
		const response = await apiClient.post(`/social/book/${bookId}/like`);
		return response.data;
	},
	// PATCH /social/book/{bookId}/unlike
	unlikeBook: async (bookId: string) => {
		const response = await apiClient.patch(`/social/book/${bookId}/unlike`);
		return response.data;
	},

	// POST /social/book/{bookId}/rate
	rateBook: async (bookId: string, rating: number) => {
		const response = await apiClient.post(`/social/book/${bookId}/rate`, {
			score: rating,
		});
		return response.data;
	},

	// PATCH /social/book/{bookId}/rate
	rateUpdateBook: async (bookId: string, rating: number) => {
		const response = await apiClient.patch(`/social/book/${bookId}/rate`, {
			score: rating,
		});
		return response.data;
	},

	// POST /social/haveread/{bookId}
	markAsRead: async (bookId: string) => {
		const response = await apiClient.post(`/social/haveread/${bookId}`);
		return response.data;
	},

	// POST /social/comments/{bookId}
	addComment: async (bookId: string, comment: string) => {
		const response = await apiClient.post(`/social/comments/${bookId}`, {
			text: comment,
		});
		return response.data;
	},

	// PATCH /social/comments/{commentId}
	updateComment: async (commentId: string, comment: string) => {
		const response = await apiClient.patch(`/social/comments/${commentId}`, {
			text: comment,
		});
		return response.data;
	},

	// DELETE /social/comments/{commentId}
	deleteComment: async (commentId: string) => {
		const response = await apiClient.delete(`/social/comments/${commentId}`);
		return response.data;
	},

	// POST /social/comments/{commentId}/like
	likeComment: async (commentId: string) => {
		const response = await apiClient.post(`/social/comments/${commentId}/like`);
		return response.data;
	},

	// PATCH /social/comments/{commentId}/unlike
	unlikeComment: async (commentId: string) => {
		const response = await apiClient.patch(
			`/social/comments/${commentId}/unlike`,
		);
		return response.data;
	},

	// GET /books/random
	getRandomBooks: async (count: number = 10) => {
		const response = await apiClient.get("/books/random", {
			params: { count },
		});
		return response.data;
	},

	//GET books/specific-genre-page/{genre}
	getBooksByGenre: async (genre: string, take: number = 15) => {
		const response = await apiClient.get(
			`/books/specific-genre-page/${genre}`,
			{
				params: { take },
			},
		);
		return response.data;
	},

	// GET /books/mycollections
	getMyCollections: async () => {
		const response = await apiClient.get("/books/mycollections");
		return response.data;
	},
};
