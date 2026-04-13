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

		const payload = new FormData();

		Object.keys(data).forEach((key) => {
			if (data[key] !== undefined && data[key] !== null) {
				payload.append(key, data[key]);
			}
		});

		if (file) {
			payload.append("file", {
				uri: file.uri,
				name: file.fileName || "profile_pic.jpg",
				type: file.type || "image/jpeg",
			} as any);
		}

		const headers = { "Content-Type": "multipart/form-data" };

		try {
			console.log("Sending payload to server...");
			const response = await apiClient.patch(endpoint, payload, { headers });
			console.log("Profile updated successfully:", response.data);
			return response.data;
		} catch (error: any) {
			console.error(
				"Error updating profile:",
				error.response?.data || error.message,
			);
			throw error;
		}
	},

	// GET /social/comments/history
	getCommentHistory: async () => {
		const response = await apiClient.get("/social/comments/history");
		return response.data;
	},
};
