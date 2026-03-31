import apiClient from "./apiClient";
import { Storage } from "@/utils/storage";
import { MainPageData } from "@/constants/interfaces";

const DATA_KEY = "@main_page_data";
const LAST_UPDATE_KEY = "@last_update_time";

export const MainPageService = {
	/**
	 * Fetches the main page data, checking if an update is needed based on the last update time and the current time.
	 */
	async fetchMainPageData() {
		try {
			const storedData = await Storage.getItem(DATA_KEY);
			const lastUpdate = await Storage.getItem(LAST_UPDATE_KEY);

			let shouldUpdate = false;
			const now = new Date();
			const tenAMToday = new Date(now);
			tenAMToday.setHours(10, 0, 0, 0);

			const nowMs = now.getTime();
			const tenAMMs = tenAMToday.getTime();
			const lastUpdateMs = new Date(lastUpdate).getTime();

			if (nowMs >= tenAMMs && lastUpdateMs < tenAMMs) {
				shouldUpdate = true;
			}

			if (shouldUpdate) {
				console.log("Update needed. Fetching new data...");
				const response: { data: MainPageData } =
					await apiClient.get("/books/mainpage");

				Storage.setItem(DATA_KEY, JSON.stringify(response.data));
				Storage.setItem(LAST_UPDATE_KEY, new Date().toISOString());
				return response.data;
			}

			console.log("Use cached data.");
			return JSON.parse(storedData);
		} catch (error) {
			console.error("Error fetching main page data:", error);
		}
	},

	async fetchMainPageAnyWay(): Promise<any> {
		try {
			const response: { data: MainPageData } =
				await apiClient.get("/books/mainpage");
			Storage.setItem(DATA_KEY, JSON.stringify(response.data));
			Storage.setItem(LAST_UPDATE_KEY, new Date().toISOString());
			return response.data;
		} catch (error) {
			console.error("Error fetching main page data:", error);
		}
	},

	//GET /books/search?query=xxx&take=10
	async searchForEverything(query: string, take: number) {
		try {
			const response = await apiClient.get("/books/search", {
				params: { query, take },
			});
			return response.data;
		} catch (error) {
			console.error("Error searching for everything:", error);
		}
	},
};
