import apiClient from "./apiClient";
import { Storage } from "@/utils/storage";
import { MainPageData } from "@/constants/interfaces";

const DATA_KEY = "@main_page_data";
const LAST_UPDATE_KEY = "@last_update_time";

const DATA_SEARCH_KEY = "@main_page_search_data";
const LAST_SEARCH_UPDATE_KEY = "@main_page_search_last_update_time";

const DATA_DISCOVER_KEY = "@main_page_discover_data";
const LAST_DISCOVER_UPDATE_KEY = "@main_page_discover_last_update_time";

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

	async fetchSearchPageData() {
		try {
			const storedData = await Storage.getItem(DATA_SEARCH_KEY);
			const lastUpdate = await Storage.getItem(LAST_SEARCH_UPDATE_KEY);
			let shouldUpdate = false;
			const now = new Date();
			const oneDayMs = 24 * 60 * 60 * 1000;
			const nowMs = now.getTime();
			const lastUpdateMs = new Date(lastUpdate).getTime();

			if (nowMs - lastUpdateMs >= oneDayMs) {
				shouldUpdate = true;
			}
			if (shouldUpdate) {
				console.log("Search page update needed. Fetching new data...");
				const response: { data: MainPageData } =
					await apiClient.get("/books/searchpage");
				Storage.setItem(DATA_SEARCH_KEY, JSON.stringify(response.data));
				Storage.setItem(LAST_SEARCH_UPDATE_KEY, new Date().toISOString());
				return response.data;
			}
			console.log("Use cached search page data.");
			return JSON.parse(storedData);
		} catch (error) {
			console.error("Error fetching search page data:", error);
		}
	},

	// GET /books/searchpage
	getSearchPageDataAnyWay: async (): Promise<any> => {
		try {
			const response: { data: MainPageData } =
				await apiClient.get("/books/searchpage");
			Storage.setItem(DATA_SEARCH_KEY, JSON.stringify(response.data));
			Storage.setItem(LAST_SEARCH_UPDATE_KEY, new Date().toISOString());
			return response.data;
		} catch (error) {
			console.error("Error fetching search page data:", error);
		}
	},

	fetchDiscoverPageData: async () => {
		try {
			const storedData = await Storage.getItem(DATA_DISCOVER_KEY);
			const lastUpdate = await Storage.getItem(LAST_DISCOVER_UPDATE_KEY);
			let shouldUpdate = false;
			const now = new Date();
			const oneDayMs = 24 * 60 * 60 * 1000;
			const nowMs = now.getTime();
			const lastUpdateMs = new Date(lastUpdate).getTime();
			if (nowMs - lastUpdateMs >= oneDayMs) {
				shouldUpdate = true;
			}
			if (shouldUpdate) {
				console.log("Discover page update needed. Fetching new data...");
				const response: { data: MainPageData } = await apiClient.get(
					"/books/discoverpage",
				);
				Storage.setItem(DATA_DISCOVER_KEY, JSON.stringify(response.data));
				Storage.setItem(LAST_DISCOVER_UPDATE_KEY, new Date().toISOString());
				return response.data;
			}
			console.log("Use cached discover page data.");
			return JSON.parse(storedData);
		} catch (error) {
			console.error("Error fetching discover page data:", error);
		}
	},

	// GET /books/discoverpage
	getDiscoverPageDataAnyWay: async (): Promise<any> => {
		try {
			const response: { data: MainPageData } = await apiClient.get(
				"/books/discoverpage",
			);
			Storage.setItem(DATA_DISCOVER_KEY, JSON.stringify(response.data));
			Storage.setItem(LAST_DISCOVER_UPDATE_KEY, new Date().toISOString());
			return response.data;
		} catch (error) {
			console.error("Error fetching discover page data:", error);
		}
	},
};
