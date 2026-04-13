import apiClient from "./apiClient";

export const UserService = {
	// GET /user/me
	getCurrentUser: async () => {
		const response = await apiClient.get("/user/me");
		return response.data;
	},

	// PATCH /user/me vagy /user/me-the-first-time
	updateProfile: async (
		data: any,
		file: any | null,
		isFirstTime: boolean = false,
	) => {
		const endpoint = isFirstTime ? "/user/me-the-first-time" : "/user/me";
		console.log("Updating profile. Endpoint:", endpoint);
		let payload: FormData | any;
		let headers: Record<string, string> = {};

		if (file) {
			payload = new FormData();
			Object.keys(data).forEach((key) => payload.append(key, data[key]));

			payload.append("file", {
				uri: file.uri,
				name: file.fileName || "profile_pic.jpg",
				type: file.type || "image/jpeg",
			} as any);

			headers = { "Content-Type": "multipart/form-data" };
		} else {
			payload = data;
		}

		const response = await apiClient.patch(endpoint, payload, { headers });
		console.log("Profile updated successfully:", response.data);
		return response.data;
	},

	// GET /social/comments/history
	getCommentHistory: async () => {
		const response = await apiClient.get("/social/comments/history");
		return response.data;
	},
};
