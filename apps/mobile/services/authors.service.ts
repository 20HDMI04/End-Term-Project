import apiClient from "./apiClient";
//authors?limit=15&search=Jókai&page=1

export const AuthorsService = {
	// GET authors?limit=15&search=Jókai&page=1
	searchAuthors: async (
		query: string,
		page: number = 1,
		limit: number = 15,
	) => {
		const response = await apiClient.get("/authors", {
			params: {
				search: query,
				page,
				limit,
			},
		});
		console.log("AuthorsService.searchAuthors response:", response.data);
		return response.data;
	},
	// POST /social/authors/{authorId}/like
	likeAuthor: async (authorId: string) => {
		const response = await apiClient.post(`/social/authors/${authorId}/like`);
		return response.data;
	},
	// PATCH /social/authors/{authorId}/unlike
	unlikeAuthor: async (authorId: string) => {
		const response = await apiClient.patch(
			`/social/authors/${authorId}/unlike`,
		);
		return response.data;
	},

	// GET /authors/{authorId}
	findOneAuthor: async (authorId: string) => {
		const response = await apiClient.get(`/authors/${authorId}`);
		return response.data;
	},
};
