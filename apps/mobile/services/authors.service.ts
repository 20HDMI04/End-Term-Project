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
};
