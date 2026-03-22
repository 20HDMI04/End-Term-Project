export const useChangePicUrlToPipline = (
	url: string | null | undefined,
): string => {
	if (!url) {
		return "";
	}
	if (!url.includes("http://localhost:4566")) {
		return url;
	}
	return url.replace("http://localhost:4566", "https://readsys3.share.zrok.io");
};
