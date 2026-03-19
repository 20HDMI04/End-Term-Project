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
};
